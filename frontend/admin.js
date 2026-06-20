// Admin Dashboard Controller

// State Management
let currentUser = null;
let inventoryList = [];
let clientsList = [];
let eventsList = [];
let galleryList = [];
let crewList = [];
let activeCrewAssignments = []; // Temporary cache during booking editing

// Search queries
let dashboardSearchQuery = "";
let warehouseSearchQuery = "";
let clientsSearchQuery = "";
let gallerySearchQuery = "";
let crewSearchQuery = "";
let financeSearchQuery = "";
let invoiceSearchQuery = "";
let eventsSearchQuery = "";

// Pagination pages (1-indexed)
let dashboardPage = 1;
let warehousePage = 1;
let clientsPage = 1;
let galleryPage = 1;
let crewPage = 1;
let financePage = 1;
let invoicePage = 1;
let eventsPage = 1;

// Global page size limit
const PAGE_SIZE = 5;

// Toast and Modals are handled via common.js

// Initialize Session
async function initializeSession() {
    const token = localStorage.getItem("eventflow_token");
    const role = localStorage.getItem("eventflow_role");
    const name = localStorage.getItem("eventflow_user_name");
    
    if (!token || role !== "admin") {
        logout();
        return;
    }
    
    currentUser = { token, role, name };
    
    // Bind Profile Display Details
    document.getElementById("user-display-name").innerText = name;
    
    // Set view structure without triggering loadDashboardData from switchView immediately
    const subviews = document.querySelectorAll(".app-subview");
    subviews.forEach(view => view.style.display = "none");
    document.getElementById("dashboard-subview").style.display = "block";
    
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => item.classList.remove("active"));
    const activeLink = document.querySelector(`.nav-item[data-target="dashboard-view"]`);
    if (activeLink) activeLink.classList.add("active");
    
    // Show the page immediately; data loads in background
    loadDashboardData();
    hideLoadingSkeleton();
}

// Navigation Controller (Tabs switcher)
function switchView(targetViewId) {
    const subviews = document.querySelectorAll(".app-subview");
    subviews.forEach(view => view.style.display = "none");
    
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => item.classList.remove("active"));
    
    if (targetViewId === "dashboard-view") {
        document.getElementById("dashboard-subview").style.display = "block";
        loadDashboardData();
    } else if (targetViewId === "events-view") {
        document.getElementById("events-subview").style.display = "block";
        loadEventsData();
    } else if (targetViewId === "warehouse-view") {
        document.getElementById("warehouse-subview").style.display = "block";
        loadWarehouseData();
    } else if (targetViewId === "clients-view") {
        document.getElementById("clients-subview").style.display = "block";
        loadClientsData();
    } else if (targetViewId === "gallery-view") {
        document.getElementById("gallery-subview").style.display = "block";
        loadGalleryData();
    } else if (targetViewId === "crew-view") {
        document.getElementById("crew-subview").style.display = "block";
        loadCrewData();
    } else if (targetViewId === "finance-view") {
        document.getElementById("finance-subview").style.display = "block";
        loadFinanceData();
    } else if (targetViewId === "invoice-view") {
        document.getElementById("invoice-subview").style.display = "block";
        loadInvoicesData();
    }
    
    // Highlight nav link
    const activeLink = document.querySelector(`.nav-item[data-target="${targetViewId}"]`);
    if (activeLink) activeLink.classList.add("active");
}

function hideLoadingSkeleton() {
    const skeleton = document.getElementById("loading-skeleton");
    if (skeleton) {
        skeleton.classList.add("hidden");
    }
}

// ─── Pagination Helper ─────────────────────────────────────────────────────
function renderPaginationControls(containerId, totalItems, currentPage, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) { container.innerHTML = ""; return; }
    let html = `<div class="pagination-container">`;
    html += `<button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} onclick="${onPageChange}(${currentPage - 1})">← Prev</button>`;
    for (let p = 1; p <= totalPages; p++) {
        html += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="${onPageChange}(${p})">${p}</button>`;
    }
    html += `<button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="${onPageChange}(${currentPage + 1})">Next →</button>`;
    html += `</div>`;
    container.innerHTML = html;
}

// ─── 1. Warehouse Catalog Management ───────────────────────────────────────
async function loadWarehouseData(page) {
    if (page !== undefined) warehousePage = page;
    try {
        inventoryList = await apiFetch("/api/inventory");
        const tbody = document.getElementById("inventory-table-body");
        tbody.innerHTML = "";

        let filtered = inventoryList;
        if (warehouseSearchQuery.trim()) {
            const q = warehouseSearchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                (i.name && i.name.toLowerCase().includes(q)) ||
                (i.category && i.category.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No catalog assets found.</td></tr>`;
            renderPaginationControls("warehouse-pagination", 0, warehousePage, "loadWarehouseData");
            return;
        }

        const start = (warehousePage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        pageItems.forEach(item => {
            const avail = item.available_stock !== undefined ? item.available_stock : item.quantity_owned;
            const cond = item.condition_status || "Excellent";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code style="color: var(--maroon); font-size: 0.8rem;">${item.id}</code></td>
                <td><strong>${item.name}</strong><br><small style="color: var(--text-muted); font-size: 0.75rem;">Condition: ${cond}</small></td>
                <td><span class="badge" style="background: rgba(107,22,35,0.05); color: var(--maroon);">${item.category}</span></td>
                <td>${avail} / ${item.quantity_owned} units</td>
                <td>₹${item.rental_price_per_day.toFixed(2)}/day</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="editInventoryItem('${item.id}')">Edit</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteInventoryItem('${item.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("warehouse-pagination", filtered.length, warehousePage, "loadWarehouseData");
    } catch (err) {}
}

async function handleInventorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById("inventory-id").value;
    const name = document.getElementById("inventory-name").value;
    const category = document.getElementById("inventory-category").value;
    const quantity_owned = parseInt(document.getElementById("inventory-qty").value);
    const available_stock = parseInt(document.getElementById("inventory-avail").value);
    const rental_price_per_day = parseFloat(document.getElementById("inventory-rate").value);
    const condition_status = document.getElementById("inventory-condition").value;
    
    const payload = { name, category, quantity_owned, rental_price_per_day, available_stock, condition_status };
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
    document.getElementById("inventory-avail").value = item.available_stock !== undefined ? item.available_stock : item.quantity_owned;
    document.getElementById("inventory-rate").value = item.rental_price_per_day;
    document.getElementById("inventory-condition").value = item.condition_status || "Excellent";
    
    openModal("modal-inventory");
}

async function deleteInventoryItem(itemId) {
    showConfirmation(
        "Confirm Delete",
        "Are you sure you want to delete this warehouse catalog asset?",
        async () => {
            try {
                await apiFetch(`/api/inventory/${itemId}`, { method: "DELETE" });
                showToast("Asset deleted from catalog.");
                loadWarehouseData();
            } catch (err) {}
        }
    );
}

// 2. Client Intake Controller
let editingClientId = null;
async function handleClientSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("client-name").value;
    const email = document.getElementById("client-email").value;
    const phone = document.getElementById("client-phone").value;
    const address = document.getElementById("client-address").value;
    
    const method = editingClientId ? "PUT" : "POST";
    const endpoint = editingClientId ? `/api/clients/${editingClientId}` : "/api/clients";
    
    try {
        const client = await apiFetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, address })
        });
        
        showToast(editingClientId ? "Client profile updated." : "Customer account generated.");
        closeModal("modal-client");
        editingClientId = null;
        
        // Re-load clients selectors
        await populateClientsDropdown();
        
        if (document.getElementById("clients-subview").style.display !== "none") {
            loadClientsData();
        } else {
            const select = document.getElementById("booking-client");
            if (select && client) {
                select.value = client.id;
            }
        }
    } catch (err) {}
}

async function populateClientsDropdown() {
    try {
        clientsList = await apiFetch("/api/clients");
        const select = document.getElementById("booking-client");
        if (select) {
            select.innerHTML = '<option value="">-- Choose Client --</option>';
            clientsList.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.innerText = `${c.name} (${c.email})`;
                select.appendChild(opt);
            });
        }
    } catch (err) {}
}

