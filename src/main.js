import './style.css'

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const stickyCardsData = [
    { img: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1600&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop" },
];

import { initLoader } from './Loader.js';

gsap.registerPlugin(ScrollTrigger);

let lenis;
// Lenis Initialization
lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

document.addEventListener("DOMContentLoaded", () => {
    initLoader(lenis);
});

export function initStickyCards() {
    // Generate Cards
    const container = document.querySelector(".sticky-cards");

    if (container) container.innerHTML = '';
    if (container) {
        stickyCardsData.forEach((data) => {
            const card = document.createElement("div");
            card.className = "sticky-card sticky top-0 w-full h-[40svh] md:h-[100svh] will-change-transform flex items-center justify-center font-bold text-5xl text-white overflow-hidden";

            const img = document.createElement("img");
            img.src = data.img;
            img.loading = "lazy";
            img.className = "absolute inset-0 w-full h-full object-cover";
            img.alt = "Le Douze Space";
            card.appendChild(img);

            const overlay = document.createElement("div");
            overlay.className = "absolute inset-0 bg-black/20 pointer-events-none z-10 transition-opacity duration-100 opacity-[var(--after-opacity,0)]";
            card.appendChild(overlay);
            container.appendChild(card);
        });
    }
    // GSAP Animations
    const stickyCards = document.querySelectorAll(".sticky-card");
    stickyCards.forEach((card, index) => {
        if (index < stickyCards.length - 1) {
            const nextCard = stickyCards[index + 1];

            ScrollTrigger.create({
                trigger: nextCard,
                start: "top bottom",
                end: "top top",
                scrub: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const scale = 1 - progress * 0.25;
                    const rotation = (index % 2 === 0 ? 5 : -5) * progress;
                    const afterOpacity = progress;
                    gsap.set(card, {
                        scale: scale,
                        rotation: rotation,
                        "--after-opacity": afterOpacity,
                    });
                },
            });
        }
    });
}

export function initLocationPreview() {
    const wrappers = document.querySelectorAll('[data-follower-wrap]');
    wrappers.forEach(wrap => {
        const collection = wrap.querySelector('[data-follower-collection]');
        const items = wrap.querySelectorAll('[data-follower-item]');
        const follower = wrap.querySelector('[data-follower-cursor]');
        const followerInner = wrap.querySelector('[data-follower-cursor-inner]');
        if (!collection || !follower || !followerInner) return;
        let prevIndex = null;
        let firstEntry = true;
        const offset = 100;
        const duration = 0.5;
        gsap.set(follower, { xPercent: -50, yPercent: -50 });
        const xTo = gsap.quickTo(follower, 'x', { duration: 0.6, ease: 'power3' });
        const yTo = gsap.quickTo(follower, 'y', { duration: 0.6, ease: 'power3' });
        window.addEventListener('mousemove', e => {
            xTo(e.clientX);
            yTo(e.clientY);
        });
        items.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                const forward = prevIndex === null || index > prevIndex;
                prevIndex = index;
                follower.querySelectorAll('[data-follower-visual]').forEach(el => {
                    gsap.killTweensOf(el);
                    gsap.to(el, {
                        yPercent: forward ? -offset : offset,
                        duration,
                        ease: 'power2.inOut',
                        overwrite: 'auto',
                        onComplete: () => el.remove()
                    });
                });
                const visual = item.querySelector('[data-follower-visual]');
                if (!visual) return;
                const clone = visual.cloneNode(true);
                followerInner.appendChild(clone);
                if (!firstEntry) {
                    gsap.fromTo(clone,
                        { yPercent: forward ? offset : -offset },
                        { yPercent: 0, duration, ease: 'power2.inOut', overwrite: 'auto' }
                    );
                } else {
                    firstEntry = false;
                }
            });
        });
        collection.addEventListener('mouseleave', () => {
            follower.querySelectorAll('[data-follower-visual]').forEach(el => {
                gsap.killTweensOf(el);
                gsap.delayedCall(duration, () => el.remove());
            });
            firstEntry = true;
            prevIndex = null;
        });
    });
}

// Initialize Modules
initStickyFeature();
initStickyCards();
initLocationPreview();
initRowMarquees();
initFooterParallax();
initContactPopup();
initTextReveal();
initParallaxImages();

window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

ScrollTrigger.refresh();

