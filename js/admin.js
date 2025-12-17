// admin.js - Yangilangan (Bookinglar va To'lov turlari bilan)

// ... (oldingi admin.js kodlari) ...

// Admin orders sahifasini yuklash
function loadAdminOrdersPage() {
    const ordersPage = document.querySelector('.orders-page');
    const allBookings = auth.getAllBookings();
    const stats = auth.getDashboardStats();
    
    ordersPage.innerHTML = `
        <div class="page-header">
            <h3>Buyurtmalar boshqaruvi</h3>
            <div style="display: flex; gap: 10px;">
                <button class="btn-export" id="exportOrders">
                    <i class="fas fa-file-export"></i> Eksport qilish
                </button>
                <button class="btn-refresh" id="refreshOrdersBtn">
                    <i class="fas fa-redo"></i> Yangilash
                </button>
            </div>
        </div>
        
        <div class="orders-content">
            <!-- Order Stats -->
            <div class="orders-stats">
                <div class="stat-card small">
                    <h4>Jami buyurtmalar</h4>
                    <p>${stats.totalBookings}</p>
                </div>
                <div class="stat-card small">
                    <h4>Bugungi buyurtmalar</h4>
                    <p>${stats.todayBookings}</p>
                </div>
                <div class="stat-card small">
                    <h4>Jami daromad</h4>
                    <p>$${stats.totalRevenue}</p>
                </div>
                <div class="stat-card small">
                    <h4>Bugungi daromad</h4>
                    <p>$${stats.todayRevenue}</p>
                </div>
            </div>
            
            <!-- Filters -->
            <div class="filters-section" style="background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #475569; font-size: 0.9rem;">Holat</label>
                        <select id="statusFilter" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;">
                            <option value="all">Barchasi</option>
                            <option value="confirmed">Tasdiqlangan</option>
                            <option value="pending">Kutilmoqda</option>
                            <option value="cancelled">Bekor qilingan</option>
                            <option value="completed">Yakunlangan</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #475569; font-size: 0.9rem;">To'lov turi</label>
                        <select id="paymentFilter" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;">
                            <option value="all">Barchasi</option>
                            <option value="card">Karta</option>
                            <option value="payme">Payme</option>
                            <option value="click">Click</option>
                            <option value="cash">Naqd pul</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #475569; font-size: 0.9rem;">Sana</label>
                        <input type="date" id="dateFilter" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;">
                    </div>
                    <button class="btn-filter" id="applyOrderFilters" style="margin-top: 20px;">
                        Filtrlash
                    </button>
                </div>
            </div>
            
            <!-- Orders Table -->
            <div class="table-container" style="margin-top: 0;">
                <div class="table-wrapper">
                    <table class="admin-table" id="ordersTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Yo'lovchi</th>
                                <th>Parvoz</th>
                                <th>Sana</th>
                                <th>To'lov turi</th>
                                <th>Narx</th>
                                <th>Holat</th>
                                <th>Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                            ${generateOrdersTable(allBookings)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Event listeners
    document.getElementById('exportOrders').addEventListener('click', exportOrdersToCSV);
    document.getElementById('refreshOrdersBtn').addEventListener('click', loadAdminOrdersPage);
    document.getElementById('applyOrderFilters').addEventListener('click', applyOrderFilters);
    
    // Table actions
    setupOrderTableActions();
}

function generateOrdersTable(bookings) {
    if (bookings.length === 0) {
        return `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #cbd5e1; margin-bottom: 1rem; display: block;"></i>
                    <h3 style="color: #64748b; margin-bottom: 0.5rem;">Hali buyurtmalar yo'q</h3>
                    <p style="color: #94a3b8;">Birorta ham buyurtma amalga oshirilmagan</p>
                </td>
            </tr>
        `;
    }
    
    return bookings.map(booking => {
        const statusClass = getStatusClass(booking.status);
        const statusText = getStatusText(booking.status);
        const paymentMethod = getPaymentMethodText(booking.paymentMethod);
        
        return `
            <tr data-booking-id="${booking.id}">
                <td>${booking.id}</td>
                <td>
                    <div style="font-weight: 500;">${booking.userName || 'Noma\'lum'}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">${booking.userEmail || ''}</div>
                </td>
                <td>
                    <div style="font-weight: 500;">${booking.flightNumber || ''}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">${booking.from} → ${booking.to}</div>
                </td>
                <td>
                    <div style="font-weight: 500;">${formatDate(booking.departureDate)}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">${booking.departureTime || ''}</div>
                </td>
                <td>
                    <span class="payment-badge ${booking.paymentMethod || 'card'}">
                        ${paymentMethod}
                    </span>
                </td>
                <td style="font-weight: 600; color: #10b981;">$${booking.totalAmount || booking.price}</td>
                <td>
                    <span class="status ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <button class="btn-action view-order" data-id="${booking.id}" title="Ko'rish">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit-status" data-id="${booking.id}" title="Holatni o'zgartirish">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete-order" data-id="${booking.id}" title="O'chirish">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusClass(status) {
    const statusMap = {
        'confirmed': 'completed',
        'pending': 'pending',
        'cancelled': 'cancelled',
        'completed': 'completed',
        'processing': 'processing'
    };
    return statusMap[status] || 'pending';
}

function getPaymentMethodText(method) {
    const methods = {
        'card': 'Karta',
        'payme': 'Payme',
        'click': 'Click',
        'cash': 'Naqd pul'
    };
    return methods[method] || method || 'Karta';
}

function setupOrderTableActions() {
    // View order
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            viewOrderDetails(bookingId);
        });
    });
    
    // Edit status
    document.querySelectorAll('.edit-status').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            editOrderStatus(bookingId);
        });
    });
    
    // Delete order
    document.querySelectorAll('.delete-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            deleteOrder(bookingId);
        });
    });
}