// ─── 3. Operations Dashboard & Event Scheduler ─────────────────────────────
async function loadDashboardData(page) {
    if (page !== undefined) dashboardPage = page;

    const tbody    = document.getElementById("bookings-table-body");
    const alertsBox = document.getElementById("booking-alerts-box");

    // ── If we already have cached data, render it instantly ──────────────────
    if (eventsList.length > 0) {
        renderDashboardTable(tbody, alertsBox);
        // Then silently refresh in the background
        fetchDashboardData().then(() => renderDashboardTable(tbody, alertsBox));
        return;
    }

    // ── First load: show a minimal status row, then fetch ────────────────────
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1.2rem;color:var(--text-muted);font-size:0.85rem;">Fetching events...</td></tr>`;
    await fetchDashboardData();
    renderDashboardTable(tbody, alertsBox);
}

// Fetches all dashboard data in parallel with an 8-second timeout
async function fetchDashboardData() {
    // Helper: wrap a fetch promise with a timeout
    function withTimeout(promise, ms) {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), ms)
        );
        return Promise.race([promise, timeout]);
    }

    const [statsRes, eventsRes, inventoryRes] = await Promise.allSettled([
        withTimeout(apiFetch("/api/analytics/summary"), 8000),
        withTimeout(apiFetch("/api/events"),            8000),
        withTimeout(apiFetch("/api/inventory"),         8000)
    ]);

    // Update globals only if fetch succeeded
    const stats     = statsRes.status     === "fulfilled" ? statsRes.value     : null;
    const events    = eventsRes.status    === "fulfilled" ? eventsRes.value    : null;
    const inventory = inventoryRes.status === "fulfilled" ? inventoryRes.value : null;

    if (events    !== null) eventsList    = events;
    if (inventory !== null) inventoryList = inventory;

    // Update stat cards
    const fmt = (v) => (typeof v === "number" ? `₹${v.toFixed(2)}` : "—");
    document.getElementById("stat-sales").innerText      = fmt(stats?.total_sales);
    document.getElementById("stat-receivable").innerText = fmt(stats?.total_receivable);
    document.getElementById("stat-wages").innerText      = fmt(stats?.total_wages);
    document.getElementById("stat-profit").innerText     = fmt(stats?.net_profit);
    document.getElementById("stat-margin").innerText     = stats?.net_margin_percentage ?? "—";
}

// Pure render function — reads from eventsList global, no async
function renderDashboardTable(tbody, alertsBox) {
    if (!tbody) return;
    tbody.innerHTML = "";
    if (alertsBox) alertsBox.innerHTML = "";

    if (eventsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:var(--maroon);">⚠️ Could not load events — is the backend server running?</td></tr>`;
        return;
    }

    // ── Upcoming events: all non-Completed, sorted nearest first ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Exclude Completed; fall back to all if every event is Completed
    let filtered = eventsList.filter(e => e.status !== "Completed");
    if (filtered.length === 0) filtered = [...eventsList];

    // Sort ascending by start_date (nearest first)
    filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    // Apply search
    if (dashboardSearchQuery.trim()) {
        const q = dashboardSearchQuery.toLowerCase();
        filtered = filtered.filter(e =>
            (e.client_name && e.client_name.toLowerCase().includes(q)) ||
            (e.venue_address && e.venue_address.toLowerCase().includes(q))
        );
    }

    // Update count badge
    const countEl = document.getElementById("timeline-capacity-status");
    if (countEl) countEl.innerText = `${filtered.length} Upcoming Event${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">🎉 No upcoming events scheduled. <a href="#" onclick="document.getElementById('btn-create-booking').click(); return false;" style="color: var(--maroon);">Create one?</a></td></tr>`;
        renderPaginationControls("dashboard-pagination", 0, dashboardPage, "loadDashboardData");
        return;
    }

    const start = (dashboardPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    pageItems.forEach(evt => {
        const tr = document.createElement("tr");
        const badgeClass = evt.status === "Completed" ? "badge-completed" :
                           evt.status === "Confirmed" ? "badge-confirmed" : "badge-draft";

        // Countdown chip
        const startDate = new Date(evt.start_date);
        startDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.round((startDate - today) / (1000 * 60 * 60 * 24));

        let chipLabel, chipColor, chipBg;
        if (daysUntil === 0) {
            chipLabel = "Today!"; chipColor = "#6B1623"; chipBg = "rgba(201,148,31,0.18)";
            tr.style.borderLeft = "3px solid var(--gold)";
        } else if (daysUntil === 1) {
            chipLabel = "Tomorrow"; chipColor = "#C9941F"; chipBg = "rgba(201,148,31,0.08)";
        } else if (daysUntil > 1 && daysUntil <= 7) {
            chipLabel = `In ${daysUntil} days`; chipColor = "var(--maroon)"; chipBg = "rgba(107,22,35,0.07)";
        } else if (daysUntil < 0) {
            chipLabel = `${Math.abs(daysUntil)}d ago`; chipColor = "var(--text-muted)"; chipBg = "rgba(0,0,0,0.04)";
        } else {
            chipLabel = `${daysUntil}d away`; chipColor = "var(--text-muted)"; chipBg = "rgba(0,0,0,0.04)";
        }
        const countdownChip = `<span style="display:inline-block;margin-top:0.3rem;font-size:0.7rem;font-weight:600;padding:2px 7px;border-radius:20px;color:${chipColor};background:${chipBg};letter-spacing:0.03em;">${chipLabel}</span>`;

        const totalInv = typeof evt.total_invoice_amount === "number" ? `₹${evt.total_invoice_amount.toFixed(2)}` : "—";
        const amtPaid  = typeof evt.amount_paid === "number" ? `₹${evt.amount_paid.toFixed(2)}` : "—";
        const balance  = typeof evt.remaining_balance === "number" ? evt.remaining_balance : null;
        const balHtml  = balance !== null
            ? `<strong class="${balance > 0 ? 'text-danger' : 'text-success'}" style="font-size:0.9rem;">₹${balance.toFixed(2)}</strong>`
            : `<span>—</span>`;

        tr.innerHTML = `
            <td>
                <strong>${evt.client_name}</strong><br>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">${evt.venue_address}</span>
            </td>
            <td>
                <span style="font-size: 0.85rem;">${evt.start_date}</span> to <br>
                <span style="font-size: 0.85rem;">${evt.end_date}</span><br>
                ${countdownChip}
            </td>
            <td><span class="badge ${badgeClass}">${evt.status}</span></td>
            <td>${totalInv}</td>
            <td>${amtPaid}</td>
            <td>${balHtml}</td>
            <td>
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Invoice/Receipt</button>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openLayoutUploadModal('${evt.id}')">Upload Layout</button>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="editEventBooking('${evt.id}')">Edit</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border-radius: 8px;" onclick="deleteEventBooking('${evt.id}')">✕</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    renderPaginationControls("dashboard-pagination", filtered.length, dashboardPage, "loadDashboardData");
}

async function renderBookingInventoryItems() {
    // Lazy-load inventory only when needed
    if (inventoryList.length === 0) {
        inventoryList = await apiFetch("/api/inventory");
    }
    // Lazy-load clients dropdown only when the booking modal opens
    await populateClientsDropdown();

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
                <span>${item.name} (₹${item.rental_price_per_day.toFixed(2)}/day)</span>
            </label>
            <input type="number" id="qty-for-${item.id}" min="1" max="${item.quantity_owned}" value="1" disabled style="max-width: 70px; padding: 0.25rem 0.5rem; height: 30px;">
        `;
        container.appendChild(div);
    });
}

function toggleBookingItemInput(itemId) {
    const checkbox = document.querySelector(`.booking-item-checkbox[value="${itemId}"]`);
    const qtyInput = document.getElementById(`qty-for-${itemId}`);
    if (qtyInput) {
        qtyInput.disabled = !checkbox.checked;
        if (checkbox.checked && !qtyInput.value) qtyInput.value = 1;
    }
}

window.toggleBookingItemInput = toggleBookingItemInput;

