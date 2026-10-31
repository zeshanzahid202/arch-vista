"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export function AmbientMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>(".philosophy > .picture")
        .forEach((element) => {
          gsap.fromTo(
            element.querySelector("img"),
            { scale: 1.1, yPercent: -3 },
            {
              scale: 1.1,
              yPercent: 3,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        });
      gsap.from(".footer-top", {
        y: 25,
        opacity: 0.6,
        duration: 1,
        scrollTrigger: { trigger: ".footer", start: "top 95%", once: true },
      });
    });
    return () => context.revert();
  }, []);
  return null;
}