function viewOrderDetails(bookingId) {
    const booking = auth.getAllBookings().find(b => b.id === bookingId);
    if (!booking) return;
    
    const modalHTML = `
        <div class="modal-overlay" id="orderDetailsModalOverlay"></div>
        <div class="modal" id="orderDetailsModal" style="max-width: 700px;">
            <div class="modal-header">
                <h3>Buyurtma ma'lumotlari: ${booking.id}</h3>
                <button class="modal-close" id="closeOrderDetailsModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h4 style="color: #475569; margin-bottom: 1rem;">Yo'lovchi ma'lumotlari</h4>
                        <div style="background: #f8fafc; border-radius: 8px; padding: 1rem;">
                            <div style="margin-bottom: 0.5rem;">
                                <div style="color: #64748b; font-size: 0.9rem;">Ism Familiya</div>
                                <div style="font-weight: 500;">${booking.userName}</div>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <div style="color: #64748b; font-size: 0.9rem;">Email</div>
                                <div style="font-weight: 500;">${booking.userEmail}</div>
                            </div>
                            <div>
                                <div style="color: #64748b; font-size: 0.9rem;">Telefon</div>
                                <div style="font-weight: 500;">${booking.passengerPhone || booking.userPhone}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: #475569; margin-bottom: 1rem;">Parvoz ma'lumotlari</h4>
                        <div style="background: #f8fafc; border-radius: 8px; padding: 1rem;">
                            <div style="margin-bottom: 0.5rem;">
                                <div style="color: #64748b; font-size: 0.9rem;">Aviakompaniya</div>
                                <div style="font-weight: 500;">${booking.airline}</div>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <div style="color: #64748b; font-size: 0.9rem;">Parvoz raqami</div>
                                <div style="font-weight: 500;">${booking.flightNumber}</div>
                            </div>
                            <div>
                                <div style="color: #64748b; font-size: 0.9rem;">Yo'nalish</div>
                                <div style="font-weight: 500;">${booking.from} → ${booking.to}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h4 style="color: #475569; margin-bottom: 1rem;">To'lov ma'lumotlari</h4>
                        <div style="background: #f8fafc; border-radius: 8px; padding: 1rem;">
                            <div style="margin-bottom: 0.5rem;">
                                <div style="color: #64748b; font-size: 0.9rem;">To'lov turi</div>
                                <div style="font-weight: 500;">${getPaymentMethodText(booking.paymentMethod)}</div>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <div style="color: #64748b; font-size: 0.9rem;">To'lov summasi</div>
                                <div style="font-weight: 500; color: #10b981;">$${booking.totalAmount || booking.price}</div>
                            </div>
                            <div>
                                <div style="color: #64748b; font-size: 0.9rem;">To'lov sanasi</div>
                                <div style="font-weight: 500;">${formatDate(booking.bookingDate)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: #475569; margin-bottom: 1rem;">Qo'shimcha ma'lumotlar</h4>
                        <div style="background: #f8fafc; border-radius: 8px; padding: 1rem;">
                            <div style="margin-bottom: 0.5rem;">
                                <div style="color: #64748b; font-size: 0.9rem;">Yo'lovchilar</div>
                                <div style="font-weight: 500;">${booking.passengers} kishi (${booking.adults || 1} katta, ${booking.children || 0} bola, ${booking.infants || 0} chaqaloq)</div>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <div style="color: #64748b; font-size: 0.9rem;">O'rindiqlar</div>
                                <div style="font-weight: 500;">${booking.seatNumbers || 'Avtomatik tanlash'}</div>
                            </div>
                            <div>
                                <div style="color: #64748b; font-size: 0.9rem;">Bagaj</div>
                                <div style="font-weight: 500;">${booking.baggage || '20kg'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn-primary" id="printBookingBtn">
                        <i class="fas fa-print"></i> Chop etish
                    </button>
                    <button type="button" class="btn-secondary" id="closeOrderDetailsBtn">
                        Yopish
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Modalni ko'rsatish
    showModal('orderDetailsModal', modalHTML);
    
    // Tugmalar
    document.getElementById('printBookingBtn').addEventListener('click', () => {
        printBookingDetails(booking);
    });
    
    document.getElementById('closeOrderDetailsBtn').addEventListener('click', () => {
        closeModal('orderDetailsModal');
    });
}

function editOrderStatus(bookingId) {
    const booking = auth.getAllBookings().find(b => b.id === bookingId);
    if (!booking) return;
    
    const modalHTML = `
        <div class="modal-overlay" id="editStatusModalOverlay"></div>
        <div class="modal" id="editStatusModal">
            <div class="modal-header">
                <h3>Holatni o'zgartirish: ${booking.id}</h3>
                <button class="modal-close" id="closeEditStatusModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editStatusForm">
                    <div class="form-group">
                        <label>Holat</label>
                        <select id="statusSelect" class="status-select">
                            <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Kutilmoqda</option>
                            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Tasdiqlangan</option>
                            <option value="processing" ${booking.status === 'processing' ? 'selected' : ''}>Jarayonda</option>
                            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Yakunlangan</option>
                            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Bekor qilingan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Izoh (ixtiyoriy)</label>
                        <textarea id="statusNote" rows="3" placeholder="Holat o'zgarishi uchun izoh..."></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Saqlash
                        </button>
                        <button type="button" class="btn-secondary" id="cancelEditStatus">
                            Bekor qilish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Modalni ko'rsatish
    showModal('editStatusModal', modalHTML);
    
    // Form submit
    document.getElementById('editStatusForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newStatus = document.getElementById('statusSelect').value;
        const note = document.getElementById('statusNote').value;
        
        // Statusni yangilash
        const success = auth.updateBookingStatus(bookingId, newStatus);
        
        if (success) {
            showNotification('Buyurtma holati muvaffaqiyatli yangilandi', 'success');
            closeModal('editStatusModal');
            loadAdminOrdersPage();
        } else {
            showNotification('Xatolik yuz berdi', 'error');
        }
    });
    
    // Modal yopish
    document.getElementById('cancelEditStatus').addEventListener('click', () => {
        closeModal('editStatusModal');
    });
}

