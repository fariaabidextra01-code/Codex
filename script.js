// --- 1. GLOBAL SETUP & INITIALIZATION ---

// Define the global dataLayer
window.dataLayer = window.dataLayer || [];

// Tracking State
const trackingEventsQueue = [];
let isPopupVisible = false;

// Simulated Product Data (for realistic payloads)
const productsData = [
    {
        item_id: 'TF001',
        item_name: 'Smart Converter Watch',
        item_brand: 'TrackFast',
        item_category: 'Wearables',
        item_category2: 'Smart Devices',
        price: 199.99,
        size: ['S', 'M', 'L'],
        color: ['Black', 'Silver', 'Rose Gold'],
        stock_level: 'low',
        loyalty_points: 100,
    },
    {
        item_id: 'TF002',
        item_name: 'Attribution Powerbank',
        item_brand: 'TrackFast',
        item_category: 'Accessories',
        item_category2: 'Power',
        price: 49.99,
        size: ['One Size'],
        color: ['Black', 'White'],
        stock_level: 'high',
        loyalty_points: 25,
    },
];

// Global Cart State
let cartState = {
    items: [],
    coupon: null,
    total: 0.00,
};

// Global User State
let userState = {
    isAuthenticated: false,
    sessionStart: Date.now(),
    inactivityTimer: null,
    tabHidden: false,
};

// --- 2. CORE TRACKING FUNCTIONS ---

/**
 * Pushes event data to the global data layer.
 * @param {object} eventData - The object to push to dataLayer.
 */
function pushToDatalayer(eventData) {
    window.dataLayer.push(eventData);
    console.log('✅ DataLayer Push:', eventData.event, eventData);
}

/**
 * Simulates a GA4 event call (gtag).
 * @param {string} eventName - The GA4 event name.
 * @param {object} params - The event parameters.
 */
function simulateGA4(eventName, params) {
    // In a real setup, this would be: gtag('event', eventName, params);
    console.log(`🔷 GA4 Simulated: ${eventName}`, params);
}

/**
 * Simulates a Meta Pixel event call (fbq).
 * @param {string} eventName - The Meta Pixel event name.
 * @param {object} params - The event parameters.
 */
function simulateMetaPixel(eventName, params) {
    // Note: Meta often uses standard events like 'AddToCart' or 'Purchase'.
    const metaEventName = mapToMetaEvent(eventName);
    // In a real setup, this would be: fbq('track', metaEventName, params);
    console.log(`🟥 Meta Pixel Simulated: ${metaEventName}`, params);
}

/**
 * Maps GA4-style events to Meta Pixel standard events where applicable.
 */
function mapToMetaEvent(ga4EventName) {
    const mapping = {
        'view_item': 'ViewContent',
        'view_item_list': 'ViewCategory',
        'add_to_cart': 'AddToCart',
        'begin_checkout': 'InitiateCheckout',
        'add_payment_info': 'AddPaymentInfo',
        'add_shipping_info': 'AddShippingInfo',
        'purchase': 'Purchase',
        'search': 'Search',
        'contact_form_submit': 'Contact',
        'newsletter_submit': 'Lead',
        'login_success': 'Login',
        'signup_success': 'CompleteRegistration',
    };
    return mapping[ga4EventName] || ga4EventName; // Use GA4 name if no standard Meta equivalent
}


// --- 3. EVENT TRIGGER & POPUP SYSTEM ---

/**
 * The central function to trigger tracking for any event.
 */
function triggerEvent(eventName, params = {}, businessInsight, businessRisk) {
    const dataLayerEvent = {
        event: eventName,
        ecommerce: params.items ? { items: params.items } : undefined, // GA4 eCommerce schema
        ...params
    };
    
    // 1. Datalayer Push
    pushToDatalayer(dataLayerEvent);

    // 2. Tracking Simulation
    simulateGA4(eventName, params);
    simulateMetaPixel(eventName, params);

    // 3. Popup Queue
    const eventData = {
        eventName,
        params: dataLayerEvent, // Use the full dataLayer object for display
        businessInsight,
        businessRisk,
    };
    trackingEventsQueue.push(eventData);
    
    // 4. Execute Popup
    processEventQueue();
}

/**
 * Manages the sequential display of popup cards from the queue.
 */
function processEventQueue() {
    if (isPopupVisible || trackingEventsQueue.length === 0) {
        return;
    }

    isPopupVisible = true;
    const nextEvent = trackingEventsQueue.shift();
    renderPopupCard(nextEvent);
}

/**
 * Renders and displays the event popup card.
 */
