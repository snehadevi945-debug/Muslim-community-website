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
const members = {

    ahmad:{
        initials:"AR",
        color:"red",
        name:"Ahmad Raza Khan",
        role:"Community Member",
        message:"Helping people through compassion and unity is my greatest motivation.",
        about:"I actively participate in food drives and community welfare programs.",
        responsibilities:[
            "Food Distribution",
            "Mosque Care",
            "Volunteer Support",
            "Community Events"
        ],
        phone:"+92 300 123 4567",
        email:"ahmad.khan@community.org",
        address:"15-B, Green Town, Lahore"
    },

    fatima:{
        initials:"FZ",
        color:"blue",
        name:"Fatima Zahra",
        role:"Community Member",
        message:"Together we can create a better future for every family.",
        about:"I organize educational workshops and women's welfare activities.",
        responsibilities:[
            "Education",
            "Counselling",
            "Volunteer Training",
            "Event Planning"
        ],
        phone:"+92 321 987 6543",
        email:"fatima.zahra@community.org",
        address:"Gulshan-e-Iqbal, Karachi"
    },

    usman:{
        initials:"MU",
        color:"orange",
        name:"Muhammad Usman",
        role:"Community Member",
        message:"Serving the community is both a responsibility and an honor.",
        about:"I coordinate youth programs and sports activities for community members.",
        responsibilities:[
            "Youth Programs",
            "Sports Events",
            "Community Help",
            "Volunteer Team"
        ],
        phone:"+92 333 456 7890",
        email:"muhammad.usman@community.org",
        address:"Model Town, Lahore"
    },

    khadija:{
        initials:"KB",
        color:"pink",
        name:"Khadija Bibi",
        role:"Community Member",
        message:"Small acts of kindness can inspire lasting change.",
        about:"I support women empowerment initiatives and social welfare campaigns.",
        responsibilities:[
            "Women's Welfare",
            "Family Support",
            "Community Outreach",
            "Food Drive"
        ],
        phone:"+92 301 654 7891",
        email:"khadija.bibi@community.org",
        address:"F-10, Islamabad"
    },

    ibrahim:{
        initials:"IS",
        color:"green",
        name:"Ibrahim Siddiqui",
        role:"Community Member",
        message:"Strong communities are built through teamwork and dedication.",
        about:"I help organize charity events and volunteer management.",
        responsibilities:[
            "Volunteer Team",
            "Charity Events",
            "Youth Guidance",
            "Mosque Support"
        ],
        phone:"+92 312 444 5566",
        email:"ibrahim.s@community.org",
        address:"Johar Town, Lahore"
    },

    abdul:{
        initials:"AR",
        color:"purple",
        name:"Abdul Rahman",
        role:"Community Member",
        message:"Faith and service together strengthen our community.",
        about:"I assist in planning community gatherings and welfare projects.",
        responsibilities:[
            "Event Planning",
            "Community Meetings",
            "Volunteer Support",
            "Mosque Activities"
        ],
        phone:"+92 322 888 7766",
        email:"abdulrahman@community.org",
        address:"DHA Phase 5, Karachi"
    },

    zainab:{
        initials:"ZM",
        color:"deep-orange",
        name:"Zainab Malik",
        role:"Community Member",
        message:"Every volunteer has the power to make a difference.",
        about:"I coordinate educational campaigns and family support programs.",
        responsibilities:[
            "Education",
            "Family Support",
            "Volunteer Training",
            "Community Service"
        ],
        phone:"+92 301 222 3344",
        email:"zainab.malik@community.org",
        address:"Satellite Town, Rawalpindi"
    },

    maryam:{
        initials:"MN",
        color:"cyan",
        name:"Maryam Noor",
        role:"Community Member",
        message:"Unity, respect, and compassion guide every community activity.",
        about:"I work with youth volunteers and community awareness programs.",
        responsibilities:[
            "Awareness Programs",
            "Youth Volunteers",
            "Charity Support",
            "Community Outreach"
        ],
        phone:"+92 315 666 5544",
        email:"maryam.noor@community.org",
        address:"Hayatabad, Peshawar"
    }

};
const overlay = document.getElementById("popupOverlay");

const avatar = document.getElementById("popupAvatar");

const initials = document.getElementById("popupInitials");

const nameText = document.getElementById("popupName");

const message = document.getElementById("popupMessage");

const about = document.getElementById("popupAbout");

const responsibilities = document.getElementById("popupResponsibilities");

const phone = document.getElementById("popupPhone");

const email = document.getElementById("popupEmail");

const address = document.getElementById("popupAddress");
document.querySelectorAll(".profile-btn").forEach(button=>{

    button.addEventListener("click",()=>{

        const id = button.dataset.member;

        const member = members[id];

        initials.textContent = member.initials;

        avatar.className = "popup-avatar " + member.color;

        nameText.textContent = member.name;

        message.textContent = member.message;

        about.textContent = member.about;

        phone.textContent = member.phone;

        email.textContent = member.email;

        address.textContent = member.address;

        responsibilities.innerHTML="";

        member.responsibilities.forEach(item=>{

            responsibilities.innerHTML+=`<span>${item}</span>`;

        });

        overlay.classList.add("active");

    });

});
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