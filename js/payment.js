// payment.js - To'liq Funksional To'lov Tizimi

document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment sahifasi yuklandi');
    
    // Loading spinnerni yashirish
    setTimeout(() => {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }, 1000);
    
    // Auth systemni tekshirish
    if (typeof auth === 'undefined') {
        console.log('Auth system yuklanmagan, loading...');
        // Yangi auth instance yaratish
        initializeAuthSystem();
    }
    
    // Sahifani ishga tushirish
    initializePaymentPage();
});

function initializeAuthSystem() {
    // Oddiy auth system (agar auth.js yo'q bo'lsa)
    window.auth = {
        currentUser: JSON.parse(localStorage.getItem('skywings_current_user')) || null,
        users: JSON.parse(localStorage.getItem('skywings_users')) || [],
        bookings: JSON.parse(localStorage.getItem('skywings_bookings')) || [],
        
        isLoggedIn: function() {
            return this.currentUser !== null;
        },
        
        addBooking: function(bookingData) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Booking yaratish
                    const booking = {
                        ...bookingData,
                        bookingDate: new Date().toISOString(),
                        status: 'confirmed'
                    };
                    
                    // Bookinglarni saqlash
                    this.bookings.push(booking);
                    localStorage.setItem('skywings_bookings', JSON.stringify(this.bookings));
                    
                    // Foydalanuvchining bookinglariga qo'shish
                    if (this.currentUser) {
                        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
                        if (userIndex !== -1) {
                            if (!this.users[userIndex].bookings) {
                                this.users[userIndex].bookings = [];
                            }
                            this.users[userIndex].bookings.push(booking);
                            localStorage.setItem('skywings_users', JSON.stringify(this.users));
                            
                            // Current user ma'lumotlarini yangilash
                            this.currentUser = this.users[userIndex];
                            localStorage.setItem('skywings_current_user', JSON.stringify(this.currentUser));
                        }
                    }
                    
                    // Admin notification yaratish
                    createAdminNotification(booking);
                    
                    resolve(booking);
                }, 1000);
            });
        }
    };
    
    console.log('Basic auth system initialized');
}

function initializePaymentPage() {
    console.log('Payment sahifasi ishga tushirilmoqda...');
    
    // Booking ma'lumotlarini olish
    const bookingData = JSON.parse(localStorage.getItem('skywings_current_booking')) || {};
    console.log('Booking data from storage:', bookingData);
    
    if (!bookingData.id && !bookingData.flightNumber) {
        console.error('No booking data found');
        showNotification('Booking ma\'lumotlari topilmadi', 'error');
        setTimeout(() => {
            window.location.href = 'flights.html';
        }, 2000);
        return;
    }
    
    // Sahifani booking ma'lumotlari bilan to'ldirish
    updatePageWithBookingData(bookingData);
    
    // To'lov usullarini sozlash
    setupPaymentMethods();
    
    // Card form validation
    setupCardFormValidation();
    
    // Promo code system
    setupPromoCodeSystem();
    
    // Confirm payment button
    setupConfirmPayment(bookingData);
    
    // Notification system
    setupNotificationSystem();
    
    // Auth events
    setupAuthEvents();
    
    console.log('Payment sahifasi muvaffaqiyatli ishga tushdi');
}

function updatePageWithBookingData(bookingData) {
    console.log('Updating page with booking data:', bookingData);
    
    // Flight summary
    const flightSummary = document.getElementById('flightSummary');
    if (flightSummary) {
        flightSummary.innerHTML = `
            <div class="flight-route">
                <div class="route-details">
                    <h4>${bookingData.from || 'Toshkent (TAS)'} → ${bookingData.to || 'Istanbul (IST)'}</h4>
                    <p>${formatDate(bookingData.departureDate)} | ${bookingData.departureTime || '10:00'} - ${bookingData.arrivalTime || '14:30'}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.5rem; font-weight: 600; color: #2563eb;">$${bookingData.totalPrice || bookingData.price || '350'}</div>
                    <div style="color: #64748b; font-size: 0.9rem;">${bookingData.passengers || 1} kishi uchun</div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <div style="color: #475569; font-size: 0.9rem; margin-bottom: 5px;">${bookingData.airline || 'Uzbekistan Airways'}</div>
                    <div style="color: #64748b; font-size: 0.9rem;">${bookingData.flightNumber || 'HY-123'} | ${bookingData.duration || '4s 30d'}</div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #475569; font-size: 0.9rem; margin-bottom: 5px;">${getClassText(bookingData.flightClass)}</div>
                    <div style="color: #64748b; font-size: 0.9rem;">${bookingData.baggage || '20kg'}</div>
                </div>
            </div>
        `;
    }
    
    // Passenger details
    const passengerDetails = document.getElementById('passengerDetails');
    if (passengerDetails) {
        const passengers = bookingData.passengers || 1;
        const adults = bookingData.adults || passengers;
        const children = bookingData.children || 0;
        const infants = bookingData.infants || 0;
        
        let passengerHTML = '';
        let passengerCount = 0;
        
        // Adults
        for (let i = 0; i < adults; i++) {
            passengerCount++;
            passengerHTML += `
                <div class="passenger-item">
                    <h4>Yo'lovchi ${passengerCount} (Katta)</h4>
                    <p>To'liq ism kiritilishi kerak</p>
                </div>
            `;
        }
        
        // Children
        for (let i = 0; i < children; i++) {
            passengerCount++;
            passengerHTML += `
                <div class="passenger-item">
                    <h4>Yo'lovchi ${passengerCount} (Bola)</h4>
                    <p>2-11 yosh</p>
                </div>
            `;
        }
        
        // Infants
        for (let i = 0; i < infants; i++) {
            passengerCount++;
            passengerHTML += `
                <div class="passenger-item">
                    <h4>Yo'lovchi ${passengerCount} (Chaqaloq)</h4>
                    <p>2 yoshgacha</p>
                </div>
            `;
        }
        
        passengerDetails.innerHTML = passengerHTML;
    }
    
    // Price breakdown
    const ticketPrice = parseInt(bookingData.totalPrice || bookingData.price || '350');
    const serviceFee = 15;
    const airportTax = 25;
    const total = ticketPrice + serviceFee + airportTax;
    
    // Update price displays
    if (document.getElementById('ticketPrice')) {
        document.getElementById('ticketPrice').textContent = `$${ticketPrice}`;
    }
    
    if (document.getElementById('serviceFee')) {
        document.getElementById('serviceFee').textContent = `$${serviceFee}`;
    }
    
    if (document.getElementById('airportTax')) {
        document.getElementById('airportTax').textContent = `$${airportTax}`;
    }
    
    if (document.getElementById('totalAmount')) {
        document.getElementById('totalAmount').textContent = `$${total}`;
    }
    
    // Totalni localStorage ga saqlash
    localStorage.setItem('skywings_booking_total', total.toString());
    localStorage.setItem('skywings_ticket_price', ticketPrice.toString());
    
    console.log('Price breakdown updated:', { ticketPrice, serviceFee, airportTax, total });
}

