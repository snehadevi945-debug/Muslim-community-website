
/* ==========================================================
   Committee Admin Panel — vanilla JS, no framework
   Data is kept in-memory (mirrors the screenshots' content).
   ========================================================== */

/* ---------- Auth Guard ---------- */
const token = localStorage.getItem("adminToken");
if (!token) {
    window.location.href = "login.html";
} else {
    fetch("https://muslim-community-website.onrender.com/api/admin/verify", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.message && data.message !== "Admin created successfully") {
            // Invalid token
            localStorage.removeItem("adminToken");
            window.location.href = "login.html";
        } else if (data.name) {
            // Valid token, update UI
            const nameDisplay = document.getElementById("adminNameDisplay");
            if (nameDisplay) nameDisplay.textContent = data.name;
            
            const roleDisplay = document.getElementById("adminRoleDisplay");
            if (roleDisplay) roleDisplay.textContent = data.role;
            
            const initialDisplay = document.getElementById("adminInitialDisplay");
            if (initialDisplay) initialDisplay.textContent = data.name.charAt(0).toUpperCase();
        }
    })
    .catch(err => console.error("Auth check failed:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("adminToken");
            window.location.href = "login.html";
        });
    }
});

/* ---------- Sample data ---------- */
let projects = [];
const API_URL = "https://muslim-community-website.onrender.com/api/projects";
const MEMBER_API = "https://muslim-community-website.onrender.com/api/members";
const GALLERY_API = "https://muslim-community-website.onrender.com/api/gallery";
const DONATION_API = "https://muslim-community-website.onrender.com/api/settings/donation";
const NOTICE_API = "https://muslim-community-website.onrender.com/api/notices";
const ADMIN_API = "https://muslim-community-website.onrender.com/api/admin";


let execMembers = [];


let generalMembers = [
    { id: 1, name: "Iqbal Hussain", phone: "+91 98111 22334", joining: "2018-03-01" },
    { id: 2, name: "Ayesha Begum", phone: "+91 99220 11445", joining: "2021-07-01" },
];

let notices = [];

let albums = [];

let adminUsers = [];

let donationDetails = {};

/* ---------- Utilities ---------- */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function uid(arr) {
    return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;
}

function formatSince(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return '—';
    return 'since ' + d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

/* ---------- Navigation ---------- */
const navLinks = document.querySelectorAll('.sidebar-link');
const views = document.querySelectorAll('.admin-view');

function goToView(name) {
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.view === name));
    views.forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        goToView(link.dataset.view);
    });
});

document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => goToView(btn.dataset.goto));
});

/* ---------- Renderers ---------- */
function statusClass(status) {
    return status === 'Completed' ? 'status-completed' : 'status-active';
}

function renderProjects() {
    console.log("renderProjects called");
    console.log(projects);
    const rowsHtml = projects.map(p => {
        const safeProgress = Math.min(100, Math.max(0, Number(p.progress) || 0));
        return `
        <tr data-id="${p._id}">
            <td class="cell-title">${p.title}</td>
            <td><span class="status-pill ${statusClass(p.status)}">${p.status}</span></td>
            <td>${safeProgress}%</td>
            <td>${p.target || 'TBD'}</td>
            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-project">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-project">Delete</button>
            </td>
        </tr>`;
    }).join('');
    document.getElementById('projectsTableBody').innerHTML = rowsHtml;

    const rowsHtml2 = projects.map(p => {
        const safeProgress = Math.min(100, Math.max(0, Number(p.progress) || 0));
        return `
    <tr data-id="${p._id}">
        <td>${p.title}</td>
        <td>${p.description || ''}</td>
        <td>${p.status}</td>
        <td>${safeProgress}%</td>
        <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</td>
        <td class="row-actions">
            <button class="btn btn-outline btn-sm edit-project">Edit</button>
            <button class="btn btn-danger-outline btn-sm delete-project">Delete</button>
        </td>
    </tr>`;
    }).join("");

    document.getElementById("projectsTableBody2").innerHTML = rowsHtml2;

    document.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.target.closest("tr").dataset.id;
            confirmAction("Delete this project? This cannot be undone.", () => {

    fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(() => {
        showToast("Project deleted");
        fetchProjects();
    })
    .catch(err => console.error(err));

});
        });
    });
    document.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', e => {
           const id = e.target.closest("tr").dataset.id;
            openProjectModal(projects.find(p => p._id === id));
        });
    });
}

