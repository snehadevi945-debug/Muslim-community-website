
/* ==========================================================
   Committee Admin Panel — vanilla JS, no framework
   Data is kept in-memory (mirrors the screenshots' content).
   ========================================================== */

/* ---------- Sample data ---------- */
let projects = [];
const API_URL = "http://localhost:3000/api/projects";
const MEMBER_API = "http://localhost:3000/api/members";
const GALLERY_API = "http://localhost:3000/api/gallery";

let execMembers = [];


let generalMembers = [
    { id: 1, name: "Iqbal Hussain", phone: "+91 98111 22334", joining: "2018-03-01" },
    { id: 2, name: "Ayesha Begum", phone: "+91 99220 11445", joining: "2021-07-01" },
];

let notices = [
    { id: 1, title: "Ramzan taraweeh schedule", description: "Daily taraweeh prayer timings for the month of Ramzan, updated weekly based on moon sighting.", fileName: "taraweeh_schedule.pdf", fileUrl: "", type: "Notice", published: "12 Jul 2026" },
    { id: 2, title: "Raksha Bandhan Langar", description: "Community langar organised on the occasion of Raksha Bandhan, open to all members and neighbours.", fileName: "", fileUrl: "", type: "Event", published: "05 Jul 2026" },
    { id: 3, title: "AGM notice", description: "Annual General Meeting notice with agenda items for review of accounts and elections.", fileName: "agm_notice.pdf", fileUrl: "", type: "Notice", published: "02 Jul 2026" },
];
let albums = [];

let adminUsers = [
    { id: 1, name: "Abdul Rahman Khan", email: "president@…org", role: "SUPER ADMIN", locked: true },
    { id: 2, name: "Imran Siddiqui", email: "secretary@…org", role: "ADMIN", locked: false },
];

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
    const rowsHtml = projects.map(p => `
        <tr data-id="${p.id}">
            <td class="cell-title">${p.title}</td>
            <td><span class="status-pill ${statusClass(p.status)}">${p.status}</span></td>
            <td>${p.progress}%</td>
            <td>${p.target}</td>
            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-project">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-project">Delete</button>
            </td>
        </tr>`).join('');
    document.getElementById('projectsTableBody').innerHTML = rowsHtml;
    document.getElementById('projectsTableBody2').innerHTML = rowsHtml;

    document.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            confirmAction('Delete this project? This cannot be undone.', () => {
                projects = projects.filter(p => p.id !== id);
                renderProjects();
                showToast('Project deleted');
            });
        });
    });
    document.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            openProjectModal(projects.find(p => p.id === id));
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
                ${member.fullName || member.name} — ${member.role}
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
        m.name.toLowerCase().includes(filter.toLowerCase())
    );
    document.getElementById('generalMembersBody').innerHTML = filtered.map(m => `
        <tr data-id="${m.id}">
            <td class="cell-title">${m.name}</td>
            <td>${m.phone}</td>
            <td>${formatSince(m.joining)}</td>
            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-general">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-general">Delete</button>
            </td>
        </tr>`).join('');
    document.getElementById('generalMemberCount').textContent = `General members (${generalMembers.length})`;

    document.querySelectorAll('.edit-general').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            openMemberModal(generalMembers.find(m => m.id === id), 'general');
        });
    });

    document.querySelectorAll('.delete-general').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            const member = generalMembers.find(m => m.id === id);
            confirmAction(`Remove ${member ? member.name : 'this member'}?`, () => {
                generalMembers = generalMembers.filter(m => m.id !== id);
                renderGeneralMembers(document.getElementById('memberSearch').value);
                showToast('Member removed');
            });
        });
    });
}

document.getElementById('memberSearch').addEventListener('input', e => {
    renderGeneralMembers(e.target.value);
});