function formatDate(dateString) {
    if (!dateString) return 'Sana kiritilmagan';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Sana noto\'g\'ri';
    }
}

function getClassText(flightClass) {
    switch(flightClass) {
        case 'economy': return 'Ekonom klass';
        case 'business': return 'Biznes klass';
        case 'first': return 'Birinchi klass';
        default: return 'Ekonom klass';
    }
}

function setupPaymentMethods() {
    console.log('Setting up payment methods');
    
    const paymentMethods = document.querySelectorAll('.payment-method');
    console.log('Found payment methods:', paymentMethods.length);
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            console.log('Payment method clicked:', this.dataset.method);
            
            // Barcha methodlardan active klassini olib tashlash
            paymentMethods.forEach(m => {
                m.classList.remove('active');
                m.style.borderColor = '#e2e8f0';
                m.style.background = '';
            });
            
            // Tanlangan methodga active klassini qo'shish
            this.classList.add('active');
            this.style.borderColor = '#2563eb';
            this.style.background = 'rgba(37, 99, 235, 0.05)';
            
            // To'lov formasi ko'rsatish
            const methodType = this.dataset.method;
            showPaymentForm(methodType);
            
            // To'lov turini localStorage ga saqlash
            localStorage.setItem('skywings_payment_method', methodType);
            console.log('Payment method saved to localStorage:', methodType);
        });
    });
    
    // Avvalgi tanlangan to'lov turini restore qilish
    const savedPaymentMethod = localStorage.getItem('skywings_payment_method') || 'card';
    const savedMethodElement = document.querySelector(`[data-method="${savedPaymentMethod}"]`);
    
    if (savedMethodElement) {
        savedMethodElement.click();
    } else if (paymentMethods.length > 0) {
        paymentMethods[0].click();
    }
}

function showPaymentForm(paymentType) {
    console.log('Showing payment form for:', paymentType);
    
    // Barcha to'lov formalarini yashirish
    const paymentForms = document.querySelectorAll('.payment-form');
    paymentForms.forEach(form => {
        form.classList.remove('active');
        form.style.display = 'none';
    });
    
    // Tanlangan to'lov formasini ko'rsatish
    const selectedForm = document.getElementById(`${paymentType}Form`);
    if (selectedForm) {
        selectedForm.classList.add('active');
        selectedForm.style.display = 'block';
        
        // Formani ko'rsatish animatsiyasi
        selectedForm.style.animation = 'fadeIn 0.3s ease';
    } else {
        console.error('Payment form not found for type:', paymentType);
        
        // Agar forma topilmasa, card formani ko'rsatish
        const cardForm = document.getElementById('cardForm');
        if (cardForm) {
            cardForm.classList.add('active');
            cardForm.style.display = 'block';
        }
    }
}

function setupCardFormValidation() {
    console.log('Setting up card form validation');
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue.substring(0, 19);
            
            // Card type detection
            detectCardType(value);
        });
    }
    
    // Card expiry formatting
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                let month = value.substring(0, 2);
                if (parseInt(month) > 12) {
                    month = '12';
                }
                if (parseInt(month) < 1) {
                    month = '01';
                }
                e.target.value = month + '/' + value.substring(2, 4);
            } else {
                e.target.value = value;
            }
        });
    }
    
    // CVV formatting
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
    
    // Payme redirect
    const redirectToPaymeBtn = document.getElementById('redirectToPayme');
    if (redirectToPaymeBtn) {
        redirectToPaymeBtn.addEventListener('click', function() {
            showNotification('Payme tizimiga yo\'naltirilmoqda...', 'info');
            // Simulyatsiya
            setTimeout(() => {
                showNotification('Payme orqali to\'lov muvaffaqiyatli amalga oshirildi', 'success');
                document.getElementById('confirmPayment').click();
            }, 2000);
        });
    }
    
    // Click process
    const processClickBtn = document.getElementById('processClick');
    if (processClickBtn) {
        processClickBtn.addEventListener('click', function() {
            const phoneInput = document.getElementById('clickPhone');
            if (!phoneInput || !phoneInput.value.trim()) {
                showNotification('Telefon raqamini kiriting', 'error');
                return;
            }
            
            showNotification('Tasdiqlash kodi SMS orqali yuborildi', 'info');
            // Simulyatsiya
            setTimeout(() => {
                showNotification('Click orqali to\'lov muvaffaqiyatli amalga oshirildi', 'success');
                document.getElementById('confirmPayment').click();
            }, 2000);
        });
    }
}

