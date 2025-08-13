// Tap.Giving JavaScript functionality

// Pricing calculator logic
document.addEventListener('DOMContentLoaded', function() {
    const plateSlider = document.getElementById('plateSlider');
    const plateCount = document.getElementById('plateCount');
    const pricePerPlate = document.getElementById('pricePerPlate');
    const totalPrice = document.getElementById('totalPrice');

    // Update pricing calculator
    function updatePricing() {
        const plates = parseInt(plateSlider.value);
        let pricePerUnit;

        // Pricing tiers (3 simplified levels)
        if (plates >= 400) {
            pricePerUnit = 3.50;
        } else if (plates >= 200) {
            pricePerUnit = 4.00;
        } else {
            pricePerUnit = 5.00;
        }

        const total = plates * pricePerUnit;

        plateCount.textContent = plates;
        pricePerPlate.textContent = pricePerUnit.toFixed(2);
        totalPrice.textContent = total.toFixed(0);

        // Update slider track color
        const percentage = ((plates - 100) / (1000 - 100)) * 100;
        plateSlider.style.background = `linear-gradient(to right, #3B82F6 ${percentage}%, #E5E7EB ${percentage}%)`;
    }

    // Initialize pricing
    if (plateSlider) {
        updatePricing();
        plateSlider.addEventListener('input', updatePricing);
    }
    // Form pricing calculator elements
    const formPlateSlider = document.getElementById('formPlateSlider');
    const formPlateCount = document.getElementById('formPlateCount');
    const formPricePerPlate = document.getElementById('formPricePerPlate');
    const formTotalPrice = document.getElementById('formTotalPrice');

    // Shared pricing calculation function
    function calculatePricing(plates) {
        let pricePerUnit;
        
        // Pricing tiers (3 simplified levels)
        if (plates >= 400) {
            pricePerUnit = 3.50;
        } else if (plates >= 200) {
            pricePerUnit = 4.00;
        } else {
            pricePerUnit = 5.00;
        }

        const total = plates * pricePerUnit;
        return { pricePerUnit, total };
    }
    
    // Update form pricing calculator
    function updateFormPricing() {
        const plates = parseInt(formPlateSlider.value);
        const { pricePerUnit, total } = calculatePricing(plates);

        formPlateCount.textContent = plates;
        formPricePerPlate.textContent = pricePerUnit.toFixed(2);
        formTotalPrice.textContent = total.toFixed(0);

        // Update slider track color
        const percentage = ((plates - 100) / (1000 - 100)) * 100;
        formPlateSlider.style.background = `linear-gradient(to right, #3B82F6 ${percentage}%, #E5E7EB ${percentage}%)`;
    }
    
    // Initialize form pricing calculator
    if (formPlateSlider) {
        updateFormPricing();
        formPlateSlider.addEventListener('input', updateFormPricing);
    }
});

// Smooth scrolling functions
function scrollToForm() {
    const formSection = document.getElementById('contact');
    if (formSection) {
        formSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function scrollToPricing() {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
        pricingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.church_name || !data.pastor_name || !data.email) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>Submitting...';
            submitButton.disabled = true;

            // Submit to real Formspree endpoint
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json().catch(() => ({ ok: true })); // Handle non-JSON responses
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .then(data => {
                // Success - show thank you message
                contactForm.innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span class="text-green-600 text-2xl">✓</span>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
                        <p class="text-gray-600 mb-6">We've received your request and will contact you within 24 hours with your custom pricing and ROI projection.</p>
                        <p class="text-primary-600 font-semibold">For immediate assistance, call: (832) 510-8788</p>
                        <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p class="text-green-800 text-sm font-semibold">✅ Form Successfully Submitted</p>
                            <p class="text-green-700 text-sm">Your quote request has been sent to hello@tap.giving</p>
                        </div>
                    </div>
                `;
                
                // Track successful conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'engagement',
                        event_label: 'contact_form'
                    });
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                
                // Reset button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                // Show user-friendly error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-6';
                errorDiv.innerHTML = `
                    <div class="flex items-center">
                        <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span class="text-red-600 text-sm">!</span>
                        </div>
                        <div>
                            <p class="text-red-800 font-semibold">There was an error submitting the form.</p>
                            <p class="text-red-700 text-sm">Please try again or call us directly at (832) 510-8788.</p>
                        </div>
                    </div>
                `;
                
                // Insert error message at the top of the form
                contactForm.insertBefore(errorDiv, contactForm.firstChild);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 5000);
            });
        });
    }
});

// Intersection Observer for fade-in animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{1,3})/, '($1) $2');
            }
            
            e.target.value = value;
        });
    }
});

// Urgency timer (optional - you can uncomment if you want a countdown)
/*
document.addEventListener('DOMContentLoaded', function() {
    const urgencyBadge = document.querySelector('.bg-orange-100');
    
    if (urgencyBadge) {
        // Set a date 7 days from now for the "price increase"
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);
        
        function updateCountdown() {
            const now = new Date();
            const timeDiff = targetDate - now;
            
            if (timeDiff > 0) {
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                
                urgencyBadge.innerHTML = `⚡ Pricing increases in ${days}d ${hours}h - Lock In Today`;
            }
        }
        
        updateCountdown();
        setInterval(updateCountdown, 3600000); // Update every hour
    }
});
*/

// Analytics tracking functions (add your tracking IDs)
function trackEvent(action, category, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Track button clicks
document.addEventListener('click', function(e) {
    if (e.target.matches('button')) {
        const buttonText = e.target.textContent.trim();
        trackEvent('click', 'button', buttonText);
    }
});

// Track phone clicks
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="tel:"]')) {
        trackEvent('click', 'phone', 'header_phone');
    }
});

// Scroll depth tracking
let maxScroll = 0;
window.addEventListener('scroll', function() {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        trackEvent('scroll', 'engagement', `${scrollPercent}%`);
    }
});