function renderExecMembers() {

    const tbody = document.getElementById("execMembersBody");

    tbody.innerHTML = execMembers.map(member => `
        <tr data-id="${member._id}">
            <td style="width:36px;">
                <span class="drag-handle">☰</span>
            </td>

           <td class="cell-title">
                <div class="member-info">
                    <img
                        src="${member.photo || 'assets/default-avatar.png'}"
                        class="member-avatar">

                    <span>
                        ${member.fullName || member.name} — ${member.role}
                    </span>
                </div>
            </td>

            <td>${member.phone}</td>

            <td>${member.email}</td>

            <td>${formatSince(member.dateOfJoining ||member.joining)}</td>

            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-exec">
                    Edit
                </button>

                <button class="btn btn-danger-outline btn-sm delete-exec">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");



    // Edit

    document.querySelectorAll(".edit-exec").forEach(button => {

        button.addEventListener("click", e => {

            const id = e.target.closest("tr").dataset.id;

            const member = execMembers.find(m => m._id === id);

            openMemberModal(member, "exec");

        });

    });



    // Delete

    document.querySelectorAll(".delete-exec").forEach(button => {

        button.addEventListener("click", e => {

            const id = e.target.closest("tr").dataset.id;

            const member = execMembers.find(m => m._id === id);

            confirmAction(

                `Remove ${member.name} from executive members?`,

                async () => {

                    try {

                        await fetch(`${MEMBER_API}/${id}`, {

                            method: "DELETE"

                        });

                        showToast("Member removed");

                        fetchMembers();

                    }

                    catch(err){

                        console.error(err);

                    }

                }

            );

        });

    });

}
function renderGeneralMembers(filter = '') {
    const filtered = generalMembers.filter(m =>
        (m.fullName || m.name || '').toLowerCase().includes(filter.toLowerCase())
    );
    document.getElementById('generalMembersBody').innerHTML = filtered.map(m => {
        const id = m._id || m.id;
        const name = m.fullName || m.name || 'Member';
        const joining = m.dateOfJoining || m.joining;
        return `
        <tr data-id="${id}">
            <td class="cell-title">
                <div class="member-info">
                    <img src="${m.photo && m.photo.trim() ? m.photo : 'assets/default-avatar.png'}" class="member-avatar">
                    <span>${name}</span>
                </div>
            </td>
            <td>${m.phone || '—'}</td>
            <td>${formatSince(joining)}</td>
            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-general">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-general">Delete</button>
            </td>
        </tr>`;
    }).join('');
    document.getElementById('generalMemberCount').textContent = `General members (${generalMembers.length})`;

    document.querySelectorAll('.edit-general').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.target.closest('tr').dataset.id;
            const member = generalMembers.find(m => (m._id === id || String(m.id) === String(id)));
            openMemberModal(member, 'general');
        });
    });

    document.querySelectorAll('.delete-general').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.target.closest('tr').dataset.id;
            const member = generalMembers.find(m => (m._id === id || String(m.id) === String(id)));
            confirmAction(`Remove ${member ? (member.fullName || member.name) : 'this member'}?`, async () => {
                try {
                    await fetch(`${MEMBER_API}/${id}`, { method: "DELETE" });
                    showToast('Member removed');
                    await fetchMembers();
                } catch(err) {
                    console.error(err);
                }
            });
        });
    });
}

document.getElementById('memberSearch').addEventListener('input', e => {
    renderGeneralMembers(e.target.value);
});

function renderNotices() {
    document.getElementById("noticesTableBody").innerHTML = notices.map(n => `
        <tr data-id="${n._id}">
            <td class="cell-title">${n.title}</td>
            <td>${n.type}</td>
            <td>
                ${n.attachment
                    ? `<a href="${n.attachment}" target="_blank" class="attachment-link">${n.attachment}</a>`
                    : `<span class="no-attachment">— none —</span>`}
            </td>
            <td>${n.publishedDate}</td>
            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-notice">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-notice">Delete</button>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".edit-notice").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.closest("tr").dataset.id;
            openNoticeModal(notices.find(n => n._id === id));
        });
    });

    document.querySelectorAll(".delete-notice").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.closest("tr").dataset.id;

            confirmAction("Delete this notice?", async () => {

                await fetch(`${NOTICE_API}/${id}`, {
                    method: "DELETE"
                });

                await fetchNotices();

                showToast("Notice deleted");
            });
        });
    });
}

/* Opens the uploaded file in a new tab. Real uploads (this session) have a
   live blob URL and open directly; seed/demo entries without a real file
   just get a friendly heads-up. */
function openAttachment(notice) {
    if (!notice || !notice.fileName) return;
    if (notice.fileUrl) {
        window.open(notice.fileUrl, '_blank');
    } else {
        showToast('This is placeholder demo data — upload a file via Edit to preview it');
    }
}

function fileTypeIcon(fileName) {
    return /\.pdf$/i.test(fileName) ? '📄' : '🖼️';
}

