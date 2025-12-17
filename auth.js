// auth.js - Yangilangan (Admin Integration)

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('skywings_users')) || [];
        this.bookings = JSON.parse(localStorage.getItem('skywings_bookings')) || [];
        this.initializeAuth();
        this.createDefaultAdmin();
    }
    
    initializeAuth() {
        // Joriy foydalanuvchini tekshirish
        const savedUser = localStorage.getItem('skywings_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
        }
    }
    
    createDefaultAdmin() {
        // Agar admin bo'lmasa, default admin yaratish
        const adminExists = this.users.find(user => user.email === 'admin@skywings.uz');
        
        if (!adminExists) {
            const adminUser = {
                id: 'admin001',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@skywings.uz',
                password: 'admin123',
                phone: '+998 90 000 00 00',
                createdAt: new Date().toISOString(),
                bookings: [],
                isAdmin: true,
                role: 'super_admin'
            };
            
            this.users.push(adminUser);
            localStorage.setItem('skywings_users', JSON.stringify(this.users));
        }
    }
    
    // Register (Ro'yxatdan o'tish)
    register(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Email unikal ekanligini tekshirish
                if (this.users.find(user => user.email === userData.email)) {
                    reject('Bu email allaqachon ro\'yxatdan o\'tgan');
                    return;
                }
                
                // Yangi foydalanuvchi yaratish
                const newUser = {
                    id: Date.now().toString(),
                    ...userData,
                    createdAt: new Date().toISOString(),
                    bookings: [],
                    isAdmin: userData.email === 'admin@skywings.uz',
                    role: userData.email === 'admin@skywings.uz' ? 'admin' : 'user'
                };
                
                this.users.push(newUser);
                localStorage.setItem('skywings_users', JSON.stringify(this.users));
                
                // Avtomatik login qilish
                this.login(userData.email, userData.password)
                    .then(resolve)
                    .catch(reject);
            }, 1000);
        });
    }
    
    // Login (Kirish)
    login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    this.currentUser = user;
                    localStorage.setItem('skywings_current_user', JSON.stringify(user));
                    this.updateUIForLoggedInUser();
                    resolve(user);
                } else {
                    reject('Email yoki parol noto\'g\'ri');
                }
            }, 1000);
        });
    }
    
    // Logout (Chiqish)
    logout() {
        this.currentUser = null;
        localStorage.removeItem('skywings_current_user');
        this.updateUIForLoggedOutUser();
    }
    
    // Booking qo'shish (YANGILANGAN)
    addBooking(bookingData) {
        return new Promise((resolve, reject) => {
            if (!this.currentUser) {
                reject('Avval tizimga kiring');
                return;
            }
            
            setTimeout(() => {
                // Bookingni yaratish
                const booking = {
                    id: bookingData.id || `BK${Date.now().toString().slice(-8)}`,
                    ...bookingData,
                    userId: this.currentUser.id,
                    userEmail: this.currentUser.email,
                    userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
                    bookingDate: new Date().toISOString(),
                    status: 'confirmed',
                    adminViewed: false
                };
                
                // Foydalanuvchining bookinglariga qo'shish
                const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
                this.users[userIndex].bookings.push(booking);
                
                // Global bookings array
                this.bookings.push(booking);
                localStorage.setItem('skywings_bookings', JSON.stringify(this.bookings));
                
                // Foydalanuvchi ma'lumotlarini yangilash
                localStorage.setItem('skywings_users', JSON.stringify(this.users));
                this.currentUser = this.users[userIndex];
                localStorage.setItem('skywings_current_user', JSON.stringify(this.currentUser));
                
                // Admin panel uchun yangi booking notification
                this.createAdminNotification(booking);
                
                resolve(booking);
            }, 1000);
        });
    }
    
    // Admin notification yaratish
    createAdminNotification(booking) {
        const notifications = JSON.parse(localStorage.getItem('skywings_admin_notifications')) || [];
        
        const notification = {
            id: `NOTIF${Date.now().toString().slice(-8)}`,
            type: 'new_booking',
            title: 'Yangi buyurtma',
            message: `${booking.userName} tomonidan yangi chipta sotib olindi`,
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
        this.updateAdminStats(booking);
    }
    
    // Admin statistikasini yangilash
    updateAdminStats(booking) {
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
    }
    
    // Foydalanuvchi bookinglarini olish
    getUserBookings() {
        return this.currentUser ? this.currentUser.bookings : [];
    }
    
    // Barcha bookinglarni olish (admin uchun)
    getAllBookings() {
        return this.bookings;
    }
    
    // Admin statistikasini olish
    getAdminStats() {
        return JSON.parse(localStorage.getItem('skywings_admin_stats')) || {
            totalBookings: this.bookings.length,
            totalRevenue: this.bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || b.price), 0),
            todayBookings: 0,
            todayRevenue: 0,
            monthlyData: {},
            paymentMethods: {},
            flightRoutes: {}
        };
    }
    
    // Admin notifications
    getAdminNotifications() {
        return JSON.parse(localStorage.getItem('skywings_admin_notifications')) || [];
    }
    
    markNotificationAsRead(notificationId) {
        const notifications = this.getAdminNotifications();
        const notification = notifications.find(n => n.id === notificationId);
        
        if (notification) {
            notification.read = true;
            localStorage.setItem('skywings_admin_notifications', JSON.stringify(notifications));
        }
    }
    
    // UI ni tizimga kirgan foydalanuvchi uchun yangilash
    updateUIForLoggedInUser() {
        const loginBtn = document.querySelector('.btn-login');
        const userDropdown = document.querySelector('.user-dropdown');
        const userMenu = document.querySelector('.user-menu');
        
        if (loginBtn && userMenu) {
            loginBtn.innerHTML = `
                <i class="fas fa-user-check"></i> 
                <span class="user-name">${this.currentUser.firstName}</span>
            `;
            loginBtn.style.background = this.currentUser.isAdmin ? '#f59e0b' : '#10b981';
            
            // User dropdown mazmunini yangilash
            if (userDropdown) {
                const profileLink = userDropdown.querySelector('#profileLink');
                const myTicketsLink = userDropdown.querySelector('#myTicketsLink');
                
                if (profileLink) {
                    const roleBadge = this.currentUser.isAdmin ? 
                        '<span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; margin-left: 5px;">Admin</span>' : '';
                    
                    profileLink.innerHTML = `
                        <i class="fas fa-user-circle"></i> 
                        ${this.currentUser.firstName} ${this.currentUser.lastName}
                        ${roleBadge}
                    `;
                }
                
                if (myTicketsLink) {
                    const bookingsCount = this.currentUser.bookings.length;
                    myTicketsLink.innerHTML = `
                        <i class="fas fa-ticket-alt"></i> 
                        Mening chiptalarim 
                        <span class="badge">${bookingsCount}</span>
                    `;
                }
            }
        }
    }
    
    // UI ni tizimdan chiqqan foydalanuvchi uchun yangilash
    updateUIForLoggedOutUser() {
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Kirish';
            loginBtn.style.background = '#2563eb';
        }
    }
    
    // Admin ma'lumotlarini olish
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }
    
    // Admin uchun yangi funksiyalar
    getDashboardStats() {
        const stats = this.getAdminStats();
        const today = new Date().toISOString().split('T')[0];
        
        // Bugungi bookinglarni hisoblash
        const todayBookings = this.bookings.filter(b => 
            b.bookingDate && b.bookingDate.startsWith(today)
        );
        
        return {
            totalBookings: stats.totalBookings,
            totalRevenue: stats.totalRevenue,
            todayBookings: todayBookings.length,
            todayRevenue: todayBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || b.price), 0),
            activeUsers: this.users.filter(u => u.bookings && u.bookings.length > 0).length,
            monthlyData: stats.monthlyData,
            paymentMethods: stats.paymentMethods,
            flightRoutes: stats.flightRoutes
        };
    }
    
    // Bookingni yangilash (admin uchun)
    updateBookingStatus(bookingId, newStatus) {
        const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            this.bookings[bookingIndex].status = newStatus;
            this.bookings[bookingIndex].updatedAt = new Date().toISOString();
            
            // Foydalanuvchi bookingini yangilash
            const userIndex = this.users.findIndex(u => 
                u.bookings && u.bookings.some(b => b.id === bookingId)
            );
            
            if (userIndex !== -1) {
                const userBookingIndex = this.users[userIndex].bookings.findIndex(b => b.id === bookingId);
                if (userBookingIndex !== -1) {
                    this.users[userIndex].bookings[userBookingIndex].status = newStatus;
                }
            }
            
            localStorage.setItem('skywings_bookings', JSON.stringify(this.bookings));
            localStorage.setItem('skywings_users', JSON.stringify(this.users));
            
            return true;
        }
        
        return false;
    }
}

// Global auth instance
const auth = new AuthSystem();