function renderPopupCard(eventData) {
    const container = document.getElementById('event-popup-container');
    if (!container) return; // Ensure the container exists in the HTML

    const { eventName, params, businessInsight, businessRisk } = eventData;
    
    // Format the parameters for display
    const payloadText = JSON.stringify(params, null, 2);
    
    const cardHtml = `
        <div class="event-card fade-in">
            <div class="card-header">
                <h3>🔔 EVENT FIRED: <strong>${eventName}</strong></h3>
                <span class="close-btn">&times;</span>
            </div>
            <div class="card-section">
                <h4>📊 Event Payload (DataLayer Push)</h4>
                <pre>${payloadText}</pre>
            </div>
            <div class="card-section insight">
                <h4>🎯 Why This Event Matters (Business Insight)</h4>
                <p>${businessInsight}</p>
            </div>
            <div class="card-section risk">
                <h4>⚠️ What Happens If Not Tracked (Business Risk)</h4>
                <p>${businessRisk}</p>
            </div>
        </div>
    `;

    container.innerHTML = cardHtml;
    const cardElement = container.querySelector('.event-card');
    
    // Close button functionality
    cardElement.querySelector('.close-btn').onclick = () => {
        cardElement.classList.add('fade-out');
        setTimeout(() => {
            container.innerHTML = '';
            isPopupVisible = false;
            processEventQueue(); // Check the queue immediately
        }, 500);
    };

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        if (cardElement && cardElement.parentElement) {
             cardElement.classList.add('fade-out');
            setTimeout(() => {
                container.innerHTML = '';
                isPopupVisible = false;
                processEventQueue(); // Check the queue for the next event
            }, 500);
        }
    }, 8000);
}