function renderAlbums() {
    const cards = albums.map(album => `
        <div class="album-card" data-id="${album._id}">
            <div class="album-thumb">
                ${
                    album.coverImage
                        ? `<img src="${album.coverImage}" alt="${album.title}">`
                        : ""
                }
            </div>

            <div class="album-body">
                <div class="album-title">
                    ${album.title}
                </div>

                <div class="album-meta">
                    ${album.photos.length} photos
                </div>

                <div class="album-actions">
                    <button class="btn btn-outline btn-sm manage-album">
                        Manage
                    </button>

                    <button class="btn btn-outline btn-sm upload-album">
                        + Upload
                    </button>

                    <button class="btn btn-danger-outline btn-sm delete-album">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    document.getElementById("galleryGrid").innerHTML =
        cards +
        `<div class="album-card-create" id="createAlbumCard">+ Create album</div>`;

    document
        .getElementById("createAlbumCard")
        .addEventListener("click", () => openAlbumModal());

    document.querySelectorAll(".manage-album").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.closest(".album-card").dataset.id;
            const album = albums.find(a => a._id === id);
            openManageAlbumModal(album);
        });
    });

    document.querySelectorAll(".upload-album").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.closest(".album-card").dataset.id;
            const album = albums.find(a => a._id === id);
            openUploadToAlbumModal(album);
        });
    });

    document.querySelectorAll(".delete-album").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.closest(".album-card").dataset.id;
            const album = albums.find(a => a._id === id);
            confirmAction(`Delete whole album "${album ? album.title : ''}"?`, async () => {
                try {
                    await fetch(`${GALLERY_API}/${id}`, { method: "DELETE" });
                    showToast("Album deleted");
                    await fetchGallery();
                } catch (err) {
                    console.error(err);
                    showToast("Failed to delete album");
                }
            });
        });
    });
}

function renderAdminUsers() {
    document.getElementById("adminUsersList").innerHTML = adminUsers.map(u => `
        <div class="settings-row" data-id="${u._id}">
            <div class="settings-row-inline" style="display:flex;align-items:center;gap:12px;">
                <img src="${u.photo && u.photo.trim() ? u.photo : 'assets/default-avatar.png'}" class="admin-pfp-avatar" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--color-primary,#116530);flex-shrink:0;" alt="${u.name}">
                <div style="display:flex;flex-direction:column;gap:2px;">
                    <span class="user-name" style="font-weight:700;font-size:0.96rem;color:var(--color-text-dark,#222);">${u.name}</span>
                    <span class="user-email" style="font-size:0.83rem;color:var(--color-text-medium,#555);">${u.email} &bull; ${u.phone || "No phone"}</span>
                </div>
                <span class="role-badge ${u.role === "SUPER ADMIN" ? "super" : "admin"}" style="margin-left:auto;">${u.role}</span>
            </div>

            <div class="settings-row-actions">
                <button class="btn btn-outline btn-sm edit-admin">Edit</button>

                ${u.role === "SUPER ADMIN"
                    ? ""
                    : `<button class="btn btn-danger-outline btn-sm remove-user">Remove</button>`
                }

            </div>
        </div>
    `).join("");

    document.querySelectorAll(".edit-admin").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.closest(".settings-row").dataset.id;
            const user = adminUsers.find(u => u._id === id);
            openAdminUserModal(user);
        });
    });

    document.querySelectorAll(".remove-user").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = e.target.closest(".settings-row").dataset.id;
            const user = adminUsers.find(u => u._id === id);
            confirmAction(`Remove ${user ? user.name : 'this user'}?`, async () => {
                await fetch(`${ADMIN_API}/${id}`, {
                    method: "DELETE"
                });
                await fetchAdmins();
                showToast("User removed");
            });
        });
    });
}

/* ---------- Modal engine ---------- */
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalSaveBtn = document.getElementById('modalSaveBtn');

function openModal(title, bodyHtml, onSave) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalOverlay.classList.add('active');
    modalSaveBtn.onclick = () => {
        if (onSave() !== false) {
            closeModal();
        }
    };
}
function closeModal() { modalOverlay.classList.remove('active'); }

document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

/* ---------- Custom confirm dialog (native confirm() gets blocked in sandboxed previews) ---------- */
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOkBtn = document.getElementById('confirmOkBtn');
let pendingConfirmAction = null;

function confirmAction(message, onConfirm) {
    confirmMessage.textContent = message;
    pendingConfirmAction = onConfirm;
    confirmOverlay.classList.add('active');
}
function closeConfirm() {
    confirmOverlay.classList.remove('active');
    pendingConfirmAction = null;
}
confirmOkBtn.addEventListener('click', () => {
    const action = pendingConfirmAction;
    closeConfirm();
    if (action) action();
});
document.getElementById('confirmCancelBtn').addEventListener('click', closeConfirm);
confirmOverlay.addEventListener('click', e => { if (e.target === confirmOverlay) closeConfirm(); });

function fieldHtml(label, id, value = '', type = 'text') {
    return `<div class="form-group"><label>${label}</label><input type="${type}" class="form-input" id="${id}" value="${value}"></div>`;
}

/* Add / edit project */
function openProjectModal(existing) {
    console.log("Modal opened");
console.log(existing);
    const isEdit = !!existing;

    openModal(
        isEdit ? "Edit project" : "Add project",
        `
        ${fieldHtml('Title', 'f_title', existing ? existing.title : '')}

        <div class="form-group">
            <label>Description</label>
            <textarea class="form-input" id="f_description">${
                existing ? (existing.description || "") : ""
            }</textarea>
        </div>

        <div class="form-group">
            <label>Status</label>
            <select class="form-input" id="f_status">
                <option ${existing && existing.status === "Active" ? "selected" : ""}>Active</option>
                <option ${existing && existing.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>
        </div>

        <div class="form-group"><label>Progress %</label><input type="number" min="0" max="100" class="form-input" id="f_progress" value="${Math.min(100, Math.max(0, existing ? (existing.progress || 0) : 0))}"></div>
        ${fieldHtml('Target', 'f_target', existing ? existing.target : '')}
        `,
        () => {
            const title = document.getElementById("f_title").value.trim() || "Untitled project";
            const description = document.getElementById("f_description").value.trim();
            const status = document.getElementById("f_status").value;
            const rawProgressVal = document.getElementById("f_progress").value;
            const rawProgress = Number(rawProgressVal);

            if (isNaN(rawProgress) || rawProgress > 100 || rawProgress < 0) {
                alert("Progress percentage must be less than or equal to 100%");
                showToast("Progress percentage cannot exceed 100%");
                return false;
            }

            const progress = Math.min(100, Math.max(0, rawProgress));
            const target = document.getElementById("f_target").value.trim() || "TBD";

            if (isEdit) {
console.log("Saving...");
console.log(existing);
              fetch(`${API_URL}/${existing._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            description,
            status,
            progress,
            target
        })
    })
    .then(res => res.json())
    .then(() => {
        showToast("Project updated");
        fetchProjects();
    })
    .catch(err => console.error(err));


            } else {

                fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        status,
                        progress,
                        target
                    })
                })
                .then(res => res.json())
                .then(() => {
                    showToast("Project Added");
                    fetchProjects();
                });

            }

        }
    );

    const fProgressInput = document.getElementById("f_progress");
    if (fProgressInput) {
        fProgressInput.addEventListener("input", function () {
            if (Number(this.value) > 100) {
                alert("Progress percentage cannot exceed 100%");
                showToast("Progress percentage capped at 100%");
                this.value = 100;
            }
        });
    }
}
document.getElementById('addProjectBtnDash').addEventListener('click', () => openProjectModal(null));
document.getElementById('addProjectBtn').addEventListener('click', () => openProjectModal(null));

