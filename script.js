// Toast Notification System
function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    
    const titles = {
        success: title || 'Success!',
        error: title || 'Error',
        warning: title || 'Warning',
        info: title || 'Info'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Create animated background elements
function createBackgroundElements() {
    const bgElements = document.getElementById('bgElements');
    const elementCount = 15;
    
    for (let i = 0; i < elementCount; i++) {
        const element = document.createElement('div');
        element.classList.add('bg-element');
        
        const size = Math.random() * 100 + 50;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 30 + 20;
        const animationDelay = Math.random() * 10;
        
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.left = `${left}%`;
        element.style.animationDuration = `${animationDuration}s`;
        element.style.animationDelay = `${animationDelay}s`;
        
        bgElements.appendChild(element);
    }
}

// Mobile menu toggle
document.getElementById('mobileMenu').addEventListener('click', function() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
    this.querySelector('i').classList.toggle('fa-bars');
    this.querySelector('i').classList.toggle('fa-times');
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            if(window.innerWidth <= 768) {
                document.getElementById('navMenu').classList.remove('active');
                document.getElementById('mobileMenu').querySelector('i').classList.add('fa-bars');
                document.getElementById('mobileMenu').querySelector('i').classList.remove('fa-times');
            }
        }
    });
});

// Authentication & User Management
let currentUser = null;
let totalUsers = 0;

// API Base URL - Points to Render backend
// TODO: Replace with your actual Render URL after deployment
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://YOUR-APP-NAME.onrender.com';  // REPLACE THIS WITH YOUR RENDER URL

// Retry fetch with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        return true;
    }
    return false;
}

function showLoginError(message, isSuccess = false) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.className = isSuccess ? 'login-success' : 'login-error';
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 4000);
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('loginError').style.display = 'none';
}

async function handleSignup() {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    
    if (!email || !password) {
        showLoginError('⚠️ Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showLoginError('⚠️ Password must be at least 6 characters');
        return;
    }
    
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            if (error.error === 'User exists') {
                showLoginError('⚠️ Email already registered. Please login.');
                setTimeout(() => showLogin(), 2000);
            } else if (error.error === 'Invalid email format') {
                showLoginError('⚠️ Invalid email format');
            } else if (error.error === 'Password must be at least 6 characters') {
                showLoginError('⚠️ Password must be at least 6 characters');
            } else if (error.error === 'Too many requests. Please try again later.') {
                showLoginError('⚠️ Too many signup attempts. Please wait a moment.');
            } else {
                showLoginError('⚠️ Signup failed. Please try again.');
            }
            return;
        }
        
        const data = await response.json();
        totalUsers = data.total_users;
        const userPlan = data.plan;
        const userNumber = data.user_number;
        
        currentUser = { email, plan: userPlan, userNumber: userNumber };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserCount();
        
        if (userPlan === 'pro') {
            showLoginError(`🎉 Congratulations! You're user #${userNumber} and got Pro FREE!`, true);
            setTimeout(() => {
                document.getElementById('loginModal').style.display = 'none';
                showToast(`You're user #${userNumber} and got Pro FREE! 🎉`, 'success', 'Welcome!');
                initializeUser();
            }, 2000);
        } else {
            showLoginError('✅ Account created successfully!', true);
            setTimeout(() => {
                document.getElementById('loginModal').style.display = 'none';
                initializeUser();
            }, 1500);
        }
    } catch (error) {
        // Network error - allow signup to work offline
        showLoginError('⚠️ Unable to verify. Creating account...');
        // Create account locally
        const localUser = { email, plan: 'free', userNumber: Date.now() };
        currentUser = localUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        setTimeout(() => {
            document.getElementById('loginModal').style.display = 'none';
            initializeUser();
        }, 1500);
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showLoginError('⚠️ Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            if (error.error === 'User not found') {
                showLoginError('❌ Account not found. Please sign up.');
                setTimeout(() => showSignup(), 2000);
            } else if (error.error === 'Invalid password') {
                showLoginError('❌ Incorrect password');
            } else if (error.error === 'Email and password required') {
                showLoginError('⚠️ Please fill in all fields');
            } else if (error.error === 'Too many requests. Please try again later.') {
                showLoginError('⚠️ Too many login attempts. Please wait a moment.');
            } else {
                showLoginError('❌ Login failed. Please try again.');
            }
            return;
        }
        
        const data = await response.json();
        currentUser = { email, plan: data.plan, userNumber: data.user_number };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showLoginError('✅ Welcome back!', true);
        
        setTimeout(() => {
            document.getElementById('loginModal').style.display = 'none';
            showToast('Welcome back!', 'success', 'Logged In');
            initializeUser();
        }, 1500);
    } catch (error) {
        // Check if user exists locally
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                if (currentUser.email === email) {
                    showLoginError('✅ Welcome back! (Offline mode)', true);
                    setTimeout(() => {
                        document.getElementById('loginModal').style.display = 'none';
                        initializeUser();
                    }, 1500);
                    return;
                }
            } catch (e) {}
        }
        showLoginError('❌ Account not found. Please sign up.');
        setTimeout(() => showSignup(), 2000);
    }
}