function renderNotices() {
    document.getElementById('noticesTableBody').innerHTML = notices.map(n => `
        <tr data-id="${n.id}">
            <td class="cell-title">${n.title}</td>
            <td>${n.type}</td>
            <td>
                ${n.fileName
                    ? `<button type="button" class="attachment-link open-attachment" title="Open ${n.fileName}">${fileTypeIcon(n.fileName)} ${n.fileName}</button>`
                    : `<span class="no-attachment">— none —</span>`}
            </td>
            <td>${n.published}</td>
            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-notice">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-notice">Delete</button>
            </td>
        </tr>`).join('');

    document.querySelectorAll('.open-attachment').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            const notice = notices.find(n => n.id === id);
            openAttachment(notice);
        });
    });

    document.querySelectorAll('.edit-notice').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            openNoticeModal(notices.find(n => n.id === id));
        });
    });

    document.querySelectorAll('.delete-notice').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            const notice = notices.find(n => n.id === id);
            confirmAction(`Delete "${notice ? notice.title : 'this notice'}"? This cannot be undone.`, () => {
                if (notice && notice.fileUrl) URL.revokeObjectURL(notice.fileUrl);
                notices = notices.filter(n => n.id !== id);
                renderNotices();
                showToast('Notice deleted');
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

}

function renderAdminUsers() {
    document.getElementById('adminUsersList').innerHTML = adminUsers.map(u => `
        <div class="settings-row" data-id="${u.id}">
            <div class="settings-row-inline">
                <span class="user-name">${u.name}</span>
                <span class="user-email">${u.email}</span>
                <span class="role-badge ${u.role === 'SUPER ADMIN' ? 'super' : 'admin'}">${u.role}</span>
            </div>
            <div class="settings-row-actions">
                <button class="btn btn-outline btn-sm">Edit</button>
                ${u.locked ? '' : '<button class="btn btn-danger-outline btn-sm remove-user">Remove</button>'}
            </div>
        </div>`).join('');

    document.querySelectorAll('.remove-user').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('.settings-row').dataset.id);
            const user = adminUsers.find(u => u.id === id);
            confirmAction(`Remove ${user ? user.name : 'this user'} from admin users?`, () => {
                adminUsers = adminUsers.filter(u => u.id !== id);
                renderAdminUsers();
                showToast('User removed');
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
        onSave();
        closeModal();
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

        ${fieldHtml('Progress %', 'f_progress', existing ? existing.progress : 0, 'number')}
        ${fieldHtml('Target', 'f_target', existing ? existing.target : '')}
        `,
        () => {

            const title = document.getElementById("f_title").value.trim() || "Untitled project";
            const description = document.getElementById("f_description").value.trim();
            const status = document.getElementById("f_status").value;
            const progress = Number(document.getElementById("f_progress").value) || 0;
            const target = document.getElementById("f_target").value.trim() || "TBD";

            if (isEdit) {

                Object.assign(existing, {
                    title,
                    description,
                    status,
                    progress,
                    target
                });

                showToast("Project updated");

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
}
document.getElementById('addProjectBtnDash').addEventListener('click', () => openProjectModal(null));
document.getElementById('addProjectBtn').addEventListener('click', () => openProjectModal(null));

/* Add / edit member (exec or general) */
function openMemberModal(existing, kind) {

    const isEdit = !!existing;
    const todayIso = new Date().toISOString().slice(0, 10);

    openModal(
        isEdit ? "Edit member" : "Add member",

        `
        ${fieldHtml("Full name", "m_name", existing ? existing.name : "")}
        ${fieldHtml("Role (leave blank for general member)", "m_role", existing && existing.role ? existing.role : "")}
        ${fieldHtml("Phone", "m_phone", existing ? existing.phone : "")}
        ${kind !== "general" ? fieldHtml("Email", "m_email", existing ? existing.email : "") : ""}
        ${fieldHtml("Date of joining", "m_joining", existing && existing.joining ? existing.joining.slice(0,10) : todayIso, "date")}
        `,

        async () => {

            const name = document.getElementById("m_name").value.trim() || "Unnamed member";
            const role = document.getElementById("m_role").value.trim();
            const phone = document.getElementById("m_phone").value.trim() || "—";
            const joining = document.getElementById("m_joining").value || todayIso;

            const emailField = document.getElementById("m_email");

            const email = emailField
                ? emailField.value.trim() || "—"
                : existing
                    ? existing.email
                    : "—";



            // ===========================
            // EXECUTIVE MEMBERS (DATABASE)
            // ===========================

            if (kind === "exec" || role) {

                try {

                    if (isEdit) {

                        await fetch(`${MEMBER_API}/${existing._id}`, {

                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                role,
                                phone,
                                email,
                                joining
                            })

                        });

                        showToast("Member updated");

                    } else {

                        await fetch(MEMBER_API, {

                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                role,
                                phone,
                                email,
                                joining
                            })

                        });

                        showToast("Member added");

                    }

                    fetchMembers();

                }
                catch (err) {

                    console.error(err);

                }

            }

            // ===========================
            // GENERAL MEMBERS (LOCAL)
            // ===========================

            else {

                if (isEdit) {

                    Object.assign(existing, {
                        name,
                        phone,
                        joining
                    });

                    renderGeneralMembers(document.getElementById("memberSearch").value);

                    showToast("Member updated");

                } else {

                    generalMembers.push({
                        id: uid(generalMembers),
                        name,
                        phone,
                        joining
                    });

                    renderGeneralMembers();

                    showToast("Member added");

                }

            }

        }

    );

}

document.getElementById("addMemberBtn").addEventListener("click", () => openMemberModal(null, "new"));

/* Add / edit notice */
function openNoticeModal(existing) {
    const isEdit = !!existing;
    openModal(isEdit ? 'Edit notice' : 'Publish notice', `
        ${fieldHtml('Title', 'n_title', existing ? existing.title : '')}
        <div class="form-group">
            <label>Type</label>
            <select class="form-input" id="n_type">
                <option ${existing && existing.type === 'Notice' ? 'selected' : ''}>Notice</option>
                <option ${existing && existing.type === 'Event' ? 'selected' : ''}>Event</option>
            </select>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="form-input" id="n_description" placeholder="Write the notice details here…">${existing ? existing.description || '' : ''}</textarea>
        </div>
        <div class="form-group">
            <label>Attach file (image or PDF)</label>
            <input type="file" class="form-input" id="n_file" accept="image/*,.pdf">
            ${existing && existing.fileName ? `<div class="existing-file-note">Current file: ${existing.fileName}${existing.fileUrl ? ' (click the attachment chip in the table to open it)' : ' — demo data, no live preview'}</div>` : ''}
        </div>
    `, () => {
        const title = document.getElementById('n_title').value.trim() || 'Untitled notice';
        const type = document.getElementById('n_type').value;
        const description = document.getElementById('n_description').value.trim();
        const fileInput = document.getElementById('n_file');
        const newFile = fileInput.files.length ? fileInput.files[0] : null;

        let fileName = existing ? existing.fileName : '';
        let fileUrl = existing ? existing.fileUrl : '';

        if (newFile) {
            // Release the previous blob URL (if any) before creating a new one
            if (existing && existing.fileUrl) URL.revokeObjectURL(existing.fileUrl);
            fileName = newFile.name;
            fileUrl = URL.createObjectURL(newFile);
        }

        if (isEdit) {
            Object.assign(existing, { title, type, description, fileName, fileUrl });
            showToast('Notice updated');
        } else {
            notices.unshift({
                id: uid(notices), title, type, description, fileName, fileUrl,
                published: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            });
            showToast('Notice published');
        }
        renderNotices();
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

/* Add admin user */
document.getElementById('addUserBtn').addEventListener('click', () => {
    openModal('Add admin user', `
        ${fieldHtml('Full name', 'u_name')}
        ${fieldHtml('Email', 'u_email')}
        <div class="form-group">
            <label>Role</label>
            <select class="form-input" id="u_role">
                <option>ADMIN</option>
                <option>SUPER ADMIN</option>
            </select>
        </div>
    `, () => {
        const name = document.getElementById('u_name').value.trim() || 'Unnamed user';
        const email = document.getElementById('u_email').value.trim() || '—';
        const role = document.getElementById('u_role').value;
        adminUsers.push({ id: uid(adminUsers), name, email, role, locked: false });
        renderAdminUsers();
        showToast('User added');
    });
});

/* ---------- Donation details: data + summary card + edit popup ---------- */
let donationDetails = {
    qrUrl: '',
    upiId: 'masjidcommittee@upi',
    mobile: '+91 98765 43210',
    accountName: 'Community Masjid Welfare Trust',
    accountNumber: '1234567890123',
    ifsc: 'SBIN0001234'
};
let pendingQrUrl = ''; // set while the popup is open, committed to donationDetails on Save

function donationRow(label, value) {
    return `<div class="donation-summary-row"><dt>${label}</dt><dd>${value && value.trim() ? value : '<span class="donation-summary-empty">Not set</span>'}</dd></div>`;
}

function renderDonationSummary() {
    const qrBox = document.getElementById('donationSummaryQr');
    qrBox.innerHTML = donationDetails.qrUrl ? `<img src="${donationDetails.qrUrl}" alt="Donation QR code">` : '';

    document.getElementById('donationSummaryList').innerHTML = [
        donationRow('UPI ID', donationDetails.upiId),
        donationRow('Mobile number', donationDetails.mobile),
        donationRow('Account name', donationDetails.accountName),
        donationRow('Account number', donationDetails.accountNumber),
        donationRow('IFSC', donationDetails.ifsc),
    ].join('');
}

function openDonationModal() {
    // Pre-fill the popup form with the currently saved details
    document.getElementById('upiId').value = donationDetails.upiId;
    document.getElementById('mobileNumber').value = donationDetails.mobile;
    document.getElementById('accountName').value = donationDetails.accountName;
    document.getElementById('accountNumber').value = donationDetails.accountNumber;
    document.getElementById('ifscCode').value = donationDetails.ifsc;

    pendingQrUrl = donationDetails.qrUrl;
    const qrPreview = document.getElementById('qrPreviewLeft');
    qrPreview.innerHTML = donationDetails.qrUrl ? `<img src="${donationDetails.qrUrl}" alt="Donation QR code">` : '';

    document.getElementById('donationModalOverlay').classList.add('active');
}
function closeDonationModal() {
    document.getElementById('donationModalOverlay').classList.remove('active');
}

document.getElementById('editDonationBtn').addEventListener('click', openDonationModal);
document.getElementById('donationModalCloseBtn').addEventListener('click', closeDonationModal);
document.getElementById('donationModalCancelBtn').addEventListener('click', closeDonationModal);
document.getElementById('donationModalOverlay').addEventListener('click', e => {
    if (e.target.id === 'donationModalOverlay') closeDonationModal();
});

document.getElementById('replaceQrBtnLeft').addEventListener('click', () => {
    document.getElementById('qrFileInputLeft').click();
});
document.getElementById('qrFileInputLeft').addEventListener('change', e => {
    if (!e.target.files.length) return;
    pendingQrUrl = URL.createObjectURL(e.target.files[0]);
    document.getElementById('qrPreviewLeft').innerHTML = `<img src="${pendingQrUrl}" alt="Donation QR code">`;
});

document.getElementById('saveDonationBtn').addEventListener('click', () => {
    if (pendingQrUrl && pendingQrUrl !== donationDetails.qrUrl && donationDetails.qrUrl) {
        URL.revokeObjectURL(donationDetails.qrUrl);
    }
    donationDetails = {
        qrUrl: pendingQrUrl,
        upiId: document.getElementById('upiId').value.trim(),
        mobile: document.getElementById('mobileNumber').value.trim(),
        accountName: document.getElementById('accountName').value.trim(),
        accountNumber: document.getElementById('accountNumber').value.trim(),
        ifsc: document.getElementById('ifscCode').value.trim(),
    };
    renderDonationSummary();
    closeDonationModal();
    showToast('Donation details saved');
});

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

async function fetchMembers() {
    try {

        const response = await fetch(MEMBER_API);

        execMembers = await response.json();

        renderExecMembers();

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


fetchProjects();
fetchMembers();
renderGeneralMembers();
renderNotices();
fetchGallery();
renderAdminUsers();
renderDonationSummary();
