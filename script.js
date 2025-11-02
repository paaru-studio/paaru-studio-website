// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in effect to sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.about-section, .advertising-section, .podcast-section, .clients-section, .testimonials-section, .contact-section');
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
});

// Animate service items on scroll
const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const serviceItems = document.querySelectorAll('.service-item, .ad-solution, .plan-card, .client-logo');
    
    serviceItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        serviceObserver.observe(item);
    });
});

// Mobile menu toggle (placeholder for future implementation)
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / 800);
    }
});

// Dynamic gradient effect on hero
document.addEventListener('mousemove', (e) => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        hero.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(99, 102, 241, 0.05), transparent)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Counter animation for statistics (if needed in future)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Typing effect for hero title (optional)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Add hover effect to cards
document.querySelectorAll('.service-item, .plan-card, .ad-solution').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Smooth reveal for testimonials
const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1)';
        }
    });
}, { threshold: 0.2 });

document.addEventListener('DOMContentLoaded', () => {
    const testimonials = document.querySelectorAll('.testimonial-card');
    testimonials.forEach(testimonial => {
        testimonial.style.opacity = '0';
        testimonial.style.transform = 'scale(0.95)';
        testimonial.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        testimonialObserver.observe(testimonial);
    });
});

console.log('Paaru Studio website loaded successfully! 🚀');

/* Video modal: idempotent modal that opens YouTube iframes when a .video-poster is clicked.
   Adds centered popup playback for portfolio tiles. */
(function(){
    if (window.__ps_video_modal_installed) return;
    window.__ps_video_modal_installed = true;

    var modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = '<div class="modal-inner" role="dialog" aria-modal="true"></div><button class="close-btn" aria-label="Close">✕</button>';
    document.body.appendChild(modal);
    var modalInner = modal.querySelector('.modal-inner');
    var closeBtn = modal.querySelector('.close-btn');

    function openModal(videoId){
        if (!videoId) return;
        // lock scroll
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
        modalInner.innerHTML = '';
        var iframe = document.createElement('iframe');
        var src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?rel=0&autoplay=1&modestbranding=1&controls=1';
        iframe.setAttribute('src', src);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.width = '100%'; iframe.style.height = '100%';
        modalInner.appendChild(iframe);
        // move focus to close button for accessibility
        closeBtn.focus();
    }

    function closeModal(){
        modal.classList.remove('active');
        modalInner.innerHTML = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeModal(); });

    // delegate clicks on poster buttons
    document.addEventListener('click', function(e){
        var btn = e.target.closest && e.target.closest('.video-poster');
        if (!btn) return;
        var container = btn.closest && btn.closest('.video-embed');
        var vid = container && container.getAttribute('data-video-id');
        if (vid) {
            openModal(vid);
            e.preventDefault();
            e.stopPropagation();
        }
    });
})();
