/* ==========================================
   TULIP TALES - APPLICATION LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const views = {
    home: document.getElementById('view-home'),
    search: document.getElementById('view-search'),
    login: document.getElementById('view-login'),
    register: document.getElementById('view-register'),
    dashboard: document.getElementById('view-dashboard'),
    tracker: document.getElementById('view-tracker')
  };

  const navLinks = document.querySelectorAll('.nav-link');
  const navLoginLink = document.getElementById('nav-login-link');
  const navRegisterLink = document.getElementById('nav-register-link');
  const userMenu = document.getElementById('user-menu');
  const headerUsername = document.getElementById('header-username');
  const logoutBtn = document.getElementById('logout-btn');
  const navBrand = document.getElementById('nav-brand');

  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  // Hero Actions
  const heroGetStarted = document.getElementById('hero-get-started');
  const heroLearnMore = document.getElementById('hero-learn-more');

  // Forms
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Passwords
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  const registerPasswordInput = document.getElementById('register-password');
  const registerConfirmInput = document.getElementById('register-confirm');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  // Dashboard Info
  const dashboardTitle = document.getElementById('dashboard-title');
  const dashboardUserInfo = document.getElementById('dashboard-user-info');
  const dashboardLogoutBtnInline = document.querySelector('.logout-btn-inline');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // --- Mock Database ---
  // Seed database with a default user if not already present
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
      { name: 'Alice Kingsley', email: 'alice@example.com', password: 'password123' }
    ]));
  }

  // --- Router State ---
  let currentView = 'home';

  // --- Navigation & Routing ---
  function navigateTo(viewName) {
    if (!views[viewName]) return;

    // Check auth guards
    const isLoggedIn = sessionStorage.getItem('currentUser') !== null;
    if ((viewName === 'login' || viewName === 'register') && isLoggedIn) {
      navigateTo('dashboard');
      return;
    }
    if ((viewName === 'dashboard' || viewName === 'tracker') && !isLoggedIn) {
      navigateTo('login');
      showToast('Authentication Required', 'Please sign in to access your sanctuary.', 'warning');
      return;
    }

    // Hide all views
    Object.keys(views).forEach(key => {
      views[key].classList.remove('active');
    });

    // Show active view
    views[viewName].classList.add('active');
    currentView = viewName;

    // Update Browser URL Hash without triggering hashchange handler again
    window.location.hash = viewName === 'home' ? '' : viewName;

    // Update Navigation UI
    updateNavUI(viewName);

    // Scroll to top with minor delay for layout rendering
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    // Close mobile menu if open
    mobileMenuToggle.classList.remove('open');
    navLinksContainer.classList.remove('open');

    // Custom dashboard initialization
    if (viewName === 'dashboard') {
      initDashboard();
    }

    // Custom search initialization
    if (viewName === 'search') {
      if (typeof window.initSearch === 'function') {
        window.initSearch();
      }
    }

    // Custom tracker initialization
    if (viewName === 'tracker') {
      if (typeof window.initTracker === 'function') {
        window.initTracker();
      }
    }
  }

  function updateNavUI(viewName) {
    navLinks.forEach(link => {
      const linkView = link.getAttribute('data-view');
      if (linkView === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const isLoggedIn = sessionStorage.getItem('currentUser') !== null;
    const trackerLink = document.getElementById('nav-tracker-link');
    if (isLoggedIn) {
      navLoginLink.classList.add('hidden');
      navRegisterLink.classList.add('hidden');
      if (trackerLink) trackerLink.classList.remove('hidden');
      userMenu.classList.remove('hidden');
      
      const user = JSON.parse(sessionStorage.getItem('currentUser'));
      headerUsername.textContent = user.name.split(' ')[0]; // Use first name
    } else {
      navLoginLink.classList.remove('hidden');
      navRegisterLink.classList.remove('hidden');
      if (trackerLink) trackerLink.classList.add('hidden');
      userMenu.classList.add('hidden');
    }
  }

  // Handle URL hashes on load or browser back/forward
  function handleRouting() {
    const hash = window.location.hash.substring(1); // strip '#'
    if (hash && views[hash]) {
      navigateTo(hash);
    } else {
      navigateTo('home');
    }
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    const target = hash || 'home';
    if (target !== currentView) {
      navigateTo(target);
    }
  });

  // Setup click listeners for elements routing manually
  document.querySelectorAll('[data-view]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const target = elem.getAttribute('data-view');
      navigateTo(target);
    });
  });

  // Click handler for logo and branding
  navBrand.addEventListener('click', () => navigateTo('home'));

  // Hero section buttons
  heroGetStarted.addEventListener('click', () => {
    const isLoggedIn = sessionStorage.getItem('currentUser') !== null;
    navigateTo(isLoggedIn ? 'dashboard' : 'register');
  });

  heroLearnMore.addEventListener('click', () => {
    showToast('Philosophy', 'Tulip Tales believes that deep reading changes lives. Our design is optimized for focus.', 'success');
  });

  // Auth switches inside cards (e.g. "Create an account" under login)
  document.querySelectorAll('.auth-switch').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const target = elem.getAttribute('data-target');
      navigateTo(target);
    });
  });

  // --- Mobile Menu Toggle ---
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
  });

  // --- Toast Notification System ---
  function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '✨';
    if (type === 'success') icon = '🌿';
    if (type === 'warning') icon = '☕';
    if (type === 'error') icon = '🍂';

    toast.innerHTML = `
      <div style="font-size: 1.5rem;">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">&times;</button>
    `;

    toastContainer.appendChild(toast);

    // Close button event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      removeToast(toast);
    });

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(toast);
    }, 4000);
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    toast.style.animation = 'none';
    toast.style.transition = 'all 0.3s ease';
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }

  // --- Password Toggle Visibility ---
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // --- Password Strength Meter ---
  if (registerPasswordInput) {
    registerPasswordInput.addEventListener('input', () => {
      const val = registerPasswordInput.value;
      strengthBar.className = 'strength-bar';
      
      if (!val) {
        strengthText.textContent = 'Password strength';
        return;
      }

      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak password';
        strengthText.style.color = 'var(--color-error)';
      } else if (score <= 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Medium password';
        strengthText.style.color = 'var(--color-warning)';
      } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong password';
        strengthText.style.color = 'var(--color-success)';
      }
    });
  }

  // --- Form Validations & Submits ---
  
  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  function setFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorContainer = document.getElementById(errorId);
    const parent = field.closest('.form-group') || field.parentNode;
    
    if (message) {
      parent.classList.add('has-error');
      errorContainer.textContent = message;
    } else {
      parent.classList.remove('has-error');
      errorContainer.textContent = '';
    }
  }

  // Login Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    let isValid = true;

    // Validate email
    if (!email) {
      setFieldError('login-email', 'login-email-error', 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setFieldError('login-email', 'login-email-error', 'Please enter a valid email address');
      isValid = false;
    } else {
      setFieldError('login-email', 'login-email-error', '');
    }

    // Validate password
    if (!password) {
      setFieldError('login-password', 'login-password-error', 'Password is required');
      isValid = false;
    } else {
      setFieldError('login-password', 'login-password-error', '');
    }

    if (!isValid) return;

    // Authenticate
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      showToast('Login Failed', 'Invalid email or password.', 'error');
      setFieldError('login-password', 'login-password-error', 'Incorrect password or email');
      return;
    }

    // Success login
    sessionStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
    showToast('Welcome Back', `Hello, ${user.name}! You are now signed in.`, 'success');
    
    // Reset form
    loginForm.reset();
    
    // Redirect to dashboard
    navigateTo('dashboard');
  });

  // Register Submit
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('register-confirm');
    const termsInput = document.getElementById('register-terms');
    const termsError = document.getElementById('register-terms-error');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    let isValid = true;

    // Name check
    if (!name) {
      setFieldError('register-name', 'register-name-error', 'Full Name is required');
      isValid = false;
    } else {
      setFieldError('register-name', 'register-name-error', '');
    }

    // Email check
    if (!email) {
      setFieldError('register-email', 'register-email-error', 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setFieldError('register-email', 'register-email-error', 'Please enter a valid email address');
      isValid = false;
    } else {
      setFieldError('register-email', 'register-email-error', '');
    }

    // Password check
    if (!password) {
      setFieldError('register-password', 'register-password-error', 'Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setFieldError('register-password', 'register-password-error', 'Password must be at least 6 characters long');
      isValid = false;
    } else {
      setFieldError('register-password', 'register-password-error', '');
    }

    // Confirm password check
    if (!confirm) {
      setFieldError('register-confirm', 'register-confirm-error', 'Please confirm your password');
      isValid = false;
    } else if (password !== confirm) {
      setFieldError('register-confirm', 'register-confirm-error', 'Passwords do not match');
      isValid = false;
    } else {
      setFieldError('register-confirm', 'register-confirm-error', '');
    }

    // Terms checkbox check
    if (!termsInput.checked) {
      termsError.textContent = 'You must accept the terms of service to proceed';
      isValid = false;
    } else {
      termsError.textContent = '';
    }

    if (!isValid) return;

    // Check if email already registered
    const users = JSON.parse(localStorage.getItem('users'));
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      showToast('Registration Error', 'An account with this email already exists.', 'error');
      setFieldError('register-email', 'register-email-error', 'Email is already registered');
      return;
    }

    // Register user
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    showToast('Success', 'Your account has been created! Please log in.', 'success');
    
    // Reset form & indicators
    registerForm.reset();
    strengthBar.className = 'strength-bar';
    strengthText.textContent = 'Password strength';

    // Redirect to login page
    navigateTo('login');
  });

  // --- Dashboard Logic ---
  function initDashboard() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) return;

    dashboardTitle.textContent = `Welcome, ${user.name}`;
    dashboardUserInfo.textContent = `Registered Email: ${user.email}`;
  }

  // --- Logout Logic ---
  function logout() {
    sessionStorage.removeItem('currentUser');
    showToast('Logged Out', 'You have been safely logged out.', 'success');
    navigateTo('home');
  }

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  if (dashboardLogoutBtnInline) {
    dashboardLogoutBtnInline.addEventListener('click', logout);
  }

  // --- Initialize App ---
  handleRouting();
});
