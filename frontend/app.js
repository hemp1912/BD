// State Management
let currentUser = null;
let inventoryList = [];
let clientsList = [];
let eventsList = [];
let activeCrewAssignments = []; // Temporary cache during booking editing

// State Management for Notifications
let notificationsList = [];
let confirmCallback = null;

// API Helpers
async function apiFetch(endpoint, options = {}) {
    // Add token if it exists in local storage
    const token = localStorage.getItem("eventflow_token");
    if (token) {
        if (!options.headers) options.headers = {};
        options.headers["Authorization"] = `Bearer ${token}`;
        
        // Append token to URL parameters as signature verification backup
        const delimiter = endpoint.includes("?") ? "&" : "?";
        endpoint = `${endpoint}${delimiter}token=${token}`;
    }
    
    try {
        const response = await fetch(endpoint, options);
        if (response.status === 401) {
            // Un-authenticated / Session expired
            showToast("Session expired. Please log in again.", "danger");
            logout();
            return Promise.reject(new Error("Unauthorized"));
        }
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return Promise.reject(new Error(errData.detail || "Server error occurred"));
        }
        return await response.json();
    } catch (error) {
        if (error.message !== "Unauthorized") {
            showToast(error.message, "danger");
        }
        return Promise.reject(error);
    }
}

// Toast Notification Engine
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast-message`;
    toast.style.borderLeftColor = type === "success" ? "var(--status-success)" : 
                                 type === "warning" ? "var(--status-warning)" : 
                                 "var(--status-danger)";
    
    toast.innerHTML = `
        <div style="font-weight: 600; font-size: 0.9rem;">${type.toUpperCase()}</div>
        <div style="font-size: 0.85rem; opacity: 0.9;">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 4.5 seconds
    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// Session Controls
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    try {
        const data = await apiFetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        localStorage.setItem("eventflow_token", data.token);
        localStorage.setItem("eventflow_role", data.role);
        localStorage.setItem("eventflow_user_name", data.name);
        localStorage.setItem("eventflow_user_id", data.id);
        
        showToast(`Authenticated successfully. Welcome back, ${data.name}!`);
        initializeSession();
    } catch (err) {
        // Error toast already displayed in apiFetch
    }
}

function logout() {
    const token = localStorage.getItem("eventflow_token");
    if (token) {
        fetch(`/api/auth/logout?token=${token}`, { method: "POST" }).catch(() => {});
    }
    localStorage.clear();
    currentUser = null;
    
    document.getElementById("website-view").style.display = "block";
    document.getElementById("app-view").style.display = "none";
    document.body.classList.remove("labor-mode");
    openModal("gateway-view");
}

// View Controller (SPA Hash Router & Swapper)
function switchView(targetViewId) {
    const subviews = document.querySelectorAll(".app-subview");
    subviews.forEach(view => view.style.display = "none");
    
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => item.classList.remove("active"));
    
    if (targetViewId === "dashboard-view") {
        document.getElementById("dashboard-subview").style.display = "block";
        loadDashboardData();
    } else if (targetViewId === "warehouse-view") {
        document.getElementById("warehouse-subview").style.display = "block";
        loadWarehouseData();
    } else if (targetViewId === "crew-view") {
        document.getElementById("crew-subview").style.display = "block";
        loadCrewData();
    }
    
    // Highlight nav link
    const activeLink = document.querySelector(`.nav-item[data-target="${targetViewId}"]`);
    if (activeLink) activeLink.classList.add("active");
}

// MODAL MANAGEMENT FUNCTIONS (ENHANCED)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

// Click outside modal to close
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// NEW: CONFIRMATION DIALOG HELPER
function showConfirmation(title, message, onConfirm) {
    document.getElementById("confirm-title").innerText = title;
    document.getElementById("confirm-message").innerText = message;
    confirmCallback = onConfirm;
    openModal("modal-confirm");
}

document.getElementById("confirm-button").addEventListener("click", () => {
    if (confirmCallback) {
        confirmCallback();
    }
    closeModal("modal-confirm");
});