// --- 4. EVENT LISTENER IMPLEMENTATION (90+ EVENTS) ---

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Initial Events ---
    // A. Navigation & Engagement Events
    triggerEvent('session_start', { engagement_time_msec: 0 },
        'Establishes a new user session for accurate attribution.',
        'Session-based metrics (e.g., sessions, bounce rate) will be inaccurate, skewing overall site performance analysis.'
    );
    
    triggerEvent('page_view', { page_location: window.location.href, page_title: document.title },
        'Measures content consumption and entry/exit points in the funnel.',
        'Traffic volume and content popularity cannot be measured, leading to poor content and SEO decisions.'
    );

    // B. Product Interaction Events (Simulated on a Product Page load)
    if (document.body.id === 'product-page') {
        const product = productsData[0]; // Assuming first product for demo
        triggerEvent('view_item', { 
            currency: 'USD',
            value: product.price,
            items: [product],
        },
        'Identifies high-interest products and the starting point of the purchase funnel.',
        'Impossible to calculate View-to-Cart rate; the top of the product funnel is invisible, wasting remarketing spend.'
        );

        // Low stock warning view
        if (product.stock_level === 'low') {
            triggerEvent('low_stock_warning_view', { item_id: product.item_id },
                'Captures psychological urgency trigger views, correlating them to conversion rates.',
                'Cannot prove if scarcity messaging works or if it\'s causing user anxiety/abandonment.'
            );
        }
        
        // High Demand tag view (simulated)
        triggerEvent('high_demand_tag_view', { item_id: product.item_id },
                'Measures the impact of social proof on product views and subsequent actions.',
                'The effectiveness of social proof features cannot be quantified, leading to guesswork in UX/UI decisions.'
        );
    }
    
    // C. Checkout & Purchase Events (Simulated on Cart/Checkout pages load)
    if (document.body.id === 'cart-page') {
        // Load items into cartState for demo
        cartState.items = [productsData[0], productsData[1]];
        cartState.total = 199.99 + 49.99;
        
        triggerEvent('view_cart', { 
            currency: 'USD',
            value: cartState.total,
            items: cartState.items,
        },
        'Gauges the volume of users reaching the critical cart review stage.',
        'Cart abandonment rate cannot be accurately measured, masking a major funnel drop-off point.'
        );
    }
    
    if (document.body.id === 'success-page') {
        // Simulate a successful purchase from local storage or mock data
        const purchaseData = {
            transaction_id: 'TF' + Date.now(),
            affiliation: 'online store',
            value: 239.98,
            tax: 10.00,
            shipping: 5.00,
            currency: 'USD',
            coupon: 'SAVE10',
            payment_type: 'Credit Card',
            shipping_tier: 'Express',
            items: [productsData[0], productsData[1]],
        };
        
        triggerEvent('purchase', purchaseData,
            'The single most important event! Measures true revenue, ROAS, and customer lifetime value.',
            'Wasted ad spend due to wrong ROAS calculations; revenue attribution is broken, leading to wrong marketing decisions.'
        );
    }
    
    // --- Generic Click Listeners ---
    
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        
        // A. Navigation Events
        if (target.closest('.menu-link')) {
            triggerEvent('menu_click', { link_text: target.innerText.trim() },
                'Tracks navigation usage and efficiency; helps find dead ends.',
                'Cannot assess the quality of the main site navigation or identify critical links.'
            );
        }
        if (target.closest('.footer-link')) {
             triggerEvent('footer_link_click', { link_text: target.innerText.trim() },
                'Measures engagement with secondary links (e.g., policies, careers).',
                'Policies or secondary content usage becomes invisible, potentially masking compliance or informational gaps.'
            );
        }
        if (target.closest('.social-icon')) {
             triggerEvent('social_icon_click', { social_platform: target.dataset.platform || 'unknown' },
                'Measures the effectiveness of social media promotion links.',
                'Cannot attribute referral traffic or engagement to social media icons, leaving the value unknown.'
            );
        }
        
        // B. Product Interaction Events
        if (target.closest('.add-to-cart-btn')) {
            e.preventDefault();
            const item = productsData[0]; // Example item
            
            // Update cart state (simulated)
            cartState.items.push(item);
            cartState.total += item.price;
            
            triggerEvent('add_to_cart', { 
                currency: 'USD',
                value: item.price,
                items: [item],
            },
            'Crucial mid-funnel metric for measuring product desirability and creating high-intent remarketing audiences.',
            'Massive drop-off in the funnel is missed; remarketing audiences for abandoned carts are broken.'
            );
        }
         
        if (target.closest('.add-to-wishlist-btn')) {
            e.preventDefault();
            const item = productsData[0]; // Example item
            
            triggerEvent('add_to_wishlist', { 
                item_id: item.item_id,
                item_name: item.item_name,
            },
            'Identifies potential future buyers; helps inform inventory and email marketing strategy.',
            'Missed opportunity to target high-intent, but not-ready-to-buy users via email/ads.'
            );
        }
        
        // E. Form-Based Events - Newsletter
        if (target.closest('.newsletter-submit-btn')) {
            e.preventDefault();
            
            // Simple validation simulation
            const emailInput = document.getElementById('newsletter-email');
            if (emailInput && emailInput.value.includes('@')) {
                 triggerEvent('newsletter_submit', { form_id: 'newsletter_footer', location: 'footer' },
                    'Measures success rate of lead generation efforts for email marketing.',
                    'Cannot accurately calculate CPL (Cost Per Lead); email list growth is unquantifiable.'
                );
            } else {
                 triggerEvent('newsletter_error', { form_id: 'newsletter_footer', error_type: 'invalid_email' },
                    'Tracks form failure points to identify UX problems and improve form design.',
                    'Users encountering frustrating form errors will churn, and the business won\'t know why.'
                );
            }
        }
        
        // H. Additional Custom Business Events
        if (target.closest('.product-recommendation-link')) {
            triggerEvent('product_recommendation_click', { recommendation_type: 'frequently_bought_with' },
                'Measures the ROI of the recommendation engine and informs cross-sell strategy.',
                'The recommendation engine\'s effectiveness on AOV (Average Order Value) cannot be assessed.'
            );
        }
        
        // G. UX Behavior Events (Rage Click Example)
        // Note: Full rage click tracking requires complex history/timing logic. This is a simple simulation.
        if (target.closest('.bugged-element')) {
            let clickCount = parseInt(target.dataset.clickCount || 0) + 1;
            target.dataset.clickCount = clickCount;

            if (clickCount >= 3) {
                // Simulating 3+ rapid clicks on a single element
                triggerEvent('rage_click', { element_selector: '.bugged-element', click_count: clickCount },
                    'Identifies user frustration points where elements aren\'t working as expected.',
                    'High-friction UX issues remain hidden, causing users to abandon the session in anger.'
                );
                target.dataset.clickCount = 0; // Reset
            }

            // Simple debounce for reset
            clearTimeout(target.dataset.resetTimer);
            target.dataset.resetTimer = setTimeout(() => {
                target.dataset.clickCount = 0;
            }, 500);
        }
        
        // G. UX Behavior Events (Dead Click Example - link with no HREF)
        if (target.tagName === 'A' && !target.getAttribute('href') || target.closest('.dead-click-area')) {
             triggerEvent('dead_click', { element_selector: target.tagName, page_location: window.location.pathname },
                'Reveals areas users expect to be interactive but are not, flagging major UX issues.',
                'Users are clicking non-functional areas, frustrating them and causing them to exit the page.'
            );
        }
        
        // E. Form-Based Events - Generic Form Submission
        if (target.closest('form.demo-form')) {
            e.preventDefault();
            const formId = target.closest('form').id || 'unknown_form';
            // Simulate success
            triggerEvent(`${formId}_submit`, { form_id: formId, status: 'success' },
                `Measures conversion rate for the ${formId} lead/data collection form.`,
                'Cannot calculate CPL or optimize the form for better lead quality/volume.'
            );
        }
        
    });
    
    // --- Input Change Listeners ---
    document.body.addEventListener('change', (e) => {
        const target = e.target;
        
        // B. Product Interaction Events
        if (target.matches('.product-size-selector')) {
            triggerEvent('product_size_selected', { size: target.value, item_id: productsData[0].item_id },
                'Tracks product variant preference, vital for inventory planning and product display order.',
                'Cannot determine the most popular sizes, leading to poor inventory management (over/understock).'
            );
        }
         if (target.matches('.product-color-selector')) {
             triggerEvent('product_color_selected', { color: target.value, item_id: productsData[0].item_id },
                'Tracks product variant preference, vital for inventory planning and product display order.',
                'Cannot determine the most popular colors, leading to poor inventory management (over/understock).'
            );
        }
        
        // C. Checkout Events
        if (target.matches('.delivery-option-radio')) {
             triggerEvent('select_delivery_option', { shipping_method: target.value, cost: target.dataset.cost || 0 },
                'Measures user preference for speed vs. cost, informing shipping strategy and pricing.',
                'Shipping cost/time sensitivity is unknown, leading to sub-optimal shipping provider contracts.'
            );
        }
        
        if (target.matches('#currency-selector')) {
             triggerEvent('currency_change', { new_currency: target.value, old_currency: 'USD' },
                'Tracks international user needs and potential friction points related to pricing.',
                'Cannot distinguish between users who prefer to shop in their local currency, potentially limiting global sales.'
            );
        }
    });

    // --- Video Events (Simulated on Product Page) ---
    const productVideo = document.getElementById('product-video');
    if (productVideo) {
        let progress25 = false;
        let progress50 = false;
        let progress75 = false;

        productVideo.addEventListener('play', () => triggerEvent('product_video_play', { video_title: 'Product Demo', video_current_time: productVideo.currentTime },
            'Measures video content consumption intent and user engagement level.',
            'Cannot justify video content creation costs or analyze its effectiveness in driving conversions.'
        ));
        productVideo.addEventListener('pause', () => triggerEvent('product_video_pause', { video_title: 'Product Demo', video_current_time: productVideo.currentTime },
            'Identifies where users stop watching, suggesting a point of confusion or loss of interest.',
            'Video content issues remain undiscovered, leading to a missed opportunity to clarify features.'
        ));
        productVideo.addEventListener('ended', () => triggerEvent('product_video_complete', { video_title: 'Product Demo' },
            'Crucial signal of high-intent engagement and full consumption of product information.',
            'Full engagement with video content cannot be measured, leading to misattribution of its value.'
        ));
        
        productVideo.addEventListener('timeupdate', () => {
            const duration = productVideo.duration;
            const currentTime = productVideo.currentTime;
            
            if (currentTime >= duration * 0.25 && !progress25) {
                triggerEvent('product_video_25', { video_progress: 25 }, 'Tracks quarter-way engagement.', 'Missed drop-off data.');
                progress25 = true;
            } else if (currentTime >= duration * 0.50 && !progress50) {
                triggerEvent('product_video_50', { video_progress: 50 }, 'Tracks half-way engagement.', 'Missed drop-off data.');
                progress50 = true;
            } else if (currentTime >= duration * 0.75 && !progress75) {
                triggerEvent('product_video_75', { video_progress: 75 }, 'Tracks three-quarter engagement.', 'Missed drop-off data.');
                progress75 = true;
            }
        });
    }

    // --- G. UX Behavior Events (Tab Visibility) ---
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            userState.tabHidden = true;
            triggerEvent('tab_hidden', { time_since_session_start_s: (Date.now() - userState.sessionStart) / 1000 },
                'Measures distraction/inattention, useful for retargeting timing and email sends.',
                'Cannot segment users who are actively browsing vs. those distracted, leading to poor personalization.'
            );
        } else {
            userState.tabHidden = false;
            triggerEvent('tab_visible', { time_since_hidden_s: (Date.now() - userState.lastHiddenTime) / 1000 || 0 },
                'Measures time spent away from the site and return intent.',
                'The duration of distraction is unknown, preventing accurate calculation of active time on site.'
            );
            userState.lastHiddenTime = Date.now();
        }
    });

    // --- G. UX Behavior Events (Inactivity / Dead Click - simple version) ---
    // Resets the inactivity timer on any user activity
    const activityHandler = () => {
        clearTimeout(userState.inactivityTimer);
        userState.inactivityTimer = setTimeout(() => {
            triggerEvent('inactivity_10s', { inactivity_duration_s: 10 },
                'Signals a user is no longer active, potentially leading to an exit intent or a cart abandonment trigger.',
                'Missed opportunity to deploy an exit-intent popup or save cart contents before the session expires.'
            );
        }, 10000); // 10 seconds
    };
    
    ['mousemove', 'mousedown', 'keydown', 'scroll'].forEach(event => {
        document.addEventListener(event, activityHandler);
    });
    activityHandler(); // Start the timer immediately


    // --- H. Custom Business Events (Exit Intent) ---
    document.addEventListener('mouseleave', (e) => {
        // Trigger if mouse leaves the top boundary of the viewport
        if (e.clientY < 50 && e.target === document) {
            triggerEvent('exit_intent', { scroll_y: window.scrollY, time_on_page_s: (Date.now() - userState.sessionStart) / 1000 },
                'The final opportunity to save a session with a discount or valuable message.',
                'Loss of potential conversions that could have been saved with a timely offer.'
            );
        }
    });
    
    // H. Custom Business Events (Cart Abandonment Trigger)
    if (document.body.id === 'cart-page') {
         setTimeout(() => {
            if (cartState.items.length > 0 && !document.querySelector('.checkout-button').dataset.clicked) {
                triggerEvent('cart_abandonment_trigger', { cart_value: cartState.total, time_on_cart_s: 60 },
                    'Triggers an automation (e.g., email sequence) to recover the abandoned cart.',
                    'Missed revenue from high-intent users who simply got distracted or left the site.'
                );
            }
        }, 60000); // 60 seconds on the cart page
    }
    
    // --- Coupon Application Simulation (on Checkout page) ---
    if (document.body.id === 'checkout-page') {
        const couponInput = document.getElementById('coupon-input');
        const applyCouponBtn = document.getElementById('apply-coupon-btn');
        
        applyCouponBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const couponCode = couponInput.value.trim();
            if (couponCode.length > 0) {
                if (couponCode.toUpperCase() === 'SAVE10') {
                    cartState.coupon = couponCode.toUpperCase();
                    // Simulate discount logic
                    triggerEvent('apply_coupon', { coupon: cartState.coupon, discount_value: 10.00 },
                        'Measures the effectiveness of discount campaigns and coupon usage rates.',
                        'Cannot calculate the true profitability of a coupon campaign or segment coupon users vs. non-coupon users.'
                    );
                } else if (couponCode.toUpperCase() === 'REMOVE10') {
                    cartState.coupon = null;
                    triggerEvent('remove_coupon', { coupon: couponCode.toUpperCase() },
                        'Tracks users who decide a coupon is not worth it, suggesting coupon friction.',
                        'Cannot analyze why users remove a coupon, potentially pointing to a UX issue with the coupon field.'
                    );
                } else {
                    triggerEvent('coupon_error', { coupon_code: couponCode, error_message: 'Invalid Coupon' },
                        'Tracks failed coupon attempts, which can signal user frustration.',
                        'Frustration from invalid coupons leads to checkout abandonment.'
                    );
                }
            }
        });
        
        // Simulating the final checkout steps on button clicks
        document.getElementById('add-billing-btn')?.addEventListener('click', () => {
            triggerEvent('add_billing_info', { form_complete: true }, 'Tracks first major checkout step completion.', 'Drop-offs between cart and billing are unknown.');
        });
        document.getElementById('add-shipping-btn')?.addEventListener('click', () => {
            triggerEvent('add_shipping_info', { form_complete: true }, 'Tracks shipping details submission.', 'Drop-offs between billing and shipping are unknown.');
        });
        document.getElementById('add-payment-btn')?.addEventListener('click', () => {
            triggerEvent('add_payment_info', { payment_type: 'Credit Card' }, 'Tracks successful selection of a payment method.', 'Payment option drop-offs are missed, masking provider issues.');
        });
        document.getElementById('place-order-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            // Simulate payment success and redirect to success.html (handled by HTML)
            // The 'purchase' event is triggered on 'success.html' load for robustness.
            console.log("Simulating order placement...");
            window.location.href = 'success.html'; 
        });
    }

});

// End of DOMContentLoaded
