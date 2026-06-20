// Crew Dashboard Controller

// State Management
let currentUser = null;
let activeEventId = null;

// Toast and Modals are handled via common.js

// Initialize Session
async function initializeSession() {
    const token = localStorage.getItem("eventflow_token");
    const role = localStorage.getItem("eventflow_role");
    const name = localStorage.getItem("eventflow_user_name");
    
    if (!token || role !== "labor") {
        logout();
        return;
    }
    
    currentUser = { token, role, name };
    
    // Bind Profile Display Details
    document.getElementById("user-display-name").innerText = name;
    
    // Load initial data
    await loadCrewData();
    
    hideLoadingSkeleton();
}

function hideLoadingSkeleton() {
    const skeleton = document.getElementById("loading-skeleton");
    if (skeleton) {
        skeleton.classList.add("hidden");
    }
}

// Labor / Field setup crew view loading
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
            container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No active field tasks assigned for your shift today.</p>`;
            document.getElementById("crew-worker-title").innerText = "No Job Assigned Today";
            activeEventId = null;
            return;
        }
        
        // Render crew list view for the first assigned event
        const activeEvent = assignedEvents[0];
        activeEventId = activeEvent.id;
        document.getElementById("crew-worker-title").innerText = `Assigned Job: @ ${activeEvent.venue_address}`;
        
        // Load layout design blueprints
        if (activeEvent.design_layout_url) {
            layoutPreview.innerHTML = `
                <img src="${activeEvent.design_layout_url}" alt="Blueprint Map Layout" style="width: 100%; border-radius: 8px;" onclick="window.open('${activeEvent.design_layout_url}', '_blank')">
            `;
        } else {
            layoutPreview.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No blueprints uploaded for this venue setup yet. Click 'Upload Layout Photo' to upload a sketch or design photo.</div>`;
        }
        
        // Fetch checklist tasks
        const tasks = await apiFetch(`/api/events/${activeEvent.id}/tasks`);
        container.innerHTML = "";
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: var(--text-muted); margin-bottom: 1rem;">No checklist has been assigned yet for this shift.</p>
                <div class="crew-task-item pending" style="padding: 1rem; border: 1.5px solid var(--border-glass); border-radius: 4px; display: flex; gap: 0.75rem; align-items: center; background: rgba(107,22,35,0.02);">
                    <div class="crew-checkbox" style="background: var(--gold); color: white; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-weight: bold;">!</div>
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
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.gap = "1rem";
            div.style.padding = "1rem";
            div.style.marginBottom = "0.75rem";
            div.style.border = "1px solid var(--border-glass)";
            div.style.borderRadius = "4px";
            div.style.background = isCompleted ? "rgba(31,75,67,0.05)" : "rgba(255,255,255,0.02)";
            
            div.innerHTML = `
                <div class="crew-checkbox ${checkedClass}" onclick="toggleTaskCompletion('${task.id}', '${task.status}')" style="width: 28px; height: 28px; border: 2px solid var(--gold); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; cursor: pointer; background: ${isCompleted ? 'var(--gold)' : 'transparent'}; color: ${isCompleted ? '#white' : 'transparent'}; font-size: 1.1rem; transition: var(--transition-smooth);">${checkedIcon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; font-size: 1rem; text-decoration: ${isCompleted ? 'line-through' : 'none'}; color: ${isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'};">${task.description}</div>
                </div>
            `;
            container.appendChild(div);
        });
        
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
        await loadCrewData();
    } catch (err) {}
}

window.toggleTaskCompletion = toggleTaskCompletion;

// Open blueprint upload modal
function openLayoutUploadModalForCrew() {
    if (!activeEventId) {
        showToast("No active job assigned to upload layout blueprints for.", "warning");
        return;
    }
    document.getElementById("upload-layout-event-id").value = activeEventId;
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
        const compressedFile = await compressImageLocally(file);
        
        const formData = new FormData();
        formData.append("file", compressedFile, file.name);
        
        await apiFetch(`/api/events/${eventId}/upload-layout`, {
            method: "POST",
            body: formData
        });
        
        showToast("Compressed layout blueprint uploaded successfully.");
        closeModal("modal-upload-layout");
        await loadCrewData();
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

// Bind DOM elements
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-upload-layout-trigger").addEventListener("click", openLayoutUploadModalForCrew);
    document.getElementById("upload-layout-form").addEventListener("submit", handleLayoutUploadSubmit);
    
    // Toggle mobile crew light contrast mode
    document.getElementById("btn-crew-highcontrast").addEventListener("click", () => {
        document.body.classList.toggle("labor-mode");
    });
    
    document.getElementById("logout-btn").addEventListener("click", logout);
    
    // Check session info
    initializeSession();
});