function detectCardType(cardNumber) {
    if (!cardNumber) return;
    
    const cardTypeIndicator = document.getElementById('cardTypeIndicator');
    if (!cardTypeIndicator) return;
    
    // Visa: starts with 4
    if (cardNumber.startsWith('4')) {
        cardTypeIndicator.innerHTML = '<i class="fab fa-cc-visa"></i> Visa';
        cardTypeIndicator.style.color = '#1a1f71';
    }
    // Mastercard: starts with 51-55
    else if (/^5[1-5]/.test(cardNumber)) {
        cardTypeIndicator.innerHTML = '<i class="fab fa-cc-mastercard"></i> MasterCard';
        cardTypeIndicator.style.color = '#eb001b';
    }
    // UzCard: starts with 8600
    else if (cardNumber.startsWith('8600')) {
        cardTypeIndicator.innerHTML = '<i class="fas fa-credit-card"></i> UzCard';
        cardTypeIndicator.style.color = '#004b87';
    }
    // Humo: starts with 9860
    else if (cardNumber.startsWith('9860')) {
        cardTypeIndicator.innerHTML = '<i class="fas fa-credit-card"></i> Humo';
        cardTypeIndicator.style.color = '#ff6b00';
    }
    else {
        cardTypeIndicator.innerHTML = '<i class="fas fa-credit-card"></i> Karta';
        cardTypeIndicator.style.color = '#64748b';
    }
}

function setupPromoCodeSystem() {
    console.log('Setting up promo code system');
    
    const applyPromoBtn = document.getElementById('applyPromo');
    const promoCodeInput = document.getElementById('promoCode');
    const promoMessage = document.getElementById('promoMessage');
    
    if (!applyPromoBtn || !promoCodeInput) {
        console.log('Promo code elements not found');
        return;
    }
    
    applyPromoBtn.addEventListener('click', function() {
        const promoCode = promoCodeInput.value.trim().toUpperCase();
        
        if (!promoCode) {
            showNotification('Iltimos, promo kodni kiriting', 'error');
            return;
        }
        
        // Promo kodlarni tekshirish
        const validPromoCodes = {
            'SKYWINGS10': 10,
            'SKYWINGS20': 20,
            'TRAVEL15': 15,
            'FIRSTORDER': 25,
            'WELCOME': 30
        };
        
        if (validPromoCodes[promoCode]) {
            const discountPercent = validPromoCodes[promoCode];
            applyPromoDiscount(discountPercent, promoCode);
            
            if (promoMessage) {
                promoMessage.textContent = `${discountPercent}% chegirma qo'llandi!`;
                promoMessage.style.color = '#10b981';
            }
            
            showNotification(`${discountPercent}% chegirma muvaffaqiyatli qo'llandi!`, 'success');
        } else {
            if (promoMessage) {
                promoMessage.textContent = 'Noto\'g\'ri promo kod';
                promoMessage.style.color = '#ef4444';
            }
            showNotification('Noto\'g\'ri promo kod', 'error');
        }
    });
    
    // Enter bosilganda ham ishlash
    promoCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyPromoBtn.click();
        }
    });
}

function applyPromoDiscount(discountPercent, promoCode) {
    const ticketPrice = parseFloat(localStorage.getItem('skywings_ticket_price') || '350');
    const serviceFee = 15;
    const airportTax = 25;
    
    // Faqat chipta narxiga chegirma qo'llash
    const discountAmount = Math.round((ticketPrice * discountPercent) / 100);
    const newTicketPrice = ticketPrice - discountAmount;
    const newTotal = newTicketPrice + serviceFee + airportTax;
    
    // UI yangilash
    const discountItem = document.getElementById('discountItem');
    const discountAmountElement = document.getElementById('discountAmount');
    const ticketPriceElement = document.getElementById('ticketPrice');
    const totalAmountElement = document.getElementById('totalAmount');
    
    if (discountItem) {
        discountItem.style.display = 'flex';
    }
    
    if (discountAmountElement) {
        discountAmountElement.textContent = `-$${discountAmount}`;
    }
    
    if (ticketPriceElement) {
        ticketPriceElement.textContent = `$${newTicketPrice}`;
    }
    
    if (totalAmountElement) {
        totalAmountElement.textContent = `$${newTotal}`;
    }
    
    // Chegirmani localStorage ga saqlash
    localStorage.setItem('skywings_discount', discountAmount.toString());
    localStorage.setItem('skywings_promo_code', promoCode);
    localStorage.setItem('skywings_booking_total', newTotal.toString());
    
    console.log('Discount applied:', { discountPercent, discountAmount, newTicketPrice, newTotal });
}