// Crew Assignments Wages List Constructor
async function openCrewWagesAllocationModal() {
    const listDiv = document.getElementById("crew-list-inputs");
    listDiv.innerHTML = "Loading team members...";
    
    try {
        const crewCandidates = await apiFetch("/api/crew");
        listDiv.innerHTML = "";
        
        if (crewCandidates.length === 0) {
            listDiv.innerHTML = "<p style='font-size:0.85rem;color:var(--text-muted);'>No crew profiles registered in Crew Ledger. Add profiles first.</p>";
            openModal("modal-crew-allocation");
            return;
        }
        
        crewCandidates.forEach(worker => {
            const assigned = activeCrewAssignments.find(a => a.worker_id === worker.id);
            const checkedStr = assigned ? "checked" : "";
            const rateVal = assigned ? assigned.pay_rate : worker.base_rate;
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
                    <label style="font-size: 0.75rem;">Daily Pay Rate (₹)</label>
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
    } catch (err) {
        listDiv.innerHTML = "Error loading team members.";
    }
}

function toggleCrewWageInput(workerId) {
    const checkbox = document.querySelector(`.crew-assign-checkbox[value="${workerId}"]`);
    const wageInput = document.getElementById(`wage-for-${workerId}`);
    const paidCheckbox = document.getElementById(`paid-for-${workerId}`);
    if (wageInput && paidCheckbox) {
        wageInput.disabled = !checkbox.checked;
        paidCheckbox.disabled = !checkbox.checked;
    }
}

window.toggleCrewWageInput = toggleCrewWageInput;

function applyCrewAllocation() {
    activeCrewAssignments = [];
    const checkboxes = document.querySelectorAll(".crew-assign-checkbox:checked");
    
    checkboxes.forEach(cb => {
        const workerId = cb.value;
        const label = cb.closest("label");
        const name = label.querySelector("strong").innerText;
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
    const discount = parseFloat(document.getElementById("booking-discount").value) || 0.0;
    const tax_rate = parseFloat(document.getElementById("booking-tax-rate").value) || 0.0;
    
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
        status: id ? eventsList.find(e => e.id === id).status : "Confirmed",
        discount,
        tax_rate
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
        
        // Add sample tasks for new bookings if they are configured
        if (!id) {
            await addSampleTasks(result.event.id);
        }
        
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
                    assigned_to: ""
                })
            });
        }
        showToast("Initial checklist tasks created.");
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
    document.getElementById("booking-discount").value = evt.discount || 0;
    document.getElementById("booking-tax-rate").value = evt.tax_rate || 0;
    
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
            const qtyInput = document.getElementById(`qty-for-${itemId}`);
            if (qtyInput) qtyInput.value = bookedMap[itemId];
        }
    });
    
    openModal("modal-booking");
}

async function deleteEventBooking(eventId) {
    showConfirmation(
        "Cancel Booking",
        "Are you sure you want to cancel and delete this event booking?",
        async () => {
            try {
                await apiFetch(`/api/events/${eventId}`, { method: "DELETE" });
                showToast("Event booking cancelled.");
                loadDashboardData();
            } catch (err) {}
        }
    );
}

// 4. On-Walk Consultation Quote Checklist Builder
async function openQuoteToolModal() {
    inventoryList = await apiFetch("/api/inventory");
    const container = document.getElementById("quote-items-calculator");
    container.innerHTML = "";
    
    inventoryList.forEach(item => {
        const div = document.createElement("div");
        div.style.display = "grid";
        div.style.gridTemplateColumns = "1.5fr 1fr 1fr";
        div.style.alignItems = "center";
        div.style.gap = "1rem";
        div.style.marginBottom = "0.75rem";
        div.style.borderBottom = "1px dashed rgba(107,22,35,0.08)";
        div.style.paddingBottom = "0.5rem";
        
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small style="color: var(--text-muted); font-size: 0.75rem;">₹${item.rental_price_per_day.toFixed(2)}/day</small>
            </div>
            <div>
                <input type="number" class="quote-qty-input" data-price="${item.rental_price_per_day}" min="0" value="0" style="padding: 0.25rem 0.5rem; height: 30px;" onchange="recalculateQuoteEstimate()">
            </div>
            <div style="text-align: right;" class="quote-item-subtotal">₹0.00</div>
        `;
        container.appendChild(div);
    });
    
    document.getElementById("quote-days").value = 1;
    document.getElementById("quote-total-price").innerText = "₹0.00";
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
        
        const subtotalDiv = input.closest("div").nextElementSibling;
        if (subtotalDiv) subtotalDiv.innerText = `₹${subtotal.toFixed(2)}`;
        grandTotal += subtotal;
    });
    
    document.getElementById("quote-total-price").innerText = `₹${grandTotal.toFixed(2)}`;
}

window.recalculateQuoteEstimate = recalculateQuoteEstimate;

// 5. Invoicing & Print Export Utilities
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
    let subtotal = 0.0;
    Object.keys(bookedItems).forEach(itemId => {
        const item = inventoryList.find(i => i.id === itemId);
        if (item) {
            const qty = bookedItems[itemId];
            const cost = item.rental_price_per_day * qty * days;
            subtotal += cost;
            itemsHtml += `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-glass); padding: 0.25rem 0;">
                    <span>${item.name} (Qty: ${qty})</span>
                    <span>₹${cost.toFixed(2)}</span>
                </div>
            `;
            itemsListTextForPrint += `<tr><td style="border: 1px solid #e5e7eb; padding: 8px;">${item.name}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">${qty}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">₹${item.rental_price_per_day.toFixed(2)}</td><td style="border: 1px solid #e5e7eb; padding: 8px;">₹${cost.toFixed(2)}</td></tr>`;
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
                <span>${worker.name} (Wage: ₹${worker.pay_rate.toFixed(2)})</span>
                <label style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" class="crew-payroll-release" data-event-id="${evt.id}" data-index="${index}" ${checked} onchange="toggleCrewPayrollPaid('${evt.id}', ${index})" style="width: auto;">
                    Released
                </label>
            </div>
        `;
    });

    const discount = evt.discount || 0.0;
    const taxRate = evt.tax_rate || 0.0;
    const afterDiscount = Math.max(0.0, subtotal - discount);
    const taxAmount = afterDiscount * (taxRate / 100.0);

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
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--status-danger);">
                <span>Discount:</span>
                <span>- ₹${discount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Tax (${taxRate}%):</span>
                <span>₹${taxAmount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-glass); padding-top: 0.25rem;">
                <span>Invoice Total:</span>
                <strong>₹${evt.total_invoice_amount.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--status-success);">
                <span>Deposits Paid:</span>
                <span>₹${evt.amount_paid.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-glass); padding-top: 0.25rem;">
                <span>Remaining Balance Due:</span>
                <strong class="${evt.remaining_balance > 0 ? 'text-danger' : 'text-success'}" style="font-size: 1.1rem;">₹${evt.remaining_balance.toFixed(2)}</strong>
            </div>
        </div>

        <div style="border-top: 1px solid var(--border-glass); padding-top: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">Setup Crew Wages & Payroll:</h4>
            ${crewHtml || '<p style="color: var(--text-muted); font-size: 0.8rem;">No workers assigned.</p>'}
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
            <p><strong>Subtotal Amount:</strong> ₹${subtotal.toFixed(2)}</p>
            <p style="color: #b91c1c;"><strong>Deducted Discount:</strong> - ₹${discount.toFixed(2)}</p>
            <p><strong>Applied Tax (${taxRate}%):</strong> ₹${taxAmount.toFixed(2)}</p>
            <p style="border-top: 1px solid #000; padding-top: 4px;"><strong>Total Invoice Amount:</strong> ₹${evt.total_invoice_amount.toFixed(2)}</p>
            <p style="color: #15803d;"><strong>Total Paid (Receipts):</strong> ₹${evt.amount_paid.toFixed(2)}</p>
            <p><strong>Remaining Accounts Balance:</strong> ₹${evt.remaining_balance.toFixed(2)}</p>
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
                body: JSON.stringify({ amount, payment_method: "Cash" })
            });
            showToast("Deposit transaction logged successfully.");
            closeModal("modal-invoice-payout");
            loadDashboardData();
        } catch (err) {}
    };

    openModal("modal-invoice-payout");
}

window.openInvoiceModal = openInvoiceModal;

async function toggleCrewPayrollPaid(eventId, crewIndex) {
    try {
        await apiFetch(`/api/events/${eventId}/crew/${crewIndex}/toggle-paid`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        
        showToast("Crew wage ledger updated.");
        closeModal("modal-invoice-payout");
        openInvoiceModal(eventId);
        loadDashboardData();
    } catch (err) {}
}

window.toggleCrewPayrollPaid = toggleCrewPayrollPaid;

// Layout blueprint image uploader
function openLayoutUploadModal(eventId) {
    document.getElementById("upload-layout-event-id").value = eventId;
    document.getElementById("upload-layout-file").value = "";
    openModal("modal-upload-layout");
}

window.openLayoutUploadModal = openLayoutUploadModal;

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
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Upload Layout";
    }
}

