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

    const attachLightboxListeners = () => {
        const mediaCards = document.querySelectorAll('.media-card');
        mediaCards.forEach(card => {
            card.addEventListener('click', () => {
                if (!lightbox) return;

                const type = card.getAttribute('data-type');
                const src = card.getAttribute('data-src');
                const title = card.querySelector('.media-card-title') ? card.querySelector('.media-card-title').textContent : '';
                const desc = card.querySelector('.media-card-desc') ? card.querySelector('.media-card-desc').textContent : '';

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
    };

    // Fetch Gallery Data Dynamically
    const fetchGallery = async () => {
        const galleryContainer = document.getElementById('media-gallery');
        if (!galleryContainer) {
            // Not on about page, but maybe there are static cards somewhere else
            attachLightboxListeners();
            return; 
        }

        try {
            const response = await fetch('http://localhost:3000/api/gallery');
            if (!response.ok) throw new Error('Failed to fetch gallery');
            const items = await response.json();
            
            galleryContainer.innerHTML = '';
            
            if (items.length === 0) {
                galleryContainer.innerHTML = '<div style="text-align:center; padding:40px; color:var(--color-text-light); grid-column: 1/-1;">No media items found.</div>';
                return;
            }

            items.forEach(item => {
                const isVideo = item.type === 'video';
                const iconSvg = isVideo 
                    ? `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`
                    : `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
                
                const playIndicator = isVideo 
                    ? `<div class="video-play-indicator"><svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg></div>`
                    : '';

                galleryContainer.innerHTML += `
                    <div class="media-card ${isVideo ? 'video-card' : ''}" data-type="${item.type || 'photo'}" data-src="${item.imageUrl || ''}" role="button" tabindex="0">
                        <img src="${item.imageUrl || 'assets/hero_bg.png'}" alt="${item.title}" class="media-card-img" loading="lazy">
                        ${playIndicator}
                        <div class="media-overlay">
                            <div class="media-icon">${iconSvg}</div>
                            <div class="media-card-title">${item.title}</div>
                            <div class="media-card-desc">${item.description || ''}</div>
                        </div>
                    </div>
                `;
            });
            
            attachLightboxListeners();
        } catch (error) {
            console.error('Error fetching gallery:', error);
            galleryContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#ff6b6b; grid-column: 1/-1;">Error loading gallery.</div>';
        }
    };
    
    fetchGallery();

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

    // ----------------------------------
    // 8. Notices & Notification Bell
    // ----------------------------------
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationList = document.getElementById('notificationList');

    if (notificationBellBtn && notificationDropdown) {
        notificationBellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBellBtn.contains(e.target)) {
                notificationDropdown.classList.remove('active');
            }
        });
    }

    const fetchNotices = async () => {
        const noticesContainer = document.getElementById('notices-container');
        
        try {
            const response = await fetch('http://localhost:3000/api/notices');
            if (!response.ok) throw new Error('Failed to fetch notices');
            const notices = await response.json();
            
            // 1. Update Notification Bell
            if (notificationList) {
                if (notices.length === 0) {
                    notificationList.innerHTML = '<div style="padding: 16px; text-align: center; color: #888;">No new notices</div>';
                    if (notificationBadge) notificationBadge.style.display = 'none';
                } else {
                    if (notificationBadge) {
                        notificationBadge.textContent = notices.length;
                        notificationBadge.style.display = 'flex';
                    }
                    notificationList.innerHTML = notices.map(n => `
                        <div class="notification-item">
                            <div class="notification-title">${n.title}</div>
                            <div class="notification-desc">${n.description || n.type || ''}</div>
                            <div class="notification-date">${n.publishedDate || ''}</div>
                        </div>
                    `).join('');
                }
            }

            // 2. Update Home Banner (if container present)
            if (noticesContainer) {
                if (notices.length === 0) {
                    noticesContainer.style.display = 'none';
                    return;
                }
                
                let noticesHtml = notices.map(notice => {
                    return `<span style="margin-right: 50px;"><strong>${notice.title}:</strong> ${notice.description || ''} 
                    ${notice.publishedDate ? `(${notice.publishedDate})` : ''}</span>`;
                }).join('');
                
                noticesContainer.innerHTML = `
                    <div style="background-color: var(--color-primary); color: white; padding: 10px; overflow: hidden; display: flex; align-items: center;">
                        <strong style="white-space: nowrap; margin-right: 15px; padding-right: 15px; border-right: 1px solid rgba(255,255,255,0.3);">📢 Latest Announcements</strong>
                        <marquee behavior="scroll" direction="left" style="flex-grow: 1;">
                            ${noticesHtml}
                        </marquee>
                    </div>
                `;
                noticesContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
            if (noticesContainer) noticesContainer.style.display = 'none';
        }
    };
    
    fetchNotices();

    // ----------------------------------
    // 9. Dynamic Donation Bank Details
    // ----------------------------------
    const fetchDonationDetails = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/settings/donation');
            if (!response.ok) throw new Error('Failed to fetch donation details');
            const data = await response.json();

            const qrImg = document.getElementById('donate-qr-img');
            const accName = document.getElementById('donate-account-name');
            const accNum = document.getElementById('donate-account-number');
            const ifsc = document.getElementById('donate-ifsc-code');

            if (qrImg && data.qrCodeUrl) qrImg.src = data.qrCodeUrl;
            if (accName) accName.textContent = data.accountName || 'N/A';
            if (accNum) accNum.textContent = data.accountNumber || 'N/A';
            if (ifsc) ifsc.textContent = data.ifscCode || 'N/A';
        } catch (error) {
            console.error('Error fetching donation details:', error);
        }
    };

    fetchDonationDetails();

});