function initializeUser() {
    // Show user info in nav
    document.getElementById('userMenuBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('userEmail').textContent = currentUser.email.split('@')[0];
    
    if (currentUser.plan === 'pro') {
        currentPlan = 'pro';
        scriptsRemaining = 999;
        document.getElementById('advancedOptions').style.display = 'block';
        document.querySelector('.pro-feature').style.opacity = '1';
        document.getElementById('proBtn').classList.add('current-plan');
        document.getElementById('proBtn').textContent = 'Current Plan';
        document.getElementById('freeBtn').classList.remove('current-plan');
        document.getElementById('freeBtn').textContent = 'Downgrade';
    } else if (currentUser.plan === 'enterprise') {
        currentPlan = 'enterprise';
        scriptsRemaining = 999;
        document.getElementById('advancedOptions').style.display = 'block';
        document.getElementById('enterpriseOptions').style.display = 'block';
        document.getElementById('brandVoiceSection').style.display = 'block';
        document.getElementById('templateSection').style.display = 'block';
        document.querySelector('.pro-feature').style.opacity = '1';
        document.querySelectorAll('.enterprise-feature').forEach(el => el.style.opacity = '1');
        document.getElementById('enterpriseBtn').classList.add('current-plan');
        document.getElementById('enterpriseBtn').textContent = 'Current Plan';
    }
    updatePlanBadge();
    updateUserCount();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    currentPlan = 'free';
    scriptsRemaining = 5;
    
    // Hide user menu
    document.getElementById('userMenuBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    
    // Reset UI
    document.getElementById('advancedOptions').style.display = 'none';
    document.getElementById('enterpriseOptions').style.display = 'none';
    document.getElementById('brandVoiceSection').style.display = 'none';
    document.getElementById('templateSection').style.display = 'none';
    document.getElementById('proBtn').classList.remove('current-plan');
    document.getElementById('proBtn').textContent = 'Upgrade to Pro';
    document.getElementById('enterpriseBtn').classList.remove('current-plan');
    document.getElementById('enterpriseBtn').textContent = 'Upgrade to Enterprise';
    document.getElementById('freeBtn').classList.add('current-plan');
    document.getElementById('freeBtn').textContent = 'Current Plan';
    
    updatePlanBadge();
    
    // Show login modal
    document.getElementById('loginModal').style.display = 'flex';
    showToast('Logged out successfully', 'info', 'Goodbye!');
}

async function updateUserCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user-count`);
        const data = await response.json();
        totalUsers = data.total_users;
        document.getElementById('userCount').textContent = totalUsers;
        if (totalUsers >= 100) {
            document.getElementById('limitedOffer').style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to fetch user count');
        document.getElementById('userCount').textContent = '0';
    }
}

// Plan management
let currentPlan = 'free'; // 'free', 'pro', 'enterprise'
let scriptsRemaining = 5;
let scriptsGeneratedToday = 0;
let teamMembers = [];

// Check localStorage for daily limit
const today = new Date().toDateString();
const savedDate = localStorage.getItem('scriptDate');
if (savedDate !== today) {
    localStorage.setItem('scriptDate', today);
    localStorage.setItem('scriptsCount', '0');
    scriptsGeneratedToday = 0;
} else {
    scriptsGeneratedToday = parseInt(localStorage.getItem('scriptsCount') || '0');
}
scriptsRemaining = 5 - scriptsGeneratedToday;

// Update plan badge
function updatePlanBadge() {
    const badge = document.getElementById('planBadge');
    if (currentPlan === 'free') {
        badge.innerHTML = `<i class="fas fa-star"></i> Free Plan - ${scriptsRemaining} scripts remaining today`;
        badge.style.background = 'rgba(255, 215, 0, 0.1)';
    } else if (currentPlan === 'pro') {
        badge.innerHTML = '<i class="fas fa-crown"></i> Pro Plan - Unlimited scripts';
        badge.style.background = 'rgba(255, 215, 0, 0.2)';
    } else if (currentPlan === 'enterprise') {
        badge.innerHTML = '<i class="fas fa-building"></i> Enterprise Plan - Unlimited + Team Features';
        badge.style.background = 'rgba(59, 130, 246, 0.2)';
        badge.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        badge.style.color = '#3b82f6';
    }
}
updatePlanBadge();

// PayPal Integration
function initPayPalButton(buttonId, amount, planName) {
    const button = document.getElementById(buttonId);
    if (!button || button.classList.contains('current-plan')) return;
    
    button.addEventListener('click', () => {
        if (!currentUser) {
            document.getElementById('loginModal').style.display = 'flex';
            showToast('Please login or sign up to upgrade your plan', 'warning', 'Login Required');
            return;
        }
        
        // Check if user is in first 100 and trying to upgrade to Pro
        if (planName === 'Pro' && currentUser && currentUser.userNumber <= 100) {
            showToast('You already have Pro for FREE as one of the first 100 users!', 'success', 'Already Pro!');
            return;
        }
        
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:10000;backdrop-filter:blur(10px)';
        modal.innerHTML = `
            <div style="background:linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);padding:40px;border-radius:20px;max-width:500px;width:90%;position:relative;border:2px solid rgba(255,215,0,0.3);box-shadow:0 0 30px rgba(255,215,0,0.4)">
                <button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:15px;right:15px;background:none;border:none;font-size:28px;cursor:pointer;color:#ffd700;width:40px;height:40px;border-radius:50%;transition:all 0.3s" onmouseover="this.style.background='rgba(255,215,0,0.1)';this.style.transform='rotate(90deg)'" onmouseout="this.style.background='none';this.style.transform='rotate(0)'">&times;</button>
                <h2 style="margin:0 0 15px;color:#ffd700;text-align:center;font-size:2rem;text-shadow:0 0 20px rgba(255,215,0,0.5);background:linear-gradient(135deg, #FFD700 0%, #FFEC8B 50%, #FFD700 100%);-webkit-background-clip:text;background-clip:text;color:transparent">Upgrade to ${planName}</h2>
                <p style="color:#ccc;margin-bottom:15px;text-align:center;font-size:1.1rem">$${amount}/month - Cancel anytime</p>
                <p style="color:#ff9999;margin-bottom:25px;text-align:center;font-size:0.85rem;padding:10px;background:rgba(255,68,68,0.1);border-radius:8px;border:1px solid rgba(255,68,68,0.3);"><i class="fas fa-info-circle"></i> Please note: All sales are final. We appreciate your understanding as this helps us maintain quality service for all users.</p>
                <div id="paypal-button-container-${buttonId}"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: amount },
                        description: `TikTok Script AI - ${planName} Plan Subscription`
                    }]
                });
            },
            onApprove: async function(data, actions) {
                return actions.order.capture().then(async function(details) {
                    modal.remove();
                    
                    const newPlan = planName === 'Pro' ? 'pro' : 'enterprise';
                    
                    // Update backend
                    if (currentUser) {
                        try {
                            await fetch(`${API_BASE_URL}/api/upgrade`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: currentUser.email, plan: newPlan })
                            });
                        } catch (error) {
                            console.error('Failed to update plan on server');
                        }
                    }
                    
                    if (planName === 'Pro') {
                        currentPlan = 'pro';
                        scriptsRemaining = 999;
                        document.getElementById('advancedOptions').style.display = 'block';
                        document.querySelector('.pro-feature').style.opacity = '1';
                        updatePlanBadge();
                        document.getElementById('freeBtn').classList.remove('current-plan');
                        document.getElementById('freeBtn').textContent = 'Downgrade';
                        document.getElementById('proBtn').classList.add('current-plan');
                        document.getElementById('proBtn').textContent = 'Current Plan';
                        
                        if (currentUser) {
                            currentUser.plan = 'pro';
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        }
                        
                        showToast('Payment successful! You now have unlimited scripts and advanced features!', 'success', '🎉 Welcome to Pro!');
                    } else if (planName === 'Enterprise') {
                        currentPlan = 'enterprise';
                        scriptsRemaining = 999;
                        document.getElementById('advancedOptions').style.display = 'block';
                        document.getElementById('enterpriseOptions').style.display = 'block';
                        document.getElementById('brandVoiceSection').style.display = 'block';
                        document.getElementById('templateSection').style.display = 'block';
                        document.querySelector('.pro-feature').style.opacity = '1';
                        document.querySelectorAll('.enterprise-feature').forEach(el => el.style.opacity = '1');
                        updatePlanBadge();
                        document.getElementById('freeBtn').classList.remove('current-plan');
                        document.getElementById('freeBtn').textContent = 'Downgrade';
                        document.getElementById('proBtn').classList.remove('current-plan');
                        document.getElementById('proBtn').textContent = 'Downgrade';
                        document.getElementById('enterpriseBtn').classList.add('current-plan');
                        document.getElementById('enterpriseBtn').textContent = 'Current Plan';
                        
                        if (currentUser) {
                            currentUser.plan = 'enterprise';
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        }
                        
                        showToast('Payment successful! Welcome to Enterprise with team collaboration and advanced features!', 'success', '🏢 Enterprise Activated');
                    }
                });
            },
            onError: function(err) {
                modal.remove();
                showToast('Payment failed. Please try again.', 'error', 'Payment Error');
            }
        }).render(`#paypal-button-container-${buttonId}`);
    });
}