/* Add / edit member (exec or general) */
function openMemberModal(existing, kind) {
    const isEdit = !!existing;
    const todayIso = new Date().toISOString().slice(0, 10);
    const defaultCategory = existing
        ? (existing.memberType || 'EXECUTIVE')
        : (kind === 'general' ? 'GENERAL' : 'EXECUTIVE');

    openModal(
        isEdit ? "Edit member" : "Add member",
        `
        <div class="form-group">
            <label>Member Category / Type</label>
            <select class="form-input" id="m_memberType">
                <option value="EXECUTIVE" ${defaultCategory === 'EXECUTIVE' ? 'selected' : ''}>Executive Member</option>
                <option value="GENERAL" ${defaultCategory === 'GENERAL' ? 'selected' : ''}>General Member</option>
            </select>
        </div>
        ${fieldHtml("Full name", "m_name", existing ? (existing.fullName || existing.name || "") : "")}
        <div class="form-group">
            <label>Profile Picture</label>
            <input type="file" id="m_photo" class="form-input" accept="image/*">
        </div>
        ${fieldHtml("Role / Designation", "m_role", existing && existing.role ? existing.role : "")}
        ${fieldHtml("Phone", "m_phone", existing ? existing.phone : "")}
        ${fieldHtml("Email", "m_email", existing ? (existing.email || "") : "")}
        ${fieldHtml("Date of joining", "m_joining", existing && (existing.dateOfJoining || existing.joining) ? (existing.dateOfJoining || existing.joining).toString().slice(0,10) : todayIso, "date")}
        <div class="form-group">
            <label>About Me</label>
            <textarea class="form-input" id="m_about" rows="4">${existing ? (existing.about || '') : ''}</textarea>
        </div>
        ${fieldHtml("Responsibilities (comma-separated)", "m_responsibilities", existing && existing.responsibilities ? (Array.isArray(existing.responsibilities) ? existing.responsibilities.join(', ') : existing.responsibilities) : "")}
        `,
        async () => {
            const memberType = document.getElementById("m_memberType").value;
            const name = document.getElementById("m_name").value.trim() || "Unnamed member";
            let role = document.getElementById("m_role").value.trim();
            if (!role) {
                role = memberType === "GENERAL" ? "General Member" : "Executive Member";
            }
            const phone = document.getElementById("m_phone").value.trim() || "—";
            const joining = document.getElementById("m_joining").value || todayIso;
            const email = document.getElementById("m_email").value.trim() || "—";
            const about = document.getElementById("m_about").value.trim();
            const responsibilitiesRaw = document.getElementById("m_responsibilities").value.trim();
            const responsibilities = responsibilitiesRaw
                ? responsibilitiesRaw.split(',').map(item => item.trim()).filter(Boolean)
                : [];
            const photoInput = document.getElementById("m_photo");

            let photo = existing?.photo || "";
            if (photoInput && photoInput.files.length) {
                photo = await fileToDataUrl(photoInput.files[0]);
            }

            const payload = {
                fullName: name,
                name: name,
                role,
                phone,
                email,
                dateOfJoining: joining,
                joining,
                photo,
                memberType,
                about,
                responsibilities
            };

            try {
                const targetId = existing ? (existing._id || existing.id) : null;
                if (isEdit && targetId) {
                    await fetch(`${MEMBER_API}/${targetId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    showToast("Member updated");
                } else {
                    await fetch(MEMBER_API, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    showToast("Member added");
                }
                await fetchMembers();
            } catch (err) {
                console.error(err);
                showToast("Failed to save member");
            }
        }
    );
}

document.getElementById("addMemberBtn").addEventListener("click", () => openMemberModal(null, "new"));

/* Add / edit notice */
function openNoticeModal(existing) {

    const isEdit = !!existing;

    openModal(isEdit ? "Edit notice" : "Publish notice", `
        ${fieldHtml("Title", "n_title", existing ? existing.title : "")}

        <div class="form-group">
            <label>Type</label>
            <select class="form-input" id="n_type">
                <option ${existing && existing.type === "Notice" ? "selected" : ""}>Notice</option>
                <option ${existing && existing.type === "Event" ? "selected" : ""}>Event</option>
            </select>
        </div>

        <div class="form-group">
            <label>Description</label>
            <textarea class="form-input" id="n_description">${existing ? existing.description || "" : ""}</textarea>
        </div>

        <div class="form-group">
            <label>Attachment</label>
            <input type="file" class="form-input" id="n_file" accept="image/*,.pdf">
        </div>

    `, async () => {

        const title = document.getElementById("n_title").value.trim();
        const type = document.getElementById("n_type").value;
        const description = document.getElementById("n_description").value.trim();

        const fileInput = document.getElementById("n_file");

        let attachment = existing ? existing.attachment : "";

        if (fileInput.files.length) {
            attachment = fileInput.files[0].name;
        }

        const noticeData = {
            title,
            type,
            description,
            attachment,
            publishedDate: existing
                ? existing.publishedDate
                : new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                })
        };

        try {

            if (isEdit) {

                await fetch(`${NOTICE_API}/${existing._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(noticeData)
                });

                showToast("Notice updated");

            } else {

                await fetch(NOTICE_API, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(noticeData)
                });

                showToast("Notice published");

            }

            await fetchNotices();

        } catch (err) {
            console.error(err);
            showToast("Failed to save notice");
        }

    });

}

