// Login Logic and Session Redirection

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
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
        
        // Redirect based on role
        setTimeout(() => {
            if (data.role === "admin") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/crew";
            }
        }, 800);
    } catch (err) {
        // Errors are automatically displayed by showToast inside apiFetch in common.js
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});