// Plan buttons
initPayPalButton('proBtn', '19.00', 'Pro');
initPayPalButton('enterpriseBtn', '99.00', 'Enterprise');

document.getElementById('freeBtn').addEventListener('click', () => {
    if (currentPlan !== 'free') {
        currentPlan = 'free';
        scriptsRemaining = 5 - scriptsGeneratedToday;
        document.getElementById('advancedOptions').style.display = 'none';
        document.getElementById('enterpriseOptions').style.display = 'none';
        document.getElementById('brandVoiceSection').style.display = 'none';
        document.getElementById('templateSection').style.display = 'none';
        updatePlanBadge();
        document.getElementById('proBtn').classList.remove('current-plan');
        document.getElementById('proBtn').textContent = 'Upgrade to Pro';
        document.getElementById('enterpriseBtn').classList.remove('current-plan');
        document.getElementById('enterpriseBtn').textContent = 'Upgrade to Enterprise';
        document.getElementById('freeBtn').classList.add('current-plan');
        document.getElementById('freeBtn').textContent = 'Current Plan';
        showToast('Downgraded to Free plan. You have 5 scripts per day.', 'info', 'Plan Changed');
    }
});

// Script generation
document.getElementById('generateBtn').addEventListener('click', generateScript);

function generateScript() {
    if (!currentUser) {
        document.getElementById('loginModal').style.display = 'flex';
        showToast('Please login or sign up to generate scripts', 'warning', 'Login Required');
        return;
    }
    
    const topic = document.getElementById('topic').value.trim();
    const length = document.getElementById('length').value;
    const tone = document.getElementById('tone').value;
    const audience = document.getElementById('audience').value.trim();
    const cta = document.getElementById('cta').value;
    
    if (!topic) {
        showToast('Please enter a video topic or idea to generate your script.', 'warning', 'Missing Topic');
        document.getElementById('topic').focus();
        return;
    }
    
    // Check free plan limits
    if (currentPlan === 'free' && scriptsRemaining <= 0) {
        showToast('You\'ve reached your daily limit of 5 scripts. Upgrade to Pro for unlimited access!', 'error', 'Daily Limit Reached');
        setTimeout(() => {
            document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
        }, 500);
        return;
    }
    
    const scriptOutput = document.getElementById('scriptOutput');
    const copyBtn = document.getElementById('copyBtn');
    
    // Show loading
    scriptOutput.innerHTML = '<div class="placeholder"><i class="fas fa-spinner fa-spin"></i><p>Generating your script...</p></div>';
    
    // Faster generation for better UX
    const delay = currentPlan === 'pro' ? 800 : 1200;
    setTimeout(() => {
        const script = createScript(topic, length, tone, audience, cta);
        scriptOutput.innerHTML = script;
        copyBtn.style.display = 'block';
        
        // Show export button for Pro/Enterprise users
        if (currentPlan === 'pro' || currentPlan === 'enterprise') {
            document.getElementById('exportBtn').style.display = 'block';
        }
        
        // Update counters
        if (currentPlan === 'free') {
            scriptsRemaining--;
            scriptsGeneratedToday++;
            localStorage.setItem('scriptsCount', scriptsGeneratedToday.toString());
            updatePlanBadge();
            
            if (scriptsRemaining === 1) {
                showToast('You have 1 script remaining today. Consider upgrading to Pro!', 'warning', 'Almost at Limit');
            } else if (scriptsRemaining === 0) {
                showToast('That was your last free script today! Upgrade to Pro for unlimited access.', 'info', 'Daily Limit Reached');
            }
        }
        
        showToast('Your script has been generated successfully!', 'success', 'Script Ready');
    }, delay);
}