function setupConfirmPayment(bookingData) {
    console.log('Setting up confirm payment');
    
    const confirmPaymentBtn = document.getElementById('confirmPayment');
    if (!confirmPaymentBtn) {
        console.error('Confirm payment button not found');
        return;
    }
    
    confirmPaymentBtn.addEventListener('click', async function() {
        console.log('Confirm payment clicked');
        
        // Foydalanuvchi tizimga kirganligini tekshirish
        if (!auth || !auth.isLoggedIn()) {
            showNotification('Avval tizimga kiring', 'error');
            showLoginModal();
            return;
        }
        
        // To'lov turini tekshirish
        const paymentMethod = localStorage.getItem('skywings_payment_method') || 'card';
        console.log('Payment method:', paymentMethod);
        
        // To'lov ma'lumotlarini tekshirish
        let isValid = true;
        
        if (paymentMethod === 'card') {
            isValid = validateCardForm();
        }
        
        if (!isValid) {
            return;
        }
        
        // Loading boshlash
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> To\'lov amalga oshirilmoqda...';
        this.disabled = true;
        
        try {
            // To'lovni amalga oshirish
            const paymentResult = await processPayment(paymentMethod, bookingData);
            
            if (paymentResult.success) {
                // Booking yaratish
                const booking = await createBooking(bookingData, paymentMethod);
                
                if (booking) {
                    showNotification('To\'lov muvaffaqiyatli amalga oshirildi!', 'success');
                    
                    // Muvaffaqiyatli to'lov modalini ochish
                    setTimeout(() => {
                        showPaymentSuccessModal(booking, paymentMethod);
                    }, 1000);
                }
            } else {
                showNotification(paymentResult.error || 'To\'lov amalga oshirilmadi', 'error');
                this.innerHTML = originalText;
                this.disabled = false;
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            showNotification('Xatolik yuz berdi: ' + error.message, 'error');
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
}

function validateCardForm() {
    console.log('Validating card form');
    
    const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s+/g, '') || '';
    const cardExpiry = document.getElementById('cardExpiry')?.value || '';
    const cardCvv = document.getElementById('cardCvv')?.value || '';
    const cardHolder = document.getElementById('cardHolder')?.value || '';
    
    console.log('Card validation data:', { cardNumber, cardExpiry, cardCvv, cardHolder });
    
    // Card number validation
    if (!/^\d{16}$/.test(cardNumber)) {
        showNotification('Noto\'g\'ri karta raqami. 16 ta raqam bo\'lishi kerak', 'error');
        return false;
    }
    
    // Expiry validation
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showNotification('Noto\'g\'ri amal qilish muddati. MM/YY formatida kiriting', 'error');
        return false;
    }
    
    const [month, year] = cardExpiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) {
        showNotification('Noto\'g\'ri oy. 01 dan 12 gacha bo\'lishi kerak', 'error');
        return false;
    }
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        showNotification('Karta muddati o\'tgan', 'error');
        return false;
    }
    
    // CVV validation
    if (!/^\d{3,4}$/.test(cardCvv)) {
        showNotification('Noto\'g\'ri CVV. 3 yoki 4 ta raqam bo\'lishi kerak', 'error');
        return false;
    }
    
    // Card holder validation
    if (!cardHolder.trim() || cardHolder.length < 3) {
        showNotification('Karta egasi ismini kiriting (kamida 3 ta harf)', 'error');
        return false;
    }
    
    return true;
}

async function processPayment(paymentMethod, bookingData) {
    console.log('Processing payment with method:', paymentMethod);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // To'lov simulyatsiyasi
            const successRates = {
                'card': 0.95,
                'payme': 0.98,
                'click': 0.97,
                'cash': 1.00
            };
            
            const successRate = successRates[paymentMethod] || 0.95;
            
            if (Math.random() < successRate) {
                resolve({
                    success: true,
                    paymentId: `PAY${Date.now().toString().slice(-8)}`,
                    method: paymentMethod,
                    amount: parseFloat(localStorage.getItem('skywings_booking_total')),
                    timestamp: new Date().toISOString()
                });
            } else {
                resolve({
                    success: false,
                    error: 'To\'lov amalga oshirilmadi. Iltimos, qayta urinib ko\'ring.'
                });
            }
        }, 2000);
    });
}

async function createBooking(bookingData, paymentMethod) {
    console.log('Creating booking with payment method:', paymentMethod);
    
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Foydalanuvchi topilmadi');
    }
    
    const totalAmount = parseFloat(localStorage.getItem('skywings_booking_total')) || 350;
    const discount = parseFloat(localStorage.getItem('skywings_discount')) || 0;
    const promoCode = localStorage.getItem('skywings_promo_code') || '';
    
    // Booking obyektini yaratish
    const booking = {
        id: `BK${Date.now().toString().slice(-8)}`,
        userId: user.id,
        passengerName: `${user.firstName} ${user.lastName}`,
        passengerEmail: user.email,
        passengerPhone: user.phone,
        flightId: bookingData.id || 'FL001',
        flightNumber: bookingData.flightNumber || 'HY-123',
        airline: bookingData.airline || 'Uzbekistan Airways',
        from: bookingData.from || 'Toshkent (TAS)',
        to: bookingData.to || 'Istanbul (IST)',
        departureDate: bookingData.departureDate || new Date().toISOString().split('T')[0],
        departureTime: bookingData.departureTime || '10:00',
        arrivalTime: bookingData.arrivalTime || '14:30',
        duration: bookingData.duration || '4s 30d',
        passengers: bookingData.passengers || 1,
        adults: bookingData.adults || 1,
        children: bookingData.children || 0,
        infants: bookingData.infants || 0,
        flightClass: bookingData.flightClass || 'economy',
        seatNumbers: generateSeatNumbers(bookingData.passengers || 1),
        baggage: bookingData.baggage || '20kg',
        price: bookingData.price || 350,
        serviceFee: 15,
        airportTax: 25,
        discount: discount,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: 'completed',
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        promoCode: promoCode,
        bookingSource: 'website'
    };
    
    console.log('Created booking object:', booking);
    
    // Bookingni saqlash
    try {
        const savedBooking = await auth.addBooking(booking);
        console.log('Booking saved successfully:', savedBooking);
        
        // Admin panel uchun notification yaratish
        createAdminNotification(savedBooking);
        
        return savedBooking;
    } catch (error) {
        console.error('Error saving booking:', error);
        
        // Agar auth.addBooking ishlamasa, manual saqlash
        const bookings = JSON.parse(localStorage.getItem('skywings_bookings')) || [];
        bookings.push(booking);
        localStorage.setItem('skywings_bookings', JSON.stringify(bookings));
        
        // Admin notification
        createAdminNotification(booking);
        
        return booking;
    }
}