// NEW: CLIENT DETAILS MODAL
async function showClientDetails(clientId) {
    try {
        const clients = clientsList.filter(c => c.id === clientId);
        if (!clients.length) {
            showToast("Client not found", "danger");
            return;
        }
        
        const client = clients[0];
        const relatedEvents = eventsList.filter(e => e.client_id === clientId);
        
        const totalSpent = relatedEvents.reduce((sum, e) => sum + e.invoice_total, 0);
        const paidAmount = relatedEvents.reduce((sum, e) => sum + e.amount_paid, 0);
        
        const html = `
            <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
                <h4>${client.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Email: <a href="mailto:${client.email}" style="color: var(--accent-gold);">${client.email}</a><br>
                    Phone: <a href="tel:${client.phone}" style="color: var(--accent-gold);">${client.phone}</a><br>
                    Address: ${client.address || "Not provided"}
                </p>
            </div>
            
            <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
                <h4>Booking Summary</h4>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Total Bookings: <strong>${relatedEvents.length}</strong><br>
                    Total Revenue: <strong style="color: var(--accent-gold);">$${totalSpent.toFixed(2)}</strong><br>
                    Total Paid: <strong style="color: var(--status-success);">$${paidAmount.toFixed(2)}</strong><br>
                    Outstanding: <strong style="color: var(--status-warning);">$${(totalSpent - paidAmount).toFixed(2)}</strong>
                </p>
            </div>
            
            <div>
                <h4>Recent Bookings</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${relatedEvents.slice(-3).map(e => `
                        <div style="padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px; font-size: 0.8rem;">
                            <strong>${e.venue}</strong><br>
                            <span style="color: var(--text-secondary);">${new Date(e.start_date).toLocaleDateString()} - ${new Date(e.end_date).toLocaleDateString()}</span><br>
                            <span style="color: var(--accent-gold);">$${e.invoice_total.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.getElementById("client-details-content").innerHTML = html;
        openModal("modal-client-details");
    } catch (err) {
        showToast("Error loading client details: " + err.message, "danger");
    }
}

// NEW: EVENT DETAILS MODAL
async function showEventDetails(eventId) {
    try {
        const event = eventsList.find(e => e.id === eventId);
        if (!event) {
            showToast("Event not found", "danger");
            return;
        }
        
        const client = clientsList.find(c => c.id === event.client_id);
        const inventoryItems = event.items.map(itemId => {
            const inv = inventoryList.find(i => i.id === itemId);
            return inv ? `${inv.name} (${inv.category})` : "Unknown";
        });
        
        const paymentHistory = event.payment_history || [];
        const statusBadge = `<span style="background: ${event.status === 'Completed' ? 'var(--status-success)' : event.status === 'Scheduled' ? 'var(--accent-gold)' : 'var(--status-danger)'}; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${event.status}</span>`;
        
        const html = `
            <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4>${event.venue}</h4>
                    ${statusBadge}
                </div>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Client: <strong>${client?.name || "Unknown"}</strong><br>
                    Dates: <strong>${new Date(event.start_date).toLocaleDateString()} - ${new Date(event.end_date).toLocaleDateString()}</strong><br>
                    Crew Assigned: <strong>${event.crew_assignments?.length || 0}</strong> members
                </p>
            </div>
            
            <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
                <h4>Inventory Details</h4>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    ${inventoryItems.map(item => `• ${item}`).join('<br>')}
                </p>
            </div>
            
            <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
                <h4>Financial Summary</h4>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Invoice Total: <strong style="color: var(--accent-gold);">$${event.invoice_total.toFixed(2)}</strong><br>
                    Amount Paid: <strong style="color: var(--status-success);">$${event.amount_paid.toFixed(2)}</strong><br>
                    Remaining Balance: <strong style="color: var(--status-warning);">$${event.remaining_balance.toFixed(2)}</strong>
                </p>
            </div>
            
            <div>
                <h4>Payment History</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${paymentHistory.length > 0 ? paymentHistory.map(p => `
                        <div style="padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px; font-size: 0.8rem;">
                            <strong>$${p.amount.toFixed(2)}</strong> via ${p.payment_method}<br>
                            <span style="color: var(--text-secondary);">${new Date(p.received_at).toLocaleString()}</span>
                        </div>
                    `).join('') : '<p style="color: var(--text-secondary); font-size: 0.8rem;">No payments recorded yet</p>'}
                </div>
            </div>
        `;
        
        document.getElementById("event-details-content").innerHTML = html;
        openModal("modal-event-details");
    } catch (err) {
        showToast("Error loading event details: " + err.message, "danger");
    }
}

// NEW: NOTIFICATION SYSTEM
function addNotification(title, message, type = "info") {
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        timestamp: new Date(),
        read: false
    };
    notificationsList.unshift(notification);
    
    // Keep only last 20 notifications
    if (notificationsList.length > 20) {
        notificationsList = notificationsList.slice(0, 20);
    }
    
    updateNotificationCenter();
    
    // Show toast too
    showToast(title + ": " + message, type);
}

function updateNotificationCenter() {
    const container = document.getElementById("notifications-list");
    if (!container) return;
    
    if (notificationsList.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No notifications yet</p>';
        return;
    }
    
    container.innerHTML = notificationsList.map(notif => `
        <div style="padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 4px; border-left: 3px solid ${
            notif.type === 'success' ? 'var(--status-success)' :
            notif.type === 'warning' ? 'var(--status-warning)' :
            notif.type === 'danger' ? 'var(--status-danger)' :
            'var(--accent-gold)'
        }; ${notif.read ? 'opacity: 0.6;' : ''}">
            <div style="font-weight: 600; font-size: 0.85rem;">${notif.title}</div>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0.25rem 0 0 0;">${notif.message}</p>
            <p style="font-size: 0.7rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">${notif.timestamp.toLocaleTimeString()}</p>
        </div>
    `).join('');
}

// Duplicate Modal Controllers removed

