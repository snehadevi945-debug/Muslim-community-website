
/* ==========================================================
   Committee Admin Panel — vanilla JS, no framework
   Data is kept in-memory (mirrors the screenshots' content).
   ========================================================== */

/* ---------- Sample data ---------- */
let projects = [
    { id: 1, title: "Minaret restoration & new dome", status: "Active", progress: 68, target: "Nov 2026" },
    { id: 2, title: "Madrasa — 8 new classrooms", status: "Active", progress: 35, target: "Aug 2027" },
    { id: 3, title: "Langar kitchen upgrade", status: "Active", progress: 12, target: "Dec 2026" },
    { id: 4, title: "Community hall roof repair", status: "Completed", progress: 100, target: "Jun 2026" },
];

let execMembers = [
    { id: 1, name: "Abdul Rahman Khan", role: "President", phone: "+91 98765 43210", email: "president@…org", joining: "2015-03-01" },
    { id: 2, name: "Mohammed Yusuf", role: "Vice President", phone: "+91 90123 44556", email: "vp@…org", joining: "2017-06-15" },
    { id: 3, name: "Imran Siddiqui", role: "Secretary", phone: "+91 91234 56780", email: "secretary@…org", joining: "2018-01-10" },
];

let generalMembers = [
    { id: 1, name: "Iqbal Hussain", phone: "+91 98111 22334", joining: "2018-03-01" },
    { id: 2, name: "Ayesha Begum", phone: "+91 99220 11445", joining: "2021-07-01" },
];

let notices = [];

async function loadNotices() {
    try {
        const response = await fetch("http://localhost:3000/api/notices");
        notices = await response.json();

        // Refresh the UI after loading the data
        renderNotices();   // <-- change this if your display function has a different name
    } catch (error) {
        console.error("Error loading notices:", error);
    }
}