function deleteOrder(bookingId) {
    if (!confirm(`${bookingId} buyurtmasini o'chirishni tasdiqlaysizmi?`)) {
        return;
    }
    
    const bookings = auth.getAllBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
        // Bookingni olib tashlash
        bookings.splice(bookingIndex, 1);
        localStorage.setItem('skywings_bookings', JSON.stringify(bookings));
        
        // Foydalanuvchidan ham olib tashlash
        const users = JSON.parse(localStorage.getItem('skywings_users')) || [];
        users.forEach(user => {
            if (user.bookings) {
                const userBookingIndex = user.bookings.findIndex(b => b.id === bookingId);
                if (userBookingIndex !== -1) {
                    user.bookings.splice(userBookingIndex, 1);
                }
            }
        });
        
        localStorage.setItem('skywings_users', JSON.stringify(users));
        
        showNotification('Buyurtma muvaffaqiyatli o\'chirildi', 'success');
        loadAdminOrdersPage();
    }
}

function exportOrdersToCSV() {
    const bookings = auth.getAllBookings();
    
    if (bookings.length === 0) {
        showNotification('Eksport qilish uchun buyurtmalar yo\'q', 'warning');
        return;
    }
    
    const headers = ['ID', 'Yo\'lovchi', 'Email', 'Parvoz', 'Yo\'nalish', 'Sana', 'To\'lov turi', 'Narx', 'Holat', 'Buyurtma sanasi'];
    
    const csvContent = [
        headers.join(','),
        ...bookings.map(booking => [
            booking.id,
            `"${booking.userName}"`,
            `"${booking.userEmail}"`,
            `"${booking.flightNumber}"`,
            `"${booking.from} → ${booking.to}"`,
            `"${formatDate(booking.departureDate)}"`,
            `"${getPaymentMethodText(booking.paymentMethod)}"`,
            `"$${booking.totalAmount || booking.price}"`,
            `"${getStatusText(booking.status)}"`,
            `"${formatDate(booking.bookingDate)}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `buyurtmalar_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Buyurtmalar CSV formatida yuklab olindi', 'success');
}

function applyOrderFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const paymentFilter = document.getElementById('paymentFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let bookings = auth.getAllBookings();
    
    // Status bo'yicha filtr
    if (statusFilter !== 'all') {
        bookings = bookings.filter(b => b.status === statusFilter);
    }
    
    // To'lov turi bo'yicha filtr
    if (paymentFilter !== 'all') {
        bookings = bookings.filter(b => b.paymentMethod === paymentFilter);
    }
    
    // Sana bo'yicha filtr
    if (dateFilter) {
        bookings = bookings.filter(b => {
            const bookingDate = new Date(b.bookingDate).toISOString().split('T')[0];
            return bookingDate === dateFilter;
        });
    }
    
    // Jadvalni yangilash
    document.getElementById('ordersTableBody').innerHTML = generateOrdersTable(bookings);
    setupOrderTableActions();
    
    showNotification(`${bookings.length} ta buyurtma topildi`, 'info');
}

function printBookingDetails(booking) {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SkyWings - Admin: ${booking.id}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: white;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 1rem;
                }
                .print-header h1 {
                    color: #2563eb;
                    margin: 0 0 0.5rem 0;
                }
                .print-header p {
                    color: #64748b;
                    margin: 0;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .info-section {
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 1rem;
                }
                .info-section h3 {
                    color: #475569;
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 0.5rem;
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
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .status-confirmed {
                    background: #d1fae5;
                    color: #065f46;
                }
                .status-pending {
                    background: #fef3c7;
                    color: #92400e;
                }
                .footer {
                    text-align: center;
                    color: #64748b;
                    font-size: 0.9rem;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e2e8f0;
                }
                @media print {
                    .print-header {
                        border-bottom: 2px solid #000;
                    }
                    .info-section {
                        border: 1px solid #ddd;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>SkyWings Airlines - Admin Panel</h1>
                <p>Buyurtma ma'lumotlari | ${new Date().toLocaleDateString('uz-UZ')}</p>
            </div>
            
            <div class="info-grid">
                <div class="info-section">
                    <h3>Buyurtma ma'lumotlari</h3>
                    <div class="info-item">
                        <div class="info-label">Buyurtma raqami</div>
                        <div class="info-value">${booking.id}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Sana</div>
                        <div class="info-value">${formatDate(booking.bookingDate)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Holat</div>
                        <div class="info-value">
                            <span class="status-badge status-${getStatusClass(booking.status)}">
                                ${getStatusText(booking.status)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Yo'lovchi ma'lumotlari</h3>
                    <div class="info-item">
                        <div class="info-label">Ism Familiya</div>
                        <div class="info-value">${booking.userName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${booking.userEmail}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Telefon</div>
                        <div class="info-value">${booking.passengerPhone || booking.userPhone}</div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Parvoz ma'lumotlari</h3>
                    <div class="info-item">
                        <div class="info-label">Aviakompaniya</div>
                        <div class="info-value">${booking.airline}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Parvoz raqami</div>
                        <div class="info-value">${booking.flightNumber}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Yo'nalish</div>
                        <div class="info-value">${booking.from} → ${booking.to}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Sana va vaqt</div>
                        <div class="info-value">${formatDate(booking.departureDate)} ${booking.departureTime}</div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>To'lov ma'lumotlari</h3>
                    <div class="info-item">
                        <div class="info-label">To'lov turi</div>
                        <div class="info-value">${getPaymentMethodText(booking.paymentMethod)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">To'lov summasi</div>
                        <div class="info-value">$${booking.totalAmount || booking.price}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Yo'lovchilar</div>
                        <div class="info-value">${booking.passengers} kishi</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">O'rindiqlar</div>
                        <div class="info-value">${booking.seatNumbers}</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>Chop etilgan sana: ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ')}</p>
                <p>SkyWings Airlines Admin Panel</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// ... (qolgan admin.js funksiyalari) ...

// Page content loading
function loadPageContent(page) {
    switch (page) {
        case 'dashboard':
            initializeChart();
            loadOrdersData();
            break;
        case 'flights':
            loadFlightsContent();
            break;
        case 'orders':
            loadAdminOrdersPage(); // YANGILANDI
            break;
        case 'users':
            loadUsersContent();
            break;
        case 'reports':
            loadReportsContent();
            break;
        case 'settings':
            loadSettingsContent();
            break;
    }
}

// Dastlabki yuklashda admin funksiyalarini yoqish
document.addEventListener('DOMContentLoaded', function() {
    // ... (oldingi kodlar) ...
    
    if (auth.currentUser && auth.currentUser.isAdmin) {
        enableAdminFeatures();
        checkAdminNotifications();
    }
});