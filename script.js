/* Museum of the Land of Frankincense — site scripts */

let currentLanguage = 'ar';

const LANG_CONFIG = {
    ar: { dir: 'rtl', label: 'العربية' },
    en: { dir: 'ltr', label: 'English' },
    de: { dir: 'ltr', label: 'Deutsch' },
    fr: { dir: 'ltr', label: 'Français' }
};

function changeLanguage(lang, triggerEl) {
    if (!LANG_CONFIG[lang]) return;
    currentLanguage = lang;

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const { dir } = LANG_CONFIG[lang];
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.classList.toggle('lang-rtl', dir === 'rtl');
    document.body.classList.toggle('lang-ltr', dir === 'ltr');

    updatePageText(lang);

    if (triggerEl) {
        try {
            localStorage.setItem('museum-lang', lang);
        } catch (_) { /* ignore */ }
    }
}

function updatePageText(lang) {
    document.querySelectorAll('[data-ar]').forEach((element) => {
        const text = element.getAttribute(`data-${lang}`);
        if (!text) return;

        if (element.dataset.html === 'true') {
            element.innerHTML = text;
        } else {
            element.textContent = text;
        }
    });

    document.querySelectorAll('[data-placeholder-ar]').forEach((element) => {
        const placeholder = element.getAttribute(`data-placeholder-${lang}`);
        if (placeholder) element.placeholder = placeholder;
    });

    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        const label = navToggle.getAttribute(`data-label-${lang}`);
        if (label) navToggle.setAttribute('aria-label', label);
    }
}

function submitForm(event) {
    event.preventDefault();
    const form = event.target;
    const messages = {
        ar: 'شكراً لك! سيتم فتح بريدك الإلكتروني لإرسال الرسالة.',
        en: 'Thank you! Your email client will open to send the message.',
        de: 'Danke! Ihr E-Mail-Programm wird zum Senden geöffnet.',
        fr: 'Merci ! Votre client e-mail s’ouvrira pour envoyer le message.'
    };

    const name = form.querySelector('[name="name"]')?.value || '';
    const email = form.querySelector('[name="email"]')?.value || '';
    const subject = form.querySelector('[name="subject"]')?.value || '';
    const message = form.querySelector('[name="message"]')?.value || '';
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailSubject = encodeURIComponent(subject || 'Museum inquiry');
    window.location.href = `mailto:info@oman.om?subject=${mailSubject}&body=${body}`;

    const status = form.querySelector('.form-status');
    if (status) {
        status.textContent = messages[currentLanguage];
        status.hidden = false;
    }
    form.reset();
}

/* Mobile navigation */
function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    if (!toggle || !nav) return;

    const closeNav = () => {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        if (overlay) overlay.classList.remove('is-visible');
    };

    const openNav = () => {
        nav.classList.add('is-open');
        toggle.classList.add('is-active');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
        if (overlay) overlay.classList.add('is-visible');
    };

    toggle.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) closeNav();
        else openNav();
    });

    overlay?.addEventListener('click', closeNav);

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeNav();
    });
}

/* Navbar scroll state */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

/* Scroll reveal */
function initScrollReveal() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document
        .querySelectorAll(
            '.reveal, .visit-card, .gallery-item, .exhibit-detailed-card, .unesco-card'
        )
        .forEach((el) => observer.observe(el));
}

/* Gallery lightbox */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (!lightbox || !lightboxImg) return;

    const open = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        if (lightboxCaption) lightboxCaption.textContent = alt || '';
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
    };

    const close = () => {
        lightbox.hidden = true;
        lightboxImg.src = '';
        document.body.classList.remove('lightbox-open');
    };

    document.querySelectorAll('[data-lightbox]').forEach((img) => {
        img.addEventListener('click', () => open(img.dataset.full || img.src, img.alt));
        img.style.cursor = 'pointer';
    });

    lightbox.querySelector('.lightbox-close')?.addEventListener('click', close);
    lightbox.querySelector('.lightbox-backdrop')?.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) close();
    });
}

/* Smooth active nav link */
function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.getAttribute('id');
                links.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            });
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
}

document.addEventListener('DOMContentLoaded', () => {
    let savedLang = 'ar';
    try {
        savedLang = localStorage.getItem('museum-lang') || 'ar';
    } catch (_) { /* ignore */ }

    if (!LANG_CONFIG[savedLang]) {
        const browser = navigator.language.slice(0, 2);
        savedLang = LANG_CONFIG[browser] ? browser : 'ar';
    }

    const activeBtn = document.querySelector(`.lang-btn[data-lang="${savedLang}"]`);
    changeLanguage(savedLang, activeBtn);

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage(btn.dataset.lang, btn);
        });
    });

    initNavigation();
    initNavbarScroll();
    initScrollReveal();
    initLightbox();
    initActiveSection();

    document.getElementById('year')?.append(new Date().getFullYear().toString());
});
