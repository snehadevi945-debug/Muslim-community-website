// =========================
// FETCH AND RENDER DYNAMIC DATA
// =========================
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
    await fetchProjects();
    await fetchMembers();
});

// -------------------------
// 1. PROJECTS
// -------------------------
async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        const projects = await response.json();
        
        const activeContainer = document.getElementById('active-projects-list');
        const completedContainer = document.getElementById('completed-projects-list');
        
        if (activeContainer) activeContainer.innerHTML = '';
        if (completedContainer) completedContainer.innerHTML = '';
        
        let activeCount = 0;
        let completedCount = 0;
        
        projects.forEach(project => {
            if (project.status === 'Active') {
                activeCount++;
                if (activeContainer) {
                    activeContainer.innerHTML += `
                        <div class="project-item ${activeCount === 1 ? 'highlight' : ''}">
                            <div class="project-header">
                                <div class="left-part">
                                    <div class="icon-circle">🏢</div>
                                    <div>
                                        <h4>${project.title}</h4>
                                        <p>${project.description || ''}</p>
                                    </div>
                                </div>
                                <span class="small-badge progress-badge">In Progress</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="--progress:${project.progress}%;"></div>
                            </div>
                            <div class="progress-value">${project.progress}%</div>
                        </div>
                    `;
                }
            } else if (project.status === 'Completed') {
                completedCount++;
                if (completedContainer) {
                    // Generate a random date for display since model doesn't have completion date, or just say Completed
                    completedContainer.innerHTML += `
                        <div class="completed-item">
                            <div class="left-part">
                                <div class="check-circle">✓</div>
                                <div>
                                    <h4>${project.title}</h4>
                                    <p>${project.description || 'Successfully completed project'}</p>
                                </div>
                            </div>
                            <div class="right-part">
                                <span class="small-badge completed-badge">✓ Completed</span>
                                <small>100%</small>
                            </div>
                        </div>
                    `;
                }
            }
        });
        
        // Add footer boxes
        if (activeContainer) {
            if (activeCount === 0) activeContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">No active projects at the moment.</div>';
            else activeContainer.innerHTML += `
                <div class="footer-box">
                    <div>
                        <strong>${activeCount} Active Projects</strong>
                        <p>Currently in progress</p>
                    </div>
                    <a href="#">View All ↗</a>
                </div>
            `;
        }
        
        if (completedContainer) {
            if (completedCount === 0) completedContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">No completed projects yet.</div>';
            else completedContainer.innerHTML += `
                <div class="footer-box completed-footer">
                    <div>
                        <strong>${completedCount}+ Projects Successfully Completed</strong>
                        <p>Alhamdulillah</p>
                    </div>
                    <a href="#">Archive ↗</a>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error fetching projects:', error);
        document.getElementById('active-projects-list').innerHTML = '<div style="text-align:center; padding:20px; color:#ff6b6b;">Error loading projects.</div>';
    }
}

// -------------------------
// 2. MEMBERS
// -------------------------
let globalMembersList = [];

async function fetchMembers() {
    try {
        const response = await fetch(`${API_BASE}/members`);
        if (!response.ok) throw new Error('Failed to fetch members');
        const members = await response.json();
        globalMembersList = members;
        
        const container = document.getElementById('members-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (members.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:20px; color:#666; grid-column: 1/-1;">No members found.</div>';
            return;
        }
        
        const colors = ['red', 'profile-blue', 'purple', 'brown', 'green', 'violet', 'deep-orange', 'cyan'];
        
        members.forEach((member, index) => {
            const initials = member.name ? member.name.substring(0, 2).toUpperCase() : 'MM';
            const colorClass = colors[index % colors.length];
            
            container.innerHTML += `
                <div class="member-card">
                    <div class="card-top-bar"></div>
                    <div class="member-profile">
                        <div class="profile-circle ${colorClass}">
                            ${initials}
                            <span class="online-dot"></span>
                        </div>
                    </div>
                    <h3 class="member-name">${member.name}</h3>
                    <div class="member-badge">${member.role || 'Community Member'}</div>
                    <div class="member-details">
                        <div class="detail-item">
                            <span class="detail-icon">☎</span>
                            <span>${member.phone || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">✉</span>
                            <span>${member.email || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">📍</span>
                            <span>${member.address || 'N/A'}</span>
                        </div>
                    </div>
                    <button class="view-profile open-popup" data-id="${member._id}">
                        View Profile >
                    </button>
                </div>
            `;
        });
        
        attachPopupListeners();
        
    } catch (error) {
        console.error('Error fetching members:', error);
        document.getElementById('members-container').innerHTML = '<div style="text-align:center; padding:20px; color:#ff6b6b; grid-column: 1/-1;">Error loading members.</div>';
    }
}


// =========================
// MEMBER POPUP LOGIC
// =========================
const popup = document.getElementById("memberPopup");
const closeButton = document.getElementById("closePopup");

function attachPopupListeners() {
    const openButtons = document.querySelectorAll(".open-popup");
    
    openButtons.forEach(button => {
        button.addEventListener("click", () => {
            const memberId = button.getAttribute('data-id');
            const member = globalMembersList.find(m => m._id === memberId);
            if (!member) return;

            document.getElementById("popupName").textContent = member.name;
            document.getElementById("popupMessage").textContent = "Serving the community is my responsibility.";
            document.getElementById("popupAbout").textContent = member.address ? `Resident at ${member.address}` : "Active member of the community.";
            
            const responsibilityList = document.getElementById("popupResponsibilities");
            if (responsibilityList) {
                responsibilityList.innerHTML = `<li>✔ Community Service</li><li>✔ Volunteer Management</li>`;
            }
            
            document.getElementById("popupProjects").textContent = "15"; // Dummy data since not in model
            document.getElementById("popupHours").textContent = "120"; // Dummy data
            document.getElementById("popupJoined").textContent = "2024"; // Dummy data
            
            document.getElementById("popupAddress").textContent = "📍 " + (member.address || 'N/A');
            document.getElementById("popupPhone").textContent = "☎ " + (member.phone || 'N/A');
            document.getElementById("popupEmail").textContent = "✉ " + (member.email || 'N/A');

            if (popup) {
                popup.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        });
    });
}

if (closeButton) {
    closeButton.addEventListener("click", () => {
        if (popup) popup.classList.remove("active");
        document.body.style.overflow = "auto";
    });
}

if (popup) {
    // Close when clicking outside
    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    });
}

// Close with ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup && popup.classList.contains("active")) {
        popup.classList.remove("active");
        document.body.style.overflow = "auto";
    }
});