document.getElementById('addNoticeBtn').addEventListener('click', () => openNoticeModal(null));

/* Create album (with optional initial files) */
function openAlbumModal(existing) {

    const isEdit = !!existing;

    openModal(

        isEdit ? "Edit Album" : "Create Album",

        `
        ${fieldHtml(
            "Album name",
            "a_name",
            existing ? existing.title : ""
        )}

        <div class="form-group">
            <label>Cover Image URL (optional)</label>
            <input
                type="text"
                class="form-input"
                id="a_cover"
                value="${existing ? (existing.coverImage || "") : ""}"
            >
        </div>
        `,

        async () => {

            const title =
                document.getElementById("a_name").value.trim() ||
                "Untitled Album";

            const coverImage =
                document.getElementById("a_cover").value.trim();

            try {

                if (isEdit) {

                    await fetch(`${GALLERY_API}/${existing._id}`, {

                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            title,

                            coverImage,

                            photos: existing.photos

                        })

                    });

                    showToast("Album updated");

                }

                else {

                    await fetch(GALLERY_API, {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            title,

                            coverImage,

                            photos: []

                        })

                    });

                    showToast("Album created");

                }

                fetchGallery();

            }

            catch (err) {

                console.error(err);

            }

        }

    );

}
document.getElementById('addAlbumBtn').addEventListener('click', openAlbumModal);