// 1. Warehouse Catalog Management
async function loadWarehouseData() {
    try {
        inventoryList = await apiFetch("/api/inventory");
        const tbody = document.getElementById("inventory-table-body");
        tbody.innerHTML = "";
        
        if (inventoryList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No physical warehouse assets registered.</td></tr>`;
            return;
        }
        
        inventoryList.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code style="color: var(--accent-purple); font-size: 0.8rem;">${item.id}</code></td>
                <td><strong>${item.name}</strong></td>
                <td><span class="badge badge-draft" style="background: rgba(255,255,255,0.05); color: var(--text-secondary);">${item.category}</span></td>
                <td>${item.quantity_owned} units</td>
                <td>$${item.rental_price_per_day.toFixed(2)}/day</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="editInventoryItem('${item.id}')">Edit</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteInventoryItem('${item.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {}
}

async function handleInventorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById("inventory-id").value;
    const name = document.getElementById("inventory-name").value;
    const category = document.getElementById("inventory-category").value;
    const quantity_owned = parseInt(document.getElementById("inventory-qty").value);
    const rental_price_per_day = parseFloat(document.getElementById("inventory-rate").value);
    
    const payload = { name, category, quantity_owned, rental_price_per_day };
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/api/inventory/${id}` : "/api/inventory";
    
    try {
        await apiFetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        showToast(id ? "Inventory asset updated." : "Catalog asset registered.");
        closeModal("modal-inventory");
        loadWarehouseData();
    } catch (err) {}
}

function editInventoryItem(itemId) {
    const item = inventoryList.find(i => i.id === itemId);
    if (!item) return;
    
    document.getElementById("inventory-modal-title").innerText = "Update Warehouse Asset";
    document.getElementById("inventory-id").value = item.id;
    document.getElementById("inventory-name").value = item.name;
    document.getElementById("inventory-category").value = item.category;
    document.getElementById("inventory-qty").value = item.quantity_owned;
    document.getElementById("inventory-rate").value = item.rental_price_per_day;
    
    openModal("modal-inventory");
}

async function deleteInventoryItem(itemId) {
    if (!confirm("Are you sure you want to delete this warehouse catalog asset?")) return;
    try {
        await apiFetch(`/api/inventory/${itemId}`, { method: "DELETE" });
        showToast("Asset deleted from catalog.");
        loadWarehouseData();
    } catch (err) {}
}

// 2. Client Intake Controller
async function handleClientSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("client-name").value;
    const email = document.getElementById("client-email").value;
    const phone = document.getElementById("client-phone").value;
    const address = document.getElementById("client-address").value;
    
    try {
        const client = await apiFetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, address })
        });
        
        showToast("Customer account generated.");
        closeModal("modal-client");
        
        // Re-load clients selectors
        await populateClientsDropdown();
        
        // Auto select newly registered client in booking form if visible
        const select = document.getElementById("booking-client");
        if (select) {
            select.value = client.id;
        }
    } catch (err) {}
}

async function populateClientsDropdown() {
    try {
        clientsList = await apiFetch("/api/clients");
        const select = document.getElementById("booking-client");
        select.innerHTML = '<option value="">-- Choose Client --</option>';
        clientsList.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.innerText = `${c.name} (${c.email})`;
            select.appendChild(opt);
        });
    } catch (err) {}
}

