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

    // 2. Version Cards Staggered Layering Effect (Chapter 04 Manage)
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

    // 3. Section Headings & Frames Scroll Reveal
    const sectionFrames = document.querySelectorAll('main .editorial-frame, .statement__body');
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

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
