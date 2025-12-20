import './style.css'

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Données des cartes (à adapter selon vos besoins)
const stickyCardsData = [
    { img: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2800&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2800&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2800&auto=format&fit=crop" },
    { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2800&auto=format&fit=crop" },
];

// Initialisation GSAP & Lenis globale
gsap.registerPlugin(ScrollTrigger);

let lenis;
// 1. Initialisation de Lenis pour le smooth scroll
lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

export function initStickyCards() {
    // 2. Génération des cartes (si pas déjà dans le HTML)
    const container = document.querySelector(".sticky-cards");

    // Nettoyage si besoin pour éviter les doublons lors des reloads HMR
    if (container) container.innerHTML = '';
    if (container) {
        stickyCardsData.forEach((data) => {
            const card = document.createElement("div");
            // Classes Tailwind équivalentes
            card.className = "sticky-card sticky top-0 w-full h-[40svh] md:h-[100svh] will-change-transform flex items-center justify-center font-bold text-5xl text-white overflow-hidden";

            const img = document.createElement("img");
            img.src = data.img;
            img.className = "absolute inset-0 w-full h-full object-cover";
            img.alt = "Le Douze Space";
            card.appendChild(img);

            // Ajout de l'overlay pour l'effet d'assombrissement
            const overlay = document.createElement("div");
            overlay.className = "absolute inset-0 bg-black/20 pointer-events-none z-10 transition-opacity duration-100 opacity-[var(--after-opacity,0)]";
            card.appendChild(overlay);
            container.appendChild(card);
        });
    }
    // 3. Animation GSAP
    const stickyCards = document.querySelectorAll(".sticky-card");
    stickyCards.forEach((card, index) => {
        // Effet de Sticky (Pin)
        // Effet de Sticky (Pin) géré par CSS "sticky top-0"

        // Effet de Scale et Rotation sur la carte suivante
        if (index < stickyCards.length - 1) {
            const nextCard = stickyCards[index + 1];

            ScrollTrigger.create({
                trigger: nextCard,
                start: "top bottom", // Quand le haut de la prochaine carte touche le bas de l'écran
                end: "top top",      // Jusqu'à ce qu'elle soit en haut
                scrub: true,         // Synchronisé avec le scroll
                onUpdate: (self) => {
                    const progress = self.progress;
                    const scale = 1 - progress * 0.25; // Réduit l'échelle de la carte actuelle
                    const rotation = (index % 2 === 0 ? 5 : -5) * progress; // Rotation alternée
                    const afterOpacity = progress; // Assombrit la carte
                    // Applique les styles sur la carte actuelle (celle qui est sticky et qui part)
                    gsap.set(card, {
                        scale: scale,
                        rotation: rotation,
                        "--after-opacity": afterOpacity, // Modifie la variable CSS pour l'overlay
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
        const offset = 100; // Distance d'animation
        const duration = 0.5;
        // Position initiale
        gsap.set(follower, { xPercent: -50, yPercent: -50 });
        // Mouvement fluide (QuickTo)
        const xTo = gsap.quickTo(follower, 'x', { duration: 0.6, ease: 'power3' });
        const yTo = gsap.quickTo(follower, 'y', { duration: 0.6, ease: 'power3' });
        window.addEventListener('mousemove', e => {
            xTo(e.clientX);
            yTo(e.clientY);
        });
        // Logique de survol des items
        items.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                const forward = prevIndex === null || index > prevIndex;
                prevIndex = index;
                // Animation de sortie de l'ancienne image
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
                // Clonage et animation d'entrée de la nouvelle image
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
        // Sortie de la liste
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

// Lancer l'initialisation
initStickyFeature(); // Sticky Section (Plan 01/02/03)
initStickyCards();   // Gallery Pics
initLocationPreview();
initRowMarquees();
initFooterParallax();
initContactPopup();
initTextReveal(); // <-- Ajouter ici

// Force refresh after all triggers are set up
ScrollTrigger.refresh();

function initTextReveal() {
    // Exclude sticky feature texts from generic reveal because they are handled in the timeline
    const texts = document.querySelectorAll('[data-text-reveal]:not([data-sticky-feature-wrap] *)');
    texts.forEach(text => {
        // Simple reveal from bottom with opacity
        gsap.fromTo(text,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%", // Trigger a bit earlier
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

    // Universal Animation (Desktop & Mobile)
    let mm = gsap.matchMedia();

    mm.add("(min-width: 0px)", () => {
        // Pin the entire section
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

        // Animation logic for items 2 and 3
        visuals.forEach((visual, i) => {
            if (i === 0) return;

            // Visual Clip Transition
            tl.to(visual, {
                clipPath: 'inset(0% 0% 0% 0%)',
                ease: 'none'
            }, (i - 1));

            // Text Transition of PREVIOUS item (Out)
            tl.to(items[i - 1], {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut'
            }, (i - 1));

            // Text Transition of CURRENT item (Wrapper In)
            // We set the wrapper to opacity 1 first (or keep it visible but animate children)
            // Actually, we need to hide the wrapper initially? 
            // The previous logic faded the wrapper. Let's keep that but FASTER.
            tl.to(items[i], {
                opacity: 1,
                duration: 0.1, // Quick fade in of wrapper
                ease: 'power2.inOut'
            }, (i - 1) + 0.2);

            // NOW, animate the text children specifically
            const textChildren = items[i].querySelectorAll('[data-sticky-feature-text]');
            if (textChildren.length > 0) {
                tl.fromTo(textChildren,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
                    (i - 1) + 0.3 // Start slightly after visual starts
                );
            }
        });

        // Progress bar
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

    // Function to setup a single row
    const setupRow = (row, direction = 'left') => {
        if (!row) return;
        const track = row.querySelector('.partners-track');
        if (!track) return;

        // Clone content to fill screen + buffer (3x is usually safe)
        const items = track.innerHTML;
        track.innerHTML = items + items + items; // 3 sets total

        // Animation
        const moveDistance = (100 / 3); // 33.33% because we have 3 sets. We move 1 set length.

        // From 0 to -33.33% (Left) OR from -33.33% to 0 (Right/Reverse)

        if (direction === 'left') {
            gsap.to(track, {
                xPercent: -moveDistance,
                ease: "none",
                duration: 20,
                repeat: -1
            });
        } else {
            // For right movement, we start at -33.33% and move to 0
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

/* === Gestion de la Modal de Contact === */
function initContactPopup() {
    const popup = document.querySelector('[data-contact-popup]');
    const openButtons = document.querySelectorAll('[data-open-contact]');
    const closeButtons = document.querySelectorAll('[data-close-contact]');
    const form = popup ? popup.querySelector('form') : null;

    if (!popup) return;

    // Bloquer le scroll du body quand la popup est ouverte
    const disableScroll = () => {
        popup.classList.add('is-open'); // Active les classes Tailwind [&.is-open]
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop(); // Stop Lenis scrolling
    };

    // Réactiver le scroll
    const enableScroll = () => {
        popup.classList.remove('is-open');
        document.body.style.overflow = '';
        if (lenis) lenis.start(); // Resume Lenis scrolling
    };

    // Listeners Ouverture
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            disableScroll();
        });
    });

    // Listeners Fermeture (Bouton croix + Overlay)
    closeButtons.forEach(btn => {
        btn.addEventListener('click', enableScroll);
    });

    // Fermeture avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('is-open')) {
            enableScroll();
        }
    });

    // Gestion du formulaire
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