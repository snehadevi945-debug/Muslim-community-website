// ===============================
// Mobile Navigation
// ===============================

const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".main-nav-list");

if (navToggle && navMenu) {

    navToggle.addEventListener("click", () => {

        navMenu.classList.toggle("active");

    });

}

// ===============================
// Smooth Scrolling
// ===============================

document.querySelectorAll('a[href^="#"]').forEach(link=>{

    link.addEventListener("click",function(e){

        e.preventDefault();

        const target=document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});
let members = {};
let admins = {};

const API_BASE = "https://muslim-community-website.onrender.com/api";

async function fetchMembers() {
    try {
        const response = await fetch(`${API_BASE}/members`);
        if (!response.ok) throw new Error("Failed to fetch members");
        const data = await response.json();

        members = {};
        const membersGrid = document.getElementById("members-grid");

        if (membersGrid) membersGrid.innerHTML = "";

        let execCount = 0;

        data.forEach(member => {
            members[member._id] = member;

            let category = 'EXECUTIVE';
            if (member.memberType) {
                category = member.memberType.toUpperCase();
            } else if (member.type) {
                category = member.type.toUpperCase();
            } else {
                const roleStr = (member.role || '').toLowerCase();
                if (roleStr.includes('general') || roleStr === 'member') {
                    category = 'GENERAL';
                }
            }

            // Only Executive Members are shown in Community Members section
            if (category === 'EXECUTIVE') {
                execCount++;
                const cardHtml = `
                    <div class="community-card">
                        <div class="card-strip"></div>
                        <div class="avatar">
                            <img src="${member.photo || "assets/default-avatar.png"}" alt="${member.fullName || member.name || "Member"}" class="member-photo">
                            <span class="status"></span>
                        </div>
                        <h3 class="member-title">${member.fullName || member.name || "Member"}</h3>
                        <div class="designation">${member.role || "Executive Member"}</div>
                        <div class="info">
                            <p><span>☎</span> ${member.phone || "Not Available"}</p>
                            <p><span>✉</span> ${member.email || "Not Available"}</p>
                            <p><span>📅</span> ${formatPopupDate(
    member.joining ||
    member.dateOfJoining ||
    member.createdAt ||
    ""
)}</p>
                        </div>
                        <button class="profile-btn" data-id="${member._id}" data-type="member">View Profile ></button>
                    </div>
                `;

                if (membersGrid) membersGrid.innerHTML += cardHtml;
            }
        });

        if (membersGrid && execCount === 0) {
            membersGrid.innerHTML = '<div style="text-align:center;padding:20px;color:#666;grid-column:1/-1;">No executive members listed.</div>';
        }

        attachProfileEvents();
    } catch (err) {
        console.error(err);
    }
}

async function fetchAdmins() {
    try {
        const response = await fetch(`${API_BASE}/admin`);
        if (!response.ok) throw new Error("Failed to fetch admins");
        const data = await response.json();

        admins = {};
        const grid = document.getElementById("admin-grid");
        if (grid) grid.innerHTML = "";

        data.forEach(admin => {
            admins[admin._id] = admin;

            if (grid) {
                grid.innerHTML += `
                    <div class="community-card">
                        <div class="card-strip"></div>
                        <div class="avatar green">
                            ${admin.photo ? `<img src="${admin.photo}" alt="${admin.name}" class="member-photo">` : admin.name.charAt(0).toUpperCase()}
                            <span class="status"></span>
                        </div>
                        <h3 class="member-title">${admin.name}</h3>
                        <div class="designation">${admin.role}</div>
                        <div class="info">
                            <p><span>☎</span> ${admin.phone || "Not Available"}</p>
                            <p><span>✉</span> ${admin.email || "Not Available"}</p>
                            <p><span>📅</span> ${formatPopupDate(
    admin.joining ||
    admin.dateOfJoining ||
    admin.createdAt ||
    ""
)}</p>
                        </div>
                        <button class="profile-btn" data-id="${admin._id}" data-type="admin">View Profile ></button>
                    </div>
                `;
            }
        });

        attachProfileEvents();
    } catch (err) {
        console.error(err);
    }
}

const overlay = document.getElementById("popupOverlay");

const avatar = document.getElementById("popupAvatar");

const initials = document.getElementById("popupInitials");

const nameText = document.getElementById("popupName");
const popupRole = document.getElementById("popupRole");



const about = document.getElementById("popupAbout");

const responsibilities = document.getElementById("popupResponsibilities");

const phone = document.getElementById("popupPhone");

const email = document.getElementById("popupEmail");

const date = document.getElementById("popupdate");

function formatPopupDate(value) {
    if (!value) return "Not Available";
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function attachProfileEvents() {

    document.querySelectorAll(".profile-btn").forEach(button => {

        button.onclick = () => {

            const type = button.dataset.type;
            const id = button.dataset.id;

            const person = type === "admin"
                ? admins[id]
                : members[id];

            if (!person) return;

            const displayName = person.fullName || person.name || "Member";
            initials.textContent = displayName.split(" ").map(x => x[0]).join("").substring(0,2);

            if (person.photo) {
                avatar.innerHTML = `<img src="${person.photo}" alt="${displayName}" class="popup-avatar-image">`;
            } else {
                avatar.innerHTML = `<span id="popupInitials">${initials.textContent}</span>`;
            }

            nameText.textContent = displayName;
            popupRole.textContent = person.role || "Community Member";

            

            about.textContent = person.about || person.bio || "No profile description available.";

            phone.textContent = person.phone || "—";

            email.textContent = person.email || "—";

            date.textContent = formatPopupDate(
                person.joining ||
                person.dateOfJoining ||
                person.createdAt ||
                person.createdAt?.toString() ||
                ""
            );

            responsibilities.innerHTML = "";
            
            let responsibilityList = [];

if (Array.isArray(person.responsibilities)) {
    responsibilityList = person.responsibilities.flatMap(item =>
        String(item)
            .split("-")
            .map(r => r.trim())
            .filter(Boolean)
    );
} else if (person.responsibilities) {
    responsibilityList = String(person.responsibilities)
        .split("-")
        .map(r => r.trim())
        .filter(Boolean);
}
            if (responsibilityList.length === 0) {
                responsibilities.innerHTML = '<span>No responsibilities assigned.</span>';
            } else {
                responsibilities.innerHTML = responsibilityList.map(item => `<span>${item}</span>`).join('');
            }

            overlay.classList.add("active");

        };

    });

}

document.getElementById("popupButton").onclick=()=>{

    overlay.classList.remove("active");

};

document.getElementById("closePopup").onclick=()=>{

    overlay.classList.remove("active");

};

overlay.addEventListener("click",(e)=>{

    if(e.target===overlay){

        overlay.classList.remove("active");

    }

});

document.addEventListener("DOMContentLoaded", async () => {

    await fetchAdmins();

    await fetchMembers();

});