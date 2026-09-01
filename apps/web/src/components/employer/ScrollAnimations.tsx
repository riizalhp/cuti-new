import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollAnimations() {
  useEffect(() => {
    // 1. Choreographed Hero Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const announcement = document.querySelector('.top-announcement');
    const heroTitle = document.querySelector('#hero-title');
    const heroSubtitle = document.querySelector('.hero__subtitle');
    const heroScroll = document.querySelector('.hero__scroll');

    if (announcement) {
      tl.fromTo(announcement, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 });
    }

    if (heroTitle && heroSubtitle) {
      tl.fromTo(
        [heroTitle, heroSubtitle],
        { opacity: 0, y: 50, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.25 },
        '-=0.4'
      );
    }

    if (heroScroll) {
      tl.fromTo(heroScroll, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.6');

      // Continuous floating bounce indicator
      gsap.to(heroScroll.querySelector('i'), {
        y: 8,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'power1.inOut',
      });
    }

    // 2. Mouse Move / Cursor Parallax on Hero Text & Card disabled as requested

    // 3. Parallax Hero Image disabled as requested

    // 4. Job Cards Staggered Entry Animation
    const jobCards = document.querySelectorAll('.job-card');
    if (jobCards.length > 0) {
      gsap.fromTo(
        jobCards,
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'back.out(1.7)',
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.job-rail',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // 5. Journey Steps Reveal Sequence
    const journeyItems = document.querySelectorAll('.journey__item');
    if (journeyItems.length > 0) {
      gsap.fromTo(
        journeyItems,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.journey__list',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // 6. Version Cards Staggered Layering Effect
    const versionCards = document.querySelectorAll('.version-card');
    if (versionCards.length > 0) {
      gsap.fromTo(
        versionCards,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.versions__stage',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // 7. Why Reasons Cards Stagger
    const whyCards = document.querySelectorAll('.why-reason');
    if (whyCards.length > 0) {
      gsap.fromTo(
        whyCards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.why-employer__reasons',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // 8. Section Headings & Frames Scroll Reveal (inside main)
    const sectionFrames = document.querySelectorAll('main .editorial-frame, .statement__body, .builder__copy');
    sectionFrames.forEach((frame) => {
      gsap.fromTo(
        frame,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: frame,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 9. Footer Reveal Smooth Fade In & Subtle Parallax Lift
    const footerInner = document.querySelector('.footer-reveal-inner');
    const footerSpacer = document.querySelector('.footer-reveal-spacer');
    if (footerInner && footerSpacer) {
      gsap.fromTo(
        footerInner,
        { opacity: 0, y: 40, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerSpacer,
            start: 'top 95%',
            end: 'bottom 100%',
            scrub: 0.6,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