loadNotices();
let albums = [
    { id: 1, title: "Ramzan & Eid 2026", files: Array.from({ length: 86 }, (_, i) => `photo_${i + 1}.jpg`) },
    { id: 2, title: "Minaret work progress", files: Array.from({ length: 44 }, (_, i) => `progress_${i + 1}.jpg`) },
    { id: 3, title: "Eid Milad juloos", files: Array.from({ length: 61 }, (_, i) => `juloos_${i + 1}.jpg`) },
];

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
    document.getElementById('execMembersBody').innerHTML = execMembers.map(m => `
        <tr data-id="${m.id}">
            <td style="width:36px;"><span class="drag-handle">☰</span></td>
            <td class="cell-title">${m.name} — ${m.role}</td>
            <td>${m.phone}</td>
            <td>${m.email}</td>
            <td>${formatSince(m.joining)}</td>
            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-exec">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-exec">Delete</button>
            </td>
        </tr>`).join('');

    document.querySelectorAll('.edit-exec').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            openMemberModal(execMembers.find(m => m.id === id), 'exec');
        });
    });

    document.querySelectorAll('.delete-exec').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            const member = execMembers.find(m => m.id === id);
            confirmAction(`Remove ${member ? member.name : 'this'} from executive members?`, () => {
                execMembers = execMembers.filter(m => m.id !== id);
                renderExecMembers();
                showToast('Member removed');
            });
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
       <tr data-id="${n._id}">
            <td class="cell-title">${n.title}</td>
            <td>${n.type}</td>
            <td>
                ${n.attachment
                    ? `<button type="button" class="attachment-link open-attachment" title="Open ${n.attachment}">${fileTypeIcon(n.attachment)} ${n.attachment}</button>`
                    : `<span class="no-attachment">— none —</span>`}
            </td>
            <td>${n.publishedDate}</td>
            <td class="row-actions">
                <button class="btn btn-outline btn-sm edit-notice">Edit</button>
                <button class="btn btn-danger-outline btn-sm delete-notice">Delete</button>
            </td>
        </tr>`).join('');

    document.querySelectorAll('.open-attachment').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('tr').dataset.id);
            const notice = notices.find(n => n._id == id);
            openAttachment(notice);
        });
    });

    document.querySelectorAll('.edit-notice').forEach(btn => {
        btn.addEventListener('click', e => {
    
            const id = e.target.closest('tr').dataset.id;
    
            console.log("Clicked ID:", id);
    
            const notice = notices.find(n => n._id === id);
    
            console.log("Found notice:", notice);
    
            openNoticeModal(notice);
        });
    });

    document.querySelectorAll('.delete-notice').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.target.closest('tr').dataset.id;
            const notice = notices.find(n => n._id == id);
            confirmAction(`Delete "${notice ? notice.title : 'this notice'}"? This cannot be undone.`, () => {
                if (notice && notice.fileUrl) URL.revokeObjectURL(notice.fileUrl);
                fetch(`http://localhost:3000/api/notices/${id}`, {
                    method: "DELETE"
                })
                .then(() => {
                    loadNotices();   // Reload notices from MongoDB
                    showToast("Notice deleted successfully");
                })
                .catch(error => {
                    console.error(error);
                    showToast("Failed to delete notice");
                });
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
    const cards = albums.map(a => `
        <div class="album-card" data-id="${a.id}">
            <div class="album-thumb"></div>
            <div class="album-body">
                <div class="album-title">${a.title}</div>
                <div class="album-meta">${a.files.length} photos</div>
                <div class="album-actions">
                    <button class="btn btn-outline btn-sm manage-album">Manage</button>
                    <button class="btn btn-outline btn-sm upload-album">+ Upload</button>
                </div>
            </div>
        </div>`).join('');
    document.getElementById('galleryGrid').innerHTML = cards + `
        <div class="album-card-create" id="createAlbumCard">+ Create album</div>`;

    document.getElementById('createAlbumCard').addEventListener('click', () => openAlbumModal(null));

    document.querySelectorAll('.manage-album').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('.album-card').dataset.id);
            openManageAlbumModal(albums.find(a => a.id === id));
        });
    });
    document.querySelectorAll('.upload-album').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(e.target.closest('.album-card').dataset.id);
            openUploadToAlbumModal(albums.find(a => a.id === id));
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
    openModal(isEdit ? 'Edit project' : 'Add project', `
        ${fieldHtml('Title', 'f_title', existing ? existing.title : '')}
        <div class="form-group">
            <label>Status</label>
            <select class="form-input" id="f_status">
                <option ${existing && existing.status === 'Active' ? 'selected' : ''}>Active</option>
                <option ${existing && existing.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
        </div>
        ${fieldHtml('Progress %', 'f_progress', existing ? existing.progress : 0, 'number')}
        ${fieldHtml('Target', 'f_target', existing ? existing.target : '')}
    `, () => {
        const title = document.getElementById('f_title').value.trim() || 'Untitled project';
        const status = document.getElementById('f_status').value;
        const progress = Number(document.getElementById('f_progress').value) || 0;
        const target = document.getElementById('f_target').value.trim() || 'TBD';
        if (isEdit) {
            Object.assign(existing, { title, status, progress, target });
            showToast('Project updated');
        } else {
            projects.push({ id: uid(projects), title, status, progress, target });
            showToast('Project added');
        }
        renderProjects();
    });
}
document.getElementById('addProjectBtnDash').addEventListener('click', () => openProjectModal(null));
document.getElementById('addProjectBtn').addEventListener('click', () => openProjectModal(null));

