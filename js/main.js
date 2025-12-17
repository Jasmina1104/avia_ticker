// Asosiy JavaScript - Barcha funksiyalar to'liq ishlaydi

document.addEventListener('DOMContentLoaded', function() {
    console.log('SkyWings platformasi yuklandi');
    
    // Loading spinnerni yashirish
    setTimeout(() => {
        document.getElementById('loadingSpinner').style.display = 'none';
    }, 1000);
    
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const isVisible = navLinks.style.display === 'flex';
            
            if (isVisible) {
                navLinks.style.display = 'none';
                navActions.style.display = 'none';
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            } else {
                navLinks.style.display = 'flex';
                navActions.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = 'white';
                navLinks.style.padding = '1rem';
                navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                navLinks.style.gap = '1rem';
                
                navActions.style.flexDirection = 'column';
                navActions.style.position = 'absolute';
                navActions.style.top = 'calc(100% + 220px)';
                navActions.style.left = '0';
                navActions.style.right = '0';
                navActions.style.background = 'white';
                navActions.style.padding = '1rem';
                navActions.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                navActions.style.gap = '1rem';
                
                menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
    }
    
    // 2. Auth System Events
    setupAuthEvents();
    
    // 3. Search Form Configuration
    setupSearchForm();
    
    // 4. Offers and Destinations
    setupOffersAndDestinations();
    
    // 5. Language Selector
    setupLanguageSelector();
    
    // 6. Date Configuration
    setupDates();
    
    // 7. Social Media Links
    setupSocialLinks();
    
    // 8. Notification System
    setupNotificationSystem();
    
    // 9. Modal System
    setupModalSystem();
});

// ========== AUTHENTICATION FUNCTIONS ==========

function setupAuthEvents() {
    // Main login button
    const mainLoginBtn = document.getElementById('mainLoginBtn');
    if (mainLoginBtn) {
        mainLoginBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (auth.currentUser) {
                // Agar foydalanuvchi tizimga kirgan bo'lsa, dropdown ko'rsatish
                const userDropdown = document.querySelector('.user-dropdown');
                userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
            } else {
                // Login modalini ochish
                showLoginModal();
            }
        });
    }
    
    // Profile link
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (auth.currentUser) {
                showProfileModal();
            } else {
                showLoginModal();
            }
        });
    }
    
    // My bookings link
    const myBookingsLink = document.getElementById('myBookings');
    const myTicketsLink = document.getElementById('myTicketsLink');
    
    [myBookingsLink, myTicketsLink].forEach(link => {
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (auth.currentUser) {
                    showMyBookingsModal();
                } else {
                    showNotification('Avval tizimga kiring', 'error');
                    showLoginModal();
                }
            });
        }
    });
    
    // Settings link
    const settingsLink = document.getElementById('settingsLink');
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (auth.currentUser) {
                showSettingsModal();
            } else {
                showLoginModal();
            }
        });
    }
    
    // Logout link
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
            showNotification('Tizimdan chiqildi', 'success');
            
            // Dropdown yopish
            const userDropdown = document.querySelector('.user-dropdown');
            if (userDropdown) {
                userDropdown.style.display = 'none';
            }
        });
    }
    
    // Tashqariga klik qilganda dropdown yopilishi
    document.addEventListener('click', function(e) {
        const userDropdown = document.querySelector('.user-dropdown');
        const userMenu = document.querySelector('.user-menu');
        
        if (userDropdown && userMenu && !userMenu.contains(e.target)) {
            userDropdown.style.display = 'none';
        }
    });
}

// ========== SEARCH FORM FUNCTIONS ==========

function setupSearchForm() {
    // Tab o'zgartirish
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.dataset.type;
            updateSearchFormType(type);
        });
    });
    
    // Shaharlarni almashtirish
    const swapBtn = document.getElementById('swapCities');
    const fromInput = document.getElementById('fromInput');
    const toInput = document.getElementById('toInput');
    
    if (swapBtn) {
        swapBtn.addEventListener('click', function() {
            const temp = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = temp;
            
            // Animatsiya
            this.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }
    
    // Passenger counter
    setupPassengerCounter();
    
    // Class selection
    const classBtns = document.querySelectorAll('.class-btn');
    classBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            classBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updatePassengerSummary();
        });
    });
    
    // City suggestions
    setupCitySuggestions();
    
    // Form submit
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
}

function updateSearchFormType(type) {
    const returnDateGroup = document.getElementById('returnDateGroup');
    const returnDateInput = document.getElementById('returnDate');
    
    switch(type) {
        case 'oneway':
            returnDateGroup.style.display = 'none';
            returnDateInput.required = false;
            break;
        case 'roundtrip':
            returnDateGroup.style.display = 'block';
            returnDateInput.required = true;
            returnDateInput.placeholder = 'Qaytish sanasi';
            break;
        case 'multicity':
            returnDateGroup.style.display = 'block';
            returnDateInput.required = true;
            returnDateInput.placeholder = 'Keyingi shahar sanasi';
            // Ko'p shahar uchun qo'shimcha inputlar qo'shish mumkin
            break;
    }
}

