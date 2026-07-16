/* 
   Muslim Community - Interaction Script
   Vanilla JS logic for navigation, modals, lightbox, and animations
*/

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------
    // 1. Mobile Navigation Toggle
    // ----------------------------------
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNavigation = document.querySelector('.primary-navigation');

    if (mobileNavToggle && primaryNavigation) {
        mobileNavToggle.addEventListener('click', () => {
            const isOpened = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isOpened);
            mobileNavToggle.classList.toggle('active');
            primaryNavigation.classList.toggle('active');
        });

        // Close mobile nav on link click
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                mobileNavToggle.classList.remove('active');
                primaryNavigation.classList.remove('active');
            });
        });
    }

    // ----------------------------------
    // 2. Active Link Highlight on Scroll (homepage only)
    // ----------------------------------
    const isHomePage = document.querySelector('.hero-section') !== null;

    if (isHomePage) {
        const sections = document.querySelectorAll('section[id], footer[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const scrollActiveHighlight = () => {
            let scrollY = window.pageYOffset;
            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 120;
                const sectionId = current.getAttribute('id');
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        const href = link.getAttribute('href');
                        if (href && (href === `#${sectionId}` || href.endsWith(`#${sectionId}`))) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        };

        window.addEventListener('scroll', scrollActiveHighlight);
    }

    // ----------------------------------
    // 3. Stats Counter Animation (homepage only)
    // ----------------------------------
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        let count = 0;
        const speed = target / 100;

        const updateCount = () => {
            count += speed;
            if (count < target) {
                element.innerText = Math.floor(count).toLocaleString() + '+';
                setTimeout(updateCount, 15);
            } else {
                element.innerText = target.toLocaleString() + '+';
            }
        };

        updateCount();
    };

    const statsSection = document.getElementById('stats');
    if (statsSection) {
        let animated = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    statNumbers.forEach(num => animateCounter(num));
                    animated = true;
                }
            });
        }, { threshold: 0.3 });
        observer.observe(statsSection);
    }

    // ----------------------------------
    // 4. Donation & Membership Modals
    // ----------------------------------
    const donateModal = document.getElementById('donate-modal');
    const memberModal = document.getElementById('member-modal');

    const donateTriggers = document.querySelectorAll('.open-modal-donate');
    const memberTriggers = document.querySelectorAll('.open-modal-member');
    const closeButtons = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');

    donateTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            if (donateModal) {
                donateModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    memberTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            if (memberModal) {
                memberModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeModal = () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = 'auto';
        // Stop any playing video in lightbox
        const lbVideo = document.querySelector('.lightbox-content video');
        if (lbVideo) lbVideo.pause();
    };

    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    if (document.querySelector('.lightbox-close')) {
        document.querySelector('.lightbox-close').addEventListener('click', closeModal);
    }

    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ----------------------------------
    // 5. Preset Amount Form Logic
    // ----------------------------------
    const presetButtons = document.querySelectorAll('.preset-btn');
    const customAmountInput = document.getElementById('custom-amount');

    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const val = btn.getAttribute('data-val');
            if (val === 'custom' && customAmountInput) {
                customAmountInput.style.display = 'block';
                customAmountInput.value = '';
                customAmountInput.focus();
            } else if (customAmountInput) {
                customAmountInput.style.display = 'none';
                customAmountInput.value = val;
            }
        });
    });

    // ----------------------------------
    // 6. Media Gallery Lightbox (About page)
    // ----------------------------------
    const lightbox = document.getElementById('media-lightbox');
    const lightboxContent = lightbox ? lightbox.querySelector('.lightbox-content') : null;
    const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
    const mediaCards = document.querySelectorAll('.media-card');

    mediaCards.forEach(card => {
        card.addEventListener('click', () => {
            if (!lightbox) return;

            const type = card.getAttribute('data-type');
            const src = card.getAttribute('data-src');
            const title = card.querySelector('.media-card-title') ? card.querySelector('.media-card-title').textContent : '';
            const desc = card.querySelector('.media-card-desc') ? card.querySelector('.media-card-desc').textContent : '';

            // Clear previous content
            lightboxContent.innerHTML = '';

            if (type === 'video') {
                const video = document.createElement('video');
                video.src = src;
                video.controls = true;
                video.autoplay = true;
                video.style.width = '100%';
                lightboxContent.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = src;
                img.alt = title;
                lightboxContent.appendChild(img);
            }

            if (lightboxCaption) {
                lightboxCaption.innerHTML = `<strong>${title}</strong> — ${desc}`;
            }

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // ----------------------------------
    // 7. Scroll-triggered Fade-in for Media Cards
    // ----------------------------------
    const observeElements = document.querySelectorAll('.media-card, .testimonial-card, .leader-card, .service-card');

    if ('IntersectionObserver' in window) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            fadeObserver.observe(el);
        });
    }

});