function generateSeatNumbers(passengers) {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];
    
    for (let i = 0; i < passengers; i++) {
        const row = Math.floor(Math.random() * 30) + 1;
        const seat = rows[Math.floor(Math.random() * rows.length)];
        seats.push(`${row}${seat}`);
    }
    
    return seats.join(', ');
}

function createAdminNotification(booking) {
    console.log('Creating admin notification for booking:', booking.id);
    
    const notifications = JSON.parse(localStorage.getItem('skywings_admin_notifications')) || [];
    
    const notification = {
        id: `NOTIF${Date.now().toString().slice(-8)}`,
        type: 'new_booking',
        title: 'Yangi buyurtma',
        message: `${booking.passengerName} tomonidan yangi chipta sotib olindi`,
        details: {
            bookingId: booking.id,
            flight: `${booking.from} → ${booking.to}`,
            amount: `$${booking.totalAmount || booking.price}`,
            paymentMethod: booking.paymentMethod || 'card',
            passengers: booking.passengers || 1
        },
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
    };
    
    notifications.unshift(notification);
    localStorage.setItem('skywings_admin_notifications', JSON.stringify(notifications));
    
    // Admin statistikasini yangilash
    updateAdminStats(booking);
    
    console.log('Admin notification created');
}

function updateAdminStats(booking) {
    console.log('Updating admin stats for booking:', booking.id);
    
    const stats = JSON.parse(localStorage.getItem('skywings_admin_stats')) || {
        totalBookings: 0,
        totalRevenue: 0,
        todayBookings: 0,
        todayRevenue: 0,
        monthlyData: {},
        paymentMethods: {},
        flightRoutes: {}
    };
    
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Statistikani yangilash
    stats.totalBookings += 1;
    stats.totalRevenue += parseFloat(booking.totalAmount || booking.price);
    
    if (booking.bookingDate && booking.bookingDate.startsWith(today)) {
        stats.todayBookings += 1;
        stats.todayRevenue += parseFloat(booking.totalAmount || booking.price);
    }
    
    // Monthly data
    if (!stats.monthlyData[month]) {
        stats.monthlyData[month] = { bookings: 0, revenue: 0 };
    }
    stats.monthlyData[month].bookings += 1;
    stats.monthlyData[month].revenue += parseFloat(booking.totalAmount || booking.price);
    
    // Payment methods
    const paymentMethod = booking.paymentMethod || 'card';
    stats.paymentMethods[paymentMethod] = (stats.paymentMethods[paymentMethod] || 0) + 1;
    
    // Flight routes
    const route = `${booking.from} → ${booking.to}`;
    stats.flightRoutes[route] = (stats.flightRoutes[route] || 0) + 1;
    
    localStorage.setItem('skywings_admin_stats', JSON.stringify(stats));
    console.log('Admin stats updated:', stats);
}

