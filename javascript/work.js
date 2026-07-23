// =========================
// FETCH AND RENDER DYNAMIC DATA
// =========================
const API_BASE = 'https://muslim-community.onrender.com/api';

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