function compressImageLocally(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
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
                    const compressed = new File([blob], file.name, {
                        type: "image/jpeg",
                        lastModified: Date.now()
                    });
                    resolve(compressed);
                } else {
                    reject(new Error("Canvas compression failed"));
                }
            }, "image/jpeg", 0.7);
        };
        
        img.onerror = () => reject(new Error("Failed to load blueprint file"));
    });
}

// Crew Onboarding Trigger
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
        showToast("Manager onboarded successfully!");
        closeModal("modal-onboard-crew");
    } catch (err) {}
}

// ─── NEW MODULE CONTROLLERS ─────────────────────────────────────────────────

// Events Projects View
let currentEventsStatusFilter = "All";
async function loadEventsData(page) {
    if (page !== undefined) eventsPage = page;
    try {
        eventsList = await apiFetch("/api/events");
        const tbody = document.getElementById("events-table-body");
        tbody.innerHTML = "";

        // Status filter button highlight
        ["all", "draft", "confirmed", "completed"].forEach(key => {
            const btn = document.getElementById(`event-status-filter-btn-${key}`);
            if (btn) btn.classList.remove("active-filter");
        });
        const activeBtnKey = currentEventsStatusFilter.toLowerCase();
        const activeBtn = document.getElementById(`event-status-filter-btn-${activeBtnKey}`);
        if (activeBtn) activeBtn.classList.add("active-filter");

        let filtered = eventsList;
        if (currentEventsStatusFilter !== "All") {
            filtered = filtered.filter(e => e.status === currentEventsStatusFilter);
        }
        if (eventsSearchQuery.trim()) {
            const q = eventsSearchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                (e.client_name && e.client_name.toLowerCase().includes(q)) ||
                (e.venue_address && e.venue_address.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No events found matching the selected filter.</td></tr>`;
            renderPaginationControls("events-pagination", 0, eventsPage, "loadEventsData");
            return;
        }

        const start = (eventsPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        pageItems.forEach(evt => {
            const tr = document.createElement("tr");
            const badgeClass = evt.status === "Completed" ? "badge-completed" :
                               evt.status === "Confirmed" ? "badge-confirmed" : "badge-draft";
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
                <td>₹${evt.total_invoice_amount.toFixed(2)}</td>
                <td>₹${evt.amount_paid.toFixed(2)}</td>
                <td><strong class="${evt.remaining_balance > 0 ? 'text-danger' : 'text-success'}" style="font-size: 0.9rem;">₹${evt.remaining_balance.toFixed(2)}</strong></td>
                <td>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="exportInvoiceToPDF('${evt.id}')">Export PDF</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Receipt/Pay</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="editEventBooking('${evt.id}')">Edit</button>
                        <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.75rem; border-radius: 8px;" onclick="deleteEventBooking('${evt.id}')">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("events-pagination", filtered.length, eventsPage, "loadEventsData");
    } catch (err) {}
}

// 1. Clients CRM
async function loadClientsData(page) {
    if (page !== undefined) clientsPage = page;
    try {
        clientsList = await apiFetch("/api/clients");
        const tbody = document.getElementById("clients-table-body");
        tbody.innerHTML = "";

        let filtered = clientsList;
        if (clientsSearchQuery.trim()) {
            const q = clientsSearchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.phone && c.phone.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No client profiles found.</td></tr>`;
            renderPaginationControls("clients-pagination", 0, clientsPage, "loadClientsData");
            return;
        }

        const start = (clientsPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        pageItems.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code style="color: var(--maroon); font-size: 0.8rem;">${c.id}</code></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.address || ''}</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="editClientItem('${c.id}')">Edit</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteClientItem('${c.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("clients-pagination", filtered.length, clientsPage, "loadClientsData");
    } catch (err) {}
}

function editClientItem(clientId) {
    const client = clientsList.find(c => c.id === clientId);
    if (!client) return;
    editingClientId = client.id;
    
    document.getElementById("client-name").value = client.name;
    document.getElementById("client-email").value = client.email;
    document.getElementById("client-phone").value = client.phone;
    document.getElementById("client-address").value = client.address || "";
    openModal("modal-client");
}

async function deleteClientItem(clientId) {
    showConfirmation(
        "Confirm Delete",
        "Are you sure you want to delete this client profile? This will not remove their historical bookings.",
        async () => {
            try {
                await apiFetch(`/api/clients/${clientId}`, { method: "DELETE" });
                showToast("Client profile deleted.");
                loadClientsData();
            } catch (err) {}
        }
    );
}

// 2. Portfolio Gallery
async function loadGalleryData(page) {
    if (page !== undefined) galleryPage = page;
    try {
        galleryList = await apiFetch("/api/gallery");
        const tbody = document.getElementById("gallery-table-body");
        tbody.innerHTML = "";

        let filtered = galleryList;
        if (gallerySearchQuery.trim()) {
            const q = gallerySearchQuery.toLowerCase();
            filtered = filtered.filter(g =>
                (g.title && g.title.toLowerCase().includes(q)) ||
                (g.category && g.category.toLowerCase().includes(q)) ||
                (g.description && g.description.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No gallery entries found.</td></tr>`;
            renderPaginationControls("gallery-pagination", 0, galleryPage, "loadGalleryData");
            return;
        }

        const start = (galleryPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        pageItems.forEach(g => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><img src="${g.image_url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" alt="${g.title}"></td>
                <td><strong>${g.title}</strong></td>
                <td><span class="badge" style="background: rgba(201,148,31,0.05); color: var(--gold);">${g.category}</span></td>
                <td>${g.description || ''}</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="editGalleryItem('${g.id}')">Edit</button>
                    <button class="btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteGalleryItem('${g.id}')">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("gallery-pagination", filtered.length, galleryPage, "loadGalleryData");
    } catch (err) {}
}

async function handleGallerySubmit(e) {
    e.preventDefault();
    const id = document.getElementById("gallery-id").value;
    const title = document.getElementById("gallery-title").value;
    const category = document.getElementById("gallery-category").value;
    const description = document.getElementById("gallery-desc").value;
    
    if (id) {
        const image_url = document.getElementById("gallery-url").value;
        try {
            await apiFetch(`/api/gallery/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, description, image_url })
            });
            showToast("Gallery item details updated.");
            closeModal("modal-gallery");
            loadGalleryData();
        } catch (err) {}
    } else {
        const fileInput = document.getElementById("gallery-file");
        const file = fileInput.files[0];
        if (!file) {
            showToast("Please choose an image file to upload", "warning");
            return;
        }
        
        const saveBtn = document.getElementById("btn-gallery-save");
        saveBtn.disabled = true;
        saveBtn.innerText = "Uploading...";
        
        try {
            const compressedFile = await compressImageLocally(file);
            const formData = new FormData();
            formData.append("title", title);
            formData.append("category", category);
            formData.append("description", description);
            formData.append("file", compressedFile, file.name);
            
            await apiFetch("/api/gallery", {
                method: "POST",
                body: formData
            });
            showToast("Portfolio image uploaded successfully.");
            closeModal("modal-gallery");
            loadGalleryData();
        } catch (err) {
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = "Upload & Save";
        }
    }
}

function editGalleryItem(photoId) {
    const photo = galleryList.find(g => g.id === photoId);
    if (!photo) return;
    
    document.getElementById("gallery-modal-title").innerText = "Edit Gallery Item";
    document.getElementById("gallery-id").value = photo.id;
    document.getElementById("gallery-title").value = photo.title;
    document.getElementById("gallery-category").value = photo.category;
    document.getElementById("gallery-desc").value = photo.description || "";
    document.getElementById("gallery-url").value = photo.image_url;
    
    document.getElementById("gallery-file-group").style.display = "none";
    document.getElementById("gallery-url-group").style.display = "block";
    
    openModal("modal-gallery");
}

async function deleteGalleryItem(photoId) {
    showConfirmation(
        "Confirm Delete",
        "Are you sure you want to remove this photo from the landing page portfolio?",
        async () => {
            try {
                await apiFetch(`/api/gallery/${photoId}`, { method: "DELETE" });
                showToast("Photo removed from gallery.");
                loadGalleryData();
            } catch (err) {}
        }
    );
}

