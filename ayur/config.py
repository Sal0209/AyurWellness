import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key_here'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'sqlite:///ayurveda.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY') or 'your_google_maps_api_key'