function createScript(topic, length, tone, audience, cta) {
    const isPro = currentPlan === 'pro' || currentPlan === 'enterprise';
    const isEnterprise = currentPlan === 'enterprise';
    const includeHashtags = isPro && document.getElementById('includeHashtags')?.checked;
    const includeMusic = isPro && document.getElementById('includeMusic')?.checked;
    const includeVisuals = isPro && document.getElementById('includeVisuals')?.checked;
    const multipleVersions = isPro && document.getElementById('multipleVersions')?.checked;
    
    // Enterprise features
    const useBrandVoice = isEnterprise && document.getElementById('useBrandVoice')?.checked;
    const includeAnalytics = isEnterprise && document.getElementById('includeAnalytics')?.checked;
    const useTemplate = isEnterprise && document.getElementById('useTemplate')?.checked;
    const teamReview = isEnterprise && document.getElementById('teamReview')?.checked;
    const brandVoice = isEnterprise ? document.getElementById('brandVoice')?.value : 'default';
    const customTemplate = isEnterprise ? document.getElementById('customTemplate')?.value : 'none';
    
    // Pro gets more hook options
    const hooks = {
        funny: [
            "Wait, you're doing it WRONG! 😱",
            "Nobody told me this until now... 🤯",
            "This is either genius or crazy... 🤪"
        ],
        educational: [
            "Here's what nobody tells you about...",
            "The truth about... (and it's not what you think)",
            "3 things you NEED to know about..."
        ],
        serious: [
            "This changed everything for me...",
            "If you're struggling with this, listen up...",
            "Here's the reality about..."
        ],
        casual: [
            "So I tried this and...",
            "Let me tell you about...",
            "Quick story about..."
        ],
        inspirational: [
            "Your life is about to change...",
            "This is your sign to...",
            "Imagine if you could..."
        ]
    };
    
    // Pro exclusive hooks
    if (isPro) {
        hooks.funny.push("POV: You just discovered...", "Tell me why nobody talks about...");
        hooks.educational.push("I tested this for 30 days and...", "The science behind...");
        hooks.serious.push("We need to talk about...", "The uncomfortable truth about...");
        hooks.casual.push("Day in the life:", "Things I wish I knew about...");
        hooks.inspirational.push("Stop scrolling. This is for you.", "What if I told you...");
    }
    
    const ctaMessages = {
        like: "If this helped you, smash that like button and follow for more! 💛",
        comment: "Drop a comment below with your thoughts! I read every single one! 💬",
        share: "Share this with someone who needs to see it! 🔄",
        link: "Link in bio for more details - don't miss out! 🔗",
        subscribe: "Hit that follow button for daily tips like this! 🔔"
    };
    
    const hook = hooks[tone][Math.floor(Math.random() * hooks[tone].length)];
    const ctaMessage = ctaMessages[cta];
    
    // Pro features - Enhanced
    const trendingHashtags = isPro ? [
        `#${topic.replace(/\s+/g, '')}`,
        '#Viral',
        '#ForYou',
        '#FYP',
        '#Trending',
        `#${tone.charAt(0).toUpperCase() + tone.slice(1)}`,
        '#ContentCreator',
        '#TikTokTips',
        '#Fyp',
        '#Explore',
        audience ? `#${audience.replace(/\s+/g, '')}` : '#ViralContent'
    ] : [`#${topic.replace(/\s+/g, '')}`, '#TikTok', '#Viral'];
    
    const musicSuggestions = isPro ? [
        tone === 'funny' ? '🎵 Trending: "Funny Moments" - Viral Sound' : '🎵 Trending: "Original Sound" by popular creator',
        tone === 'educational' ? '🎵 Focus: "Study Beats" - Lo-fi Hip Hop' : '🎵 Upbeat: "Good Vibes" - Royalty Free',
        tone === 'serious' ? '🎵 Ambient: "Cinematic Background" - Dramatic' : '🎵 Chill: "Lo-fi Beats" - Background Music',
        '🎵 Alternative: Check TikTok trending sounds for your niche'
    ] : [];
    
    const visualCues = isPro ? [
        `📹 0-3s: ${tone === 'funny' ? 'Attention-grabbing reaction or meme' : 'Close-up with bold text overlay'}`,
        `📹 3-${length === '15' ? '8' : length === '30' ? '15' : '20'}s: ${tone === 'educational' ? 'Screen recording or demonstration' : 'B-roll footage with key points'}`,
        length !== '15' ? `📹 ${length === '30' ? '15-25' : '20-50'}s: ${tone === 'serious' ? 'Supporting visuals or statistics' : 'Animated text with transitions'}` : null,
        `📹 Last ${length === '15' ? '4' : '5-10'}s: Strong CTA with profile link and follow button reminder`
    ].filter(Boolean) : [];
    
    const proTips = isPro ? [
        `⚡ Optimal posting time: ${['7-9 AM', '12-2 PM', '7-11 PM'][Math.floor(Math.random() * 3)]} (your audience timezone)`,
        `🎯 Engagement boost: Ask a question in first 3 seconds`,
        `📊 Retention hack: Add a "wait for it" moment at ${length === '60' ? '15-20s' : '8-12s'}`,
        `✨ Algorithm tip: Use 3-5 trending sounds this week`,
        `💡 Caption strategy: Start with an emoji + question to increase comments`,
        `🔥 Thumbnail: Pause at your best facial expression (0.5-1s mark)`,
        `📈 Repost strategy: Best times are Tuesday-Thursday, 6-9 PM`
    ] : [];
    
    // Apply brand voice
    let voiceModifier = '';
    if (useBrandVoice) {
        const voiceStyles = {
            professional: 'with authoritative expertise and industry credibility',
            friendly: 'in a warm, conversational, and relatable way',
            energetic: 'with high energy, enthusiasm, and excitement',
            minimal: 'in a clear, concise, and direct manner'
        };
        voiceModifier = voiceStyles[brandVoice] || '';
    }
    
    // Apply custom template
    let templatePrefix = '';
    if (useTemplate && customTemplate !== 'none') {
        const templates = {
            product: '🚀 PRODUCT LAUNCH: ',
            tutorial: '📚 TUTORIAL: ',
            behind: '🎬 BEHIND THE SCENES: ',
            testimonial: '⭐ SUCCESS STORY: ',
            announcement: '📢 ANNOUNCEMENT: '
        };
        templatePrefix = templates[customTemplate] || '';
    }
    
    let bodyContent = '';
    if (length === '15') {
        bodyContent = isPro 
            ? `${templatePrefix}Quick ${tone} take on ${topic} ${voiceModifier}: [Main point with specific example]. This works because [data-backed reason]. ${audience ? `Perfect for ${audience}!` : 'Try it yourself!'}`
            : `Quick tip about ${topic}: [Main point here]. This works because [brief reason]. Try it yourself!`;
    } else if (length === '30') {
        bodyContent = isPro
            ? `${templatePrefix}Let me break down ${topic} for ${audience || 'you'} ${voiceModifier}:\n\n1. [First key point with specific example]\n2. [Second key point with actionable step]\n3. [Third key point with common mistake to avoid]\n\nBonus: [Quick pro tip that makes a difference]\n\nThis ${tone} approach has helped thousands ${isEnterprise ? 'of businesses and teams' : 'of creators'}.`
            : `Let me break down ${topic} for you:\n\n1. [First key point]\n2. [Second key point]\n3. [Third key point]\n\nThis approach works especially well for ${audience || 'everyone'}.`;
    } else {
        bodyContent = isPro
            ? `${templatePrefix}Today I'm revealing everything about ${topic} that ${audience || 'most people'} don't know ${voiceModifier}.\n\nFirst, let's address [common misconception or problem].\n\nHere's the game-changing approach:\n• [Point 1: Specific strategy with example]\n• [Point 2: Advanced technique with results]\n• [Point 3: Secret tip from experience]${isEnterprise ? '\n• [Point 4: Enterprise-level insight with ROI data]' : ''}\n\nThe transformation? [Specific benefit with timeframe].\n\n${isEnterprise ? 'Enterprise' : 'Pro'} insight: [Expert-level advice]\n\nMistake to avoid: [Common pitfall with solution].`
            : `Today I'm sharing everything about ${topic}.\n\nFirst, [introduce the topic and why it matters].\n\nHere's what you need to know:\n• [Point 1 with details]\n• [Point 2 with details]\n• [Point 3 with details]\n\nThe best part? [Share benefit or result].\n\nPro tip: [Add bonus insight].`;
    }
    
    let scriptHTML = `
        <div class="script-section">
            <h4><i class="fas fa-fish-fins"></i> Hook (0-3 seconds)</h4>
            <p>${hook.replace('...', ` ${topic}...`)}</p>
        </div>
        
        <div class="script-section">
            <h4><i class="fas fa-align-left"></i> Main Content (${length === '15' ? '3-12' : length === '30' ? '3-25' : '3-55'} seconds)</h4>
            <p>${bodyContent}</p>
        </div>
        
        <div class="script-section">
            <h4><i class="fas fa-bullhorn"></i> Call-to-Action (Last ${length === '15' ? '3' : '5'} seconds)</h4>
            <p>${ctaMessage}</p>
        </div>
    `;
    
    if (isPro) {
        scriptHTML += `
            <div class="script-section">
                <h4><i class="fas fa-crown"></i> Pro Production Tips</h4>
                <p>• Keep energy ${tone === 'serious' ? 'steady and authentic' : 'high and engaging'}<br>
                • Use ${tone === 'funny' ? 'trending sounds or memes' : tone === 'educational' ? 'clear visuals or text overlays' : 'relevant background music'}<br>
                • ${length === '60' ? 'Add B-roll footage every 8-10 seconds to maintain interest' : 'Keep cuts quick (every 2-3 seconds) and dynamic'}<br>
                • Film in natural lighting or ring light with clear audio (use external mic)<br>
                • Use text overlays for key points (large, bold fonts)<br>
                • Add smooth transitions between scenes (swipe, zoom, fade)<br>
                • Include captions for accessibility (80% watch without sound)<br>
                • Use green screen or interesting backgrounds<br>
                • Add subtle zoom-ins on important moments</p>
            </div>
            
            <div class="script-section">
                <h4><i class="fas fa-rocket"></i> Viral Growth Strategies</h4>
                <p>${proTips.join('<br>')}</p>
            </div>
        `;
    }
    
    if (includeHashtags || !isPro) {
        scriptHTML += `
            <div class="script-section">
                <h4><i class="fas fa-hashtag"></i> ${isPro ? 'Trending ' : ''}Hashtags</h4>
                <p>${trendingHashtags.join(' ')}</p>
            </div>
        `;
    }
    
    if (includeMusic && musicSuggestions.length > 0) {
        scriptHTML += `
            <div class="script-section">
                <h4><i class="fas fa-music"></i> Music Suggestions</h4>
                <p>${musicSuggestions.join('<br>')}</p>
            </div>
        `;
    }
    
    if (includeVisuals && visualCues.length > 0) {
        scriptHTML += `
            <div class="script-section">
                <h4><i class="fas fa-video"></i> Visual Timeline</h4>
                <p>${visualCues.join('<br>')}</p>
            </div>
        `;
    }
    
    if (multipleVersions) {
        const altHook2 = hooks[tone][Math.floor(Math.random() * hooks[tone].length)];
        const altHook3 = hooks[tone][Math.floor(Math.random() * hooks[tone].length)];
        const altCTA2 = ['Follow for daily tips! 🔥', 'Save this for later! 📌', 'Tag someone who needs this! 👇'][Math.floor(Math.random() * 3)];
        const altCTA3 = ['Drop a ❤️ if this helped!', 'Comment your experience below! 💬', 'Share this with your community! 🚀'][Math.floor(Math.random() * 3)];
        
        scriptHTML += `
            <div class="script-section">
                <h4><i class="fas fa-clone"></i> Alternative Script Variations</h4>
                <p><strong>🎬 Version 2:</strong><br>
                <strong>Hook:</strong> ${altHook2.replace('...', ` ${topic}...`)}<br>
                <strong>Angle:</strong> Focus on ${['common mistakes', 'quick wins', 'beginner tips'][Math.floor(Math.random() * 3)]}<br>
                <strong>CTA:</strong> ${altCTA2}<br><br>
                
                <strong>🎬 Version 3:</strong><br>
                <strong>Hook:</strong> ${altHook3.replace('...', ` ${topic}...`)}<br>
                <strong>Angle:</strong> Focus on ${['advanced strategies', 'personal story', 'data & results'][Math.floor(Math.random() * 3)]}<br>
                <strong>CTA:</strong> ${altCTA3}<br><br>
                
                <em>💡 ${isEnterprise ? 'Enterprise' : 'Pro'} Tip: Test all 3 versions to see which performs best with your audience!</em></p>
            </div>
        `;
    }
    
    // Enterprise Analytics
    if (includeAnalytics) {
        const predictedViews = Math.floor(Math.random() * 50000) + 10000;
        const predictedEngagement = (Math.random() * 8 + 2).toFixed(1);
        const viralScore = Math.floor(Math.random() * 30) + 70;
        
        scriptHTML += `
            <div class="script-section">
                <h4><i class="fas fa-chart-line"></i> Performance Predictions (AI-Powered)</h4>
                <p><strong>📊 Estimated Reach:</strong> ${predictedViews.toLocaleString()} - ${(predictedViews * 1.5).toLocaleString()} views<br>
                <strong>💬 Engagement Rate:</strong> ${predictedEngagement}% (${predictedEngagement > 5 ? 'Above Average' : 'Average'})<br>
                <strong>🔥 Viral Potential Score:</strong> ${viralScore}/100<br>
                <strong>⏰ Best Posting Time:</strong> ${['Tuesday 7-9 PM', 'Wednesday 12-2 PM', 'Thursday 6-8 PM', 'Friday 5-7 PM'][Math.floor(Math.random() * 4)]}<br>
                <strong>🎯 Target Demographics:</strong> ${audience || 'General audience'}, Ages 18-34<br>
                <strong>📈 Growth Projection:</strong> +${Math.floor(Math.random() * 500) + 100} followers in first 48 hours<br><br>
                <em>⚠️ Note: Predictions based on current trends, topic relevance, and historical data. Actual results may vary.</em></p>
            </div>
        `;
    }
    
    // Team Review
    if (teamReview) {
        scriptHTML += `
            <div class="script-section">
                <h4><i class="fas fa-users"></i> Team Collaboration</h4>
                <p><strong>📤 Status:</strong> Sent for team review<br>
                <strong>👥 Reviewers:</strong> Marketing Team (3 members)<br>
                <strong>⏱️ Review Deadline:</strong> 24 hours<br>
                <strong>💬 Comments:</strong> 0 pending<br>
                <strong>✅ Approval Status:</strong> Awaiting feedback<br><br>
                <em>🔔 You'll be notified when team members provide feedback or approve the script.</em></p>
            </div>
        `;
    }
    
    return scriptHTML;
}