// 3. Crew Ledger
async function loadCrewData(page) {
    if (page !== undefined) crewPage = page;
    try {
        crewList = await apiFetch("/api/crew");
        const tbody = document.getElementById("crew-table-body");
        tbody.innerHTML = "";

        let filtered = crewList;
        if (crewSearchQuery.trim()) {
            const q = crewSearchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.role && c.role.toLowerCase().includes(q)) ||
                (c.contact && c.contact.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No crew profiles found.</td></tr>`;
            renderPaginationControls("crew-pagination", 0, crewPage, "loadCrewData");
            return;
        }

        const start = (crewPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        pageItems.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code style="color: var(--maroon); font-size: 0.8rem;">${c.id}</code></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.role}</td>
                <td>${c.contact || ''}</td>
                <td>₹${c.base_rate.toFixed(2)}</td>
                <td><strong class="${c.amount_owed > 0 ? 'text-danger' : 'text-success'}">₹${c.amount_owed.toFixed(2)}</strong></td>
                <td>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;" onclick="openCrewPaymentModal('${c.id}')">Payout</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;" onclick="editCrewMember('${c.id}')">Edit</button>
                        <button class="btn-danger" style="padding: 0.35rem 0.5rem; font-size: 0.8rem; border-radius: 8px;" onclick="deleteCrewMember('${c.id}')">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("crew-pagination", filtered.length, crewPage, "loadCrewData");
    } catch (err) {}
}

async function handleCrewSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("crew-id").value;
    const name = document.getElementById("crew-name").value;
    const role = document.getElementById("crew-role").value;
    const contact = document.getElementById("crew-contact").value;
    const base_rate = parseFloat(document.getElementById("crew-rate").value) || 0.0;
    
    const payload = { name, role, contact, base_rate };
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/api/crew/${id}` : "/api/crew";
    
    try {
        await apiFetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        showToast(id ? "Crew profile updated." : "Crew member record generated.");
        closeModal("modal-crew");
        loadCrewData();
    } catch (err) {}
}

function editCrewMember(crewId) {
    const member = crewList.find(c => c.id === crewId);
    if (!member) return;
    
    document.getElementById("crew-modal-title").innerText = "Update Team Profile";
    document.getElementById("crew-id").value = member.id;
    document.getElementById("crew-name").value = member.name;
    document.getElementById("crew-role").value = member.role;
    document.getElementById("crew-contact").value = member.contact || "";
    document.getElementById("crew-rate").value = member.base_rate;
    
    openModal("modal-crew");
}

async function deleteCrewMember(crewId) {
    showConfirmation(
        "Confirm Delete",
        "Are you sure you want to remove this crew member profile?",
        async () => {
            try {
                await apiFetch(`/api/crew/${crewId}`, { method: "DELETE" });
                showToast("Crew member removed.");
                loadCrewData();
            } catch (err) {}
        }
    );
}

function openCrewPaymentModal(crewId) {
    const member = crewList.find(c => c.id === crewId);
    if (!member) return;
    
    document.getElementById("crew-payment-id").value = member.id;
    document.getElementById("crew-payment-name").innerText = member.name;
    document.getElementById("crew-payment-owed").innerText = `₹${member.amount_owed.toFixed(2)}`;
    document.getElementById("crew-payment-amount").value = member.amount_owed > 0 ? member.amount_owed.toFixed(2) : "";
    
    openModal("modal-crew-payment");
}

async function handleCrewPaymentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("crew-payment-id").value;
    const amount = parseFloat(document.getElementById("crew-payment-amount").value);
    if (!amount || amount <= 0) return;
    
    try {
        await apiFetch(`/api/crew/${id}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount })
        });
        showToast("Payout to crew member logged.");
        closeModal("modal-crew-payment");
        loadCrewData();
    } catch (err) {}
}

// ─── 4. Finance Hub ──────────────────────────────────────────────────────────
let currentFinanceFilter = "All";
async function loadFinanceData(filterType = "All", page) {
    currentFinanceFilter = filterType;
    if (page !== undefined) financePage = page;

    // Update active class on filter buttons
    const filters = ["all", "fully", "partially", "unpaid"];
    filters.forEach(f => {
        const btn = document.getElementById(`filter-btn-${f}`);
        if (btn) btn.classList.remove("active-filter");
    });

    let filterBtnId = "all";
    if (filterType === "Fully Paid") filterBtnId = "fully";
    else if (filterType === "Partially Paid") filterBtnId = "partially";
    else if (filterType === "Unpaid") filterBtnId = "unpaid";

    const activeBtn = document.getElementById(`filter-btn-${filterBtnId}`);
    if (activeBtn) activeBtn.classList.add("active-filter");

    try {
        eventsList = await apiFetch("/api/events");
        const tbody = document.getElementById("finance-table-body");
        tbody.innerHTML = "";

        let filtered = eventsList;
        if (filterType !== "All") {
            filtered = filtered.filter(evt => evt.payment_status === filterType);
        }
        if (financeSearchQuery.trim()) {
            const q = financeSearchQuery.toLowerCase();
            filtered = filtered.filter(evt =>
                (evt.client_name && evt.client_name.toLowerCase().includes(q)) ||
                (evt.venue_address && evt.venue_address.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No transactions found.</td></tr>`;
            renderPaginationControls("finance-pagination", 0, financePage, "loadFinanceData");
            return;
        }

        const start = (financePage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        pageItems.forEach(evt => {
            const tr = document.createElement("tr");
            const pStatus = evt.payment_status || "Unpaid";
            const badgeClass = pStatus === "Fully Paid" ? "badge-completed" :
                               pStatus === "Partially Paid" ? "badge-confirmed" : "badge-draft";
            tr.innerHTML = `
                <td>
                    <strong>${evt.client_name}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${evt.venue_address}</span>
                </td>
                <td>${evt.start_date}</td>
                <td>₹${evt.total_invoice_amount.toFixed(2)}</td>
                <td>₹${evt.amount_paid.toFixed(2)}</td>
                <td><strong class="${evt.remaining_balance > 0 ? 'text-danger' : 'text-success'}">₹${evt.remaining_balance.toFixed(2)}</strong></td>
                <td><span class="badge ${badgeClass}">${pStatus}</span></td>
                <td>
                    <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Receipt/Payout</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls("finance-pagination", filtered.length, financePage, "loadFinanceData");
    } catch (err) {}
}

// ─── 5. Invoices Hub ────────────────────────────────────────────────────────
let currentInvoiceFilter = "All";

async function loadInvoicesData(filterType = "All") {
    currentInvoiceFilter = filterType;
    
    const filterBtnIds = {
        "All": "invoice-filter-btn-all",
        "Paid": "invoice-filter-btn-paid",
        "Remaining": "invoice-filter-btn-remaining",
        "Unpaid": "invoice-filter-btn-unpaid"
    };
    
    Object.keys(filterBtnIds).forEach(fKey => {
        const btn = document.getElementById(filterBtnIds[fKey]);
        if (btn) {
            if (fKey === filterType) {
                btn.classList.add("active-filter");
            } else {
                btn.classList.remove("active-filter");
            }
        }
    });

    try {
        eventsList = await apiFetch("/api/events");
        
        let totalInvoiced = 0.0;
        let totalCollected = 0.0;
        let totalRemaining = 0.0;
        
        eventsList.forEach(evt => {
            totalInvoiced += evt.total_invoice_amount || 0.0;
            totalCollected += evt.amount_paid || 0.0;
            totalRemaining += evt.remaining_balance || 0.0;
        });
        
        document.getElementById("invoice-stat-total").innerText = `₹${totalInvoiced.toFixed(2)}`;
        document.getElementById("invoice-stat-collected").innerText = `₹${totalCollected.toFixed(2)}`;
        document.getElementById("invoice-stat-remaining").innerText = `₹${totalRemaining.toFixed(2)}`;
        
        const tbody = document.getElementById("invoices-table-body");
        tbody.innerHTML = "";
        
        let filtered = eventsList;
        
        if (filterType !== "All") {
            filtered = filtered.filter(evt => {
                const balance = evt.remaining_balance || 0.0;
                const paid = evt.amount_paid || 0.0;
                
                if (filterType === "Paid") {
                    return balance <= 0;
                } else if (filterType === "Remaining") {
                    return balance > 0 && paid > 0;
                } else if (filterType === "Unpaid") {
                    return paid <= 0;
                }
                return true;
            });
        }
        
        if (invoiceSearchQuery.trim() !== "") {
            const query = invoiceSearchQuery.toLowerCase();
            filtered = filtered.filter(evt => 
                (evt.client_name && evt.client_name.toLowerCase().includes(query)) ||
                (evt.venue_address && evt.venue_address.toLowerCase().includes(query))
            );
        }
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No invoices found.</td></tr>`;
            return;
        }
        
        filtered.forEach(evt => {
            const balance = evt.remaining_balance || 0.0;
            const paid = evt.amount_paid || 0.0;
            
            let statusText = "Unpaid";
            let badgeClass = "badge-draft";
            if (balance <= 0) {
                statusText = "Paid";
                badgeClass = "badge-completed";
            } else if (paid > 0) {
                statusText = "Remaining";
                badgeClass = "badge-confirmed";
            }
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <strong>${evt.client_name}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${evt.venue_address}</span>
                </td>
                <td>${evt.start_date}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td>₹${evt.total_invoice_amount.toFixed(2)}</td>
                <td>₹${evt.amount_paid.toFixed(2)}</td>
                <td><strong class="${balance > 0 ? 'text-danger' : 'text-success'}">₹${balance.toFixed(2)}</strong></td>
                <td>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="exportInvoiceToPDF('${evt.id}')">Export PDF</button>
                        <button class="btn-secondary" style="padding: 0.35rem 0.5rem; font-size: 0.75rem;" onclick="openInvoiceModal('${evt.id}')">Receipt/Payout</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Failed to load invoices data:", err);
    }
}

async function exportInvoiceToPDF(eventId) {
    try {
        const evt = await apiFetch(`/api/events/${eventId}`);
        if (!evt) {
            showToast("Failed to fetch event invoice details", "error");
            return;
        }
        
        if (clientsList.length === 0) {
            clientsList = await apiFetch("/api/clients");
        }
        const client = clientsList.find(c => c.id === evt.client_id) || {};
        
        const template = document.getElementById("invoice-pdf-template");
        if (!template) {
            showToast("Invoice template not found", "error");
            return;
        }
        
        const printArea = template.cloneNode(true);
        printArea.style.display = "block";
        
        printArea.querySelector("#pdf-invoice-id").innerText = `#${evt.id}`;
        printArea.querySelector("#pdf-invoice-date").innerText = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        printArea.querySelector("#pdf-client-name").innerText = client.name || evt.client_name || "N/A";
        printArea.querySelector("#pdf-client-email").innerText = client.email || "N/A";
        printArea.querySelector("#pdf-client-phone").innerText = client.phone || "N/A";
        printArea.querySelector("#pdf-client-address").innerText = client.address || evt.venue_address || "N/A";
        
        printArea.querySelector("#pdf-event-venue").innerText = evt.venue_address || "N/A";
        printArea.querySelector("#pdf-event-start").innerText = evt.start_date || "N/A";
        printArea.querySelector("#pdf-event-end").innerText = evt.end_date || "N/A";
        
        const sDate = new Date(evt.start_date);
        const eDate = new Date(evt.end_date);
        const days = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);
        
        let bookedItems = {};
        try {
            bookedItems = JSON.parse(evt.items_booked || "{}");
        } catch (e) {}
        
        if (inventoryList.length === 0) {
            inventoryList = await apiFetch("/api/inventory");
        }
        
        const itemsBody = printArea.querySelector("#pdf-items-body");
        itemsBody.innerHTML = "";
        
        let subtotal = 0.0;
        let itemIndex = 0;
        
        Object.keys(bookedItems).forEach(itemId => {
            const item = inventoryList.find(i => i.id === itemId);
            if (item) {
                const qty = bookedItems[itemId];
                const cost = item.rental_price_per_day * qty * days;
                subtotal += cost;
                
                const tr = document.createElement("tr");
                tr.style.backgroundColor = itemIndex % 2 === 0 ? "#ffffff" : "#fdfaf7";
                tr.innerHTML = `
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee;"><strong>${item.name}</strong></td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.category}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: 600;">${qty}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; color: #666;">₹${item.rental_price_per_day.toFixed(2)}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #6b1623;">₹${cost.toFixed(2)}</td>
                `;
                itemsBody.appendChild(tr);
                itemIndex++;
            }
        });
        
        if (itemIndex === 0) {
            itemsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #888;">No reserved catalog items found.</td></tr>`;
        }
        
        const discount = evt.discount || 0.0;
        const taxRate = evt.tax_rate || 0.0;
        const afterDiscount = Math.max(0.0, subtotal - discount);
        const taxAmount = afterDiscount * (taxRate / 100.0);
        
        printArea.querySelector("#pdf-subtotal").innerText = `₹${subtotal.toFixed(2)}`;
        printArea.querySelector("#pdf-discount").innerText = `-₹${discount.toFixed(2)}`;
        printArea.querySelector("#pdf-tax").innerText = `${taxRate.toFixed(1)}%`;
        printArea.querySelector("#pdf-total").innerText = `₹${evt.total_invoice_amount.toFixed(2)}`;
        printArea.querySelector("#pdf-paid").innerText = `₹${evt.amount_paid.toFixed(2)}`;
        printArea.querySelector("#pdf-balance").innerText = `₹${evt.remaining_balance.toFixed(2)}`;
        
        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     `Bhoomi_Invoice_${evt.id}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        showToast("Generating PDF Invoice...");
        html2pdf().from(printArea).set(opt).save().then(() => {
            showToast("Invoice exported successfully.");
        }).catch(err => {
            console.error("PDF generation failed:", err);
            showToast("Failed to generate PDF.", "error");
        });
        
    } catch (err) {
        console.error("Error exporting PDF:", err);
        showToast("Error generating PDF invoice.", "error");
    }
}

// ─── Manual Invoice Builder ──────────────────────────────────────────────────
let manualInvoiceItems = [];

function recalculateManualInvoiceTotal() {
    const discount = parseFloat(document.getElementById("manual-invoice-discount").value) || 0;
    const taxRate = parseFloat(document.getElementById("manual-invoice-tax-rate").value) || 0;
    const subtotal = manualInvoiceItems.reduce((sum, i) => sum + (i.qty * i.rate), 0);
    const afterDiscount = Math.max(0, subtotal - discount);
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    const el = document.getElementById("manual-invoice-grand-total");
    if (el) el.innerText = `₹${total.toFixed(2)}`;
    return { subtotal, discount, taxRate, taxAmount, total };
}

function renderManualInvoiceItemsList() {
    const container = document.getElementById("manual-invoice-items-list");
    if (!container) return;
    if (manualInvoiceItems.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem;">No items added yet. Click "Add" below.</div>`;
        return;
    }
    container.innerHTML = "";
    manualInvoiceItems.forEach((item, idx) => {
        const subtotal = item.qty * item.rate;
        const div = document.createElement("div");
        div.style.cssText = "display: grid; grid-template-columns: 2fr 0.7fr 1fr 1fr auto; gap: 0.4rem; align-items: center; padding: 0.35rem 0; border-bottom: 1px dashed rgba(107,22,35,0.1);";
        div.innerHTML = `
            <span style="font-size:0.85rem;">${item.desc}</span>
            <span style="font-size:0.8rem; text-align:center;">${item.qty}</span>
            <span style="font-size:0.8rem;">₹${item.rate.toFixed(2)}</span>
            <span style="font-size:0.85rem; font-weight:600; color:var(--maroon);">₹${subtotal.toFixed(2)}</span>
            <button type="button" onclick="removeManualItem(${idx})" style="background:none;border:none;cursor:pointer;color:var(--maroon);font-size:1rem;padding:0 4px;" title="Remove">✕</button>
        `;
        container.appendChild(div);
    });
}

window.removeManualItem = function(idx) {
    manualInvoiceItems.splice(idx, 1);
    renderManualInvoiceItemsList();
    recalculateManualInvoiceTotal();
};

function openManualInvoiceModal() {
    manualInvoiceItems = [];
    document.getElementById("manual-invoice-form").reset();
    document.getElementById("manual-invoice-id").value = "";
    renderManualInvoiceItemsList();
    recalculateManualInvoiceTotal();

    // Populate client dropdown
    const sel = document.getElementById("manual-invoice-client-select");
    if (sel) {
        sel.innerHTML = `<option value="">-- None / Manual Entry --</option>`;
        clientsList.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.innerText = `${c.name} (${c.email})`;
            sel.appendChild(opt);
        });
        sel.onchange = () => {
            const chosen = clientsList.find(c => c.id === sel.value);
            if (chosen) {
                document.getElementById("manual-invoice-client-name").value = chosen.name;
                document.getElementById("manual-invoice-client-email").value = chosen.email;
                document.getElementById("manual-invoice-client-phone").value = chosen.phone || "";
                document.getElementById("manual-invoice-client-address").value = chosen.address || "";
            }
        };
    }
    openModal("modal-manual-invoice");
}

async function handleManualInvoiceSubmit(e) {
    e.preventDefault();
    if (manualInvoiceItems.length === 0) {
        showToast("Please add at least one line item to the invoice.", "warning");
        return;
    }

    const client_name = document.getElementById("manual-invoice-client-name").value.trim();
    const client_email = document.getElementById("manual-invoice-client-email").value.trim();
    const client_phone = document.getElementById("manual-invoice-client-phone").value.trim();
    const client_address = document.getElementById("manual-invoice-client-address").value.trim();
    const venue_address = document.getElementById("manual-invoice-venue").value.trim();
    const start_date = document.getElementById("manual-invoice-start").value;
    const end_date = document.getElementById("manual-invoice-end").value;
    const discount = parseFloat(document.getElementById("manual-invoice-discount").value) || 0;
    const tax_rate = parseFloat(document.getElementById("manual-invoice-tax-rate").value) || 0;
    const amount_paid = parseFloat(document.getElementById("manual-invoice-paid").value) || 0;
    const status = document.getElementById("manual-invoice-status").value;
    const memoNotes = document.getElementById("manual-invoice-notes").value.trim();

    const saveBtn = document.getElementById("btn-save-manual-invoice");
    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";

    try {
        // Step 1: Ensure client exists or create new one
        let client_id = document.getElementById("manual-invoice-client-select").value;
        if (!client_id) {
            // Create a new client record
            const newClient = await apiFetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: client_name, email: client_email, phone: client_phone, address: client_address })
            });
            client_id = newClient.id;
            await populateClientsDropdown();
        }

        // Step 2: Build notes payload with line items JSON
        const notesPayload = JSON.stringify({
            type: "manual_invoice",
            memo: memoNotes,
            line_items: manualInvoiceItems
        });

        // Step 3: Create the event booking record
        const payload = {
            client_id,
            client_name,
            venue_address,
            start_date,
            end_date,
            items_booked: JSON.stringify({}),
            crew_assignments: JSON.stringify([]),
            max_workforce_capacity: 1,
            notes: notesPayload,
            status,
            discount,
            tax_rate
        };

        const result = await apiFetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // Step 4: Record initial payment if provided
        if (amount_paid > 0 && result.event) {
            await apiFetch(`/api/events/${result.event.id}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amount_paid, payment_method: "Cash" })
            });
        }

        showToast("Manual invoice saved successfully!");
        closeModal("modal-manual-invoice");
        loadInvoicesData(currentInvoiceFilter);

        // Step 5: Trigger PDF export for the new invoice
        if (result.event) {
            await exportManualInvoiceToPDF(result.event.id, {
                client_name, client_email, client_phone, client_address,
                venue_address, start_date, end_date,
                line_items: manualInvoiceItems,
                discount, tax_rate, amount_paid
            });
        }
    } catch (err) {
        console.error("Manual invoice save error:", err);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save & Export PDF";
    }
}

async function exportManualInvoiceToPDF(eventId, data) {
    const template = document.getElementById("invoice-pdf-template");
    if (!template) return;

    const printArea = template.cloneNode(true);
    printArea.style.display = "block";

    printArea.querySelector("#pdf-invoice-id").innerText = `#${eventId}`;
    printArea.querySelector("#pdf-invoice-date").innerText = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    printArea.querySelector("#pdf-client-name").innerText = data.client_name || "N/A";
    printArea.querySelector("#pdf-client-email").innerText = data.client_email || "N/A";
    printArea.querySelector("#pdf-client-phone").innerText = data.client_phone || "N/A";
    printArea.querySelector("#pdf-client-address").innerText = data.client_address || "N/A";
    printArea.querySelector("#pdf-event-venue").innerText = data.venue_address || "N/A";
    printArea.querySelector("#pdf-event-start").innerText = data.start_date || "N/A";
    printArea.querySelector("#pdf-event-end").innerText = data.end_date || "N/A";

    const itemsBody = printArea.querySelector("#pdf-items-body");
    itemsBody.innerHTML = "";

    let subtotal = 0;
    (data.line_items || []).forEach((item, idx) => {
        const cost = item.qty * item.rate;
        subtotal += cost;
        const tr = document.createElement("tr");
        tr.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#fdfaf7";
        tr.innerHTML = `
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee;"><strong>${item.desc}</strong></td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;">Custom</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: 600;">${item.qty}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; color: #666;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #6b1623;">₹${cost.toFixed(2)}</td>
        `;
        itemsBody.appendChild(tr);
    });

    const discount = data.discount || 0;
    const taxRate = data.tax_rate || 0;
    const afterDiscount = Math.max(0, subtotal - discount);
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    const balance = Math.max(0, total - (data.amount_paid || 0));

    printArea.querySelector("#pdf-subtotal").innerText = `₹${subtotal.toFixed(2)}`;
    printArea.querySelector("#pdf-discount").innerText = `-₹${discount.toFixed(2)}`;
    printArea.querySelector("#pdf-tax").innerText = `${taxRate.toFixed(1)}%`;
    printArea.querySelector("#pdf-total").innerText = `₹${total.toFixed(2)}`;
    printArea.querySelector("#pdf-paid").innerText = `₹${(data.amount_paid || 0).toFixed(2)}`;
    printArea.querySelector("#pdf-balance").innerText = `₹${balance.toFixed(2)}`;

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `Bhoomi_ManualInvoice_${eventId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    showToast("Generating PDF Invoice...");
    html2pdf().from(printArea).set(opt).save().then(() => {
        showToast("PDF invoice exported successfully.");
    }).catch(err => {
        console.error("PDF generation failed:", err);
        showToast("Failed to generate PDF.", "error");
    });
}

// ─── Bind Event Listeners ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // 1. Navigation Button Actions
    document.getElementById("nav-btn-dashboard").addEventListener("click", () => switchView("dashboard-view"));
    document.getElementById("nav-btn-events").addEventListener("click", () => switchView("events-view"));
    document.getElementById("nav-btn-warehouse").addEventListener("click", () => switchView("warehouse-view"));
    document.getElementById("nav-btn-clients").addEventListener("click", () => switchView("clients-view"));
    document.getElementById("nav-btn-gallery").addEventListener("click", () => switchView("gallery-view"));
    document.getElementById("nav-btn-crew").addEventListener("click", () => switchView("crew-view"));
    document.getElementById("nav-btn-finance").addEventListener("click", () => switchView("finance-view"));
    document.getElementById("nav-btn-invoice").addEventListener("click", () => switchView("invoice-view"));

    // 2. Form submission bindings
    document.getElementById("inventory-form").addEventListener("submit", handleInventorySubmit);
    document.getElementById("client-form").addEventListener("submit", handleClientSubmit);
    document.getElementById("booking-form").addEventListener("submit", handleBookingSubmit);
    document.getElementById("upload-layout-form").addEventListener("submit", handleLayoutUploadSubmit);
    document.getElementById("onboard-crew-form").addEventListener("submit", handleOnboardCrewSubmit);
    document.getElementById("gallery-form").addEventListener("submit", handleGallerySubmit);
    document.getElementById("crew-form").addEventListener("submit", handleCrewSubmit);
    document.getElementById("crew-payment-form").addEventListener("submit", handleCrewPaymentSubmit);
    document.getElementById("manual-invoice-form").addEventListener("submit", handleManualInvoiceSubmit);

    // 3. Modals open triggers
    document.getElementById("btn-add-inventory").addEventListener("click", () => {
        document.getElementById("inventory-modal-title").innerText = "Register Catalog Asset";
        document.getElementById("inventory-id").value = "";
        document.getElementById("inventory-form").reset();
        document.getElementById("inventory-condition").value = "Excellent";
        openModal("modal-inventory");
    });

    document.getElementById("btn-create-booking").addEventListener("click", async () => {
        document.getElementById("booking-modal-title").innerText = "Book New Event Project";
        document.getElementById("booking-id").value = "";
        document.getElementById("booking-form").reset();
        document.getElementById("booking-discount").value = 0;
        document.getElementById("booking-tax-rate").value = 0;
        activeCrewAssignments = [];
        await renderBookingInventoryItems();
        openModal("modal-booking");
    });

    // Events view - create booking button
    const btnEventsCreate = document.getElementById("btn-events-create-booking");
    if (btnEventsCreate) {
        btnEventsCreate.addEventListener("click", async () => {
            document.getElementById("booking-modal-title").innerText = "Book New Event Project";
            document.getElementById("booking-id").value = "";
            document.getElementById("booking-form").reset();
            document.getElementById("booking-discount").value = 0;
            document.getElementById("booking-tax-rate").value = 0;
            activeCrewAssignments = [];
            await renderBookingInventoryItems();
            openModal("modal-booking");
        });
    }

    document.getElementById("btn-quick-client").addEventListener("click", () => {
        editingClientId = null;
        document.getElementById("client-form").reset();
        openModal("modal-client");
    });

    document.getElementById("btn-add-client-tab").addEventListener("click", () => {
        editingClientId = null;
        document.getElementById("client-form").reset();
        openModal("modal-client");
    });

    document.getElementById("btn-add-gallery-item").addEventListener("click", () => {
        document.getElementById("gallery-modal-title").innerText = "Upload Portfolio Photo";
        document.getElementById("gallery-id").value = "";
        document.getElementById("gallery-form").reset();
        document.getElementById("gallery-file-group").style.display = "block";
        document.getElementById("gallery-url-group").style.display = "none";
        openModal("modal-gallery");
    });

    document.getElementById("btn-add-crew-member").addEventListener("click", () => {
        document.getElementById("crew-modal-title").innerText = "Create Team Profile";
        document.getElementById("crew-id").value = "";
        document.getElementById("crew-form").reset();
        openModal("modal-crew");
    });

    document.getElementById("btn-quick-quote").addEventListener("click", openQuoteToolModal);
    document.getElementById("btn-assign-crew").addEventListener("click", openCrewWagesAllocationModal);
    document.getElementById("btn-apply-crew-allocation").addEventListener("click", applyCrewAllocation);

    document.getElementById("btn-onboard-crew-trigger").addEventListener("click", () => {
        document.getElementById("onboard-crew-form").reset();
        openModal("modal-onboard-crew");
    });

    document.getElementById("btn-export-print").addEventListener("click", () => window.print());
    document.getElementById("logout-btn").addEventListener("click", logout);

    // Quote Consultation
    document.getElementById("quote-days").addEventListener("change", recalculateQuoteEstimate);

    // Finance Hub filters
    document.getElementById("filter-btn-all").addEventListener("click", () => { financePage = 1; loadFinanceData("All"); });
    document.getElementById("filter-btn-fully").addEventListener("click", () => { financePage = 1; loadFinanceData("Fully Paid"); });
    document.getElementById("filter-btn-partially").addEventListener("click", () => { financePage = 1; loadFinanceData("Partially Paid"); });
    document.getElementById("filter-btn-unpaid").addEventListener("click", () => { financePage = 1; loadFinanceData("Unpaid"); });

    // Finance Hub search
    const financeSearchInput = document.getElementById("finance-search-input");
    if (financeSearchInput) {
        financeSearchInput.addEventListener("input", (e) => {
            financeSearchQuery = e.target.value;
            financePage = 1;
            loadFinanceData(currentFinanceFilter);
        });
    }

    // Invoices Hub search & filters
    const invoiceSearchInput = document.getElementById("invoice-search-input");
    if (invoiceSearchInput) {
        invoiceSearchInput.addEventListener("input", (e) => {
            invoiceSearchQuery = e.target.value;
            invoicePage = 1;
            loadInvoicesData(currentInvoiceFilter);
        });
    }
    document.getElementById("invoice-filter-btn-all").addEventListener("click", () => { invoicePage = 1; loadInvoicesData("All"); });
    document.getElementById("invoice-filter-btn-paid").addEventListener("click", () => { invoicePage = 1; loadInvoicesData("Paid"); });
    document.getElementById("invoice-filter-btn-remaining").addEventListener("click", () => { invoicePage = 1; loadInvoicesData("Remaining"); });
    document.getElementById("invoice-filter-btn-unpaid").addEventListener("click", () => { invoicePage = 1; loadInvoicesData("Unpaid"); });

    // Manual Invoice modal trigger
    const btnManualInvoice = document.getElementById("btn-create-manual-invoice");
    if (btnManualInvoice) {
        btnManualInvoice.addEventListener("click", openManualInvoiceModal);
    }

    // Manual Invoice - add item button
    const btnAddItem = document.getElementById("btn-add-custom-item");
    if (btnAddItem) {
        btnAddItem.addEventListener("click", () => {
            const desc = document.getElementById("new-item-desc").value.trim();
            const qty = parseInt(document.getElementById("new-item-qty").value) || 1;
            const rate = parseFloat(document.getElementById("new-item-rate").value) || 0;
            if (!desc) { showToast("Please enter an item description.", "warning"); return; }
            manualInvoiceItems.push({ desc, qty, rate });
            document.getElementById("new-item-desc").value = "";
            document.getElementById("new-item-qty").value = 1;
            document.getElementById("new-item-rate").value = 0;
            renderManualInvoiceItemsList();
            recalculateManualInvoiceTotal();
        });
    }

    // Manual invoice live total recalculation
    ["manual-invoice-discount", "manual-invoice-tax-rate"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", recalculateManualInvoiceTotal);
    });

    // Dashboard search
    const dashboardSearchInput = document.getElementById("dashboard-search-input");
    if (dashboardSearchInput) {
        dashboardSearchInput.addEventListener("input", (e) => {
            dashboardSearchQuery = e.target.value;
            dashboardPage = 1;
            loadDashboardData();
        });
    }

    // Warehouse search
    const warehouseSearchInput = document.getElementById("warehouse-search-input");
    if (warehouseSearchInput) {
        warehouseSearchInput.addEventListener("input", (e) => {
            warehouseSearchQuery = e.target.value;
            warehousePage = 1;
            loadWarehouseData();
        });
    }

    // Clients search
    const clientsSearchInput = document.getElementById("clients-search-input");
    if (clientsSearchInput) {
        clientsSearchInput.addEventListener("input", (e) => {
            clientsSearchQuery = e.target.value;
            clientsPage = 1;
            loadClientsData();
        });
    }

    // Gallery search
    const gallerySearchInput = document.getElementById("gallery-search-input");
    if (gallerySearchInput) {
        gallerySearchInput.addEventListener("input", (e) => {
            gallerySearchQuery = e.target.value;
            galleryPage = 1;
            loadGalleryData();
        });
    }

    // Crew search
    const crewSearchInput = document.getElementById("crew-search-input");
    if (crewSearchInput) {
        crewSearchInput.addEventListener("input", (e) => {
            crewSearchQuery = e.target.value;
            crewPage = 1;
            loadCrewData();
        });
    }

    // Events section search
    const eventsSearchInput = document.getElementById("events-search-input");
    if (eventsSearchInput) {
        eventsSearchInput.addEventListener("input", (e) => {
            eventsSearchQuery = e.target.value;
            eventsPage = 1;
            loadEventsData();
        });
    }

    // Events section status filters
    ["all", "draft", "confirmed", "completed"].forEach(key => {
        const btn = document.getElementById(`event-status-filter-btn-${key}`);
        if (btn) {
            btn.addEventListener("click", () => {
                currentEventsStatusFilter = key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1);
                eventsPage = 1;
                loadEventsData();
            });
        }
    });

    // Initialize session
    initializeSession();
});

// ─── Global Window Exports ──────────────────────────────────────────────────
window.editInventoryItem = editInventoryItem;
window.deleteInventoryItem = deleteInventoryItem;
window.editEventBooking = editEventBooking;
window.deleteEventBooking = deleteEventBooking;
window.editClientItem = editClientItem;
window.deleteClientItem = deleteClientItem;
window.editGalleryItem = editGalleryItem;
window.deleteGalleryItem = deleteGalleryItem;
window.editCrewMember = editCrewMember;
window.deleteCrewMember = deleteCrewMember;
window.openCrewPaymentModal = openCrewPaymentModal;
window.exportInvoiceToPDF = exportInvoiceToPDF;
window.loadWarehouseData = loadWarehouseData;
window.loadClientsData = loadClientsData;
window.loadGalleryData = loadGalleryData;
window.loadCrewData = loadCrewData;
window.loadFinanceData = loadFinanceData;
window.loadDashboardData = loadDashboardData;
window.loadEventsData = loadEventsData;
window.loadInvoicesData = loadInvoicesData;
