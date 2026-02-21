// Tap.Giving JavaScript functionality

// Form pricing calculator logic  
document.addEventListener('DOMContentLoaded', function() {
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
        // Check for preset quantity from pricing page
        const presetQuantity = sessionStorage.getItem('presetQuantity');
        if (presetQuantity) {
            formPlateSlider.value = presetQuantity;
            sessionStorage.removeItem('presetQuantity'); // Clear it after use
        }
        
        updateFormPricing();
        formPlateSlider.addEventListener('input', updateFormPricing);
    }
});

// Set quantity and scroll to form function
function setQuantity(quantity) {
    // Store the quantity for when the page loads
    sessionStorage.setItem('presetQuantity', quantity);
    
    // If we're on the same page, try to set immediately
    const formPlateSlider = document.getElementById('formPlateSlider');
    if (formPlateSlider) {
        formPlateSlider.value = quantity;
        // Trigger the update function
        const event = new Event('input');
        formPlateSlider.dispatchEvent(event);
    }
}

// Smooth scrolling functions
function scrollToForm() {
    const formSection = document.getElementById('contact');
    if (formSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const elementPosition = formSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 10; // 10px extra padding
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
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

// Pricing tier selection function
function selectPricingTier(plateCount) {
    // Scroll to the contact form
    const formSection = document.getElementById('contact');
    if (formSection) {
        formSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Wait for scroll to complete, then update the calculator
    setTimeout(() => {
        const plateSlider = document.getElementById('formPlateSlider');
        const plateCountDisplay = document.getElementById('formPlateCount');
        
        if (plateSlider && plateCountDisplay) {
            // Set the slider value
            plateSlider.value = plateCount;

            // Trigger the calculator update via the existing input handler
            const inputEvent = new Event('input', { bubbles: true });
            plateSlider.dispatchEvent(inputEvent);
            
            // Add a subtle highlight effect to show the form was updated
            const calculatorSection = plateSlider.closest('.bg-gradient-to-br');
            if (calculatorSection) {
                calculatorSection.style.transform = 'scale(1.02)';
                calculatorSection.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    calculatorSection.style.transform = 'scale(1)';
                }, 300);
            }
        }
    }, 800); // Wait for scroll animation to complete
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
            if (!data.church_name || !data.email || !data.phone) {
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
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">Order Started 🎉</h3>
                        <p class="text-gray-600 mb-6">Congratulations on taking your first step toward increased generosity and engagement! Our team will reach out to you within 24 hours to discuss your artwork and order details.</p>
                        <p class="text-primary-600 font-semibold">Have questions? Text us at <a href="sms:+18325108788" class="text-primary-600 hover:text-primary-700 underline">(832) 510-8788</a></p>
                        <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p class="text-green-800 text-sm font-semibold">✅ Order Successfully Submitted</p>
                            <p class="text-green-700 text-sm">Your order details have been sent to hello@tap.giving</p>
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
        section.classList.add('fade-section');
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

// Lazy-load Wistia demo video only when requested
document.addEventListener('DOMContentLoaded', function() {
    const videoContainer = document.querySelector('[data-wistia-id]');
    if (!videoContainer) {
        return;
    }

    const trigger = videoContainer.querySelector('[data-load-video]');
    if (!trigger) {
        return;
    }

    trigger.addEventListener('click', function() {
        const videoId = videoContainer.getAttribute('data-wistia-id');
        if (!videoId) {
            return;
        }

        embedWistiaVideo(videoContainer, videoId);
    });
});

function embedWistiaVideo(container, videoId) {
    if (container.dataset.videoLoaded === 'true') {
        return;
    }

    container.dataset.videoLoaded = 'true';

    const iframe = document.createElement('iframe');
    iframe.src = `https://fast.wistia.net/embed/iframe/${videoId}?seo=false&videoFoam=true`;
    iframe.title = 'Tap.Giving demo video';
    iframe.allow = 'autoplay; fullscreen';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.loading = 'lazy';
    iframe.className = 'absolute inset-0 w-full h-full';
    iframe.style.border = '0';

    container.innerHTML = '';
    container.appendChild(iframe);

    if (!document.querySelector('script[src*="fast.wistia.net/assets/external/E-v1.js"]')) {
        const wistiaScript = document.createElement('script');
        wistiaScript.src = 'https://fast.wistia.net/assets/external/E-v1.js';
        wistiaScript.async = true;
        wistiaScript.defer = true;
        document.body.appendChild(wistiaScript);
    }
}

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

// Hero Phone Tap Animation based on scroll
function animatePhoneTap() {
    const phoneImage = document.getElementById('phone-image');
    const plateImage = document.getElementById('plate-image');
    const tapRings = document.getElementById('tap-rings');
    const container = document.getElementById('tap-animation-container');
    
    if (!phoneImage || !tapRings || !container) return;
    
    // Get the container's position relative to the viewport
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;
    
    // Calculate animation progress based on scroll
    // Animation starts immediately when user scrolls and moves faster
    let progress = 0;
    
    // Start animation as soon as any scrolling happens
    const scrollY = window.scrollY;
    
    if (scrollY > 0) {
        // Animation starts immediately on scroll and completes faster
        const animationStartScroll = 0; // Start immediately
        const animationCompleteScroll = 200; // Complete animation after 200px of scroll (faster)
        
        progress = Math.max(0, Math.min(1, (scrollY - animationStartScroll) / (animationCompleteScroll - animationStartScroll)));
    }
    
    // Animate phone position (moves up and right to plate as user scrolls down)
    const maxDistance = 120; // Distance phone travels upward to reach plate
    const currentPosition = -progress * maxDistance; // Negative to move up from starting position
    const rightMovement = progress * 50; // Move 50px to the right as it approaches (starts much more left, ends even further left)
    
    // Update phone position (starts much further left, moves up and right but ends left of plate)
    phoneImage.style.transform = `translate(calc(-50% - 120px + ${rightMovement}px), ${currentPosition}px)`;
    
    // Add rotation to phone as it approaches
    const rotation = progress * 10; // 10 degrees clockwise rotation (more subtle)
    phoneImage.style.transform += ` rotate(${rotation}deg)`;
    
    // Plate scaling animation - scale up 10% during animation
    if (plateImage) {
        const plateScale = 1 + (progress * 0.1); // Scales from 1.0 to 1.1
        plateImage.style.transform = `translate(-50%, 0) scale(${plateScale})`;
    }
    
    // Show tap rings when phone reaches the plate (last 30% of animation)
    if (progress > 0.7) {
        tapRings.style.opacity = Math.min(1, (progress - 0.7) / 0.3);
    } else {
        tapRings.style.opacity = '0';
    }
}

// Add scroll listener for phone animation
window.addEventListener('scroll', animatePhoneTap);
window.addEventListener('resize', animatePhoneTap);

// Initialize animation on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(animatePhoneTap, 100); // Small delay to ensure elements are rendered
});

// Mobile Phone Scroll Animation
function animateMobilePhone() {
    const mobilePhone = document.getElementById('mobile-phone-image');
    const mobilePlate = document.getElementById('mobile-plate-image');
    const mobileRings = document.getElementById('mobile-tap-rings');
    
    if (!mobilePhone) return;
    
    // Check if we're on mobile (screen width less than 1024px)
    if (window.innerWidth >= 1024) return;
    
    // Get scroll progress
    const scrollY = window.scrollY;
    const animationStart = 100; // Animation starts after 100px of scroll (1/4 of original 400px)
    const animationDuration = 200; // Animation runs for 200px (2/4 of original 400px)
    const animationEnd = animationStart + animationDuration; // Ends at 300px
    
    // Calculate animation progress (0 to 1) only during the active animation window
    let progress = 0;
    if (scrollY >= animationStart) {
        progress = Math.min(1, (scrollY - animationStart) / animationDuration);
    }
    
    // Mobile phone animation - starts closer to plate, travels less distance, positioned more to the left
    const translateX = -120 + (progress * 40); // Moves from -120% to -80% (shifted left by 20%)
    const rotation = 20 - (progress * 10); // Rotation decreases from 20deg to 10deg (ends more rotated clockwise)
    
    // Apply the transforms to phone
    mobilePhone.style.transform = `translateX(${translateX}%) rotate(${rotation}deg)`;
    
    // Add subtle opacity animation to phone
    const opacity = 0.9 + (progress * 0.1);
    mobilePhone.style.opacity = opacity;
    
    // Plate animation - scale up 10% during animation
    if (mobilePlate) {
        const plateScale = 1 + (progress * 0.1); // Scales from 1.0 to 1.1
        mobilePlate.style.transform = `translate(-50%, 0) scale(${plateScale})`;
    }
    
    // Rings animation - appear only at the end (last 20% of animation) and stay visible
    if (mobileRings) {
        if (progress >= 0.8) {
            // Rings appear in the last 20% of the animation and stay up
            mobileRings.style.opacity = '1';
        } else {
            // Keep rings hidden during most of the animation
            mobileRings.style.opacity = '0';
        }
    }
}

// Add scroll listener for mobile phone animation
window.addEventListener('scroll', animateMobilePhone);
window.addEventListener('resize', animateMobilePhone);

// Initialize mobile animation on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(animateMobilePhone, 100);
});