function initParallaxImages() {
    const images = document.querySelectorAll('[data-parallax-img]');
    images.forEach(img => {
        gsap.fromTo(img,
            {
                scale: 1.3,
                yPercent: -15
            },
            {
                yPercent: 15,
                scale: 1.0,
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });
}

function initTextReveal() {
    const texts = document.querySelectorAll('[data-text-reveal]:not([data-sticky-feature-wrap] *)');
    texts.forEach(text => {
        gsap.fromTo(text,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}


function initStickyFeature() {
    const wrap = document.querySelector('[data-sticky-feature-wrap]');
    if (!wrap) return;

    const visuals = wrap.querySelectorAll('[data-sticky-feature-visual-wrap]');
    const items = wrap.querySelectorAll('[data-sticky-feature-item]');
    const progress = wrap.querySelector('[data-sticky-feature-progress]');

    let mm = gsap.matchMedia();

    mm.add("(min-width: 0px)", () => {
        visuals.forEach((v, i) => {
            if (i === 0) {
                gsap.set(v, { clipPath: 'inset(0% 0% 0% 0%)' });
            } else {
                gsap.set(v, { clipPath: 'inset(100% 0% 0% 0%)' });
            }
        });

        items.forEach((item, i) => {
            if (i === 0) {
                gsap.set(item, { opacity: 1 });
                gsap.set(item.querySelectorAll('[data-sticky-feature-text]'), { opacity: 1, y: 0 });
            } else {
                gsap.set(item, { opacity: 0 });
                gsap.set(item.querySelectorAll('[data-sticky-feature-text]'), { opacity: 0, y: 30 });
            }
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: wrap,
                start: "top top",
                end: "+=" + (window.innerHeight * 3),
                pin: true,
                scrub: 1,
                anticipatePin: 1,
            }
        });

        visuals.forEach((visual, i) => {
            if (i === 0) return;

            tl.to(visual, {
                clipPath: 'inset(0% 0% 0% 0%)',
                ease: 'none'
            }, (i - 1));

            tl.to(items[i - 1], {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut'
            }, (i - 1));

            tl.to(items[i], {
                opacity: 1,
                duration: 0.1,
                ease: 'power2.inOut'
            }, (i - 1) + 0.2);

            const textChildren = items[i].querySelectorAll('[data-sticky-feature-text]');
            if (textChildren.length > 0) {
                tl.fromTo(textChildren,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
                    (i - 1) + 0.3
                );
            }
        });

        tl.to(progress, {
            scaleX: 1,
            ease: 'none'
        }, 0);

        return () => {
            // Clean up if needed
        };
    });
}

function initRowMarquees() {
    const leftRow = document.querySelector('.partners-row-left');
    const rightRow = document.querySelector('.partners-row-right');

    const setupRow = (row, direction = 'left') => {
        if (!row) return;
        const track = row.querySelector('.partners-track');
        if (!track) return;

        const items = track.innerHTML;
        track.innerHTML = items + items + items;

        const moveDistance = (100 / 3);

        if (direction === 'left') {
            gsap.to(track, {
                xPercent: -moveDistance,
                ease: "none",
                duration: 20,
                repeat: -1
            });
        } else {
            gsap.fromTo(track,
                { xPercent: -moveDistance },
                { xPercent: 0, ease: "none", duration: 20, repeat: -1 }
            );
        }
    };

    setupRow(leftRow, 'left');
    setupRow(rightRow, 'right');
}

function initFooterParallax() {
    document.querySelectorAll('[data-footer-parallax]').forEach(el => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: 'clamp(top bottom)',
                end: 'clamp(top top)',
                scrub: true
            }
        });

        const inner = el.querySelector('[data-footer-parallax-inner]');
        const dark = el.querySelector('[data-footer-parallax-dark]');

        if (inner) {
            tl.from(inner, {
                yPercent: -25,
                ease: 'linear'
            });
        }

        if (dark) {
            tl.from(dark, {
                opacity: 0.5,
                ease: 'linear'
            }, '<');
        }
    });
}

/* === Contact Modal Management === */
function initContactPopup() {
    const popup = document.querySelector('[data-contact-popup]');
    const openButtons = document.querySelectorAll('[data-open-contact]');
    const closeButtons = document.querySelectorAll('[data-close-contact]');
    const form = popup ? popup.querySelector('form') : null;

    if (!popup) return;

    const disableScroll = () => {
        popup.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
    };

    const enableScroll = () => {
        popup.classList.remove('is-open');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
    };

    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            disableScroll();
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', enableScroll);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('is-open')) {
            enableScroll();
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Formulaire soumis');
            alert('Merci ! Votre message a bien été envoyé.');
            enableScroll();
            form.reset();
        });
    }
}