// 3. Operations Dashboard & Event Scheduler
async function loadDashboardData() {
    try {
        // Load stats, active bookings, and warehouse catalog in parallel
        const [stats, events, inventory] = await Promise.all([
            apiFetch("/api/analytics/summary"),
            apiFetch("/api/events"),
            apiFetch("/api/inventory")
        ]);
        
        eventsList = events;
        inventoryList = inventory;
        
        document.getElementById("stat-sales").innerText = `$${stats.total_sales.toFixed(2)}`;
        document.getElementById("stat-receivable").innerText = `$${stats.total_receivable.toFixed(2)}`;
        document.getElementById("stat-wages").innerText = `$${stats.total_wages.toFixed(2)}`;
        document.getElementById("stat-profit").innerText = `$${stats.net_profit.toFixed(2)}`;
        document.getElementById("stat-margin").innerText = stats.net_margin_percentage;
        
        const tbody = document.getElementById("bookings-table-body");
        const alertsBox = document.getElementById("booking-alerts-box");
        tbody.innerHTML = "";
        alertsBox.innerHTML = "";
        
        if (eventsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No active event schedules listed.</td></tr>`;
            return;
        }
        
        eventsList.forEach(evt => {
            const tr = document.createElement("tr");
            
            // Format badges
            const badgeClass = evt.status === "Completed" ? "badge-completed" : 
                               evt.status === "Confirmed" ? "badge-confirmed" : 
                               "badge-draft";
                               
            tr.innerHTML = `
                <td>
                    <strong>${evt.client_name}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">${evt.venue_address}</span>
                </td>
                <td>
                    <span style="font-size: 0.85rem;">${evt.start_date}</span> to <br>
                    <span style="font-size: 0.85rem;">${evt.end_date}</span>
                </td>
                <td><span class="badge ${badgeClass}">${evt.status}</span></td>
                <td>$${evt.total_invoice_amount.toFixed(2)}</td>
                <td>$${evt.amount_paid.toFixed(2)}</td>
                <td><strong class="${evt.remaining_balance > 0 ? 'stat-val danger' : 'stat-val success'}" style="font-size: 0.9rem;">$${evt.remaining_balance.toFixed(2)}</strong></td>
                <td style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Invoice/Receipt</button>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openLayoutUploadModal('${evt.id}')">Upload Layout</button>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="editEventBooking('${evt.id}')">Edit</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border-radius: 8px;" onclick="deleteEventBooking('${evt.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (err) {}
}

async function renderBookingInventoryItems() {
    // Populate modal booking checkoff items selector list
    inventoryList = await apiFetch("/api/inventory");
    const container = document.getElementById("booking-items-selector");
    container.innerHTML = "";
    
    inventoryList.forEach(item => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        
        div.innerHTML = `
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; flex: 1;">
                <input type="checkbox" class="booking-item-checkbox" value="${item.id}" onchange="toggleBookingItemInput('${item.id}')" style="width: auto;">
                <span>${item.name} ($${item.rental_price_per_day.toFixed(2)}/day)</span>
            </label>
            <input type="number" id="qty-for-${item.id}" min="1" max="${item.quantity_owned}" value="1" disabled style="max-width: 70px; padding: 0.25rem 0.5rem; height: 30px;">
        `;
        container.appendChild(div);
    });
}

function toggleBookingItemInput(itemId) {
    const checkbox = document.querySelector(`.booking-item-checkbox[value="${itemId}"]`);
    const qtyInput = document.getElementById(`qty-for-${itemId}`);
    qtyInput.disabled = !checkbox.checked;
    if (checkbox.checked && !qtyInput.value) qtyInput.value = 1;
}

// Crew Assignments Wages List Constructor
function openCrewWagesAllocationModal() {
    const listDiv = document.getElementById("crew-list-inputs");
    listDiv.innerHTML = "";
    
    // In Mock Mode, we assign from Marcus Chen (usr_labor_1) and David Miller (usr_labor_2)
    const crewCandidates = [
        { id: "usr_labor_1", name: "Marcus Chen", role: "Field Setup Crew" },
        { id: "usr_labor_2", name: "David Miller", role: "Field Setup Crew" }
    ];
    
    crewCandidates.forEach(worker => {
        // Check if worker was already assigned in this booking
        const assigned = activeCrewAssignments.find(a => a.worker_id === worker.id);
        const checkedStr = assigned ? "checked" : "";
        const rateVal = assigned ? assigned.pay_rate : 150.00;
        const paidStr = assigned && assigned.paid ? "checked" : "";
        
        const div = document.createElement("div");
        div.className = "glass-panel";
        div.style.padding = "0.75rem";
        div.style.display = "grid";
        div.style.gridTemplateColumns = "1.5fr 1fr auto";
        div.style.alignItems = "center";
        div.style.gap = "0.5rem";
        
        div.innerHTML = `
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" class="crew-assign-checkbox" value="${worker.id}" ${checkedStr} onchange="toggleCrewWageInput('${worker.id}')" style="width: auto;">
                <div>
                    <strong>${worker.name}</strong><br>
                    <small style="color: var(--text-muted);">${worker.role}</small>
                </div>
            </label>
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.75rem;">Daily Pay Rate ($)</label>
                <input type="number" id="wage-for-${worker.id}" min="0" step="5" value="${rateVal}" ${assigned ? "" : "disabled"} style="padding: 0.25rem 0.5rem; height: 32px;">
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end;">
                <label for="paid-for-${worker.id}" style="font-size: 0.75rem;">Paid?</label>
                <input type="checkbox" class="crew-paid-checkbox" id="paid-for-${worker.id}" value="${worker.id}" ${paidStr} ${assigned ? "" : "disabled"} style="width: auto; height: auto;">
            </div>
        `;
        listDiv.appendChild(div);
    });
    
    openModal("modal-crew-allocation");
}

function toggleCrewWageInput(workerId) {
    const checkbox = document.querySelector(`.crew-assign-checkbox[value="${workerId}"]`);
    const wageInput = document.getElementById(`wage-for-${workerId}`);
    const paidCheckbox = document.getElementById(`paid-for-${workerId}`);
    wageInput.disabled = !checkbox.checked;
    paidCheckbox.disabled = !checkbox.checked;
}

function applyCrewAllocation() {
    // Gather checked assignments
    activeCrewAssignments = [];
    const checkboxes = document.querySelectorAll(".crew-assign-checkbox:checked");
    
    checkboxes.forEach(cb => {
        const workerId = cb.value;
        const name = cb.parentNode.innerText.split("\n")[0];
        const pay_rate = parseFloat(document.getElementById(`wage-for-${workerId}`).value) || 150.00;
        const paid = document.getElementById(`paid-for-${workerId}`).checked;
        
        activeCrewAssignments.push({
            worker_id: workerId,
            name: name,
            pay_rate: pay_rate,
            paid: paid
        });
    });
    
    showToast("Crew allocation updated.");
    closeModal("modal-crew-allocation");
}

if (false) {
    applyCrewAllocation();
}

window.applyCrewAllocation = applyCrewAllocation;

async function handleBookingSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("booking-id").value;
    const client_id = document.getElementById("booking-client").value;
    
    if (!client_id) {
        showToast("Please choose or intake a client profile", "warning");
        return;
    }
    
    const client = clientsList.find(c => c.id === client_id);
    const client_name = client ? client.name : "Unknown Client";
    
    const venue_address = document.getElementById("booking-venue").value;
    const start_date = document.getElementById("booking-start").value;
    const end_date = document.getElementById("booking-end").value;
    const max_workforce_capacity = parseInt(document.getElementById("booking-capacity").value) || 4;
    const notes = document.getElementById("booking-notes").value;
    
    // Build items_booked map
    const items_booked = {};
    const checkedItems = document.querySelectorAll(".booking-item-checkbox:checked");
    checkedItems.forEach(cb => {
        const itemId = cb.value;
        items_booked[itemId] = parseInt(document.getElementById(`qty-for-${itemId}`).value) || 1;
    });
    
    // Format payload
    const payload = {
        client_id,
        client_name,
        venue_address,
        start_date,
        end_date,
        items_booked: JSON.stringify(items_booked),
        crew_assignments: JSON.stringify(activeCrewAssignments),
        max_workforce_capacity,
        notes,
        status: id ? eventsList.find(e => e.id === id).status : "Confirmed"
    };
    
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/api/events/${id}` : "/api/events";
    
    try {
        const result = await apiFetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        showToast(id ? "Booking details updated." : "Booking scheduled successfully.");
        closeModal("modal-booking");
        await loadDashboardData();
        
        // Show conflict alerts if any returned from server
        if (result.conflict_alerts && result.conflict_alerts.length > 0) {
            let msg = "Inventory Conflict Alerts Detected: \n";
            result.conflict_alerts.forEach(al => {
                msg += `- Shortage of ${al.shortage} units for ${al.name} on ${al.date_checked}\n`;
            });
            alert(msg);
        }
        
        if (result.capacity_alert) {
            alert(result.capacity_alert.message);
        }
        
    } catch (err) {}
}

async function editEventBooking(eventId) {
    const evt = eventsList.find(e => e.id === eventId);
    if (!evt) return;
    
    document.getElementById("booking-modal-title").innerText = "Edit Event Booking Details";
    document.getElementById("booking-id").value = evt.id;
    document.getElementById("booking-venue").value = evt.venue_address;
    document.getElementById("booking-start").value = evt.start_date;
    document.getElementById("booking-end").value = evt.end_date;
    document.getElementById("booking-capacity").value = evt.max_workforce_capacity;
    document.getElementById("booking-notes").value = evt.notes;
    
    // Select Client
    document.getElementById("booking-client").value = evt.client_id;
    
    // Parse crew assignments
    try {
        activeCrewAssignments = JSON.parse(evt.crew_assignments || "[]");
    } catch (e) {
        activeCrewAssignments = [];
    }
    
    // Parse and render inventory selection checkboxes
    await renderBookingInventoryItems();
    
    let bookedMap = {};
    try {
        bookedMap = JSON.parse(evt.items_booked || "{}");
    } catch (e) {}
    
    Object.keys(bookedMap).forEach(itemId => {
        const cb = document.querySelector(`.booking-item-checkbox[value="${itemId}"]`);
        if (cb) {
            cb.checked = true;
            toggleBookingItemInput(itemId);
            document.getElementById(`qty-for-${itemId}`).value = bookedMap[itemId];
        }
    });
    
    openModal("modal-booking");
}

async function deleteEventBooking(eventId) {
    if (!confirm("Are you sure you want to cancel and delete this event booking?")) return;
    try {
        await apiFetch(`/api/events/${eventId}`, { method: "DELETE" });
        showToast("Event booking cancelled.");
        loadDashboardData();
    } catch (err) {}
}

// 4. On-Walk Consultation Quote Checklist Builder (Client-Side Rates Multiplier)
async function openQuoteToolModal() {
    inventoryList = await apiFetch("/api/inventory");
    const container = document.getElementById("quote-items-calculator");
    container.innerHTML = "";
    
    inventoryList.forEach(item => {
        const div = document.createElement("div");
        div.className = "quote-item-grid";
        
        div.innerHTML = `
            <div><strong>${item.name}</strong><br><small style="color: var(--text-muted); font-size: 0.75rem;">$${item.rental_price_per_day.toFixed(2)}/day</small></div>
            <div>
                <input type="number" class="quote-qty-input" data-price="${item.rental_price_per_day}" min="0" value="0" style="padding: 0.25rem 0.5rem; height: 30px;" onchange="recalculateQuoteEstimate()">
            </div>
            <div style="text-align: right;" class="quote-item-subtotal">$0.00</div>
        `;
        container.appendChild(div);
    });
    
    document.getElementById("quote-days").value = 1;
    document.getElementById("quote-total-price").innerText = "$0.00";
    openModal("modal-quote");
}

function recalculateQuoteEstimate() {
    const days = parseInt(document.getElementById("quote-days").value) || 1;
    const inputs = document.querySelectorAll(".quote-qty-input");
    let grandTotal = 0.0;
    
    inputs.forEach(input => {
        const qty = parseInt(input.value) || 0;
        const rate = parseFloat(input.getAttribute("data-price"));
        const subtotal = qty * rate * days;
        
        input.parentNode.nextElementSibling.innerText = `$${subtotal.toFixed(2)}`;
        grandTotal += subtotal;
    });
    
    document.getElementById("quote-total-price").innerText = `$${grandTotal.toFixed(2)}`;
}

// 5. Invoicing & Print Export Utilities (REQ-13 Receipts)
async function openInvoiceModal(eventId) {
    const evt = await apiFetch(`/api/events/${eventId}`);
    const detailsDiv = document.getElementById("invoice-details-box");
    
    // Parse items booked
    let bookedItems = {};
    try {
        bookedItems = JSON.parse(evt.items_booked || "{}");
    } catch (e) {}
    
    // Resolve item names and rates
    let itemsHtml = "";
    inventoryList = await apiFetch("/api/inventory");
    
    // Calculate rental span
    const sDate = new Date(evt.start_date);
    const eDate = new Date(evt.end_date);
    const days = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);
    
    let itemsListTextForPrint = "";
    Object.keys(bookedItems).forEach(itemId => {
        const item = inventoryList.find(i => i.id === itemId);
        if (item) {
            const qty = bookedItems[itemId];
            const cost = item.rental_price_per_day * qty * days;
            itemsHtml += `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-glass); padding: 0.25rem 0;">
                    <span>${item.name} (Qty: ${qty})</span>
                    <span>$${cost.toFixed(2)}</span>
                </div>
            `;
            itemsListTextForPrint += `<tr><td>${item.name}</td><td>${qty}</td><td>$${item.rental_price_per_day.toFixed(2)}</td><td>$${cost.toFixed(2)}</td></tr>`;
        }
    });

    // Parse worker wages layout
    let crew = [];
    try {
        crew = JSON.parse(evt.crew_assignments || "[]");
    } catch (e) {}
    
    let crewHtml = "";
    crew.forEach((worker, index) => {
        const checked = worker.paid ? "checked" : "";
        crewHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                <span>${worker.name} (Wage: $${worker.pay_rate.toFixed(2)})</span>
                <label style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" class="crew-payroll-release" data-event-id="${evt.id}" data-index="${index}" ${checked} onchange="toggleCrewPayrollPaid('${evt.id}', ${index})" style="width: auto;">
                    Released
                </label>
            </div>
        `;
    });

    detailsDiv.innerHTML = `
        <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 0.75rem;">
            <strong>Client Profile:</strong> ${evt.client_name}<br>
            <strong>Target Venue:</strong> ${evt.venue_address}<br>
            <strong>Dates Range:</strong> ${evt.start_date} to ${evt.end_date} (${days} days)
        </div>
        
        <div>
            <h4 style="margin-bottom: 0.5rem;">Reserved Stock Breakdown:</h4>
            ${itemsHtml}
        </div>
        
        <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between;">
                <span>Invoice Total:</span>
                <strong>$${evt.total_invoice_amount.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--status-success);">
                <span>Deposits Paid:</span>
                <span>$${evt.amount_paid.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-glass); padding-top: 0.25rem;">
                <span>Remaining Balance Due:</span>
                <strong class="${evt.remaining_balance > 0 ? 'stat-val danger' : 'stat-val success'}" style="font-size: 1.1rem;">$${evt.remaining_balance.toFixed(2)}</strong>
            </div>
        </div>

        <div style="border-top: 1px solid var(--border-glass); padding-top: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">Setup Crew Wages & Payroll:</h4>
            ${crewHtml || '<p style="color: var(--text-muted); font-size: 0.8rem;">No workers assigned.</p>'}
        </div>

        <div style="border-top: 1px solid var(--border-glass); padding-top: 1rem; margin-top: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">Payment History:</h4>
            ${(() => {
                try {
                    const history = JSON.parse(evt.payment_history || "[]");
                    if (!history.length) return '<p style="color: var(--text-muted); font-size: 0.8rem;">No payments recorded yet.</p>';
                    return history.map(entry => `<div style="display:flex; justify-content:space-between; gap:1rem; font-size:0.85rem; padding:0.35rem 0; border-bottom:1px dashed var(--border-glass);"><span>${entry.received_at || "N/A"} · ${entry.payment_method || "Cash"}</span><strong>$${Number(entry.amount || 0).toFixed(2)}</strong></div>`).join("");
                } catch (e) {
                    return '<p style="color: var(--text-muted); font-size: 0.8rem;">No payments recorded yet.</p>';
                }
            })()}
        </div>
    `;

    // Cache the print preview block content
    document.getElementById("print-content-body").innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <p><strong>Customer Client:</strong> ${evt.client_name}</p>
            <p><strong>Setup Address:</strong> ${evt.venue_address}</p>
            <p><strong>Booked Dates:</strong> ${evt.start_date} to ${evt.end_date} (${days} Days Rental)</p>
            <p><strong>Invoice Reference Code:</strong> ${evt.id}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
            <thead>
                <tr style="background-color: #f3f4f6;">
                    <th style="border: 1px solid #e5e7eb; padding: 8px;">Decor Item</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px;">Qty</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px;">Day Rate</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${itemsListTextForPrint}
            </tbody>
        </table>
        <div style="text-align: right; font-size: 1.1rem; line-height: 1.6;">
            <p><strong>Total Rental Statement:</strong> $${evt.total_invoice_amount.toFixed(2)}</p>
            <p style="color: #15803d;"><strong>Total Paid (Receipts):</strong> $${evt.amount_paid.toFixed(2)}</p>
            <p><strong>Remaining Accounts Balance:</strong> $${evt.remaining_balance.toFixed(2)}</p>
        </div>
    `;

    // Setup submit payments routing values
    document.getElementById("payment-amount").value = evt.remaining_balance.toFixed(2);
    document.getElementById("payment-form").onsubmit = async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById("payment-amount").value);
        if (!amount || amount <= 0) return;
        
        try {
            await apiFetch(`/api/events/${evt.id}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount })
            });
            showToast("Deposit transaction logged successfully.");
            closeModal("modal-invoice-payout");
            loadDashboardData();
        } catch (err) {}
    };

    openModal("modal-invoice-payout");
}

