// booking.js - Yangilangan va to'liq ishlaydigan versiya

document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking sahifasi yuklandi');
    
    // Auth system yuklash (agar kerak bo'lsa)
    if (typeof auth === 'undefined') {
        console.log('Auth system yuklanmagan, loading...');
        // Auth.js yuklanishini kutish
        setTimeout(initializeBookingPage, 500);
    } else {
        initializeBookingPage();
    }
});

function initializeBookingPage() {
    console.log('Booking sahifasi ishga tushirilmoqda...');
    
    // URL parametrlarini olish
    const urlParams = new URLSearchParams(window.location.search);
    const flightId = urlParams.get('flight') || '1';
    const price = urlParams.get('price') || '350';
    const destination = urlParams.get('destination') || 'Istanbul';
    
    console.log('URL parametrlari:', { flightId, price, destination });
    
    // Booking ma'lumotlarini yangilash
    if (document.getElementById('bookingPrice')) {
        document.getElementById('bookingPrice').textContent = `$${price}`;
    }
    
    if (document.getElementById('destinationName')) {
        document.getElementById('destinationName').textContent = destination;
    }
    
    // LocalStorage'dan booking ma'lumotlarini olish
    const bookingData = JSON.parse(localStorage.getItem('skywings_current_booking')) || {};
    console.log('LocalStorage booking:', bookingData);
    
    // Agar booking ma'lumotlari bo'lsa, formani to'ldirish
    if (bookingData.id) {
        updateFormWithBookingData(bookingData);
    }
    
    // Form validatsiya
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        console.log('Booking form found, adding submit listener');
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Booking form submitted');
            processBooking();
        });
    } else {
        console.log('Booking form not found');
    }
    
    // To'lov usullari
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            // To'lov formasi ko'rsatish
            const paymentType = this.dataset.payment || this.dataset.method;
            showPaymentForm(paymentType);
        });
    });
    
    // Agar payment-method elementlari bo'lmasa, yangi formatda qidirish
    if (paymentMethods.length === 0) {
        const altPaymentMethods = document.querySelectorAll('[data-method]');
        altPaymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                altPaymentMethods.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                const paymentType = this.dataset.method;
                showPaymentForm(paymentType);
            });
        });
    }
    
    // Passenger qo'shish
    const addPassengerBtn = document.getElementById('addPassenger');
    if (addPassengerBtn) {
        addPassengerBtn.addEventListener('click', addPassengerForm);
    }
    
    // Promo code
    setupPromoCodeSystem();
    
    // Confirm booking button
    const confirmBookingBtn = document.getElementById('confirmBooking');
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', processBooking);
    }
    
    // Confirm payment button
    const confirmPaymentBtn = document.getElementById('confirmPayment');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', processPayment);
    }
    
    // Notification system setup
    setupNotificationSystem();
    
    console.log('Booking sahifasi muvaffaqiyatli ishga tushdi');
}

function updateFormWithBookingData(bookingData) {
    console.log('Formni booking ma\'lumotlari bilan yangilash:', bookingData);
    
    // Flight number
    if (document.getElementById('flightNumber')) {
        document.getElementById('flightNumber').value = bookingData.flightNumber || '';
    }
    
    // From city
    if (document.getElementById('fromCity')) {
        document.getElementById('fromCity').value = bookingData.from || '';
    }
    
    // To city
    if (document.getElementById('toCity')) {
        document.getElementById('toCity').value = bookingData.to || '';
    }
    
    // Flight date
    if (document.getElementById('flightDate')) {
        document.getElementById('flightDate').value = bookingData.departureDate || '';
    }
    
    // Total price
    if (document.getElementById('totalPrice')) {
        document.getElementById('totalPrice').value = bookingData.totalPrice || bookingData.price || '';
    }
    
    // Flight class
    if (document.getElementById('flightClass')) {
        document.getElementById('flightClass').value = bookingData.flightClass || 'economy';
    }
    
    // Passenger count
    if (document.getElementById('passengerCount')) {
        document.getElementById('passengerCount').value = bookingData.passengers || '1';
    }
    
    // Update price displays
    if (document.getElementById('ticketPrice')) {
        document.getElementById('ticketPrice').textContent = `$${bookingData.price || '350'}`;
    }
    
    if (document.getElementById('totalAmount')) {
        const serviceFee = 15;
        const airportTax = 25;
        const total = (parseInt(bookingData.price) || 350) + serviceFee + airportTax;
        document.getElementById('totalAmount').textContent = `$${total}`;
    }
}