// Exit Intent Popup Configuration
// DISABLED - To re-enable, remove the return statement below
document.addEventListener('DOMContentLoaded', function() {
    // Exit intent popup disabled
    return;

    // Check if bioEp library is loaded
    if (typeof bioEp === 'undefined') {
        console.error('bioEp library not loaded. Make sure bioep.min.js is included.');
        return;
    }

    console.log('Initializing exit intent popup...');
    
    // Initialize exit intent popup after page loads
    bioEp.init({
        html: `
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.3);">
                <div style="margin-bottom: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3B82F6, #1D4ED8); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <span style="color: white; font-size: 24px; font-weight: bold;">%</span>
                    </div>
                    <h3 style="font-size: 28px; font-weight: 900; color: #111827; margin-bottom: 15px; font-family: 'Inter', sans-serif;">Wait! Don't Leave Yet</h3>
                    <p style="font-size: 18px; color: #6B7280; margin-bottom: 25px; font-family: 'Inter', sans-serif;">Get <strong style="color: #3B82F6;">10% off</strong> your first order plus priority processing</p>
                </div>
                
                <form id="exitPopupForm" style="margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <input type="email" id="exitEmail" name="email" placeholder="Enter your email address" required 
                               style="flex: 1; padding: 15px; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 16px; font-family: 'Inter', sans-serif; outline: none; transition: all 0.3s ease;"
                               onfocus="this.style.borderColor='#3B82F6'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)';"
                               onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';">
                        <button type="submit" 
                                style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; border: none; padding: 15px 25px; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.3s ease; font-family: 'Inter', sans-serif;"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(59, 130, 246, 0.3)';"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
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
        css: `
            #bio_ep {
                background: none !important;
                box-shadow: none !important;
            }
            #bio_ep_bg {
                background-color: rgba(0, 0, 0, 0.6) !important;
                opacity: 1 !important;
            }
        `,
        width: 520,
        height: 400,
        delay: 1, // Reduced delay to 1 second
        showOnDelay: false,
        cookieExp: 1 // Reduced to 1 day for testing
    });

    // Add multiple test triggers for debugging (remove in production)
    // You can test the popup by pressing Ctrl+Shift+P
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            console.log('Manually triggering exit intent popup via Ctrl+Shift+P');
            bioEp.showPopup();
        }
        // Also add Escape key to close popup for testing
        if (e.key === 'Escape' && bioEp.shown) {
            console.log('Manually closing popup via Escape key');
            bioEp.hidePopup();
        }
    });

    // Add a simple click trigger for testing - click on logo 5 times quickly
    let logoClickCount = 0;
    let logoClickTimer;
    const logo = document.querySelector('img[alt="Tap.Giving Logo"]');
    if (logo) {
        logo.addEventListener('click', function() {
            logoClickCount++;
            clearTimeout(logoClickTimer);
            
            if (logoClickCount >= 5) {
                console.log('Logo clicked 5 times - showing popup for testing');
                bioEp.showPopup();
                logoClickCount = 0;
                return;
            }
            
            // Reset click count after 2 seconds
            logoClickTimer = setTimeout(() => {
                logoClickCount = 0;
            }, 2000);
        });
    }

    // Add debug info to console every 5 seconds
    setInterval(function() {
        console.log('Exit Intent Debug - timeOnPage:', timeOnPage, 'scrollDepth:', scrollDepth, 'hasMouseMovement:', hasMouseMovement, 'popup shown:', bioEp.shown);
    }, 5000);

    // Add function to clear cookies for testing (call tapGivingDebug.clearCookies() in console)
    window.tapGivingDebug = {
        clearCookies: function() {
            document.cookie = 'bioep_shown=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            document.cookie = 'bioep_shown_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            bioEp.shown = false;
            console.log('Exit intent cookies cleared and popup reset');
        },
        showPopup: function() {
            bioEp.showPopup();
        },
        hidePopup: function() {
            bioEp.hidePopup();
        },
        getStatus: function() {
            return {
                timeOnPage: timeOnPage,
                scrollDepth: scrollDepth,
                hasMouseMovement: hasMouseMovement,
                popupShown: bioEp.shown,
                cookies: {
                    bioep_shown: document.cookie.includes('bioep_shown=true'),
                    bioep_shown_session: document.cookie.includes('bioep_shown_session=true')
                }
            };
        }
    };

    // Add additional exit intent triggers with more aggressive detection
    let exitIntentTimer;
    let scrollDepth = 0;
    let timeOnPage = 0;
    let hasMouseMovement = false;
    
    // Track time on page
    const startTime = Date.now();
    setInterval(function() {
        timeOnPage = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
    
    // Track scroll depth
    window.addEventListener('scroll', function() {
        const currentScroll = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        scrollDepth = Math.max(scrollDepth, currentScroll);
    });

    // Track mouse movement to ensure user is active
    let mouseY = 0;
    document.addEventListener('mousemove', function(e) {
        mouseY = e.clientY;
        hasMouseMovement = true;
    });

    // More aggressive mouse leave detection
    document.addEventListener('mouseleave', function(e) {
        // Trigger if user has been on page for at least 5 seconds OR scrolled at least 10%
        if ((timeOnPage >= 5 || scrollDepth >= 10) && hasMouseMovement) {
            console.log('Exit intent detected via mouseleave - timeOnPage:', timeOnPage, 'scrollDepth:', scrollDepth);
            if (!bioEp.shown) {
                bioEp.showPopup();
            }
        }
    });

    // Detect upward mouse movement to top of screen (more sensitive)
    let lastMouseY = 0;
    document.addEventListener('mousemove', function(e) {
        if (e.clientY < 50 && lastMouseY > 50 && timeOnPage >= 3) {
            // Mouse moved to top 50px of screen and user has been here 3+ seconds
            console.log('Exit intent detected via mouse movement to top');
            if (!bioEp.shown) {
                bioEp.showPopup();
            }
        }
        lastMouseY = e.clientY;
    });

    // Alternative: detect when user tries to close tab/window
    window.addEventListener('beforeunload', function(e) {
        if (!bioEp.shown && timeOnPage >= 5) {
            // This won't show our popup due to browser restrictions, 
            // but we can track the attempt
            console.log('User attempting to leave page after', timeOnPage, 'seconds');
        }
    });

    // Additional trigger: page visibility change (tab switching)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && !bioEp.shown && timeOnPage >= 10) {
            // User switched away from tab after 10+ seconds - potential exit intent
            setTimeout(function() {
                if (document.visibilityState === 'visible' && !bioEp.shown) {
                    console.log('Exit intent detected via tab switch return');
                    bioEp.showPopup();
                }
            }, 500);
        }
    });

    // Reduced timeout trigger - show after user has been on page for 20 seconds
    setTimeout(function() {
        if (!bioEp.shown && (scrollDepth >= 15 || timeOnPage >= 20)) {
            console.log('Exit intent triggered by timeout - scrollDepth:', scrollDepth, 'timeOnPage:', timeOnPage);
            bioEp.showPopup();
        }
    }, 20000);

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
                    document.getElementById('exitPopupForm').innerHTML = `
                        <div style="text-align: center; padding: 20px;">
                            <div style="color: #10B981; font-size: 48px; margin-bottom: 15px;">✓</div>
                            <h4 style="color: #10B981; font-size: 20px; font-weight: 700; margin-bottom: 10px; font-family: 'Inter', sans-serif;">Success!</h4>
                            <p style="color: #6B7280; font-size: 16px; margin-bottom: 15px; font-family: 'Inter', sans-serif;">Check your email for the 10% discount code</p>
                            <p style="color: #3B82F6; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;">We'll also send your priority quote within 2 hours!</p>
                        </div>
                    `;
                    
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