function setupPassengerCounter() {
    const counterBtns = document.querySelectorAll('.counter-btn');
    
    counterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            const isPlus = this.classList.contains('plus');
            const countElement = document.getElementById(`${type}Count`);
            let count = parseInt(countElement.textContent);
            
            // Cheklovlar
            const limits = {
                adults: { min: 1, max: 9 },
                children: { min: 0, max: 8 },
                infants: { min: 0, max: 4 }
            };
            
            if (isPlus && count < limits[type].max) {
                count++;
            } else if (!isPlus && count > limits[type].min) {
                count--;
            }
            
            // Chaqaloqlar soni kattalar sonidan oshmasligi kerak
            if (type === 'infants') {
                const adultsCount = parseInt(document.getElementById('adultsCount').textContent);
                if (count > adultsCount) {
                    count = adultsCount;
                }
            }
            
            countElement.textContent = count;
            updatePassengerSummary();
        });
    });
    
    // Passenger dropdown
    const passengerSelect = document.querySelector('.passenger-select');
    const passengerDropdown = document.querySelector('.passenger-dropdown');
    
    if (passengerSelect) {
        passengerSelect.addEventListener('click', function(e) {
            e.stopPropagation();
            passengerDropdown.style.display = 
                passengerDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    // Tashqariga klik qilganda yopish
    document.addEventListener('click', function() {
        if (passengerDropdown) {
            passengerDropdown.style.display = 'none';
        }
    });
}

function updatePassengerSummary() {
    const adults = parseInt(document.getElementById('adultsCount').textContent);
    const children = parseInt(document.getElementById('childrenCount').textContent);
    const infants = parseInt(document.getElementById('infantsCount').textContent);
    const classBtn = document.querySelector('.class-btn.active');
    const className = classBtn ? classBtn.dataset.class : 'economy';
    
    const total = adults + children + infants;
    const classNames = {
        economy: 'Ekonom',
        business: 'Biznes',
        first: 'Birinchi'
    };
    
    document.getElementById('passengerSummary').value = 
        `${total} kishi, ${classNames[className]}`;
}

function setupCitySuggestions() {
    const cities = [
        "Toshkent (TAS)",
        "Samarqand (SKD)", 
        "Buxoro (BHK)",
        "Istanbul (IST)",
        "Moskva (SVO)",
        "Dubai (DXB)",
        "London (LHR)",
        "New York (JFK)",
        "Parij (CDG)",
        "Milan (MXP)"
    ];
    
    const fromInput = document.getElementById('fromInput');
    const toInput = document.getElementById('toInput');
    const fromSuggestions = document.getElementById('fromSuggestions');
    const toSuggestions = document.getElementById('toSuggestions');
    
    function createSuggestions(input, container) {
        input.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            container.innerHTML = '';
            
            if (value.length >= 2) {
                const filtered = cities.filter(city => 
                    city.toLowerCase().includes(value)
                );
                
                if (filtered.length > 0) {
                    container.style.display = 'block';
                    filtered.forEach(city => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.textContent = city;
                        div.addEventListener('click', function() {
                            input.value = city;
                            container.style.display = 'none';
                        });
                        container.appendChild(div);
                    });
                } else {
                    container.style.display = 'none';
                }
            } else {
                container.style.display = 'none';
            }
        });
        
        // Tashqariga klik qilganda yopilishi
        document.addEventListener('click', function(e) {
            if (!container.contains(e.target) && e.target !== input) {
                container.style.display = 'none';
            }
        });
    }
    
    if (fromInput && fromSuggestions) {
        createSuggestions(fromInput, fromSuggestions);
    }
    
    if (toInput && toSuggestions) {
        createSuggestions(toInput, toSuggestions);
    }
}

