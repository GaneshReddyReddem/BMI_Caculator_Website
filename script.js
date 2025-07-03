        // Global variables
        let currentTheme = 'light';
        let chartExpanded = false;

        // Enhanced BMI categories with more detailed information
        const bmiCategories = {
            underweight: {
                range: [0, 18.5],
                emoji: '⚠️',
                gradient: '--warning-gradient',
                message: 'Your BMI suggests you are underweight. This may indicate nutritional deficiencies or other health concerns.',
                tip: 'Nutritional Recommendations:\n- Increase calorie intake with nutrient-dense foods like nuts, avocados, and whole grains\n- Focus on protein sources like lean meats, eggs, and legumes\n- Consider smaller, more frequent meals if appetite is low\n\nExercise Suggestions:\n- Strength training to build muscle mass\n- Yoga or light cardio to improve appetite\n- Consult a dietitian for personalized advice',
                risks: 'Potential health risks:\n- Weakened immune system\n- Osteoporosis\n- Fertility issues\n- Developmental delays (in children)',
                action: 'Recommended actions:\n1. Schedule a check-up with your doctor\n2. Consider working with a nutritionist\n3. Monitor weight changes regularly'
            },
            normal: {
                range: [18.5, 25],
                emoji: '💪',
                gradient: '--success-gradient',
                message: 'Congratulations! Your BMI falls within the healthy weight range.',
                tip: 'Maintenance Tips:\n- Continue balanced diet with variety of fruits, vegetables, and whole grains\n- Stay hydrated with plenty of water\n- Monitor portion sizes to maintain current weight\n\nExercise Recommendations:\n- 150 minutes moderate activity or 75 minutes vigorous activity weekly\n- Include strength training 2-3 times per week\n- Stay active throughout the day with walking or stretching',
                benefits: 'Health benefits:\n- Lower risk of chronic diseases\n- Better energy levels\n- Improved sleep quality\n- Enhanced mobility and flexibility',
                action: 'Maintenance plan:\n1. Regular health check-ups\n2. Continue healthy habits\n3. Monitor weight monthly'
            },
            overweight: {
                range: [25, 30],
                emoji: '⚠️',
                gradient: '--warning-gradient',
                message: 'Your BMI indicates you are overweight. Small lifestyle changes can make a big difference.',
                tip: 'Weight Management Strategies:\n- Reduce portion sizes gradually\n- Limit processed foods and sugary drinks\n- Increase fiber intake with vegetables and whole grains\n\nEffective Exercises:\n- Brisk walking 30 minutes daily\n- Swimming or cycling for joint-friendly cardio\n- Bodyweight exercises like squats and push-ups\n- Consider a fitness tracker to monitor activity',
                risks: 'Potential concerns:\n- Increased risk of type 2 diabetes\n- Higher blood pressure\n- Joint pain\n- Sleep apnea',
                action: 'Next steps:\n1. Set realistic weight loss goals (1-2 lbs/week)\n2. Keep a food diary\n3. Consult a healthcare provider'
            },
            obese: {
                range: [30, Infinity],
                emoji: '🔥',
                gradient: '--danger-gradient',
                message: 'Your BMI falls in the obese range. Professional guidance can help improve your health outcomes.',
                tip: 'Comprehensive Approach:\n- Medical supervision for weight loss plan\n- Behavioral therapy for eating habits\n- Support groups for motivation\n\nSafe Exercise Options:\n- Start with low-impact activities like water aerobics\n- Short walking sessions throughout the day\n- Chair exercises if mobility is limited\n- Physical therapy if needed',
                risks: 'Serious health risks:\n- Heart disease\n- Stroke\n- Certain cancers\n- Severe COVID-19 complications',
                action: 'Immediate actions:\n1. Schedule a doctor\'s appointment\n2. Request metabolic testing\n3. Create a supervised weight management plan'
            }
        };

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadSavedData();
            setupEventListeners();
            setupAccessibility();
        });

        function setupEventListeners() {
            const form = document.getElementById('bmiForm');
            const heightUnit = document.getElementById('heightUnit');
            const themeToggle = document.querySelector('.theme-toggle');
            const chartToggle = document.querySelector('.chart-toggle');

            form.addEventListener('submit', handleSubmit);
            heightUnit.addEventListener('change', toggleHeightInputs);
            
            // Keyboard support for theme toggle
            themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            });

            // Keyboard support for chart toggle
            chartToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleChart();
                }
            });

            // Auto-save inputs
            ['heightInput', 'weightInput', 'heightUnit', 'weightUnit', 'inchesInput'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('input', saveFormData);
                    element.addEventListener('change', saveFormData);
                }
            });
        }

        function setupAccessibility() {
            // Add focus indicators for keyboard navigation
            const focusableElements = document.querySelectorAll('button, input, select, [tabindex]');
            focusableElements.forEach(element => {
                element.addEventListener('focus', (e) => {
                    e.target.style.outline = '2px solid #4361ee';
                    e.target.style.outlineOffset = '2px';
                });
                element.addEventListener('blur', (e) => {
                    e.target.style.outline = '';
                    e.target.style.outlineOffset = '';
                });
            });
        }

        function handleSubmit(e) {
            e.preventDefault();
            
            const height = parseFloat(document.getElementById('heightInput').value);
            const weight = parseFloat(document.getElementById('weightInput').value);
            const heightUnit = document.getElementById('heightUnit').value;
            const weightUnit = document.getElementById('weightUnit').value;
            const inches = parseFloat(document.getElementById('inchesInput').value) || 0;

            if (!height || !weight) {
                showToast('Please enter both height and weight values.');
                return;
            }

            const bmi = calculateBMI(height, weight, heightUnit, weightUnit, inches);
            displayResults(bmi);
            saveCalculationData(bmi);
        }

        function calculateBMI(height, weight, heightUnit, weightUnit, inches = 0) {
            // Convert to metric (cm and kg)
            let heightInCm = height;
            let weightInKg = weight;

            if (heightUnit === 'ft') {
                heightInCm = (height * 12 + inches) * 2.54;
            }

            if (weightUnit === 'lbs') {
                weightInKg = weight * 0.453592;
            }

            // Calculate BMI
            const heightInM = heightInCm / 100;
            const bmi = weightInKg / (heightInM * heightInM);

            return Math.round(bmi * 10) / 10;
        }

        function getBMICategory(bmi) {
            for (const [category, data] of Object.entries(bmiCategories)) {
                if (bmi >= data.range[0] && bmi < data.range[1]) {
                    return { category, ...data };
                }
            }
            return { category: 'normal', ...bmiCategories.normal };
        }

        function displayResults(bmi) {
            const categoryData = getBMICategory(bmi);
            const resultContainer = document.getElementById('resultContainer');
            const bmiValue = document.getElementById('bmiValue');
            const bmiCategory = document.getElementById('bmiCategory');
            const healthMessage = document.getElementById('healthMessage');
            const healthTip = document.getElementById('healthTip');
            const timestamp = document.getElementById('timestamp');
            const progressFill = document.getElementById('progressFill');

            // Update BMI value with gradient
            bmiValue.textContent = bmi;
            bmiValue.style.background = `var(${categoryData.gradient})`;
            bmiValue.style.webkitBackgroundClip = 'text';
            bmiValue.style.webkitTextFillColor = 'transparent';
            bmiValue.style.backgroundClip = 'text';

            // Update category with emoji
            bmiCategory.innerHTML = `
                <span class="category-emoji">${categoryData.emoji}</span>
                ${categoryData.category.charAt(0).toUpperCase() + categoryData.category.slice(1).replace(/([A-Z])/g, ' $1')}
            `;

            // Update messages with enhanced content
            healthMessage.innerHTML = `
                <p><strong>${categoryData.message}</strong></p>
                ${categoryData.risks ? `<p class="health-risk">${categoryData.risks.replace(/\n/g, '<br>')}</p>` : ''}
                ${categoryData.benefits ? `<p class="health-benefit">${categoryData.benefits.replace(/\n/g, '<br>')}</p>` : ''}
                ${categoryData.action ? `<p class="health-action">${categoryData.action.replace(/\n/g, '<br>')}</p>` : ''}
            `;

            // Update tips with formatted content
            healthTip.innerHTML = categoryData.tip.replace(/\n/g, '<br>');

            // Update timestamp
            const now = new Date();
            timestamp.textContent = `Last calculated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;

            // Update progress bar
            const progressPercent = Math.min((bmi / 40) * 100, 100);
            progressFill.style.width = `${progressPercent}%`;
            progressFill.style.setProperty('--progress-width', `${progressPercent}%`);

            // Show results with animation
            resultContainer.classList.add('show');

            // Announce results to screen readers
            const announcement = `BMI calculated: ${bmi}, Category: ${categoryData.category}`;
            announceToScreenReader(announcement);
        }

        function toggleHeightInputs() {
            const heightUnit = document.getElementById('heightUnit').value;
            const inchesContainer = document.getElementById('heightInches');
            const heightInput = document.getElementById('heightInput');

            if (heightUnit === 'ft') {
                inchesContainer.style.display = 'block';
                heightInput.placeholder = 'Enter feet';
            } else {
                inchesContainer.style.display = 'none';
                heightInput.placeholder = 'Enter height';
            }
        }

        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', currentTheme);
            
            const themeIcon = document.getElementById('themeIcon');
            themeIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
            
            localStorage.setItem('bmi-theme', currentTheme);
        }

        function toggleChart() {
            const chartContent = document.getElementById('chartContent');
            const chartIcon = document.getElementById('chartIcon');
            const chartToggle = document.querySelector('.chart-toggle');

            chartExpanded = !chartExpanded;
            
            if (chartExpanded) {
                chartContent.classList.add('expanded');
                chartIcon.textContent = '▲';
                chartToggle.setAttribute('aria-expanded', 'true');
            } else {
                chartContent.classList.remove('expanded');
                chartIcon.textContent = '▼';
                chartToggle.setAttribute('aria-expanded', 'false');
            }
        }

        function resetCalculator() {
            // Show confirmation toast
            showToast('All data has been cleared!', 'success');

            // Clear form
            document.getElementById('bmiForm').reset();
            
            // Hide results
            document.getElementById('resultContainer').classList.remove('show');
            
            // Clear localStorage
            localStorage.removeItem('bmi-form-data');
            localStorage.removeItem('bmi-result-data');
            
            // Reset height unit display
            document.getElementById('heightInches').style.display = 'none';
            
            // Focus on first input for accessibility
            document.getElementById('heightInput').focus();
        }

        function saveFormData() {
            const formData = {
                height: document.getElementById('heightInput').value,
                weight: document.getElementById('weightInput').value,
                heightUnit: document.getElementById('heightUnit').value,
                weightUnit: document.getElementById('weightUnit').value,
                inches: document.getElementById('inchesInput').value
            };
            localStorage.setItem('bmi-form-data', JSON.stringify(formData));
        }

        function saveCalculationData(bmi) {
            const resultData = {
                bmi: bmi,
                timestamp: new Date().toISOString(),
                category: getBMICategory(bmi).category
            };
            localStorage.setItem('bmi-result-data', JSON.stringify(resultData));
        }

        function loadSavedData() {
            // Load theme
            const savedTheme = localStorage.getItem('bmi-theme');
            if (savedTheme) {
                currentTheme = savedTheme;
                document.body.setAttribute('data-theme', currentTheme);
                document.getElementById('themeIcon').textContent = currentTheme === 'light' ? '🌙' : '☀️';
            }

            // Load form data
            const savedFormData = localStorage.getItem('bmi-form-data');
            if (savedFormData) {
                const formData = JSON.parse(savedFormData);
                document.getElementById('heightInput').value = formData.height || '';
                document.getElementById('weightInput').value = formData.weight || '';
                document.getElementById('heightUnit').value = formData.heightUnit || 'cm';
                document.getElementById('weightUnit').value = formData.weightUnit || 'kg';
                document.getElementById('inchesInput').value = formData.inches || '';
                
                // Update height input display
                toggleHeightInputs();
            }

            // Load and display previous results
            const savedResultData = localStorage.getItem('bmi-result-data');
            if (savedResultData) {
                const resultData = JSON.parse(savedResultData);
                displayResults(resultData.bmi);
            }
        }

        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
            
            toast.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 1rem;">${icon}</div>
                <div>${message}</div>
            `;
            
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        function announceToScreenReader(text) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = text;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }

        // Add screen reader only class
        const srOnlyStyle = document.createElement('style');
        srOnlyStyle.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
        document.head.appendChild(srOnlyStyle);

        // Service worker registration for offline functionality
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Create inline service worker
                const swCode = `
                    const CACHE_NAME = 'bmi-calculator-v1';
                    
                    self.addEventListener('install', (event) => {
                        event.waitUntil(
                            caches.open(CACHE_NAME).then((cache) => {
                                return cache.addAll(['/']);
                            })
                        );
                    });
                    
                    self.addEventListener('fetch', (event) => {
                        event.respondWith(
                            caches.match(event.request).then((response) => {
                                return response || fetch(event.request);
                            })
                        );
                    });
                `;
                
                const blob = new Blob([swCode], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(blob);
                
                navigator.serviceWorker.register(swUrl)
                    .then(() => console.log('Service Worker registered for offline functionality'))
                    .catch(() => console.log('Service Worker registration failed'));
            });
        }
