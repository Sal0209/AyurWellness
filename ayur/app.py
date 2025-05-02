from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from datetime import datetime
import os
import json
import requests
from functools import wraps
from transformers import pipeline

# Initialize app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ayurveda.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Initialize AI translator
translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-mul")

# Database Models
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    date_of_birth = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    prakruti_results = db.relationship('PrakrutiResult', backref='user', lazy=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class PrakrutiResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    vata_score = db.Column(db.Integer, nullable=False)
    pitta_score = db.Column(db.Integer, nullable=False)
    kapha_score = db.Column(db.Integer, nullable=False)
    dominant_dosha = db.Column(db.String(20), nullable=False)
    secondary_dosha = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"PrakrutiResult('{self.user_id}', '{self.dominant_dosha}')"

class Remedy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    concern = db.Column(db.String(100), nullable=False)
    vata_recommendation = db.Column(db.Text, nullable=False)
    pitta_recommendation = db.Column(db.Text, nullable=False)
    kapha_recommendation = db.Column(db.Text, nullable=False)
    general_approach = db.Column(db.Text, nullable=False)
    herbs = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f"Remedy('{self.concern}')"

class Center(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.String(20), nullable=False)
    longitude = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    rating = db.Column(db.String(10), nullable=False)
    reviews = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"Center('{self.name}', '{self.type}')"

# Load user callback
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Forms
class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=2, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    full_name = StringField('Full Name', validators=[DataRequired()])
    phone = StringField('Phone Number')
    date_of_birth = StringField('Date of Birth')
    gender = SelectField('Gender', choices=[('', 'Select Gender'), ('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('That username is already taken. Please choose a different one.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('That email is already registered. Please use a different one.')

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

# Helper function to add default data
def add_default_data():
    # Default remedies
    if Remedy.query.count() == 0:
        remedies_data = [
            {
                'concern': 'Digestive Issues',
                'vata_recommendation': 'For Vata-related digestive issues like gas, bloating and constipation, focus on warm, cooked, easy-to-digest foods. Avoid raw, cold foods and irregular eating patterns. Use warming spices like ginger, cumin, and fennel in your diet.',
                'pitta_recommendation': 'For Pitta-related digestive issues like acid reflux and inflammation, focus on cooling foods and herbs. Avoid spicy, sour, and fermented foods. Include sweet, bitter and astringent tastes in your diet.',
                'kapha_recommendation': 'For Kapha-related digestive issues like slow digestion and excess mucus, focus on light, warm, and spicy foods. Avoid heavy, oily, and sweet foods. Include pungent, bitter and astringent tastes in your diet.',
                'general_approach': 'Maintain regular eating habits, avoid overeating, and eat in a calm environment. Sip warm water throughout the day and take a gentle walk after meals. Chew food thoroughly and avoid eating late at night.',
                'herbs': 'Triphala, Ginger, Cumin, Fennel, Ajwain, Aloe Vera, Licorice'
            },
            {
                'concern': 'Sleep Problems',
                'vata_recommendation': 'For Vata-related sleep issues like insomnia and restlessness, establish a regular sleep routine. Take a warm bath before bed with calming essential oils. Practice gentle breathing exercises and avoid stimulating activities before sleep.',
                'pitta_recommendation': 'For Pitta-related sleep issues like difficulty falling asleep due to an active mind, cool your body temperature before bed. Avoid working late into the night and practice cooling breathwork. Use sandalwood or rose essential oil.',
                'kapha_recommendation': 'For Kapha-related sleep issues like oversleeping and feeling groggy, avoid daytime naps and wake up early. Keep your bedroom well-ventilated and exercise regularly but not before bed. Use invigorating scents like eucalyptus.',
                'general_approach': 'Create a conducive sleep environment with comfortable bedding and minimal electronic distractions. Avoid heavy meals and caffeine before bedtime. Establish a regular sleep schedule and practice relaxation techniques.',
                'herbs': 'Ashwagandha, Brahmi, Jatamansi, Chamomile, Valerian Root, Nutmeg, Shankhapushpi'
            },
            {
                'concern': 'Stress & Anxiety',
                'vata_recommendation': 'For Vata-related anxiety characterized by worry and racing thoughts, establish daily routines and avoid excessive stimulation. Practice grounding exercises like gentle yoga and meditation. Keep warm and get adequate rest.',
                'pitta_recommendation': 'For Pitta-related stress characterized by irritability and intensity, practice cooling breathwork and spend time in nature. Avoid competitive situations when stressed and make time for leisure activities.',
                'kapha_recommendation': 'For Kapha-related stress characterized by lethargy and withdrawal, engage in regular stimulating exercise and vary your routine. Practice energizing breathing techniques and expose yourself to new experiences.',
                'general_approach': 'Practice regular mindfulness meditation, deep breathing exercises, and moderate physical activity. Maintain balanced nutrition and hydration. Consider reducing caffeine and adopting stress management strategies.',
                'herbs': 'Ashwagandha, Brahmi, Holy Basil (Tulsi), Jatamansi, Shankhapushpi, Bhringaraj, Saffron'
            },
            {
                'concern': 'Skin Issues',
                'vata_recommendation': 'For Vata-related skin issues like dryness and roughness, use warm oil massage regularly. Keep hydrated and consume healthy fats. Protect your skin from harsh winds and cold weather.',
                'pitta_recommendation': 'For Pitta-related skin issues like inflammation, rashes, and acne, use cooling aloe vera gel and natural face packs. Avoid sun exposure and spicy foods. Stay hydrated with cooling drinks.',
                'kapha_recommendation': 'For Kapha-related skin issues like oiliness and congestion, use gentle exfoliation and clay masks. Keep your skincare routine stimulating and light. Avoid heavy creams and oils.',
                'general_approach': 'Maintain good hydration, balanced nutrition rich in antioxidants, and regular cleansing routines. Protect skin from environmental damage and consider natural, non-toxic skincare products.',
                'herbs': 'Neem, Turmeric, Aloe Vera, Manjistha, Guduchi, Sandalwood, Brahmi'
            },
            {
                'concern': 'Joint Pain',
                'vata_recommendation': 'For Vata-related joint pain characterized by cracking, popping, and variable pain, apply warm sesame oil and keep joints warm. Avoid cold exposure and practice gentle joint movements. Include healthy fats in your diet.',
                'pitta_recommendation': 'For Pitta-related joint pain characterized by inflammation, redness, and heat, apply cooling treatments like aloe vera or sandalwood paste. Avoid overexertion and heating foods.',
                'kapha_recommendation': 'For Kapha-related joint pain characterized by swelling, heaviness, and stiffness, use dry heat and stimulating herbs. Maintain regular movement and avoid static positions. Reduce heavy, oily foods.',
                'general_approach': 'Maintain appropriate weight, engage in suitable physical activity, and ensure proper joint alignment during activities. Consider anti-inflammatory herbs and supplements after consulting a healthcare provider.',
                'herbs': 'Turmeric, Boswellia, Guggulu, Ashwagandha, Ginger, Castor Oil, Nirgundi'
            }
        ]

        for remedy_data in remedies_data:
            remedy = Remedy(**remedy_data)
            db.session.add(remedy)
        
        db.session.commit()

    # Default Ayurvedic centers
    if Center.query.count() == 0:
        centers_data = [
            {
                'name': 'Ayush Wellness Clinic',
                'type': 'Ayurvedic Clinic',
                'address': '123 Healing St, Delhi, India',
                'latitude': '28.6139',
                'longitude': '77.2090',
                'phone': '+91 98765 43210',
                'rating': '4.8',
                'reviews': 124
            },
            {
                'name': 'Prakruti Ayurveda Hospital',
                'type': 'Ayurvedic Hospital',
                'address': '456 Ancient Way, Mumbai, India',
                'latitude': '19.0760',
                'longitude': '72.8777',
                'phone': '+91 87654 32109',
                'rating': '4.6',
                'reviews': 98
            },
            {
                'name': 'Vaidya Panchakarma Center',
                'type': 'Panchakarma',
                'address': '789 Wellness Ave, Bangalore, India',
                'latitude': '12.9716',
                'longitude': '77.5946',
                'phone': '+91 76543 21098',
                'rating': '4.9',
                'reviews': 156
            },
            {
                'name': 'Doshas Balance Retreat',
                'type': 'Wellness Center',
                'address': '321 Harmony Rd, Chennai, India',
                'latitude': '13.0827',
                'longitude': '80.2707',
                'phone': '+91 65432 10987',
                'rating': '4.7',
                'reviews': 112
            },
            {
                'name': 'Ayur Health Consultation',
                'type': 'Consultation',
                'address': '654 Traditional Blvd, Hyderabad, India',
                'latitude': '17.3850',
                'longitude': '78.4867',
                'phone': '+91 54321 09876',
                'rating': '4.5',
                'reviews': 86
            }
        ]

        for center_data in centers_data:
            center = Center(**center_data)
            db.session.add(center)
        
        db.session.commit()

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/prakruti-types')
def prakruti_types():
    return render_template('prakruti-types.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/results')
def results():
    if 'quiz_results' not in session:
        flash('Please take the quiz first to see your results.', 'warning')
        return redirect(url_for('quiz'))
    return render_template('results.html')

@app.route('/remedies')
def remedies():
    remedies = Remedy.query.all()
    return render_template('remedies.html', remedies=remedies)

@app.route('/map')
def map():
    centers = Center.query.all()
    return render_template('map.html', centers=centers)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User(
            username=form.username.data,
            email=form.email.data,
            password=hashed_password,
            full_name=form.full_name.data,
            phone=form.phone.data,
            date_of_birth=form.date_of_birth.data,
            gender=form.gender.data
        )
        db.session.add(user)
        db.session.commit()
        flash(f'Account created for {form.username.data}! You can now log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user)
            next_page = request.args.get('next')
            flash('You have been logged in!', 'success')
            return redirect(next_page) if next_page else redirect(url_for('home'))
        else:
            flash('Login unsuccessful. Please check your username and password.', 'danger')
    return render_template('login.html', form=form)

@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('home'))

@app.route('/profile')
@login_required
def profile():
    prakruti_results = PrakrutiResult.query.filter_by(user_id=current_user.id).order_by(PrakrutiResult.created_at.desc()).all()
    return render_template('profile.html', prakruti_results=prakruti_results)

# API routes for quiz submission
@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    
    # Calculate scores
    vata_score = data.get('vata_score', 0)
    pitta_score = data.get('pitta_score', 0)
    kapha_score = data.get('kapha_score', 0)
    
    # Calculate percentages
    total = vata_score + pitta_score + kapha_score
    vata_percentage = round((vata_score / total) * 100) if total > 0 else 0
    pitta_percentage = round((pitta_score / total) * 100) if total > 0 else 0
    kapha_percentage = round((kapha_score / total) * 100) if total > 0 else 0
    
    # Determine dominant and secondary doshas
    scores = {'vata': vata_score, 'pitta': pitta_score, 'kapha': kapha_score}
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
    dominant_dosha = sorted_scores[0][0]
    secondary_dosha = sorted_scores[1][0] if sorted_scores[1][1] > 0 else None
    
    # Prepare results
    results = {
        'vata_score': vata_score,
        'pitta_score': pitta_score,
        'kapha_score': kapha_score,
        'vata_percentage': vata_percentage,
        'pitta_percentage': pitta_percentage,
        'kapha_percentage': kapha_percentage,
        'dominant_dosha': dominant_dosha,
        'secondary_dosha': secondary_dosha
    }
    
    # Save to session
    session['quiz_results'] = results
    
    # Save to database if user is logged in
    if current_user.is_authenticated:
        prakruti_result = PrakrutiResult(
            user_id=current_user.id,
            vata_score=vata_score,
            pitta_score=pitta_score,
            kapha_score=kapha_score,
            dominant_dosha=dominant_dosha,
            secondary_dosha=secondary_dosha
        )
        db.session.add(prakruti_result)
        db.session.commit()
    
    return jsonify({'success': True, 'redirect': url_for('results')})

# API for remedies
@app.route('/api/remedies')
def api_remedies():
    remedies = Remedy.query.all()
    remedies_list = []
    
    for remedy in remedies:
        remedies_list.append({
            'id': remedy.id,
            'concern': remedy.concern,
            'vata_recommendation': remedy.vata_recommendation,
            'pitta_recommendation': remedy.pitta_recommendation,
            'kapha_recommendation': remedy.kapha_recommendation,
            'general_approach': remedy.general_approach,
            'herbs': remedy.herbs
        })
    
    return jsonify(remedies_list)

# API for centers
@app.route('/api/centers')
def api_centers():
    centers = Center.query.all()
    centers_list = []
    
    for center in centers:
        centers_list.append({
            'id': center.id,
            'name': center.name,
            'type': center.type,
            'address': center.address,
            'latitude': center.latitude,
            'longitude': center.longitude,
            'phone': center.phone,
            'rating': center.rating,
            'reviews': center.reviews
        })
    
    return jsonify(centers_list)


# Initialize database and run app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        add_default_data()
    app.run(debug=True)