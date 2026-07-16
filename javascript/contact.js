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
// Map Zoom
// ===============================

const mapInner = document.getElementById("mapInner");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

let zoom = 1;

if (mapInner && zoomIn && zoomOut) {

    zoomIn.addEventListener("click", () => {

        zoom = Math.min(zoom + 0.2, 2);

        mapInner.style.transform = `scale(${zoom})`;

    });

    zoomOut.addEventListener("click", () => {

        zoom = Math.max(zoom - 0.2, 1);

        mapInner.style.transform = `scale(${zoom})`;

    });

}


// ===============================
// Contact Form
// ===============================

const form = document.getElementById("contactForm");

if (form) {

    form.addEventListener("submit", function(e){

        e.preventDefault();

        const button = document.getElementById("submitBtn");
        const text = document.getElementById("submitBtnText");

        button.disabled = true;

        text.innerHTML = "✔ Message Sent";

        button.style.background = "#16a34a";

        setTimeout(() => {

            form.reset();

            button.disabled = false;

            text.innerHTML = "Send Message";

            button.style.background = "#0F766E";

        },3000);

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