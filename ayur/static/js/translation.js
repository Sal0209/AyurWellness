/**
 * Language Translation Functionality
 * This script handles the translation of webpage content to different languages.
 */

// Current language selection
let currentLanguage = 'en';

// Store original text for all translatable elements
const originalTexts = new Map();

// Function to translate page content
function translatePage(language) {
    if (language === 'en') {
        // Reset to original English text
        restoreOriginalText();
        currentLanguage = 'en';
        document.getElementById('current-language').textContent = 'English';
        return;
    }
    
    // Update current language display
    document.getElementById('current-language').textContent = getLanguageDisplayName(language);
    currentLanguage = language;
    
    // Get all elements with text content to translate
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, a, button, label, span.translatable, div.translatable');
    
    // Store original text if first time translating
    if (originalTexts.size === 0) {
        elements.forEach((el, index) => {
            // Skip empty elements or those with just whitespace
            if (el.textContent.trim() === '') return;
            
            // Skip elements with just icons/symbols
            if (el.textContent.trim().length < 2) return;
            
            // Skip elements that shouldn't be translated
            if (el.getAttribute('data-no-translate') === 'true') return;
            
            originalTexts.set(`el-${index}`, {
                element: el,
                text: el.textContent
            });
        });
    }
    
    // Prepare batch of texts to translate
    const textsToTranslate = [];
    originalTexts.forEach((item) => {
        textsToTranslate.push({
            id: [...originalTexts.entries()].find(entry => entry[1] === item)[0],
            text: item.text
        });
    });
    
    // Split into batches of 10 to avoid long requests
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        batches.push(textsToTranslate.slice(i, i + batchSize));
    }
    
    // Process each batch
    batches.forEach(batch => {
        processBatch(batch, language);
    });
}

// Process a batch of translations
function processBatch(batch, language) {
    // Only attempt translation if batch has items
    if (batch.length === 0) return;
    
    // Use the API to translate the text
    fetch('/api/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            texts: batch.map(item => item.text),
            language: language
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update each element with translated text
            batch.forEach((item, index) => {
                const originalItem = originalTexts.get(item.id);
                if (originalItem && originalItem.element) {
                    originalItem.element.textContent = data.translations[index];
                }
            });
        } else {
            console.error('Translation failed:', data.error);
        }
    })
    .catch(error => {
        console.error('Error during translation:', error);
    });
}

// Restore original English text
function restoreOriginalText() {
    originalTexts.forEach((item) => {
        item.element.textContent = item.text;
    });
}

// Get display name for language
function getLanguageDisplayName(code) {
    const languageMap = {
        'en': 'English',
        'hi': 'हिन्दी',
        'ta': 'தமிழ்',
        'te': 'తెలుగు',
        'ml': 'മലയാളം',
        'bn': 'বাংলা'
    };
    
    return languageMap[code] || 'English';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language display
    document.getElementById('current-language').textContent = 'English';
    
    // Add event listeners to language selection
    document.querySelectorAll('[onclick^="translatePage"]').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            translatePage(lang);
        });
    });
});