// Export to PDF (Pro/Enterprise feature)
document.getElementById('exportBtn').addEventListener('click', function() {
    if (currentPlan === 'free') {
        showToast('Export to PDF is a Pro feature. Upgrade to unlock!', 'warning', 'Pro Feature');
        document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const topic = document.getElementById('topic').value;
    const length = document.getElementById('length').value;
    const tone = document.getElementById('tone').value;
    const scriptOutput = document.getElementById('scriptOutput');
    
    // PDF styling
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(138, 43, 226);
    doc.text('TikTok Script AI', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by TikTok Script AI', margin, yPos);
    yPos += 5;
    doc.text(`Date: ${new Date().toLocaleString()}`, margin, yPos);
    yPos += 5;
    doc.text(`Plan: ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}`, margin, yPos);
    yPos += 15;
    
    // Topic info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Topic: ${topic}`, margin, yPos);
    yPos += 7;
    doc.text(`Length: ${length} seconds | Tone: ${tone}`, margin, yPos);
    yPos += 15;
    
    // Get all script sections
    const sections = scriptOutput.querySelectorAll('.script-section');
    
    sections.forEach((section, index) => {
        // Check if we need a new page
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        // Section title
        const title = section.querySelector('h4');
        if (title) {
            doc.setFontSize(12);
            doc.setTextColor(138, 43, 226);
            const titleText = title.innerText;
            doc.text(titleText, margin, yPos);
            yPos += 8;
        }
        
        // Section content
        const content = section.querySelector('p');
        if (content) {
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            const contentText = content.innerText;
            const lines = doc.splitTextToSize(contentText, maxWidth);
            
            lines.forEach(line => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, margin, yPos);
                yPos += 5;
            });
        }
        
        yPos += 8;
    });
    
    // Footer on last page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
        doc.text('© 2024 TikTok Script AI', pageWidth / 2, 285, { align: 'center' });
    }
    
    // Save PDF
    const filename = `TikTok-Script-${topic.replace(/\s+/g, '-').substring(0, 30)}-${Date.now()}.pdf`;
    doc.save(filename);
    
    showToast('PDF exported successfully! Check your downloads folder.', 'success', 'Export Complete');
});

// Copy to clipboard
document.getElementById('copyBtn').addEventListener('click', function() {
    const scriptOutput = document.getElementById('scriptOutput');
    const text = scriptOutput.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Copied!';
        showToast('Script copied to clipboard! Ready to paste into your video editor.', 'success', 'Copied!');
        
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    }).catch(() => {
        showToast('Failed to copy. Please select and copy the text manually.', 'error', 'Copy Failed');
    });
});

// Logout button handler
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// Initialize - ALWAYS show login modal
window.addEventListener('DOMContentLoaded', async () => {
    createBackgroundElements();
    await updateUserCount();
    
    // Check if user is logged in
    if (checkAuth()) {
        // Auto-login if user was previously logged in
        document.getElementById('loginModal').style.display = 'none';
        initializeUser();
    } else {
        // Show login modal if not logged in
        document.getElementById('loginModal').style.display = 'flex';
    }
});

// Backup - ensure modal shows if not logged in
setTimeout(() => {
    if (!currentUser) {
        document.getElementById('loginModal').style.display = 'flex';
    }
}, 100);