function setupPromoCodeSystem() {
    const applyPromoBtn = document.getElementById('applyPromo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', function() {
            const promoCodeInput = document.getElementById('promoCode');
            const promoCode = promoCodeInput ? promoCodeInput.value : '';
            
            if (promoCode === 'SKYWINGS10') {
                applyDiscount(10);
                showNotification('10% chegirma qo\'llandi!', 'success');
            } else if (promoCode === 'SKYWINGS20') {
                applyDiscount(20);
                showNotification('20% chegirma qo\'llandi!', 'success');
            } else if (promoCode === 'TRAVEL15') {
                applyDiscount(15);
                showNotification('15% chegirma qo\'llandi!', 'success');
            } else {
                showNotification('Noto\'g\'ri promo kod', 'error');
            }
        });
    }
}

function applyDiscount(percent) {
    const totalAmountElement = document.getElementById('totalAmount');
    const discountItem = document.getElementById('discountItem');
    const discountAmount = document.getElementById('discountAmount');
    const ticketPriceElement = document.getElementById('ticketPrice');
    
    if (!totalAmountElement || !ticketPriceElement) return;
    
    // Joriy narxlarni olish
    const currentTotal = parseFloat(totalAmountElement.textContent.replace('$', ''));
    const ticketPrice = parseFloat(ticketPriceElement.textContent.replace('$', ''));
    
    // Chegirma miqdorini hisoblash
    const discount = Math.round((currentTotal * percent) / 100);
    const newTotal = currentTotal - discount;
    
    // UI yangilash
    if (discountItem) {
        discountItem.style.display = 'flex';
    }
    
    if (discountAmount) {
        discountAmount.textContent = `-$${discount}`;
    }
    
    totalAmountElement.textContent = `$${newTotal}`;
    
    // Chegirmani localStorage ga saqlash
    localStorage.setItem('skywings_discount', discount.toString());
    localStorage.setItem('skywings_promo_code', `SKYWINGS${percent}`);
}

function showPaymentForm(paymentType) {
    console.log('To\'lov turi tanlandi:', paymentType);
    
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
    }
    
    // To'lov turini localStorage ga saqlash
    localStorage.setItem('skywings_payment_method', paymentType);
}

function addPassengerForm() {
    const passengerContainer = document.getElementById('passengerForms');
    if (!passengerContainer) return;
    
    const passengerCount = passengerContainer.children.length + 1;
    
    const passengerHTML = `
        <div class="passenger-form">
            <h4>Yo'lovchi ${passengerCount}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Ism</label>
                    <input type="text" placeholder="Ism" required>
                </div>
                <div class="form-group">
                    <label>Familiya</label>
                    <input type="text" placeholder="Familiya" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Tug'ilgan sana</label>
                    <input type="date" required>
                </div>
                <div class="form-group">
                    <label>Pasport raqami</label>
                    <input type="text" placeholder="AA1234567" required>
                </div>
            </div>
        </div>
    `;
    
    passengerContainer.innerHTML += passengerHTML;
}