/* Manage album — view / remove existing files */
function openManageAlbumModal(album) {

    if (!album) return;

    const listHtml = album.photos.length

        ? album.photos.map((photo, i) => `
            <div class="file-list-item" data-index="${i}">
                <span class="file-list-name">📄 ${photo}</span>
                <button type="button" class="btn btn-danger-outline btn-sm remove-file">
                    Remove
                </button>
            </div>
        `).join("")

        : `<p style="font-size:0.88rem;color:var(--color-text-light);">
                No files in this album yet.
           </p>`;



    openModal(`Manage — ${album.title}`, `

        ${fieldHtml("Album name", "am_name", album.title)}

        <div class="form-group">
            <label>Files (${album.photos.length})</label>
            <div class="file-list" id="am_fileList">
                ${listHtml}
            </div>
        </div>

        <div style="margin-top:20px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:flex-end;">
            <button type="button" class="btn btn-danger-outline btn-sm" id="deleteWholeAlbumModalBtn">Delete Whole Album</button>
        </div>
    `,

    async () => {

        try {

            await fetch(`${GALLERY_API}/${album._id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: document.getElementById("am_name").value.trim(),

                    coverImage: album.coverImage,

                    photos: album.photos

                })

            });

            await fetchGallery();

            showToast("Album updated");

        }

        catch (err) {

            console.error(err);

        }

    });



    document.querySelectorAll(".remove-file").forEach(btn => {
        btn.addEventListener("click", async e => {
            const idx = Number(
                e.target.closest(".file-list-item").dataset.index
            );

            album.photos.splice(idx, 1);

            try {
                await fetch(`${GALLERY_API}/${album._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: album.title,
                        coverImage: album.coverImage,
                        photos: album.photos
                    })
                });

                openManageAlbumModal(album);
                await fetchGallery();
            }
            catch (err) {
                console.error(err);
            }
        });
    });

    const deleteBtn = document.getElementById("deleteWholeAlbumModalBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            confirmAction(`Delete whole album "${album.title}"?`, async () => {
                try {
                    await fetch(`${GALLERY_API}/${album._id}`, { method: "DELETE" });
                    closeModal();
                    showToast("Album deleted");
                    await fetchGallery();
                } catch (err) {
                    console.error(err);
                    showToast("Failed to delete album");
                }
            });
        });
    }
}

