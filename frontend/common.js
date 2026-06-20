// Shared JavaScript Utilities

// State Management for Notifications
let confirmCallback = null;

// API Helpers
async function apiFetch(endpoint, options = {}) {
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
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
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

// MODAL MANAGEMENT FUNCTIONS
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

// CONFIRMATION DIALOG HELPER
function showConfirmation(title, message, onConfirm) {
    injectConfirmModalHTML();
    document.getElementById("confirm-title").innerText = title;
    document.getElementById("confirm-message").innerText = message;
    confirmCallback = onConfirm;
    openModal("modal-confirm");
}

function injectConfirmModalHTML() {
    if (document.getElementById("modal-confirm")) return;
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "modal-confirm";
    modal.innerHTML = `
        <div class="modal-card glass-panel" style="max-width: 400px;">
            <div class="modal-header">
                <h3 id="confirm-title">Confirm Action</h3>
                <button class="btn btn-secondary" onclick="closeModal('modal-confirm')"
                    style="padding: 0.25rem 0.5rem; border-radius: 4px;">✕</button>
            </div>
            <p id="confirm-message" style="margin-bottom: 1.5rem; color: var(--text-secondary);">Are you sure?</p>
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="closeModal('modal-confirm')">Cancel</button>
                <button type="button" class="btn btn-danger" id="confirm-button">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById("confirm-button").addEventListener("click", () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeModal("modal-confirm");
    });
}

function logout() {
    const token = localStorage.getItem("eventflow_token");
    if (token) {
        fetch(`/api/auth/logout?token=${token}`, { method: "POST" }).catch(() => {});
    }
    localStorage.clear();
    window.location.href = "/";
}

// Inject toast container automatically on DOM Load and setup mobile sidebar triggers
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("toast-container")) {
        const container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    // Mobile sidebar toggle setup
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarClose = document.getElementById("sidebar-close");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");
    const sidebar = document.getElementById("app-sidebar");

    function openMobileSidebar() {
        if (sidebar) sidebar.classList.add("open");
        if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent background body scrolling when sidebar drawer is open
    }

    function closeMobileSidebar() {
        if (sidebar) sidebar.classList.remove("open");
        if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", openMobileSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener("click", closeMobileSidebar);
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener("click", closeMobileSidebar);
    }

    // Auto-close sidebar when clicking any navigation link
    const navLinks = document.querySelectorAll(".nav-item");
    navLinks.forEach(link => {
        link.addEventListener("click", closeMobileSidebar);
    });
});