async function processBooking() {
    console.log('Booking jarayoni boshlandi');
    
    // Foydalanuvchi tizimga kirganligini tekshirish
    if (typeof auth === 'undefined' || !auth.currentUser) {
        showNotification('Avval tizimga kiring', 'error');
        showLoginModal();
        return;
    }
    
    // Form ma'lumotlarini yig'ish
    const bookingData = collectBookingData();
    
    if (!bookingData) {
        showNotification('Iltimos, barcha maydonlarni to\'ldiring', 'error');
        return;
    }
    
    // Loading boshlash
    const submitBtn = document.querySelector('.btn-confirm-booking') || document.querySelector('.btn-confirm-payment');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Jarayon...';
        submitBtn.disabled = true;
    }
    
    try {
        // Booking yaratish
        const booking = await createBooking(bookingData);
        
        if (booking) {
            showNotification('Booking muvaffaqiyatli yaratildi!', 'success');
            
            // To'lov sahifasiga yo'naltirish
            setTimeout(() => {
                window.location.href = `payment.html?booking=${booking.id}`;
            }, 1000);
        }
    } catch (error) {
        showNotification(error, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

function collectBookingData() {
    // Asosiy ma'lumotlar
    const bookingData = JSON.parse(localStorage.getItem('skywings_current_booking')) || {};
    
    // Form ma'lumotlari
    const flightNumber = document.getElementById('flightNumber')?.value || bookingData.flightNumber;
    const fromCity = document.getElementById('fromCity')?.value || bookingData.from;
    const toCity = document.getElementById('toCity')?.value || bookingData.to;
    const flightDate = document.getElementById('flightDate')?.value || bookingData.departureDate;
    const totalPrice = document.getElementById('totalPrice')?.value || bookingData.totalPrice || bookingData.price;
    const flightClass = document.getElementById('flightClass')?.value || bookingData.flightClass;
    const passengers = document.getElementById('passengerCount')?.value || bookingData.passengers;
    
    // Tekshirish
    if (!flightNumber || !fromCity || !toCity || !flightDate || !totalPrice || !passengers) {
        console.error('Yetarli ma\'lumotlar yo\'q');
        return null;
    }
    
    return {
        id: `BK${Date.now().toString().slice(-8)}`,
        flightNumber: flightNumber,
        from: fromCity,
        to: toCity,
        departureDate: flightDate,
        price: totalPrice,
        flightClass: flightClass,
        passengers: parseInt(passengers),
        bookingDate: new Date().toISOString(),
        status: 'pending'
    };
}

async function createBooking(bookingData) {
    return new Promise((resolve, reject) => {
        if (!auth.currentUser) {
            reject('Foydalanuvchi tizimga kirish kerak');
            return;
        }
        
        // Simulyatsiya
        setTimeout(() => {
            const booking = {
                ...bookingData,
                userId: auth.currentUser.id,
                userName: `${auth.currentUser.firstName} ${auth.currentUser.lastName}`,
                userEmail: auth.currentUser.email,
                status: 'confirmed'
            };
            
            // LocalStorage ga saqlash
            localStorage.setItem('skywings_current_booking', JSON.stringify(booking));
            
            resolve(booking);
        }, 1000);
    });
}

async function processPayment() {
    console.log('To\'lov jarayoni boshlandi');
    
    // Foydalanuvchi tizimga kirganligini tekshirish
    if (typeof auth === 'undefined' || !auth.currentUser) {
        showNotification('Avval tizimga kiring', 'error');
        showLoginModal();
        return;
    }
    
    // To'lov ma'lumotlarini tekshirish
    const paymentMethod = localStorage.getItem('skywings_payment_method') || 'card';
    const isValid = validatePaymentData(paymentMethod);
    
    if (!isValid) {
        showNotification('To\'lov ma\'lumotlarini to\'ldiring', 'error');
        return;
    }
    
    // Loading boshlash
    const submitBtn = document.querySelector('.btn-confirm-payment');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> To\'lov amalga oshirilmoqda...';
        submitBtn.disabled = true;
    }
    
    try {
        // To'lovni amalga oshirish
        const paymentResult = await executePayment(paymentMethod);
        
        if (paymentResult.success) {
            // Booking yaratish
            const booking = await createBookingFromPayment();
            
            if (booking) {
                showNotification('To\'lov muvaffaqiyatli amalga oshirildi!', 'success');
                
                // Booking tasdiqlash modalini ochish
                setTimeout(() => {
                    showBookingConfirmationModal(booking, paymentMethod);
                }, 1000);
            }
        } else {
            showNotification('To\'lov amalga oshirilmadi', 'error');
        }
    } catch (error) {
        showNotification(error, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

function validatePaymentData(paymentMethod) {
    switch (paymentMethod) {
        case 'card':
            const cardNumber = document.getElementById('cardNumber')?.value;
            const cardExpiry = document.getElementById('cardExpiry')?.value;
            const cardCvv = document.getElementById('cardCvv')?.value;
            const cardHolder = document.getElementById('cardHolder')?.value;
            
            if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
                return false;
            }
            
            // Card number validation
            const cleanedCardNumber = cardNumber.replace(/\s+/g, '');
            if (!/^\d{16}$/.test(cleanedCardNumber)) {
                showNotification('Noto\'g\'ri karta raqami', 'error');
                return false;
            }
            
            // Expiry validation
            if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                showNotification('Noto\'g\'ri amal qilish muddati', 'error');
                return false;
            }
            
            // CVV validation
            if (!/^\d{3}$/.test(cardCvv)) {
                showNotification('Noto\'g\'ri CVV', 'error');
                return false;
            }
            
            return true;
            
        case 'payme':
        case 'click':
        case 'cash':
            return true;
            
        default:
            return false;
    }
}

async function executePayment(paymentMethod) {
    return new Promise((resolve) => {
        // To'lov simulyatsiyasi
        setTimeout(() => {
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
                    timestamp: new Date().toISOString()
                });
            } else {
                resolve({
                    success: false,
                    error: 'To\'lov amalga oshirilmadi'
                });
            }
        }, 2000);
    });
}

