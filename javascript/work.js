// =========================
// MEMBER POPUP
// =========================
const members = {

    ahmad: {
        name: "Ahmad Raza Khan",
        message: "Serving the community is my responsibility and my source of happiness.",
        about: "Ahmad has been actively serving the Muslim community through mosque renovation, food distribution drives and educational programs.",
        phone: "+92 300 123 4567",
        email: "ahmad.khan@community.org",
        address: "15-B Green Town, Lahore",
        projects: "18",
        responsibilities: [
            "Food Distribution",
            "Mosque Maintenance",
            "Event Coordination",
            "Volunteer Management"
        ],
    
        hours: "152",
        joined: "2023"
    },

    fatima: {
        name: "Fatima Zahra",
        message: "Helping people is the greatest form of worship.",
        about: "Fatima organizes women's education programs and health awareness campaigns.",
        phone: "+92 321 987 6543",
        email: "fatima.zahra@community.org",
        address: "8 Gulshan-e-Iqbal, Karachi",
        projects: "15",
        responsibilities: [
            "Food Distribution",
            "Mosque Maintenance",
            "Event Coordination",
            "Volunteer Management"
        ],
        hours: "120",
        joined: "2022"
    },

    usman: {
        name: "Muhammad Usman",
        message: "Every act of kindness makes our community stronger.",
        about: "Usman manages youth development and community welfare activities.",
        phone: "+92 333 456 7890",
        email: "muhammad.usman@community.org",
        address: "Model Town, Lahore",
        projects: "20",
        responsibilities: [
            "Food Distribution",
            "Mosque Maintenance",
            "Event Coordination",
            "Volunteer Management"
        ],
        hours: "165",
        joined: "2021"
    },

    khadija: {
        name: "Khadija Bibi",
        message: "Serving humanity is serving Allah.",
        about: "Khadija leads women's support and family welfare initiatives.",
        phone: "+92 301 654 7891",
        email: "khadija.bibi@community.org",
        address: "F-10, Islamabad",
        projects: "17",
        responsibilities: [
            "Food Distribution",
            "Mosque Maintenance",
            "Event Coordination",
            "Volunteer Management"
        ],
        hours: "130",
        joined: "2023"
    },

    ibrahim: {
        name: "Ibrahim Siddiqui",
        message: "Together we build a better community.",
        about: "Ibrahim supervises volunteer teams and charity drives.",
        phone: "+92 312 444 5566",
        email: "ibrahim.s@community.org",
        address: "Johar Town, Lahore",
        projects: "14",
        responsibilities: [
            "Food Distribution",
            "Mosque Maintenance",
            "Event Coordination",
            "Volunteer Management"
        ],
        hours: "115",
        joined: "2024"
    },

    abdul: {
        name: "Abdul Rahman",
        message: "Unity is our greatest strength.",
        about: "Abdul coordinates community events and mosque maintenance.",
        phone: "+92 322 888 7766",
        email: "abdulrahman@community.org",
        address: "DHA Phase 5, Karachi",
        projects: "22",
        responsibilities: [
            "Food Distribution",
            "Mosque Maintenance",
            "Event Coordination",
            "Volunteer Management"
        ],
        hours: "170",
        joined: "2022"
    },

    zainab: {
        name: "Zainab Malik",
        message: "Education changes generations.",
        about: "Zainab manages educational workshops for children.",
        phone: "+92 301 222 3344",
        email: "zainab.malik@community.org",
        address: "Satellite Town, Rawalpindi",
        projects: "19",
        responsibilities: [
            "Food Distribution",
            "Mosque Maintenance",
            "Event Coordination",
            "Volunteer Management"
        ],
        hours: "145",
        joined: "2023"
    },

    maryam: {
        name: "Maryam Noor",
        message: "Small efforts create big changes.",
        about: "Maryam organizes community health and awareness programs.",
        phone: "+92 315 666 5544",
        email: "maryam.noor@community.org",
        address: "Hayatabad, Peshawar",
        projects: "16",
        responsibilities: [
            "Food Distribution",
            "Mosque Maintenance",
            "Event Coordination",
            "Volunteer Management"
        ],
        hours: "128",
        joined: "2024"
    }

};
const popup = document.getElementById("memberPopup");
const openButtons = document.querySelectorAll(".open-popup");
const closeButton = document.getElementById("closePopup");

// Open Popup
openButtons.forEach(button => {

    button.addEventListener("click", () => {

        const member = members[button.dataset.member];

        document.getElementById("popupName").textContent = member.name;
        document.getElementById("popupMessage").textContent = member.message;
        document.getElementById("popupAbout").textContent = member.about;
        const responsibilityList = document.getElementById("popupResponsibilities");

responsibilityList.innerHTML = "";

member.responsibilities.forEach(function(item) {
    responsibilityList.innerHTML += `<li>✔ ${item}</li>`;
});
        document.getElementById("popupProjects").textContent = member.projects;
        document.getElementById("popupHours").textContent = member.hours;
        document.getElementById("popupJoined").textContent = member.joined;
        document.getElementById("popupAddress").textContent = "📍 " + member.address;
        document.getElementById("popupPhone").textContent = "☎ " + member.phone;
        document.getElementById("popupEmail").textContent = "✉ " + member.email;

        popup.classList.add("active");
        document.body.style.overflow = "hidden";

    });

});

// Close Popup Button
closeButton.addEventListener("click", () => {

    popup.classList.remove("active");
    document.body.style.overflow = "auto";

});

// Close when clicking outside
popup.addEventListener("click", (e) => {

    if (e.target === popup) {

        popup.classList.remove("active");
        document.body.style.overflow = "auto";

    }

});

// Close with ESC key
document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        popup.classList.remove("active");
        document.body.style.overflow = "auto";

    }

});