async function toggleCrewPayrollPaid(eventId, crewIndex) {
    try {
        await apiFetch(`/api/events/${eventId}/crew/${crewIndex}/toggle-paid`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        
        showToast("Crew wage ledger updated.");
        // Re-open the modal to show the change without a full dashboard reload
        closeModal("modal-invoice-payout");
        openInvoiceModal(eventId);
        loadDashboardData(); // Also refresh dashboard in background
    } catch (err) {}
}

// Layout blueprint image uploader (REQ-8)
function openLayoutUploadModal(eventId) {
    document.getElementById("upload-layout-event-id").value = eventId;
    document.getElementById("upload-layout-file").value = "";
    openModal("modal-upload-layout");
}

async function handleLayoutUploadSubmit(e) {
    e.preventDefault();
    const eventId = document.getElementById("upload-layout-event-id").value;
    const fileInput = document.getElementById("upload-layout-file");
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const submitBtn = document.getElementById("btn-upload-submit");
    submitBtn.disabled = true;
    submitBtn.innerText = "Compressing & Uploading...";
    
    try {
        // Run Client-Side Image Compression Routine (REQ-19)
        const compressedFile = await compressImageLocally(file);
        
        const formData = new FormData();
        formData.append("file", compressedFile, file.name);
        
        await apiFetch(`/api/events/${eventId}/upload-layout`, {
            method: "POST",
            body: formData
        });
        
        showToast("Compressed layout blueprint uploaded successfully.");
        closeModal("modal-upload-layout");
        loadDashboardData();
    } catch (err) {
        // error logged by fetch
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Upload Layout";
    }
}

// Client Side JPEG Compression Canvas helper (REQ-19)
function compressImageLocally(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            // Set Max Boundary to 1200px
            const maxDimension = 1200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    // Wrap blob back to File
                    const compressed = new File([blob], file.name, {
                        type: "image/jpeg",
                        lastModified: Date.now()
                    });
                    resolve(compressed);
                } else {
                    reject(new Error("Canvas compression blob generation failed"));
                }
            }, "image/jpeg", 0.7); // 0.7 JPEG Quality ratio
        };
        
        img.onerror = () => reject(new Error("Failed to load blueprint image files"));
    });
}