/* Upload more files into an existing album */
function openUploadToAlbumModal(album) {

    if (!album) return;

    openModal(`Upload to — ${album.title}`, `

        <div class="form-group">

            <label>Select photos / PDFs</label>

            <input
                type="file"
                class="form-input"
                id="u_files"
                accept="image/*,.pdf"
                multiple>

        </div>

    `, async () => {

        const fileInput = document.getElementById("u_files");

        const newFiles = Array.from(fileInput.files).map(file => file.name);

        if (!newFiles.length) {

            showToast("No files selected");

            return;

        }

        try {

            const response = await fetch(`${GALLERY_API}/${album._id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: album.title,

                    coverImage: album.coverImage,

                    photos: [...album.photos, ...newFiles]

                })

            });

            if (!response.ok) {

                throw new Error("Failed to upload files");

            }

            await fetchGallery();

            showToast(`${newFiles.length} file(s) uploaded`);

        }

        catch (err) {

            console.error(err);

            showToast("Upload failed");

        }

    });

}

/* Add / edit admin user */
function openAdminUserModal(existing) {
    const isEdit = !!existing;

    openModal(
        isEdit ? "Edit admin user" : "Add admin user",
        `
        ${fieldHtml("Full name", "a_name", existing ? existing.name : "")}
        ${fieldHtml("Email", "a_email", existing ? existing.email : "")}
        ${fieldHtml("Phone", "a_phone", existing ? (existing.phone || "") : "")}
        <div class="form-group">
            <label>Profile Picture (PFP)</label>
            <input type="file" class="form-input" id="u_photo" accept="image/*">
            <div id="u_photoPreview" style="margin-top:8px;display:${existing && existing.photo ? 'block' : 'none'};">
                <img id="u_photoPreviewImg" src="${existing ? (existing.photo || "") : ""}" alt="PFP" style="width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid var(--color-primary,#116530);">
            </div>
        </div>
        ${fieldHtml(isEdit ? "Password (leave blank to keep current)" : "Password", "a_password", "", "password")}
        <div class="form-group">
            <label>Role</label>
            <select class="form-input" id="a_role">
                <option value="ADMIN" ${existing && existing.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
                <option value="SUPER ADMIN" ${existing && existing.role === "SUPER ADMIN" ? "selected" : ""}>SUPER ADMIN</option>
            </select>
        </div>
        <div class="form-group">
            <label>About Me</label>
            <textarea class="form-input" id="a_about" rows="4">${existing ? (existing.about || '') : ''}</textarea>
        </div>
        ${fieldHtml("Responsibilities (comma-separated)", "a_responsibilities", existing && existing.responsibilities ? (Array.isArray(existing.responsibilities) ? existing.responsibilities.join(', ') : existing.responsibilities) : "")}
        `,
        async () => {
            const name = document.getElementById("a_name").value.trim();
            const email = document.getElementById("a_email").value.trim();
            const phone = document.getElementById("a_phone").value.trim();
            const password = document.getElementById("a_password").value;
            const role = document.getElementById("a_role").value;
            const about = document.getElementById("a_about").value.trim();
            const responsibilitiesRaw = document.getElementById("a_responsibilities").value.trim();
            const responsibilities = responsibilitiesRaw
                ? responsibilitiesRaw.split(',').map(item => item.trim()).filter(Boolean)
                : [];
            const photoInput = document.getElementById("u_photo");

            if (!name || !email) {
                alert("Name and email are required.");
                return false;
            }
            if (!isEdit && !password) {
                alert("Password is required for new admin.");
                return false;
            }

            let photo = existing?.photo || "";
            if (photoInput && photoInput.files.length) {
                photo = await fileToDataUrl(photoInput.files[0]);
            }

            const payload = { name, email, phone, role, photo, about, responsibilities };
            if (password) payload.password = password;

            try {
                const targetUrl = isEdit ? `${ADMIN_API}/${existing._id}` : ADMIN_API;
                const method = isEdit ? "PUT" : "POST";

                const res = await fetch(targetUrl, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (!res.ok) {
                    showToast(data.message || "Failed to save user");
                    return false;
                }

                await fetchAdmins();
                showToast(isEdit ? "User updated" : "User added");
            } catch (err) {
                console.error(err);
                showToast("Failed to save user");
                return false;
            }
        }
    );

    const photoInput = document.getElementById("u_photo");
    if (photoInput) {
        photoInput.addEventListener("change", function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewContainer = document.getElementById("u_photoPreview");
                const previewImg = document.getElementById("u_photoPreviewImg");
                if (previewImg) previewImg.src = e.target.result;
                if (previewContainer) previewContainer.style.display = "block";
            };
            reader.readAsDataURL(file);
        });
    }
}

if (document.getElementById("addUserBtn")) {
    document.getElementById("addUserBtn").addEventListener("click", () => openAdminUserModal(null));
}

/* ---------- Donation details: data + summary card + edit popup ---------- */
let pendingQrUrl = ''; // set while the popup is open, committed to donationDetails on Save
 
function donationRow(label, value, fullRow) {
    const rowClass = fullRow ? 'donation-summary-row full-row' : 'donation-summary-row';
    return `<div class="${rowClass}"><dt>${label}</dt><dd>${value && value.trim() ? value : '<span class="donation-summary-empty">Not set</span>'}</dd></div>`;
}

function renderDonationSummary() {
    const qrBox = document.getElementById("donationSummaryQr");
    const qrUrl = donationDetails.qrCodeUrl || donationDetails.qrImage;
    if (qrBox) {
        if (qrUrl) {
            qrBox.innerHTML = `<img src="${qrUrl}" alt="Donation QR" title="Click to enlarge" style="cursor:pointer;" id="donationQrThumb">`;
            const thumb = document.getElementById('donationQrThumb');
            if (thumb) {
                thumb.addEventListener('click', () => openQrLightbox(qrUrl));
            }
        } else {
            qrBox.innerHTML = '<div style="color:#aaa;font-size:0.9rem;padding:20px;text-align:center;">No QR code set</div>';
        }
    }

    const listEl = document.getElementById("donationSummaryList");
    if (listEl) {
        listEl.innerHTML = [
            donationRow("Account Name", donationDetails.accountName),
            donationRow("Account Number", donationDetails.accountNumber),
            donationRow("IFSC Code", donationDetails.ifscCode || donationDetails.ifsc)
        ].join("");
    }
}

function openQrLightbox(src) {
    const overlay = document.getElementById('qrLightboxOverlay');
    const img = document.getElementById('qrLightboxImg');
    const caption = document.getElementById('qrLightboxCaption');
    if (!overlay || !img) return;
    img.src = src;
    if (caption) caption.textContent = 'Scan to donate';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeQrLightbox() {
    const overlay = document.getElementById('qrLightboxOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openDonationModal() {
    const accName = document.getElementById("accountName");
    const accNum = document.getElementById("accountNumber");
    const ifsc = document.getElementById("ifscCode");
    const qrFile = document.getElementById("qrCodeFile");
    const qrPreview = document.getElementById("qrUploadPreview");

    if (accName) accName.value = donationDetails.accountName || "";
    if (accNum) accNum.value = donationDetails.accountNumber || "";
    if (ifsc) ifsc.value = donationDetails.ifscCode || donationDetails.ifsc || "";

    pendingQrUrl = donationDetails.qrCodeUrl || donationDetails.qrImage || "";
    if (qrFile) qrFile.value = "";
    if (qrPreview) {
        const previewImg = document.getElementById("qrPreviewImg");
        if (pendingQrUrl && previewImg) {
            previewImg.src = pendingQrUrl;
            qrPreview.style.display = "block";
        } else {
            qrPreview.style.display = "none";
        }
    }

    const overlay = document.getElementById("donationModalOverlay");
    if (overlay) overlay.classList.add("active");
}

// File upload preview
const qrFileInput = document.getElementById('qrCodeFile');
if (qrFileInput) {
    qrFileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('qrUploadPreview');
            const previewImg = document.getElementById('qrPreviewImg');
            if (previewImg) previewImg.src = e.target.result;
            if (preview) preview.style.display = 'block';
            pendingQrUrl = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function closeDonationModal() {
    const overlay = document.getElementById('donationModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

if (document.getElementById('qrLightboxCloseBtn')) {
    document.getElementById('qrLightboxCloseBtn').addEventListener('click', closeQrLightbox);
}
if (document.getElementById('qrLightboxOverlay')) {
    document.getElementById('qrLightboxOverlay').addEventListener('click', e => {
        if (e.target.id === 'qrLightboxOverlay') closeQrLightbox();
    });
}

if (document.getElementById('editDonationBtn')) {
    document.getElementById('editDonationBtn').addEventListener('click', openDonationModal);
}
if (document.getElementById('donationModalCloseBtn')) {
    document.getElementById('donationModalCloseBtn').addEventListener('click', closeDonationModal);
}
if (document.getElementById('donationModalCancelBtn')) {
    document.getElementById('donationModalCancelBtn').addEventListener('click', closeDonationModal);
}
if (document.getElementById('donationModalOverlay')) {
    document.getElementById('donationModalOverlay').addEventListener('click', e => {
        if (e.target.id === 'donationModalOverlay') closeDonationModal();
    });
}

if (document.getElementById("saveDonationBtn")) {
    document.getElementById("saveDonationBtn").addEventListener("click", async () => {
        const accName = document.getElementById("accountName");
        const accNum = document.getElementById("accountNumber");
        const ifsc = document.getElementById("ifscCode");

        const data = {
            accountName: accName ? accName.value.trim() : "",
            accountNumber: accNum ? accNum.value.trim() : "",
            ifscCode: ifsc ? ifsc.value.trim() : "",
            qrCodeUrl: pendingQrUrl || donationDetails.qrCodeUrl || donationDetails.qrImage || ""
        };

        try {
            const response = await fetch(DONATION_API, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error("Failed to save donation details");

            donationDetails = await response.json();
            renderDonationSummary();
            closeDonationModal();
            showToast("Donation details saved successfully");
        } catch (err) {
            console.error(err);
            showToast("Failed to save donation details");
        }
    });
}

/* ---------- Init ---------- */
async function fetchProjects() {
    try {
        const response = await fetch(API_URL);
        projects = await response.json();

        renderProjects();

    } catch (err) {
        console.error(err);
    }
}

function getMemberCategory(m) {
    if (m && m.memberType) {
        return m.memberType.toUpperCase();
    }
    if (m && m.type) {
        return m.type.toUpperCase();
    }
    const roleStr = (m?.role || '').toLowerCase();
    if (roleStr.includes('general') || roleStr === 'member') {
        return 'GENERAL';
    }
    return 'EXECUTIVE';
}

async function fetchMembers() {
    try {
        const response = await fetch(MEMBER_API);
        if (!response.ok) throw new Error("Failed to fetch members");
        const allMembers = await response.json();
        execMembers = allMembers.filter(m => getMemberCategory(m) === 'EXECUTIVE');
        generalMembers = allMembers.filter(m => getMemberCategory(m) === 'GENERAL');
        renderExecMembers();
        const searchInput = document.getElementById('memberSearch');
        renderGeneralMembers(searchInput ? searchInput.value : '');
    } catch (err) {
        console.error(err);
    }
}

async function fetchGallery() {
    try {

        const response = await fetch(GALLERY_API);

        albums = await response.json();

        console.log(albums);

        renderAlbums();

    } catch (err) {

        console.error(err);

    }
}

async function fetchDonation() {

    try {

        const response = await fetch(DONATION_API);

        donationDetails = await response.json();

        if (!donationDetails) {

            donationDetails = {};

        }

        renderDonationSummary();

    }

    catch (err) {

        console.error(err);

    }

}

async function fetchNotices() {
    try {
        const res = await fetch(NOTICE_API);
        notices = await res.json();
        renderNotices();
    } catch (err) {
        console.error(err);
        showToast("Failed to load notices");
    }
}

async function fetchAdmins() {
    try {

        const res = await fetch(ADMIN_API);

        adminUsers = await res.json();

        renderAdminUsers();

    } catch (err) {

        console.error(err);
        showToast("Failed to load admin users");

    }
}

fetchProjects();
console.log("fetchMembers called");
fetchMembers();
console.log("fetchMembers called");
renderGeneralMembers();
console.log("fetchMembers called");
fetchNotices();
console.log("fetchMembers called");
fetchGallery();
console.log("fetchMembers called");
fetchAdmins();
console.log("fetchMembers called");
fetchDonation();
console.log("fetchMembers called");