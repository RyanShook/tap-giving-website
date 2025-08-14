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

// Exit Intent Popup Configuration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize exit intent popup after page loads
    bioEp.init({
        html: `
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.3);">
                <div style="margin-bottom: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3B82F6, #1D4ED8); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-percentage" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h3 style="font-size: 28px; font-weight: 900; color: #111827; margin-bottom: 15px; font-family: 'Inter', sans-serif;">Wait! Don't Leave Yet</h3>
                    <p style="font-size: 18px; color: #6B7280; margin-bottom: 25px; font-family: 'Inter', sans-serif;">Get <strong style="color: #3B82F6;">10% off</strong> your first order plus priority processing</p>
                </div>
                
                <form id="exitPopupForm" style="margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <input type="email" id="exitEmail" name="email" placeholder="Enter your email address" required 
                               style="flex: 1; padding: 15px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; font-family: 'Inter', sans-serif; outline: none; transition: all 0.3s ease;"
                               onFocus="this.style.borderColor='#3B82F6'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)';"
                               onBlur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';">
                        <button type="submit" 
                                style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; border: none; padding: 15px 25px; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.3s ease; font-family: 'Inter', sans-serif;"
                                onMouseOver="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(59, 130, 246, 0.3)';"
                                onMouseOut="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                            Get Discount
                        </button>
                    </div>
                </form>
                
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 14px; color: #9CA3AF; margin-bottom: 15px; font-family: 'Inter', sans-serif;">✅ Limited time offer &nbsp; ✅ No spam, unsubscribe anytime</p>
                </div>
                
                <button onclick="bioEp.hidePopup()" 
                        style="background: none; border: none; color: #9CA3AF; font-size: 14px; cursor: pointer; text-decoration: underline; font-family: 'Inter', sans-serif;">
                    No thanks, I'll pay full price
                </button>
            </div>
        `,
        css: '',
        width: 520,
        height: 400,
        delay: 3000, // Wait 3 seconds before allowing popup
        showOnDelay: false,
        cookieExp: 7 // Don't show again for 7 days after closing
    });

    // Handle exit popup form submission
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'exitPopupForm') {
            e.preventDefault();
            
            const email = document.getElementById('exitEmail').value;
            
            // Create form data for Formspree
            const formData = new FormData();
            formData.append('email', email);
            formData.append('source', 'Exit Intent Popup - 10% Discount');
            formData.append('discount_type', '10% Off First Order');
            
            // Submit to Formspree
            fetch('https://formspree.io/p/2803072267095900016/f/contact', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Show success message
                    document.getElementById('exitPopupForm').innerHTML = \`
                        <div style="text-align: center; padding: 20px;">
                            <div style="color: #10B981; font-size: 48px; margin-bottom: 15px;">✓</div>
                            <h4 style="color: #10B981; font-size: 20px; font-weight: 700; margin-bottom: 10px; font-family: 'Inter', sans-serif;">Success!</h4>
                            <p style="color: #6B7280; font-size: 16px; margin-bottom: 15px; font-family: 'Inter', sans-serif;">Check your email for the 10% discount code</p>
                            <p style="color: #3B82F6; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;">We'll also send your priority quote within 2 hours!</p>
                        </div>
                    \`;
                    
                    // Auto-close popup after 3 seconds
                    setTimeout(() => {
                        bioEp.hidePopup();
                    }, 3000);
                    
                    // Track conversion
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'exit_intent_conversion', {
                            event_category: 'engagement',
                            event_label: 'discount_signup'
                        });
                    }
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('Exit popup form error:', error);
                alert('Sorry, there was an error. Please try again or call us at (832) 510-8788');
            });
        }
    });
});