async function performSearch() {
    const from = document.getElementById('fromInput').value;
    const to = document.getElementById('toInput').value;
    const departure = document.getElementById('departureDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const tabType = document.querySelector('.tab.active').dataset.type;
    
    // Validatsiya
    if (!from || !to) {
        showNotification('Iltimos, shaharlarni kiriting!', 'error');
        return;
    }
    
    if (!departure) {
        showNotification('Iltimos, ketish sanasini tanlang!', 'error');
        return;
    }
    
    if (tabType === 'roundtrip' && !returnDate) {
        showNotification('Iltimos, qaytish sanasini tanlang!', 'error');
        return;
    }
    
    // Loading animatsiyasi
    const searchBtn = document.getElementById('searchBtn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Qidirilmoqda...';
    searchBtn.disabled = true;
    
    try {
        // Narxni hisoblash
        const flightData = {
            from,
            to,
            departure,
            returnDate: tabType === 'roundtrip' ? returnDate : null,
            passengers: getPassengerData(),
            class: document.querySelector('.class-btn.active').dataset.class,
            type: tabType
        };
        
        const price = calculateFlightPrice(flightData);
        
        // Simulyatsiya
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Parvozlar sahifasiga o'tish
        const params = new URLSearchParams({
            from: encodeURIComponent(from),
            to: encodeURIComponent(to),
            date: departure,
            price: price,
            type: tabType,
            ...flightData.passengers
        });
        
        if (returnDate) {
            params.append('return', returnDate);
        }
        
        window.location.href = `flights.html?${params.toString()}`;
        
    } finally {
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
    }
}

function getPassengerData() {
    return {
        adults: parseInt(document.getElementById('adultsCount').textContent),
        children: parseInt(document.getElementById('childrenCount').textContent),
        infants: parseInt(document.getElementById('infantsCount').textContent)
    };
}

function calculateFlightPrice(flightData) {
    // Bazaviy narx
    let basePrice = 200;
    
    // Masofaga qarab
    const routes = {
        'Toshkent-Istanbul': 350,
        'Toshkent-Moskva': 280,
        'Toshkent-Dubai': 420,
        'Toshkent-London': 650,
        'Toshkent-New York': 720,
        'Toshkent-Parij': 380
    };
    
    const route = `${flightData.from.split('(')[0].trim()}-${flightData.to.split('(')[0].trim()}`;
    if (routes[route]) {
        basePrice = routes[route];
    }
    
    // Yo'lovchilar soniga qarab
    const passengerMultiplier = 
        flightData.passengers.adults + 
        (flightData.passengers.children * 0.7) + 
        (flightData.passengers.infants * 0.1);
    
    // Klassga qarab
    const classMultiplier = {
        economy: 1,
        business: 2.5,
        first: 4
    }[flightData.class] || 1;
    
    // Aylanma parvoz uchun
    const typeMultiplier = flightData.type === 'roundtrip' ? 1.8 : 1;
    
    return Math.round(basePrice * passengerMultiplier * classMultiplier * typeMultiplier);
}

// ========== MODAL FUNCTIONS ==========

function setupModalSystem() {
    // Modal CSS qo'shish
    const modalCSS = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            padding: 2rem;
            min-width: 400px;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            z-index: 10001;
            animation: modalFadeIn 0.3s ease;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #1e293b;
            font-size: 1.5rem;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 1.2rem;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        
        .modal-close:hover {
            background: #f1f5f9;
            color: #475569;
        }
        
        .modal-body {
            padding: 1rem 0;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #475569;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #2563eb;
        }
        
        .btn-primary {
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary:hover {
            background: #1d4ed8;
        }
        
        .btn-secondary {
            padding: 12px 24px;
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-secondary:hover {
            background: #e2e8f0;
        }
        
        .btn-danger {
            padding: 12px 24px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-danger:hover {
            background: #b91c1c;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 2rem;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .auth-tab {
            padding: 12px 24px;
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-weight: 500;
            position: relative;
        }
        
        .auth-tab.active {
            color: #2563eb;
        }
        
        .auth-tab.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #2563eb;
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
        }
        
        @keyframes modalFadeIn {
            from {
                opacity: 0;
                transform: translate(-50%, -40%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

function showLoginModal() {
    const modalHTML = `
        <div class="modal-overlay" id="authModalOverlay"></div>
        <div class="modal" id="authModal">
            <div class="modal-header">
                <h3>Tizimga kirish / Ro'yxatdan o'tish</h3>
                <button class="modal-close" id="closeAuthModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="auth-tabs">
                    <button class="auth-tab active" data-form="loginForm">Kirish</button>
                    <button class="auth-tab" data-form="registerForm">Ro'yxatdan o'tish</button>
                </div>
                
                <form id="loginForm" class="auth-form active">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" placeholder="example@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Parol</label>
                        <input type="password" id="loginPassword" placeholder="********" required>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="rememberMe"> Eslab qolish
                        </label>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-sign-in-alt"></i> Kirish
                        </button>
                        <button type="button" class="btn-secondary" id="cancelLogin">
                            Bekor qilish
                        </button>
                    </div>
                </form>
                
                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <label>Ism</label>
                        <input type="text" id="registerFirstName" placeholder="Ismingiz" required>
                    </div>
                    <div class="form-group">
                        <label>Familiya</label>
                        <input type="text" id="registerLastName" placeholder="Familiyangiz" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="registerEmail" placeholder="example@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Telefon raqam</label>
                        <input type="tel" id="registerPhone" placeholder="+998 90 123 45 67" required>
                    </div>
                    <div class="form-group">
                        <label>Parol</label>
                        <input type="password" id="registerPassword" placeholder="********" required>
                    </div>
                    <div class="form-group">
                        <label>Parolni tasdiqlang</label>
                        <input type="password" id="registerConfirmPassword" placeholder="********" required>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-user-plus"></i> Ro'yxatdan o'tish
                        </button>
                        <button type="button" class="btn-secondary" id="cancelRegister">
                            Bekor qilish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalsContainer = document.getElementById('modalsContainer');
    modalsContainer.innerHTML = modalHTML;
    
    // Overlay va modalni ko'rsatish
    document.getElementById('authModalOverlay').style.display = 'block';
    document.getElementById('authModal').style.display = 'block';
    
    // Tab o'zgartirish
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Barcha tab va formlardan active klassini olib tashlash
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Tanlangan tab va formga active klassini qo'shish
            this.classList.add('active');
            const formId = this.dataset.form;
            document.getElementById(formId).classList.add('active');
        });
    });
    
    // Login formasi
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Loading
        const submitBtn = this.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kirilmoqda...';
        submitBtn.disabled = true;
        
        try {
            await auth.login(email, password);
            showNotification('Muvaffaqiyatli kirdingiz!', 'success');
            closeModal('authModal');
        } catch (error) {
            showNotification(error, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Register formasi
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('registerFirstName').value,
            lastName: document.getElementById('registerLastName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            password: document.getElementById('registerPassword').value
        };
        
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        // Validatsiya
        if (formData.password !== confirmPassword) {
            showNotification('Parollar mos kelmadi!', 'error');
            return;
        }
        
        if (formData.password.length < 6) {
            showNotification('Parol kamida 6 ta belgidan iborat bo\'lishi kerak', 'error');
            return;
        }
        
        // Loading
        const submitBtn = this.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ro\'yxatdan o\'tilmoqda...';
        submitBtn.disabled = true;
        
        try {
            await auth.register(formData);
            showNotification('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
            closeModal('authModal');
        } catch (error) {
            showNotification(error, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Modal yopish
    document.getElementById('closeAuthModal').addEventListener('click', function() {
        closeModal('authModal');
    });
    
    document.getElementById('cancelLogin').addEventListener('click', function() {
        closeModal('authModal');
    });
    
    document.getElementById('cancelRegister').addEventListener('click', function() {
        closeModal('authModal');
    });
    
    // Overlay bosilganda yopish
    document.getElementById('authModalOverlay').addEventListener('click', function() {
        closeModal('authModal');
    });
}

function showProfileModal() {
    const user = auth.currentUser;
    if (!user) return;
    
    const modalHTML = `
        <div class="modal-overlay" id="profileModalOverlay"></div>
        <div class="modal" id="profileModal">
            <div class="modal-header">
                <h3>Profil ma'lumotlari</h3>
                <button class="modal-close" id="closeProfileModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 1rem;">
                        ${user.firstName[0]}${user.lastName[0]}
                    </div>
                    <h3 style="margin: 0;">${user.firstName} ${user.lastName}</h3>
                    <p style="color: #64748b; margin: 0.5rem 0;">${user.email}</p>
                    <p style="color: #64748b; margin: 0;">${user.phone}</p>
                </div>
                
                <div class="profile-stats">
                    <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 2rem;">
                        <div>
                            <h4 style="margin: 0; color: #2563eb;">${user.bookings.length}</h4>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Chiptalar</p>
                        </div>
                        <div>
                            <h4 style="margin: 0; color: #2563eb;">${new Date(user.createdAt).toLocaleDateString('uz-UZ')}</h4>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Ro'yxatdan o'tgan</p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-primary" id="editProfileBtn">
                        <i class="fas fa-edit"></i> Profilni tahrirlash
                    </button>
                    <button type="button" class="btn-secondary" id="closeProfileBtn">
                        Yopish
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalsContainer = document.getElementById('modalsContainer');
    modalsContainer.innerHTML = modalHTML;
    
    // Modalni ko'rsatish
    document.getElementById('profileModalOverlay').style.display = 'block';
    document.getElementById('profileModal').style.display = 'block';
    
    // Tugmalar
    document.getElementById('editProfileBtn').addEventListener('click', function() {
        closeModal('profileModal');
        showEditProfileModal();
    });
    
    document.getElementById('closeProfileBtn').addEventListener('click', function() {
        closeModal('profileModal');
    });
    
    document.getElementById('closeProfileModal').addEventListener('click', function() {
        closeModal('profileModal');
    });
    
    document.getElementById('profileModalOverlay').addEventListener('click', function() {
        closeModal('profileModal');
    });
}

function showEditProfileModal() {
    const user = auth.currentUser;
    if (!user) return;
    
    const modalHTML = `
        <div class="modal-overlay" id="editProfileModalOverlay"></div>
        <div class="modal" id="editProfileModal">
            <div class="modal-header">
                <h3>Profilni tahrirlash</h3>
                <button class="modal-close" id="closeEditProfileModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editProfileForm">
                    <div class="form-group">
                        <label>Ism</label>
                        <input type="text" id="editFirstName" value="${user.firstName}" required>
                    </div>
                    <div class="form-group">
                        <label>Familiya</label>
                        <input type="text" id="editLastName" value="${user.lastName}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="editEmail" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label>Telefon raqam</label>
                        <input type="tel" id="editPhone" value="${user.phone}" required>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Saqlash
                        </button>
                        <button type="button" class="btn-secondary" id="cancelEditProfile">
                            Bekor qilish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalsContainer = document.getElementById('modalsContainer');
    modalsContainer.innerHTML = modalHTML;
    
    // Modalni ko'rsatish
    document.getElementById('editProfileModalOverlay').style.display = 'block';
    document.getElementById('editProfileModal').style.display = 'block';
    
    // Form submit
    document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value
        };
        
        // Loading
        const submitBtn = this.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';
        submitBtn.disabled = true;
        
        try {
            await auth.updateProfile(formData);
            showNotification('Profil muvaffaqiyatli yangilandi!', 'success');
            closeModal('editProfileModal');
            showProfileModal();
        } catch (error) {
            showNotification(error, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Modal yopish
    document.getElementById('closeEditProfileModal').addEventListener('click', function() {
        closeModal('editProfileModal');
    });
    
    document.getElementById('cancelEditProfile').addEventListener('click', function() {
        closeModal('editProfileModal');
    });
    
    document.getElementById('editProfileModalOverlay').addEventListener('click', function() {
        closeModal('editProfileModal');
    });
}

function showMyBookingsModal() {
    const bookings = auth.getUserBookings();
    
    let bookingsHTML = '';
    if (bookings.length === 0) {
        bookingsHTML = `
            <div style="text-align: center; padding: 3rem 0;">
                <i class="fas fa-ticket-alt" style="font-size: 48px; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <h3 style="color: #64748b; margin-bottom: 0.5rem;">Hali chiptalar yo'q</h3>
                <p style="color: #94a3b8;">Birinchi chiptangizni sotib olish uchun parvoz qidiring</p>
            </div>
        `;
    } else {
        bookingsHTML = `
            <div style="max-height: 400px; overflow-y: auto;">
                ${bookings.map(booking => `
                    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h4 style="margin: 0; color: #2563eb;">${booking.flightNumber || 'HY-123'}</h4>
                            <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                                ${booking.status === 'confirmed' ? 'Tasdiqlangan' : booking.status}
                            </span>
                        </div>
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 0.5rem;">
                            ${booking.from} → ${booking.to}
                        </div>
                        <div style="display: flex; justify-content: space-between; color: #475569; font-size: 14px;">
                            <span>Sana: ${new Date(booking.departureDate).toLocaleDateString('uz-UZ')}</span>
                            <span style="font-weight: 600;">${booking.price}</span>
                        </div>
                        <div style="margin-top: 0.5rem; font-size: 12px; color: #94a3b8;">
                            Buyurtma raqami: ${booking.id}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    const modalHTML = `
        <div class="modal-overlay" id="bookingsModalOverlay"></div>
        <div class="modal" id="bookingsModal">
            <div class="modal-header">
                <h3>Mening chiptalarim</h3>
                <button class="modal-close" id="closeBookingsModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${bookingsHTML}
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="closeBookingsBtn">
                        Yopish
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalsContainer = document.getElementById('modalsContainer');
    modalsContainer.innerHTML = modalHTML;
    
    // Modalni ko'rsatish
    document.getElementById('bookingsModalOverlay').style.display = 'block';
    document.getElementById('bookingsModal').style.display = 'block';
    
    // Modal yopish
    document.getElementById('closeBookingsModal').addEventListener('click', function() {
        closeModal('bookingsModal');
    });
    
    document.getElementById('closeBookingsBtn').addEventListener('click', function() {
        closeModal('bookingsModal');
    });
    
    document.getElementById('bookingsModalOverlay').addEventListener('click', function() {
        closeModal('bookingsModal');
    });
}

function showSettingsModal() {
    const modalHTML = `
        <div class="modal-overlay" id="settingsModalOverlay"></div>
        <div class="modal" id="settingsModal">
            <div class="modal-header">
                <h3>Sozlamalar</h3>
                <button class="modal-close" id="closeSettingsModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="settingsForm">
                    <div class="form-group">
                        <label>Til</label>
                        <select id="languageSelect">
                            <option value="uz">O'zbek</option>
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Valyuta</label>
                        <select id="currencySelect">
                            <option value="UZS">So'm (UZS)</option>
                            <option value="USD" selected>Dollar (USD)</option>
                            <option value="EUR">Yevro (EUR)</option>
                            <option value="RUB">Rubl (RUB)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Bildirishnomalar</label>
                        <div>
                            <label style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                                <input type="checkbox" id="emailNotifications" checked> Email orqali
                            </label>
                            <label style="display: flex; align-items: center;">
                                <input type="checkbox" id="smsNotifications" checked> SMS orqali
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Sozlamalarni saqlash
                        </button>
                        <button type="button" class="btn-secondary" id="cancelSettings">
                            Bekor qilish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalsContainer = document.getElementById('modalsContainer');
    modalsContainer.innerHTML = modalHTML;
    
    // Modalni ko'rsatish
    document.getElementById('settingsModalOverlay').style.display = 'block';
    document.getElementById('settingsModal').style.display = 'block';
    
    // Form submit
    document.getElementById('settingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            language: document.getElementById('languageSelect').value,
            currency: document.getElementById('currencySelect').value,
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked
        };
        
        // Saqlash
        localStorage.setItem('skywings_settings', JSON.stringify(settings));
        showNotification('Sozlamalar saqlandi!', 'success');
        closeModal('settingsModal');
    });
    
    // Modal yopish
    document.getElementById('closeSettingsModal').addEventListener('click', function() {
        closeModal('settingsModal');
    });
    
    document.getElementById('cancelSettings').addEventListener('click', function() {
        closeModal('settingsModal');
    });
    
    document.getElementById('settingsModalOverlay').addEventListener('click', function() {
        closeModal('settingsModal');
    });
}

function closeModal(modalId) {
    const overlay = document.getElementById(`${modalId}Overlay`);
    const modal = document.getElementById(modalId);
    
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.animation = '';
        }, 300);
    }
    
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// ========== BOOKING SYSTEM ==========

// Bu funksiya flights.html va booking.html sahifalarida ishlatiladi
async function bookFlight(flightData) {
    if (!auth.currentUser) {
        showNotification('Avval tizimga kiring', 'error');
        showLoginModal();
        return null;
    }
    
    try {
        const booking = await auth.addBooking(flightData);
        
        // Admin panelda yangi bookingni ko'rsatish
        updateAdminBookings(booking);
        
        return booking;
    } catch (error) {
        showNotification(error, 'error');
        return null;
    }
}

function updateAdminBookings(booking) {
    // Admin panel uchun bookings arrayini yangilash
    const adminBookings = JSON.parse(localStorage.getItem('skywings_admin_bookings')) || [];
    adminBookings.unshift({
        ...booking,
        passenger: `${auth.currentUser.firstName} ${auth.currentUser.lastName}`,
        email: auth.currentUser.email,
        phone: auth.currentUser.phone
    });
    
    localStorage.setItem('skywings_admin_bookings', JSON.stringify(adminBookings));
    
    // Admin panel uchun notification
    const adminNotifications = JSON.parse(localStorage.getItem('skywings_admin_notifications')) || [];
    adminNotifications.unshift({
        id: `N${Date.now()}`,
        type: 'new_booking',
        message: `Yangi buyurtma: ${booking.id}`,
        details: `${auth.currentUser.firstName} tomonidan ${booking.from} → ${booking.to} uchun`,
        timestamp: new Date().toISOString(),
        read: false
    });
    
    localStorage.setItem('skywings_admin_notifications', JSON.stringify(adminNotifications));
}

// ========== OTHER FUNCTIONS ==========

function setupOffersAndDestinations() {
    // Offers buyurtma qilish
    document.querySelectorAll('.btn-book').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.offer-card');
            const destination = card.querySelector('h3').textContent;
            const price = card.querySelector('.price').textContent.split(' ')[0];
            
            if (!auth.currentUser) {
                showNotification('Avval tizimga kiring', 'info');
                showLoginModal();
                return;
            }
            
            showNotification(`${destination} uchun bron qilish boshlanmoqda...`, 'success');
            
            // Booking modalini ochish
            showQuickBookingModal(destination, price);
        });
    });
    
    // Destination cardlar
    document.querySelectorAll('.destination-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const destination = this.querySelector('h3').textContent;
            const fromInput = document.getElementById('fromInput');
            const toInput = document.getElementById('toInput');
            
            fromInput.value = 'Toshkent (TAS)';
            toInput.value = `${destination} (${getAirportCode(destination)})`;
            
            showNotification(`${destination} yo'nalishi tanlandi`, 'success');
            document.querySelector('.search-box').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function setupLanguageSelector() {
    const langSelect = document.querySelector('.lang-select');
    if (langSelect) {
        // Saved tilni o'rnatish
        const savedSettings = JSON.parse(localStorage.getItem('skywings_settings'));
        if (savedSettings && savedSettings.language) {
            langSelect.value = savedSettings.language;
        }
        
        langSelect.addEventListener('change', function() {
            const lang = this.value;
            const translations = {
                uz: {
                    heroTitle: "Dunyoning istalgan nuqtasiga <span class='highlight'>oson</span> uchish",
                    heroSubtitle: "Eng yaxshi narxlarda 1000+ kompaniyadan aviachiptalar",
                    searchBtn: "Parvozlarni qidirish"
                },
                ru: {
                    heroTitle: "Летай <span class='highlight'>легко</span> в любую точку мира",
                    heroSubtitle: "Авиабилеты от 1000+ авиакомпаний по лучшим ценам",
                    searchBtn: "Найти рейсы"
                },
                en: {
                    heroTitle: "Fly <span class='highlight'>easy</span> to any point in the world",
                    heroSubtitle: "Air tickets from 1000+ airlines at the best prices",
                    searchBtn: "Search flights"
                }
            };
            
            const text = translations[lang] || translations.uz;
            
            // UI ni yangilash
            const heroTitle = document.getElementById('heroTitle');
            const heroSubtitle = document.getElementById('heroSubtitle');
            const searchBtn = document.getElementById('searchBtn');
            
            if (heroTitle) heroTitle.innerHTML = text.heroTitle;
            if (heroSubtitle) heroSubtitle.textContent = text.heroSubtitle;
            if (searchBtn) searchBtn.innerHTML = `<i class="fas fa-search"></i> ${text.searchBtn}`;
            
            showNotification(`Til ${lang === 'uz' ? "O'zbek" : lang === 'ru' ? "Rus" : "Ingliz"} tiliga o'zgartirildi`, 'info');
        });
    }
}

function setupDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const departureInput = document.getElementById('departureDate');
    const returnInput = document.getElementById('returnDate');
    
    if (departureInput) {
        departureInput.min = today.toISOString().split('T')[0];
        departureInput.value = today.toISOString().split('T')[0];
        
        departureInput.addEventListener('change', function() {
            if (returnInput) {
                returnInput.min = this.value;
                if (returnInput.value && returnInput.value < this.value) {
                    returnInput.value = this.value;
                }
            }
        });
    }
    
    if (returnInput) {
        returnInput.min = tomorrow.toISOString().split('T')[0];
        returnInput.value = tomorrow.toISOString().split('T')[0];
    }
}

function setupSocialLinks() {
    document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className.split('fa-')[1].split(' ')[0];
            showNotification(`${platform} sahifamiz ochilmoqda...`, 'info');
            
            const urls = {
                facebook: 'https://facebook.com',
                telegram: 'https://telegram.org',
                instagram: 'https://instagram.com',
                twitter: 'https://twitter.com'
            };
            
            setTimeout(() => {
                window.open(urls[platform], '_blank');
            }, 500);
        });
    });
}

function setupNotificationSystem() {
    // Notification container yaratish
    const notificationCSS = `
        #notificationContainer {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .notification {
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            max-width: 400px;
        }
        
        .notification.success { background: #10b981; }
        .notification.error { background: #ef4444; }
        .notification.info { background: #3b82f6; }
        .notification.warning { background: #f59e0b; }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1rem;
            padding: 0;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = notificationCSS;
    document.head.appendChild(style);
}

function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const container = document.getElementById('notificationContainer');
    container.appendChild(notification);
    
    // Yopish tugmasi
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    // Avtomatik yopilish
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
}

function getAirportCode(city) {
    const codes = {
        'Toshkent': 'TAS',
        'Samarqand': 'SKD',
        'Buxoro': 'BHK',
        'London': 'LHR',
        'New York': 'JFK',
        'Parij': 'CDG',
        'Istanbul': 'IST',
        'Dubai': 'DXB',
        'Moskva': 'SVO'
    };
    return codes[city] || 'XXX';
}

function showQuickBookingModal(destination, price) {
    const modalHTML = `
        <div class="modal-overlay" id="quickBookingModalOverlay"></div>
        <div class="modal" id="quickBookingModal">
            <div class="modal-header">
                <h3>Tezkor bron qilish</h3>
                <button class="modal-close" id="closeQuickBookingModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h4 style="color: #2563eb; margin-bottom: 0.5rem;">${destination}</h4>
                    <p style="color: #64748b;">Tezkor bron qilish narxi: <strong>${price}</strong></p>
                </div>
                
                <form id="quickBookingForm">
                    <div class="form-group">
                        <label>Sana</label>
                        <input type="date" id="bookingDate" required>
                    </div>
                    <div class="form-group">
                        <label>Yo'lovchilar soni</label>
                        <select id="bookingPassengers" required>
                            <option value="1">1 kishi</option>
                            <option value="2">2 kishi</option>
                            <option value="3">3 kishi</option>
                            <option value="4">4 kishi</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-ticket-alt"></i> Bron qilish
                        </button>
                        <button type="button" class="btn-secondary" id="cancelQuickBooking">
                            Bekor qilish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalsContainer = document.getElementById('modalsContainer');
    modalsContainer.innerHTML = modalHTML;
    
    // Sana sozlamalari
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 7);
    
    document.getElementById('bookingDate').min = today.toISOString().split('T')[0];
    document.getElementById('bookingDate').value = tomorrow.toISOString().split('T')[0];
    
    // Modalni ko'rsatish
    document.getElementById('quickBookingModalOverlay').style.display = 'block';
    document.getElementById('quickBookingModal').style.display = 'block';
    
    // Form submit
    document.getElementById('quickBookingForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const bookingData = {
            flightNumber: `SW-${Math.floor(Math.random() * 1000)}`,
            from: 'Toshkent (TAS)',
            to: destination,
            departureDate: document.getElementById('bookingDate').value,
            price: price,
            passengers: parseInt(document.getElementById('bookingPassengers').value),
            class: 'economy'
        };
        
        const submitBtn = this.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bron qilinmoqda...';
        submitBtn.disabled = true;
        
        try {
            const booking = await bookFlight(bookingData);
            if (booking) {
                showNotification('Bron muvaffaqiyatli amalga oshirildi!', 'success');
                closeModal('quickBookingModal');
                
                // Booking tasdiqlash modalini ochish
                setTimeout(() => {
                    showBookingConfirmationModal(booking);
                }, 500);
            }
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Modal yopish
    document.getElementById('closeQuickBookingModal').addEventListener('click', function() {
        closeModal('quickBookingModal');
    });
    
    document.getElementById('cancelQuickBooking').addEventListener('click', function() {
        closeModal('quickBookingModal');
    });
    
    document.getElementById('quickBookingModalOverlay').addEventListener('click', function() {
        closeModal('quickBookingModal');
    });
}

function showBookingConfirmationModal(booking) {
    const modalHTML = `
        <div class="modal-overlay" id="confirmationModalOverlay"></div>
        <div class="modal" id="confirmationModal">
            <div class="modal-header">
                <h3>Bron muvaffaqiyatli amalga oshirildi!</h3>
                <button class="modal-close" id="closeConfirmationModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <i class="fas fa-check-circle" style="font-size: 48px; color: #10b981; margin-bottom: 1rem;"></i>
                    <p style="color: #64748b; margin-bottom: 0.5rem;">Buyurtma raqamingiz:</p>
                    <h3 style="color: #2563eb; margin: 0;">${booking.id}</h3>
                </div>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #64748b;">Parvoz:</span>
                        <span style="font-weight: 500;">${booking.from} → ${booking.to}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #64748b;">Sana:</span>
                        <span style="font-weight: 500;">${new Date(booking.departureDate).toLocaleDateString('uz-UZ')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #64748b;">Narx:</span>
                        <span style="font-weight: 500; color: #10b981;">${booking.price}</span>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-primary" id="printTicketBtn">
                        <i class="fas fa-print"></i> Chiptani chop etish
                    </button>
                    <button type="button" class="btn-secondary" id="closeConfirmationBtn">
                        Yopish
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalsContainer = document.getElementById('modalsContainer');
    modalsContainer.innerHTML = modalHTML;
    
    // Modalni ko'rsatish
    document.getElementById('confirmationModalOverlay').style.display = 'block';
    document.getElementById('confirmationModal').style.display = 'block';
    
    // Chop etish tugmasi
    document.getElementById('printTicketBtn').addEventListener('click', function() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>SkyWings - Chipta #${booking.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .ticket { border: 2px dashed #ccc; padding: 20px; max-width: 600px; margin: 0 auto; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .details { margin-bottom: 20px; }
                        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                        .label { color: #666; }
                        .value { font-weight: bold; }
                        .barcode { text-align: center; margin-top: 30px; font-family: monospace; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="header">
                            <h1>SkyWings Airlines</h1>
                            <h2>Elektron Chipta</h2>
                            <p>Buyurtma raqami: ${booking.id}</p>
                        </div>
                        <div class="details">
                            <div class="detail-row">
                                <span class="label">Yo'lovchi:</span>
                                <span class="value">${auth.currentUser.firstName} ${auth.currentUser.lastName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Parvoz:</span>
                                <span class="value">${booking.from} → ${booking.to}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Sana:</span>
                                <span class="value">${new Date(booking.departureDate).toLocaleDateString('uz-UZ')}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Narx:</span>
                                <span class="value">${booking.price}</span>
                            </div>
                        </div>
                        <div class="barcode">
                            ||| ${booking.id.replace('#', '')} |||
                        </div>
                        <p style="text-align: center; color: #666; margin-top: 20px; font-size: 12px;">
                            Ushbu chipta chop etilgan sana: ${new Date().toLocaleDateString('uz-UZ')}
                        </p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });
    
    // Modal yopish
    document.getElementById('closeConfirmationModal').addEventListener('click', function() {
        closeModal('confirmationModal');
    });
    
    document.getElementById('closeConfirmationBtn').addEventListener('click', function() {
        closeModal('confirmationModal');
    });
    
    document.getElementById('confirmationModalOverlay').addEventListener('click', function() {
        closeModal('confirmationModal');
    });
}