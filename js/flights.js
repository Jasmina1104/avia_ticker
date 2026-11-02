 // Simulyatsiya: API dan parvozlarni olish
    const flights = generateFlights(from, to, date, passengers);
    
    if (flights.length === 0) {
        flightsContainer.innerHTML = `
            <div class="no-flights">
                <i class="fas fa-plane-slash"></i>
                <h3>Parvoz topilmadi</h3>
                <p>Berilgan parametrlar bo'yicha parvozlar topilmadi. Boshqa sanani yoki yo'nalishni tanlang.</p>
                <button class="btn-primary" onclick="window.location.href='index.html'">
                    Boshqa parvoz qidirish
                </button>
            </div>
        `;
        return;
    }
    
    let flightsHTML = '';
    
    flights.forEach(flight => {
        flightsHTML += `
            <div class="flight-card">
                <div class="flight-header">
                    <div class="airline-info">
                        <div class="airline-logo">${flight.airlineCode}</div>
                        <div>
                            <h3 style="margin: 0 0 5px 0;">${flight.airline}</h3>
                            <p style="margin: 0; color: #64748b; font-size: 0.9rem;">${flight.flightNumber}</p>
                        </div>
                    </div>
                    <div class="flight-status">
                        <span class="status ${flight.status === 'onTime' ? 'completed' : 'warning'}">
                            ${flight.status === 'onTime' ? 'Oʻz vaqtida' : 'Kechikish'}
                        </span>
                    </div>
                </div>
                
                <div class="flight-routes">
                    <div class="route-item">
                        <div class="route-time">${flight.departureTime}</div>
                        <div class="route-city">${flight.fromCity}</div>
                    </div>
                    
                    <div class="route-duration">
                        <div class="duration-text">${flight.duration}</div>
                        <div style="color: #64748b; font-size: 0.8rem; margin-top: 5px;">
                            ${flight.stops === 0 ? 'To\'g\'ridan-to\'g\'ri' : `${flight.stops} ta to'xtash`}
                        </div>
                    </div>
                    
                    <div class="route-item">
                        <div class="route-time">${flight.arrivalTime}</div>
                        <div class="route-city">${flight.toCity}</div>
                    </div>
                </div>
                
                <div class="flight-details">
                    <div class="detail-item">
                        <i class="fas fa-suitcase"></i>
                        <span>${flight.baggage}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-utensils"></i>
                        <span>${flight.meal ? 'Ovqat kiritilgan' : 'Ovqat kiritilmagan'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-wifi"></i>
                        <span>${flight.wifi ? 'Wi-Fi mavjud' : 'Wi-Fi mavjud emas'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tv"></i>
                        <span>${flight.entertainment ? 'Ruxsat etilgan' : 'Ruxsat etilmagan'}</span>
                    </div>
                </div>
                
                <div class="flight-footer">
                    <div>
                        <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 5px;">
                            ${flight.seats} ta joy mavjud
                        </div>
                        <div style="color: #10b981; font-weight: 500;">
                            <i class="fas fa-check-circle"></i> Qaytarish mumkin
                        </div>
                    </div>
                    
                    <div class="flight-price">
                        <div class="price-amount">$${flight.price}</div>
                        <div class="price-per-person">${passengers} kishi uchun: $${flight.price * passengers}</div>
                    </div>
                    
                    <button class="btn-book-flight" 
                            data-flight='${JSON.stringify(flight)}'
                            data-passengers='${passengers}'>
                        <i class="fas fa-ticket-alt"></i> Tanlash
                    </button>
                </div>
            </div>
        `;
    });
    
    flightsContainer.innerHTML = flightsHTML;
    
    // Book flight tugmalariga event listener qo'shish
    setupBookFlightButtons();
}

function generateFlights(from, to, date, passengers) {
    const airlines = [
        { name: 'Uzbekistan Airways', code: 'HY', color: '#1e40af' },
        { name: 'Turkish Airlines', code: 'TK', color: '#c2410c' },
        { name: 'Aeroflot', code: 'SU', color: '#dc2626' },
        { name: 'Emirates', code: 'EK', color: '#f59e0b' },
        { name: 'Qatar Airways', code: 'QR', color: '#7c3aed' },
        { name: 'Air Astana', code: 'KC', color: '#059669' }
    ];
    
    const flights = [];
    const basePrice = Math.floor(Math.random() * 200) + 300;
    
    for (let i = 0; i < 10; i++) {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const departureHour = Math.floor(Math.random() * 24);
        const departureMinute = Math.floor(Math.random() * 60);
        const durationHours = Math.floor(Math.random() * 8) + 4;
        
        const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
        const arrivalHour = departureHour + durationHours;
        const arrivalTime = `${(arrivalHour % 24).toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
        
        const price = Math.floor(basePrice * (0.9 + Math.random() * 0.3));
        
        flights.push({
            id: `FL${Date.now().toString().slice(-6)}${i}`,
            airline: airline.name,
            airlineCode: airline.code,
            flightNumber: `${airline.code}-${Math.floor(Math.random() * 1000)}`,
            from: from,
            to: to,
            fromCity: from.split('(')[0].trim(),
            toCity: to.split('(')[0].trim(),
            departureDate: date,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            duration: `${durationHours}s ${Math.floor(Math.random() * 60)}d`,
            stops: Math.floor(Math.random() * 2),
            price: price,
            baggage: '20kg',
            meal: Math.random() > 0.3,
            wifi: Math.random() > 0.5,
            entertainment: Math.random() > 0.7,
            seats: Math.floor(Math.random() * 20) + 5,
            status: Math.random() > 0.8 ? 'delayed' : 'onTime',
            airlineColor: airline.color
        });
    }
    
    // Narx bo'yicha tartiblash
    return flights.sort((a, b) => a.price - b.price);
}

function setupBookFlightButtons() {
    document.querySelectorAll('.btn-book-flight').forEach(button => {
        button.addEventListener('click', function() {
            const flightData = JSON.parse(this.dataset.flight);
            const passengers = parseInt(this.dataset.passengers);
            
            // URL parametrlarini olish
            const urlParams = new URLSearchParams(window.location.search);
            const adults = urlParams.get('adults') || '1';
            const children = urlParams.get('children') || '0';
            const infants = urlParams.get('infants') || '0';
            const flightClass = urlParams.get('class') || 'economy';
            
            // Booking ma'lumotlarini yig'ish
            const bookingData = {
                ...flightData,
                passengers: passengers,
                adults: parseInt(adults),
                children: parseInt(children),
                infants: parseInt(infants),
                flightClass: flightClass,
                totalPrice: flightData.price * passengers
            };
            
            // LocalStorage ga saqlash
            localStorage.setItem('skywings_current_booking', JSON.stringify(bookingData));
            
            // Payment sahifasiga o'tish
            window.location.href = `payment.html?flight=${bookingData.id}&passengers=${passengers}`;
        });
    });
}

function setupFilters() {
    // Price slider
    const priceSlider = document.getElementById('priceSlider');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            maxPriceInput.value = this.value;
        });
    }
    
    if (minPriceInput) {
        minPriceInput.addEventListener('change', function() {
            if (parseInt(this.value) < 100) this.value = 100;
            if (parseInt(this.value) > 1000) this.value = 1000;
            priceSlider.value = maxPriceInput.value;
        });
    }
    
    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', function() {
            if (parseInt(this.value) < 100) this.value = 100;
            if (parseInt(this.value) > 1000) this.value = 1000;
            if (parseInt(this.value) < parseInt(minPriceInput.value)) {
                minPriceInput.value = this.value;
            }
            priceSlider.value = this.value;
        });
    }
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const selectedAirlines = [];
            const airlineCheckboxes = [
                'airline1', 'airline2', 'airline3', 'airline4'
            ];
            
            airlineCheckboxes.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox && checkbox.checked) {
                    selectedAirlines.push(checkbox.nextElementSibling.textContent);
                }
            });
            
            const minPrice = parseInt(minPriceInput.value);
            const maxPrice = parseInt(maxPriceInput.value);
            
            // Filterlarni qo'llash (simulyatsiya)
            showNotification(`Filtrlar qo'llandi: ${selectedAirlines.join(', ')}, Narx: $${minPrice}-$${maxPrice}`, 'success');
            
            // Haqiqiy loyihada bu yerda API so'rovi bo'ladi
            setTimeout(() => {
                loadFlights(
                    document.getElementById('fromCity').textContent,
                    document.getElementById('toCity').textContent,
                    document.getElementById('departureDate').textContent,
                    parseInt(document.getElementById('passengerCount').textContent.split(' ')[0])
                );
            }, 500);
        });
    }
}

function setupPagination() {
    const paginationHTML = `
        <button class="pagination-btn">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
        <button class="pagination-btn">4</button>
        <button class="pagination-btn">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    document.getElementById('pagination').innerHTML = paginationHTML;
}

function setupAuthEvents() {
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
            if (auth.currentUser) {
                const userDropdown = document.querySelector('.user-dropdown');
                userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
            } else {
                showLoginModal();
            }
        });
    }
    
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
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
            showNotification('Tizimdan chiqildi', 'success');
            const userDropdown = document.querySelector('.user-dropdown');
            if (userDropdown) {
                userDropdown.style.display = 'none';
            }
        });
    }
}

// Modal functions (auth.js dan)
function showLoginModal() {
    // ... (auth.js dagi showLoginModal funksiyasi) ...
}

function showProfileModal() {
    // ... (auth.js dagi showProfileModal funksiyasi) ...
}

function showMyBookingsModal() {
    // ... (auth.js dagi showMyBookingsModal funksiyasi) ...
}

function showSettingsModal() {
    // ... (auth.js dagi showSettingsModal funksiyasi) ...
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
    if (container) {
        container.appendChild(notification);
    }
    
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