async function createBookingFromPayment() {
    const bookingData = JSON.parse(localStorage.getItem('skywings_current_booking')) || {};
    const paymentMethod = localStorage.getItem('skywings_payment_method') || 'card';
    const discount = localStorage.getItem('skywings_discount') || 0;
    const promoCode = localStorage.getItem('skywings_promo_code') || '';
    
    const booking = {
        ...bookingData,
        id: `BK${Date.now().toString().slice(-8)}`,
        paymentMethod: paymentMethod,
        discount: parseInt(discount),
        promoCode: promoCode,
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        adminViewed: false
    };
    
    // Auth system orqali booking yaratish
    if (typeof auth !== 'undefined' && auth.addBooking) {
        try {
            const savedBooking = await auth.addBooking(booking);
            return savedBooking;
        } catch (error) {
            console.error('Booking yaratishda xatolik:', error);
            
            // Agar auth system ishlamasa, manual saqlash
            const bookings = JSON.parse(localStorage.getItem('skywings_bookings')) || [];
            bookings.push(booking);
            localStorage.setItem('skywings_bookings', JSON.stringify(bookings));
            
            return booking;
        }
    } else {
        // Auth system yo'q, manual saqlash
        const bookings = JSON.parse(localStorage.getItem('skywings_bookings')) || [];
        bookings.push(booking);
        localStorage.setItem('skywings_bookings', JSON.stringify(bookings));
        
        return booking;
    }
}