/* Add / edit member (exec or general) */
function openMemberModal(existing, kind) {
    const isEdit = !!existing;
    const todayIso = new Date().toISOString().slice(0, 10);
    openModal(isEdit ? 'Edit member' : 'Add member', `
        ${fieldHtml('Full name', 'm_name', existing ? existing.name : '')}
        ${fieldHtml('Role (leave blank for general member)', 'm_role', existing && existing.role ? existing.role : '')}
        ${fieldHtml('Phone', 'm_phone', existing ? existing.phone : '')}
        ${kind !== 'general' ? fieldHtml('Email', 'm_email', existing ? existing.email : '') : ''}
        ${fieldHtml('Date of joining', 'm_joining', existing && existing.joining ? existing.joining : todayIso, 'date')}
    `, () => {
        const name = document.getElementById('m_name').value.trim() || 'Unnamed member';
        const role = document.getElementById('m_role').value.trim();
        const phone = document.getElementById('m_phone').value.trim() || '—';
        const joining = document.getElementById('m_joining').value || todayIso;
        const emailField = document.getElementById('m_email');
        const email = emailField ? (emailField.value.trim() || '—') : (existing ? existing.email : '—');

        if (isEdit) {
            Object.assign(existing, { name, phone, joining });
            if (kind === 'exec') { existing.role = role || existing.role; existing.email = email; }
            renderExecMembers();
            renderGeneralMembers(document.getElementById('memberSearch').value);
            showToast('Member updated');
        } else if (role) {
            execMembers.push({ id: uid(execMembers), name, role, phone, email, joining });
            renderExecMembers();
            showToast('Member added');
        } else {
            generalMembers.push({ id: uid(generalMembers), name, phone, joining });
            renderGeneralMembers();
            showToast('Member added');
        }
    });
}
document.getElementById('addMemberBtn').addEventListener('click', () => openMemberModal(null, 'new'));

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

        const noticeData = {
            title,
            description,
            fileName,
            fileUrl,
            type,
            published: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
        };
        
        if (isEdit) {
            fetch(`http://localhost:3000/api/notices/${existing._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(noticeData)
            })
            .then(() => {
                loadNotices();
                showToast("Notice updated");
            });
        } else {
            fetch("http://localhost:3000/api/notices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(noticeData)
            })
            .then(() => {
                loadNotices();
                showToast("Notice published");
            });
        }
    });
}
document.getElementById('addNoticeBtn').addEventListener('click', () => openNoticeModal(null));

/* Create album (with optional initial files) */
function openAlbumModal() {
    openModal('Create album', `
        ${fieldHtml('Album name', 'a_name')}
        <div class="form-group">
            <label>Add photos / PDFs</label>
            <input type="file" class="form-input" id="a_files" accept="image/*,.pdf" multiple>
        </div>
    `, () => {
        const title = document.getElementById('a_name').value.trim() || 'Untitled album';
        const fileInput = document.getElementById('a_files');
        const files = fileInput.files.length ? Array.from(fileInput.files).map(f => f.name) : [];
        albums.push({ id: uid(albums), title, files });
        renderAlbums();
        showToast('Album created');
    });
}
document.getElementById('addAlbumBtn').addEventListener('click', openAlbumModal);

/* Manage album — view / remove existing files */
function openManageAlbumModal(album) {
    if (!album) return;
    const listHtml = album.files.length
        ? album.files.map((f, i) => `
            <div class="file-list-item" data-index="${i}">
                <span class="file-list-name">📄 ${f}</span>
                <button type="button" class="btn btn-danger-outline btn-sm remove-file">Remove</button>
            </div>`).join('')
        : `<p style="font-size:0.88rem;color:var(--color-text-light);">No files in this album yet.</p>`;

    openModal(`Manage — ${album.title}`, `
        ${fieldHtml('Album name', 'am_name', album.title)}
        <div class="form-group">
            <label>Files (${album.files.length})</label>
            <div class="file-list" id="am_fileList">${listHtml}</div>
        </div>
    `, () => {
        const newTitle = document.getElementById('am_name').value.trim() || album.title;
        album.title = newTitle;
        renderAlbums();
        showToast('Album updated');
    });

    document.querySelectorAll('#am_fileList .remove-file').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = Number(e.target.closest('.file-list-item').dataset.index);
            album.files.splice(idx, 1);
            openManageAlbumModal(album);
        });
    });
}

/* Upload more files into an existing album */
function openUploadToAlbumModal(album) {
    if (!album) return;
    openModal(`Upload to — ${album.title}`, `
        <div class="form-group">
            <label>Select photos / PDFs</label>
            <input type="file" class="form-input" id="u_files" accept="image/*,.pdf" multiple>
        </div>
    `, () => {
        const fileInput = document.getElementById('u_files');
        const newFiles = Array.from(fileInput.files).map(f => f.name);
        album.files.push(...newFiles);
        renderAlbums();
        showToast(newFiles.length ? `${newFiles.length} file(s) uploaded` : 'No files selected');
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

/* Donation form save */
document.getElementById('saveDonationBtn').addEventListener('click', () => {
    showToast('Donation details saved');
});

/* ---------- Init ---------- */
renderProjects();
renderExecMembers();
renderGeneralMembers();
renderNotices();
renderAlbums();
renderAdminUsers();
