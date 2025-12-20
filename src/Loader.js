import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

// Helper to split text into chars (Alternative to SplitText)
function splitTextToChars(element) {
    const text = element.textContent;
    element.innerHTML = '';
    const chars = [];
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        if (char === ' ') span.style.width = '0.3em';
        element.appendChild(span);
        chars.push(span);
    });
    return chars;
}

export function initLoader() {
    // Defines the custom easing
    CustomEase.create("loader", "0.65, 0.01, 0.05, 0.99");

    const wrap = document.querySelector("[data-load-wrap]");
    if (!wrap) return;

    const container = wrap.querySelector("[data-load-container]");
    const bg = wrap.querySelector("[data-load-bg]");
    const progressBar = wrap.querySelector("[data-load-progress]");
    const logo = wrap.querySelector("[data-load-logo]");
    const textElements = Array.from(wrap.querySelectorAll("[data-load-text]"));

    // Reset targets
    const resetTargets = Array.from(
        wrap.querySelectorAll('[data-load-reset]:not([data-load-text])')
    );

    // Timeline
    const loadTimeline = gsap.timeline({
        defaults: {
            ease: "loader",
            duration: 3
        },
        onComplete: () => {
            wrap.style.display = "none";
        }
    })
    .set(wrap, { display: "block" })
    .to(progressBar, { scaleX: 1 })
    .to(logo, { clipPath: "inset(0% 0% 0% 0%)" }, "<")
    .to(container, { autoAlpha: 0, duration: 0.5 })
    .to(progressBar, { scaleX: 0, transformOrigin: "right center", duration: 0.5 }, "<")
    .add("hideContent", "<")
    .to(bg, { yPercent: -101, duration: 1 }, "hideContent");

    if (resetTargets.length) {
        loadTimeline.set(resetTargets, { autoAlpha: 1 }, 0);
    }

    if (textElements.length >= 2) {
        const firstChars = splitTextToChars(textElements[0]);
        const secondChars = splitTextToChars(textElements[1]);

        gsap.set([firstChars, secondChars], { autoAlpha: 0, yPercent: 125 });
        gsap.set(textElements, { autoAlpha: 1 });

        loadTimeline.to(firstChars, {
            autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 }
        }, 0);

        loadTimeline.to(firstChars, {
            autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 }
        }, ">+=0.4");

        loadTimeline.to(secondChars, {
            autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 }
        }, "<");

        loadTimeline.to(secondChars, {
            autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 }
        }, "hideContent-=0.5");
    }
}