function showPaymentSuccessModal(booking, paymentMethod) {
    console.log('Showing payment success modal for booking:', booking.id);
    
    const user = auth.currentUser;
    
    const modalHTML = `
        <div class="modal-overlay" id="successModalOverlay"></div>
        <div class="modal" id="successModal">
            <div class="modal-header">
                <h3>To'lov muvaffaqiyatli amalga oshirildi!</h3>
                <button class="modal-close" id="closeSuccessModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <i class="fas fa-check-circle" style="font-size: 64px; color: #10b981; margin-bottom: 1rem;"></i>
                    <h3 style="color: #10b981; margin-bottom: 0.5rem;">Rahmat!</h3>
                    <p style="color: #64748b;">Buyurtmangiz muvaffaqiyatli amalga oshirildi</p>
                </div>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #2563eb;">${booking.flightNumber || 'HY-123'}</h4>
                        <p style="margin: 0; color: #64748b;">${booking.from} → ${booking.to}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <div style="color: #475569; font-size: 0.9rem;">Buyurtma raqami</div>
                            <div style="font-weight: 600; color: #1e293b;">${booking.id}</div>
                        </div>
                        <div>
                            <div style="color: #475569; font-size: 0.9rem;">To'lov turi</div>
                            <div style="font-weight: 600; color: #1e293b;">${getPaymentMethodText(paymentMethod)}</div>
                        </div>
                        <div>
                            <div style="color: #475569; font-size: 0.9rem;">Sana</div>
                            <div style="font-weight: 600; color: #1e293b;">${formatDate(booking.departureDate)}</div>
                        </div>
                        <div>
                            <div style="color: #475569; font-size: 0.9rem;">Jami to'lov</div>
                            <div style="font-weight: 600; color: #1e293b;">$${booking.totalAmount || booking.price}</div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; color: #64748b; font-size: 0.9rem; margin-bottom: 2rem;">
                    <p>Chipta ma'lumotlari ${user ? user.email : 'sizning'} elektron pochtangizga yuborildi</p>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-primary" id="printTicketBtn" style="padding: 12px 24px;">
                        <i class="fas fa-print"></i> Chiptani chop etish
                    </button>
                    <button type="button" class="btn-secondary" id="goToProfileBtn" style="padding: 12px 24px;">
                        <i class="fas fa-ticket-alt"></i> Chiptalarimga o'tish
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalsContainer = document.getElementById('modalsContainer');
    if (modalsContainer) {
        modalsContainer.innerHTML = modalHTML;
    } else {
        // Agar modalsContainer bo'lmasa, body ga qo'shish
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv);
    }
    
    // Modalni ko'rsatish
    const overlay = document.getElementById('successModalOverlay');
    const modal = document.getElementById('successModal');
    
    if (overlay) {
        overlay.style.display = 'block';
        overlay.style.animation = 'fadeIn 0.3s ease';
    }
    
    if (modal) {
        modal.style.display = 'block';
        modal.style.animation = 'fadeIn 0.3s ease';
    }
    
    // Tugmalar
    document.getElementById('printTicketBtn')?.addEventListener('click', function() {
        printTicket(booking);
    });
    
    document.getElementById('goToProfileBtn')?.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Modal yopish
    document.getElementById('closeSuccessModal')?.addEventListener('click', function() {
        closeModal('successModal');
    });
    
    overlay?.addEventListener('click', function() {
        closeModal('successModal');
    });
    
    // LocalStorage'dan booking ma'lumotlarini tozalash
    cleanupBookingStorage();
}

function getPaymentMethodText(method) {
    const methods = {
        'card': 'Karta',
        'payme': 'Payme',
        'click': 'Click',
        'cash': 'Naqd pul'
    };
    return methods[method] || method;
}

function printTicket(booking) {
    console.log('Printing ticket for booking:', booking.id);
    
    const printWindow = window.open('', '_blank');
    const user = auth.currentUser;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SkyWings - Chipta #${booking.id}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: #f8fafc;
                }
                .ticket {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .ticket-header {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white;
                    padding: 2rem;
                    text-align: center;
                }
                .ticket-header h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 2rem;
                }
                .ticket-header p {
                    margin: 0;
                    opacity: 0.9;
                }
                .ticket-body {
                    padding: 2rem;
                }
                .flight-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                    padding-bottom: 2rem;
                    border-bottom: 2px solid #e2e8f0;
                }
                .info-section h3 {
                    color: #475569;
                    font-size: 0.9rem;
                    margin: 0 0 0.5rem 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .info-section p {
                    color: #1e293b;
                    font-size: 1.1rem;
                    margin: 0;
                    font-weight: 500;
                }
                .passenger-info {
                    margin-bottom: 2rem;
                    padding-bottom: 2rem;
                    border-bottom: 2px solid #e2e8f0;
                }
                .passenger-info h2 {
                    color: #1e293b;
                    margin: 0 0 1rem 0;
                }
                .passenger-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                .detail-item {
                    margin-bottom: 0.5rem;
                }
                .detail-label {
                    color: #64748b;
                    font-size: 0.9rem;
                }
                .detail-value {
                    color: #1e293b;
                    font-weight: 500;
                }
                .barcode {
                    text-align: center;
                    padding: 2rem;
                    border-top: 2px dashed #cbd5e1;
                }
                .barcode-code {
                    font-family: monospace;
                    font-size: 1.5rem;
                    letter-spacing: 3px;
                    color: #1e293b;
                    margin: 1rem 0;
                }
                .footer-note {
                    text-align: center;
                    color: #64748b;
                    font-size: 0.8rem;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e2e8f0;
                }
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    .ticket {
                        box-shadow: none;
                        border: 1px solid #cbd5e1;
                    }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="ticket-header">
                    <h1>SkyWings Airlines</h1>
                    <p>Elektron chipta va boarding pass</p>
                    <div style="margin-top: 1rem; font-size: 1.2rem;">${booking.id}</div>
                </div>
                
                <div class="ticket-body">
                    <div class="flight-info">
                        <div class="info-section">
                            <h3>Parvoz</h3>
                            <p>${booking.flightNumber || 'HY-123'}</p>
                        </div>
                        <div class="info-section">
                            <h3>Sana</h3>
                            <p>${formatDate(booking.departureDate)}</p>
                        </div>
                        <div class="info-section">
                            <h3>Yo'nalish</h3>
                            <p>${booking.from} → ${booking.to}</p>
                        </div>
                        <div class="info-section">
                            <h3>Uchish vaqti</h3>
                            <p>${booking.departureTime || '10:00'}</p>
                        </div>
                        <div class="info-section">
                            <h3>Aviakompaniya</h3>
                            <p>${booking.airline || 'Uzbekistan Airways'}</p>
                        </div>
                        <div class="info-section">
                            <h3>Davomiyligi</h3>
                            <p>${booking.duration || '4s 30d'}</p>
                        </div>
                    </div>
                    
                    <div class="passenger-info">
                        <h2>Yo'lovchi ma'lumotlari</h2>
                        <div class="passenger-details">
                            <div class="detail-item">
                                <div class="detail-label">Ism Familiya</div>
                                <div class="detail-value">${user ? `${user.firstName} ${user.lastName}` : booking.passengerName}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Email</div>
                                <div class="detail-value">${user ? user.email : booking.passengerEmail}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Telefon</div>
                                <div class="detail-value">${user ? user.phone : booking.passengerPhone}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Yo'lovchilar</div>
                                <div class="detail-value">${booking.passengers} kishi (${booking.adults || 1} katta, ${booking.children || 0} bola, ${booking.infants || 0} chaqaloq)</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">O'rindiqlar</div>
                                <div class="detail-value">${booking.seatNumbers}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Klass</div>
                                <div class="detail-value">${getClassText(booking.flightClass)}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Bagaj</div>
                                <div class="detail-value">${booking.baggage}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">To'lov turi</div>
                                <div class="detail-value">${getPaymentMethodText(booking.paymentMethod)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="barcode">
                        <div class="barcode-code">
                            ${booking.id.replace('#', '')} ${booking.flightNumber} ${(booking.departureDate || '').replace(/-/g, '')}
                        </div>
                        <p>Ushbu kodni aeroportda skanerlang</p>
                    </div>
                    
                    <div class="footer-note">
                        <p>Uchishdan 2 soat oldin aeroportga kelishingizni tavsiya qilamiz</p>
                        <p>Boarding pass uchun check-in counterga boring</p>
                        <p>Chop etilgan sana: ${new Date().toLocaleDateString('uz-UZ')}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function cleanupBookingStorage() {
    console.log('Cleaning up booking storage');
    
    localStorage.removeItem('skywings_current_booking');
    localStorage.removeItem('skywings_booking_total');
    localStorage.removeItem('skywings_ticket_price');
    localStorage.removeItem('skywings_discount');
    localStorage.removeItem('skywings_promo_code');
    localStorage.removeItem('skywings_payment_method');
    
    console.log('Booking storage cleaned up');
}

function setupNotificationSystem() {
    console.log('Setting up notification system');
    
    // Notification container yaratish
    if (!document.getElementById('notificationContainer')) {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    console.log('Showing notification:', { message, type, duration });
    
    const container = document.getElementById('notificationContainer');
    if (!container) {
        console.error('Notification container not found');
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Notification styling
    notification.style.cssText = `
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
    `;
    
    // Type bo'yicha rang
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'info': '#3b82f6',
        'warning': '#f59e0b'
    };
    
    notification.style.background = colors[type] || colors.info;
    
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
    
    return notification;
}

function setupAuthEvents() {
    console.log('Setting up auth events');
    
    // Navigation buttons
    const mainLoginBtn = document.getElementById('mainLoginBtn');
    const profileLink = document.getElementById('profileLink');
    const myBookingsLink = document.getElementById('myBookings');
    const myTicketsLink = document.getElementById('myTicketsLink');
    const settingsLink = document.getElementById('settingsLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (mainLoginBtn) {
        mainLoginBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (auth && auth.isLoggedIn()) {
                const userDropdown = document.querySelector('.user-dropdown');
                if (userDropdown) {
                    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
                }
            } else {
                showLoginModal();
            }
        });
    }
    
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (auth && auth.isLoggedIn()) {
                showProfileModal();
            } else {
                showLoginModal();
            }
        });
    }
    
    [myBookingsLink, myTicketsLink].forEach(link => {
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (auth && auth.isLoggedIn()) {
                    showMyBookingsModal();
                } else {
                    showNotification('Avval tizimga kiring', 'error');
                    showLoginModal();
                }
            });
        }
    });
    
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (auth && auth.isLoggedIn()) {
                showSettingsModal();
            } else {
                showLoginModal();
            }
        });
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (auth && auth.currentUser) {
                auth.currentUser = null;
                localStorage.removeItem('skywings_current_user');
                showNotification('Tizimdan chiqildi', 'success');
                const userDropdown = document.querySelector('.user-dropdown');
                if (userDropdown) {
                    userDropdown.style.display = 'none';
                }
                window.location.reload();
            }
        });
    }
}

// Modal functions
function showLoginModal() {
    showNotification('Iltimos, avval tizimga kiring', 'info');
    // Haqiqiy loyihada bu yerda login modalini ochasiz
}

function showProfileModal() {
    showNotification('Profil ma\'lumotlari', 'info');
    // Haqiqiy loyihada bu yerda profil modalini ochasiz
}

function showMyBookingsModal() {
    showNotification('Mening chiptalarim', 'info');
    // Haqiqiy loyihada bu yerda bookinglar modalini ochasiz
}

function showSettingsModal() {
    showNotification('Sozlamalar', 'info');
    // Haqiqiy loyihada bu yerda sozlamalar modalini ochasiz
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

// CSS animatsiyalari qo'shish
const animationCSS = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -40%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -40%);
        }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .payment-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }
    
    .payment-badge.card {
        background: #dbeafe;
        color: #1e40af;
    }
    
    .payment-badge.payme {
        background: #fef3c7;
        color: #92400e;
    }
    
    .payment-badge.click {
        background: #d1fae5;
        color: #065f46;
    }
    
    .payment-badge.cash {
        background: #f3e8ff;
        color: #6b21a8;
    }
`;

// CSS qo'shish
if (!document.querySelector('#payment-animations')) {
    const style = document.createElement('style');
    style.id = 'payment-animations';
    style.textContent = animationCSS;
    document.head.appendChild(style);
}

console.log('payment.js fayli muvaffaqiyatli yuklandi');
function closeModal(modalId) {
    const overlay = document.getElementById(`${modalId}Overlay`);
    const modal = document.getElementById(modalId);
    
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
    
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Style elementni olib tashlash
    const modalStyles = document.getElementById('payment-success-modal-styles');
    if (modalStyles) {
        modalStyles.remove();
    }
}
function showPaymentSuccessModal(booking, paymentMethod) {
    console.log('Showing payment success modal for booking:', booking.id);
    
    const user = auth.currentUser;
    
    // Modal uchun CSS stylelarini qo'shish
    const modalStyles = document.createElement('style');
    modalStyles.id = 'payment-success-modal-styles';
    modalStyles.textContent = `
        #successModalOverlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        #successModal {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            position: relative;
        }
        
        #successModal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        #successModal .modal-header h3 {
            margin: 0;
            color: #1e293b;
            font-size: 1.5rem;
        }
        
        #successModal .modal-close {
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
        
        #successModal .modal-close:hover {
            background: #f1f5f9;
            color: #475569;
        }
        
        #successModal .modal-body {
            padding: 0;
        }
        
        #successModal .btn-primary {
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s;
            width: 100%;
            margin-bottom: 10px;
        }
        
        #successModal .btn-primary:hover {
            background: #1d4ed8;
        }
        
        #successModal .btn-secondary {
            padding: 12px 24px;
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s;
            width: 100%;
        }
        
        #successModal .btn-secondary:hover {
            background: #e2e8f0;
        }
        
        .modal-footer {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @media (max-width: 768px) {
            #successModal {
                padding: 1.5rem;
                margin: 1rem;
            }
        }
    `;
    
    // Agar style allaqachon qo'shilgan bo'lsa, olib tashlash
    const existingStyles = document.getElementById('payment-success-modal-styles');
    if (existingStyles) {
        existingStyles.remove();
    }
    
    document.head.appendChild(modalStyles);
    
    const modalHTML = `
        <div class="modal-overlay" id="successModalOverlay">
            <div class="modal" id="successModal">
                <div class="modal-header">
                    <h3>To'lov muvaffaqiyatli amalga oshirildi!</h3>
                    <button class="modal-close" id="closeSuccessModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <i class="fas fa-check-circle" style="font-size: 64px; color: #10b981; margin-bottom: 1rem;"></i>
                        <h3 style="color: #10b981; margin-bottom: 0.5rem;">Rahmat!</h3>
                        <p style="color: #64748b; margin-bottom: 2rem;">Buyurtmangiz muvaffaqiyatli amalga oshirildi</p>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <h4 style="margin: 0 0 0.5rem 0; color: #2563eb; font-size: 1.2rem;">${booking.flightNumber || 'HY-123'}</h4>
                            <p style="margin: 0; color: #64748b; font-size: 0.9rem;">${booking.from} → ${booking.to}</p>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <div style="color: #475569; font-size: 0.85rem; margin-bottom: 0.25rem;">Buyurtma raqami</div>
                                <div style="font-weight: 600; color: #1e293b; font-size: 1rem;">${booking.id}</div>
                            </div>
                            <div>
                                <div style="color: #475569; font-size: 0.85rem; margin-bottom: 0.25rem;">To'lov turi</div>
                                <div style="font-weight: 600; color: #1e293b; font-size: 1rem;">${getPaymentMethodText(paymentMethod)}</div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <div style="color: #475569; font-size: 0.85rem; margin-bottom: 0.25rem;">Sana</div>
                                <div style="font-weight: 600; color: #1e293b; font-size: 1rem;">${formatDate(booking.departureDate)}</div>
                            </div>
                            <div>
                                <div style="color: #475569; font-size: 0.85rem; margin-bottom: 0.25rem;">Jami to'lov</div>
                                <div style="font-weight: 600; color: #1e293b; font-size: 1rem;">$${booking.totalAmount || booking.price}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; padding: 0 1rem;">
                        <p style="margin: 0;">Chipta ma'lumotlari ${user ? user.email : 'sizning'} elektron pochtangizga yuborildi</p>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn-primary" id="printTicketBtn">
                            <i class="fas fa-print"></i> Chiptani chop etish
                        </button>
                        <button type="button" class="btn-secondary" id="goToProfileBtn">
                            <i class="fas fa-ticket-alt"></i> Chiptalarimga o'tish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Eski modalni olib tashlash
    const oldModal = document.getElementById('successModal');
    const oldOverlay = document.getElementById('successModalOverlay');
    if (oldModal) oldModal.remove();
    if (oldOverlay) oldOverlay.remove();
    
    // Yangi modalni qo'shish
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Tugmalarga event listener qo'shish
    document.getElementById('printTicketBtn').addEventListener('click', function() {
        printTicket(booking);
    });
    
    document.getElementById('goToProfileBtn').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Modal yopish
    document.getElementById('closeSuccessModal').addEventListener('click', function() {
        closeModal('successModal');
    });
    
    document.getElementById('successModalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('successModal');
        }
    });
    
    // ESC tugmasi bosilganda modalni yopish
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('successModal');
        }
    });
    
    // LocalStorage'dan booking ma'lumotlarini tozalash
    cleanupBookingStorage();
}