function showBookingConfirmationModal(booking, paymentMethod) {
    const modalHTML = `
        <div class="modal-overlay" id="successModalOverlay"></div>
        <div class="modal" id="successModal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Muvaffaqiyatli!</h3>
                <button class="modal-close" id="closeSuccessModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <i class="fas fa-check-circle" style="font-size: 64px; color: #10b981; margin-bottom: 1rem;"></i>
                    <h3 style="color: #10b981; margin-bottom: 0.5rem;">Buyurtmangiz qabul qilindi!</h3>
                    <p style="color: #64748b;">To'lov muvaffaqiyatli amalga oshirildi</p>
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
                            <div style="font-weight: 600; color: #1e293b;">$${booking.price || booking.totalPrice}</div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; color: #64748b; font-size: 0.9rem; margin-bottom: 2rem;">
                    <p>Chipta ma'lumotlari ${auth.currentUser ? auth.currentUser.email : 'sizning'} elektron pochtangizga yuborildi</p>
                </div>
                
                <div class="modal-actions" style="display: flex; gap: 10px;">
                    <button type="button" class="btn-primary" id="printTicketBtn" style="flex: 1; padding: 12px;">
                        <i class="fas fa-print"></i> Chiptani chop etish
                    </button>
                    <button type="button" class="btn-secondary" id="goToProfileBtn" style="flex: 1; padding: 12px;">
                        <i class="fas fa-ticket-alt"></i> Chiptalarim
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
    
    if (overlay) overlay.style.display = 'block';
    if (modal) modal.style.display = 'block';
    
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

function formatDate(dateString) {
    if (!dateString) return 'Noma\'lum';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function printTicket(booking) {
    const printWindow = window.open('', '_blank');
    
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
                .ticket-body {
                    padding: 2rem;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                .info-section h3 {
                    color: #475569;
                    margin: 0 0 1rem 0;
                }
                .info-item {
                    margin-bottom: 0.5rem;
                }
                .info-label {
                    color: #64748b;
                    font-size: 0.9rem;
                }
                .info-value {
                    color: #1e293b;
                    font-weight: 500;
                }
                .barcode {
                    text-align: center;
                    padding: 2rem;
                    border-top: 2px dashed #cbd5e1;
                    font-family: monospace;
                    font-size: 1.5rem;
                    letter-spacing: 3px;
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
                    <div class="info-grid">
                        <div class="info-section">
                            <h3>Parvoz ma'lumotlari</h3>
                            <div class="info-item">
                                <div class="info-label">Parvoz raqami</div>
                                <div class="info-value">${booking.flightNumber}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Yo'nalish</div>
                                <div class="info-value">${booking.from} → ${booking.to}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Sana</div>
                                <div class="info-value">${formatDate(booking.departureDate)}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Uchish vaqti</div>
                                <div class="info-value">${booking.departureTime || 'Noma\'lum'}</div>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h3>Yo'lovchi ma'lumotlari</h3>
                            <div class="info-item">
                                <div class="info-label">Ism Familiya</div>
                                <div class="info-value">${booking.userName || 'Yo\'lovchi'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Yo'lovchilar</div>
                                <div class="info-value">${booking.passengers} kishi</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Klass</div>
                                <div class="info-value">${booking.flightClass === 'economy' ? 'Ekonom' : 
                                                       booking.flightClass === 'business' ? 'Biznes' : 'Birinchi'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">To'lov turi</div>
                                <div class="info-value">${getPaymentMethodText(booking.paymentMethod)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="barcode">
                        ${booking.id.replace('#', '')} ${booking.flightNumber} 
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
    localStorage.removeItem('skywings_current_booking');
    localStorage.removeItem('skywings_booking_total');
    localStorage.removeItem('skywings_discount');
    localStorage.removeItem('skywings_promo_code');
    localStorage.removeItem('skywings_payment_method');
}

function setupNotificationSystem() {
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
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
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
}

function closeModal(modalId) {
    const overlay = document.getElementById(`${modalId}Overlay`);
    const modal = document.getElementById(modalId);
    
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.remove();
}

// Modal functions (agar kerak bo'lsa)
function showLoginModal() {
    showNotification('Iltimos, avval tizimga kiring', 'info');
}

// CSS animatsiyalari qo'shish
const animationCSS = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

// CSS qo'shish
if (!document.querySelector('#booking-animations')) {
    const style = document.createElement('style');
    style.id = 'booking-animations';
    style.textContent = animationCSS;
    document.head.appendChild(style);
}