// 6. Labor / Field setup crew view (REQ-9, REQ-14, REQ-16)
async function loadCrewData() {
    const currentWorkerId = localStorage.getItem("eventflow_user_id");
    const container = document.getElementById("crew-tasks-container");
    const layoutPreview = document.getElementById("crew-layout-preview");
    
    container.innerHTML = `<div style="text-align: center;"><div class="loader-spinner" style="margin: auto;"></div></div>`;
    layoutPreview.innerHTML = `<span style="color: var(--text-muted);">No design layout attached yet.</span>`;
    
    try {
        // Fetch all bookings
        const events = await apiFetch("/api/events");
        
        // Find events assigned to this crew member
        const assignedEvents = events.filter(evt => {
            try {
                const crew = JSON.parse(evt.crew_assignments || "[]");
                return crew.some(w => w.worker_id === currentWorkerId);
            } catch (e) {
                return false;
            }
        });
        
        if (assignedEvents.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">No active field tasks assigned for your shift today.</p>`;
            return;
        }
        
        // Render crew list view for the first assigned event
        const activeEvent = assignedEvents[0];
        document.getElementById("crew-worker-title").innerText = `Assigned Job: @ ${activeEvent.venue_address}`;
        
        // Load layout design blueprints (REQ-9)
        if (activeEvent.design_layout_url) {
            layoutPreview.innerHTML = `
                <img src="${activeEvent.design_layout_url}" alt="Blueprint Map Layout" style="width: 100%; border-radius: 8px;" onclick="window.open('${activeEvent.design_layout_url}', '_blank')">
            `;
        } else {
            layoutPreview.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No blueprints uploaded for this venue setup yet.</div>`;
        }
        
        // Fetch checklist tasks
        const tasks = await apiFetch(`/api/events/${activeEvent.id}/tasks`);
        container.innerHTML = "";
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: var(--text-muted); margin-bottom: 1rem;">No checklist has been assigned yet for this shift.</p>
                <div class="crew-task-item pending">
                    <div class="crew-checkbox">!</div>
                    <div style="flex: 1;"><strong>Awaiting admin task assignment.</strong> Please check again after the manager assigns checklist items.</div>
                </div>
            `;
            return;
        }
        
        tasks.forEach(task => {
            const isCompleted = task.status === "Completed";
            const itemClass = isCompleted ? "completed" : "pending";
            const checkedClass = isCompleted ? "checked" : "";
            const checkedIcon = isCompleted ? "✓" : "";
            
            const div = document.createElement("div");
            div.className = `crew-task-item ${itemClass}`;
            
            div.innerHTML = `
                <div class="crew-checkbox ${checkedClass}" onclick="toggleTaskCompletion('${task.id}', '${task.status}')">${checkedIcon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; text-decoration: ${isCompleted ? 'line-through' : 'none'};">${task.description}</div>
                </div>
            `;
            container.appendChild(div);
        });
        
    } catch (err) {}
}

