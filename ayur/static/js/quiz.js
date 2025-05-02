/**
 * Ayurveda Prakruti Quiz - Main Quiz Functionality
 * This script handles the quiz interaction, scoring, and result submission.
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const quizContainer = document.getElementById('quiz-container');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionNumber = document.getElementById('question-number');
    const progressBar = document.getElementById('progress-bar');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const submitButton = document.getElementById('submit-button');
    
    // Quiz state
    let currentQuestionIndex = 0;
    let answers = [];
    
    // Initialize quiz
    initQuiz();
    
    function initQuiz() {
        // Initialize answers array with empty values
        answers = new Array(quizQuestions.length).fill(null);
        
        // Display first question
        renderQuestion();
        
        // Add button event listeners
        prevButton.addEventListener('click', prevQuestion);
        nextButton.addEventListener('click', nextQuestion);
        submitButton.addEventListener('click', submitQuiz);
    }
    
    function renderQuestion() {
        const question = quizQuestions[currentQuestionIndex];
        
        // Update question text
        questionText.textContent = question.text;
        
        // Update question number
        questionNumber.textContent = `${currentQuestionIndex + 1}/${quizQuestions.length}`;
        
        // Update progress bar
        const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Add new options
        question.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = `option mb-3 p-3 rounded border ${answers[currentQuestionIndex] === option.value ? 'border-success bg-success bg-opacity-10' : 'border-light'}`;
            optionDiv.setAttribute('data-value', option.value);
            
            optionDiv.innerHTML = `
                <div class="d-flex">
                    <div class="option-selector me-3">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="quiz-option" id="option-${option.id}" ${answers[currentQuestionIndex] === option.value ? 'checked' : ''}>
                            <label class="form-check-label" for="option-${option.id}"></label>
                        </div>
                    </div>
                    <div class="option-content">
                        <h4 class="h6 mb-1">${option.text}</h4>
                        <p class="text-muted mb-0 small">${option.description}</p>
                    </div>
                </div>
            `;
            
            optionDiv.addEventListener('click', () => selectOption(option.value));
            optionsContainer.appendChild(optionDiv);
        });
        
        // Update button visibility
        prevButton.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === quizQuestions.length - 1) {
            nextButton.style.display = 'none';
            submitButton.style.display = 'inline-block';
        } else {
            nextButton.style.display = 'inline-block';
            submitButton.style.display = 'none';
        }
    }
    
    function selectOption(value) {
        answers[currentQuestionIndex] = value;
        renderQuestion(); // Re-render to update selected option
    }
    
    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    }
    
    function nextQuestion() {
        if (answers[currentQuestionIndex] === null) {
            alert('Please select an option before proceeding.');
            return;
        }
        
        if (currentQuestionIndex < quizQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        }
    }
    
    function calculateResults() {
        // Count dosha scores
        const scores = {
            vata: 0,
            pitta: 0,
            kapha: 0
        };
        
        answers.forEach(answer => {
            if (answer) {
                scores[answer]++;
            }
        });
        
        return scores;
    }
    
    function submitQuiz() {
        // Check if all questions are answered
        if (answers.includes(null)) {
            alert('Please answer all questions before submitting.');
            return;
        }
        
        // Calculate dosha scores
        const scores = calculateResults();
        
        // Prepare data for submission
        const quizData = {
            vata_score: scores.vata,
            pitta_score: scores.pitta,
            kapha_score: scores.kapha
        };
        
        // Submit data to server
        fetch('/submit-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quizData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.redirect) {
                window.location.href = data.redirect;
            } else {
                alert('There was an error submitting your quiz. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting your quiz. Please try again.');
        });
    }
});