async function addSampleTasks(eventId) {
    const tasks = [
        `Setup Uplights coordinates exactly as per blueprint boundaries`,
        `Reinforce structural arches and hang drapes backdrops`,
        `Arrange banquet chair configurations and clean stage layout`
    ];
    
    try {
        for (const desc of tasks) {
            await apiFetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id: eventId,
                    description: desc,
                    status: "Pending",
                    assigned_to: localStorage.getItem("eventflow_user_id")
                })
            });
        }
        showToast("Cheklist generated successfully.");
        loadCrewData();
    } catch (err) {}
}

async function toggleTaskCompletion(taskId, currentStatus) {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
        await apiFetch(`/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus })
        });
        showToast("Task status updated.");
        loadCrewData();
    } catch (err) {}
}

function hideLoadingSkeleton() {
    const skeleton = document.getElementById("loading-skeleton");
    if (skeleton) {
        skeleton.classList.add("hidden");
    }
}

// Startup Session Boot Initialization (REQ-20 Cold Starts)
function initializeSession() {
    const token = localStorage.getItem("eventflow_token");
    const role = localStorage.getItem("eventflow_role");
    const name = localStorage.getItem("eventflow_user_name");
    
    if (!token || !role) {
        logout();
        return;
    }
    
    currentUser = { token, role, name };
    
    // UI Screen Swap: Hide website and login modal, show app dashboard
    document.getElementById("website-view").style.display = "none";
    closeModal("gateway-view");
    document.getElementById("app-view").style.display = "flex";
    
    // Bind Profile Display Details
    document.getElementById("user-display-name").innerText = name;
    document.getElementById("user-display-role").innerText = role === "admin" ? "Business Administrator" : "Logistics Field Crew";
    
    // Setup Navigation Layout Controls based on Roles
    const sidebar = document.getElementById("app-sidebar");
    const navLinks = document.getElementById("sidebar-nav-links");
    
    if (role === "admin") {
        sidebar.style.display = "flex";
        navLinks.innerHTML = `
            <li><a class="nav-item active" data-target="dashboard-view" onclick="switchView('dashboard-view')">Operations Dashboard</a></li>
            <li><a class="nav-item" data-target="warehouse-view" onclick="switchView('warehouse-view')">Warehouse Catalog</a></li>
        `;
        document.getElementById("btn-onboard-crew-trigger").style.display = "inline-flex";
        switchView("dashboard-view");
        populateClientsDropdown();
    } else {
        // Crew role has a minified/hidden side navigation bar on mobile
        sidebar.style.display = "flex";
        navLinks.innerHTML = `
            <li><a class="nav-item active" data-target="crew-view" onclick="switchView('crew-view')">Assigned Shifts</a></li>
        `;
        document.getElementById("btn-onboard-crew-trigger").style.display = "none";
        document.body.classList.add("labor-mode");
        switchView("crew-view");
    }
    
    hideLoadingSkeleton();
}

async function handleOnboardCrewSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("onboard-email").value;
    const password = document.getElementById("onboard-password").value;
    const full_name = document.getElementById("onboard-name").value;
    const role = document.getElementById("onboard-role").value;
    const base_daily_rate = parseFloat(document.getElementById("onboard-rate").value) || 0.0;
    
    try {
        await apiFetch("/api/auth/onboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role, full_name, base_daily_rate })
        });
        showToast("Crew member onboarded successfully!");
        closeModal("modal-onboard-crew");
    } catch (err) {
        // error logged by apiFetch
    }
}

// Bind Global DOM Event Handlers
document.addEventListener("DOMContentLoaded", () => {
    // 1. Auth gateway login submit
    document.getElementById("login-form").addEventListener("submit", handleLogin);
    
    // 2. Logout trigger
    document.getElementById("logout-btn").addEventListener("click", logout);
    
    // 3. Modal Actions
    document.getElementById("btn-add-inventory").addEventListener("click", () => {
        document.getElementById("inventory-modal-title").innerText = "Register Catalog Asset";
        document.getElementById("inventory-id").value = "";
        document.getElementById("inventory-form").reset();
        openModal("modal-inventory");
    });
    
    document.getElementById("inventory-form").addEventListener("submit", handleInventorySubmit);
    
    document.getElementById("btn-create-booking").addEventListener("click", async () => {
        document.getElementById("booking-modal-title").innerText = "Book New Event Project";
        document.getElementById("booking-id").value = "";
        document.getElementById("booking-form").reset();
        activeCrewAssignments = [];
        await renderBookingInventoryItems();
        openModal("modal-booking");
    });
    
    document.getElementById("booking-form").addEventListener("submit", handleBookingSubmit);
    
    document.getElementById("btn-quick-client").addEventListener("click", () => {
        document.getElementById("client-form").reset();
        openModal("modal-client");
    });
    
    document.getElementById("btn-quick-quote").addEventListener("click", openQuoteToolModal);
    
    document.getElementById("client-form").addEventListener("submit", handleClientSubmit);
    
    document.getElementById("btn-assign-crew").addEventListener("click", openCrewWagesAllocationModal);
    document.getElementById("btn-apply-crew-allocation").addEventListener("click", applyCrewAllocation);
    
    document.getElementById("upload-layout-form").addEventListener("submit", handleLayoutUploadSubmit);
    
    document.getElementById("btn-export-print").addEventListener("click", () => {
        window.print();
    });
    
    // Onboard crew modal triggers
    document.getElementById("btn-onboard-crew-trigger").addEventListener("click", () => {
        document.getElementById("onboard-crew-form").reset();
        openModal("modal-onboard-crew");
    });
    document.getElementById("onboard-crew-form").addEventListener("submit", handleOnboardCrewSubmit);
    
    // Toggle mobile crew light contrast mode
    document.getElementById("btn-crew-highcontrast").addEventListener("click", () => {
        document.body.classList.toggle("labor-mode");
    });

    // 4. Portfolio Website Interactivity
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.style.display = mobileMenu.style.display === 'none' ? 'block' : 'none';
        });
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.style.display = 'none'));
    }

    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.15 });
    reveals.forEach(el => revealObserver.observe(el));
    
    // 5. Run automatic Session Restore check (REQ-2)
    const token = localStorage.getItem("eventflow_token");
    if (token) {
        initializeSession();
    } else {
        logout();
        // Hide loading skeleton after a short delay for guests
        setTimeout(hideLoadingSkeleton, 50);
    }
});
