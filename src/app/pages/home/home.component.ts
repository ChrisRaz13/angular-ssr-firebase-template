import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SeoService } from '../../services/seo.service';

interface OyProduct {
  rank: number;
  brand: string;
  name: string;
  shortName: string;
  price: number;
  salePrice: number | null;
  rating: number;
  image: string;
  tag?: string;
  outOfStock?: boolean;
  category: string;
  highlight?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private gsapCtx: any;
  private heroMouseMove!: (e: MouseEvent) => void;
  private heroMouseLeave!: () => void;
  private heroEl!: HTMLElement;

  constructor(
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef
  ) {}

  products: OyProduct[] = [
    {
      rank: 1, brand: "d'Alba", shortName: "White Truffle Spray Serum",
      name: "White Truffle First Spray Serum 100mL Double Pack",
      price: 70.00, salePrice: 41.20, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1124/3e428fad-d1b1-41f0-b7f1-e00555d8cf8c.jpg?RS=315x420&SF=webp&QT=80',
      tag: '#1 Best Seller', category: 'Serum', highlight: 'Korea\'s most-repurchased serum'
    },
    {
      rank: 2, brand: "S.NATURE", shortName: "Aqua Squalane Cream 1+1",
      name: "Aqua Squalane Moisturizing Cream 60mL 1+1 Limited Set",
      price: 50.00, salePrice: 27.32, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1650/6b15bb5b-196b-4f62-8816-a51bfe856442.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Moisturizer', highlight: 'Buy one get one free'
    },
    {
      rank: 3, brand: "Torriden", shortName: "Dive-In HA Serum Refill Set",
      name: "Dive In Low Molecular Hyaluronic Acid Serum 50ml Refill Set",
      price: 42.00, salePrice: 31.50, rating: 4.9,
      image: 'https://cdn-image.oliveyoung.com/display/1291/5ed4a9c1-d3b8-4cff-8be0-1c42c175158e.jpg?RS=315x420&SF=webp&QT=80',
      tag: 'Top Rated', category: 'Serum', highlight: 'Rated 4.9 by 10,000+ Koreans'
    },
    {
      rank: 4, brand: "Anua", shortName: "PDRN HA Capsule Serum",
      name: "PDRN Hyaluronic Acid Capsule 100 Serum 30ml Double Pack",
      price: 67.00, salePrice: 34.84, rating: 4.9,
      image: 'https://cdn-image.oliveyoung.com/display/1361/ccb287b1-36cb-4e23-a3fb-b1a42b6db27e.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Serum', highlight: 'PDRN technology from Korea'
    },
    {
      rank: 5, brand: "beplain", shortName: "Mung Bean Cleansing Foam",
      name: "Mung Bean pH-Balanced Cleansing Foam 160ml Double Pack",
      price: 31.00, salePrice: 29.68, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1927/fcabb81a-7d60-4b8e-8c6d-4d167942e2a0.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Cleanser', highlight: 'Gentle enough for sensitive skin'
    },
    {
      rank: 6, brand: "medicube", shortName: "PDRN Pink Peptide Ampoule",
      name: "PDRN Pink Peptide Ampoule 30ml Refill Set",
      price: 54.00, salePrice: 28.87, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1124/b45371a5-5b3c-4604-af42-f83ecc9852d9.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Ampoule', highlight: 'Anti-aging PDRN formula'
    },
    {
      rank: 7, brand: "WELLAGE", shortName: "Real HA Blue Ampoule",
      name: "Real Hyaluronic Blue 100 Ampoule 75ml Double Pack",
      price: 58.00, salePrice: 34.68, rating: 4.9,
      image: 'https://cdn-image.oliveyoung.com/display/1653/f7f0174b-b0a1-4a01-9ef6-bc851187bfe1.jpg?RS=315x420&SF=webp&QT=80',
      outOfStock: true, category: 'Ampoule', highlight: '100% pure hyaluronic acid'
    },
    {
      rank: 8, brand: "ma:nyo", shortName: "Pure Cleansing Oil Double",
      name: "Pure Cleansing Oil 200ml x 2ea (+25ml Gift)",
      price: 43.00, salePrice: 30.10, rating: 4.9,
      image: 'https://cdn-image.oliveyoung.com/display/1587/93d560ea-8311-43da-bd44-9d6b1082d91d.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Cleanser', highlight: 'Melts off sunscreen & makeup'
    },
    {
      rank: 9, brand: "ongredients", shortName: "Skin Barrier Calming Lotion",
      name: "Skin Barrier Calming Lotion EX 220ml Set (+80ml)",
      price: 47.00, salePrice: null, rating: 4.7,
      image: 'https://cdn-image.oliveyoung.com/display/1164/c84db808-8a07-4a2e-896e-86552013a02a.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Lotion', highlight: 'Restores damaged skin barrier'
    },
    {
      rank: 10, brand: "BIOHEAL BOH", shortName: "Probioderm 3D Lifting Cream",
      name: "Probioderm 3D Lifting Cream 50ml Refill Set",
      price: 82.00, salePrice: null, rating: 5.0,
      image: 'https://cdn-image.oliveyoung.com/display/1263/9f574a14-a156-403e-923c-c1a65398eed7.jpg?RS=315x420&SF=webp&QT=80',
      tag: '⭐ Perfect Score', category: 'Cream', highlight: 'Rated 5.0 — zero bad reviews'
    },
    {
      rank: 11, brand: "MEDIHEAL", shortName: "Madecassoside Blemish Serum",
      name: "Madecassoside Blemish Repair Serum 40ml x2",
      price: 49.00, salePrice: 30.40, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1938/07929254-2989-4529-a767-2111e0ab7564.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Serum', highlight: 'Heals blemishes overnight'
    },
    {
      rank: 12, brand: "Torriden", shortName: "Dive-in Soothing Cream",
      name: "Dive-in Soothing Cream 100ml Double Pack",
      price: 49.00, salePrice: 36.75, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1141/9697bcba-7257-4226-85d3-c8cc1fc0f20b.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Cream', highlight: 'The glass-skin finishing cream'
    },
  ];

  get featuredProduct(): OyProduct {
    return this.products[0];
  }

  ngOnInit(): void {
    this.seoService.setPageSEO('home');
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger);
      window.scrollTo(0, 0);
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initAnimations();
  }

  private initAnimations(): void {
    this.gsapCtx = gsap.context(() => {

      // ─────────────────────────────────────────────────────
      // 1. CINEMATIC HERO ENTRANCE
      //    Sequenced like a luxury brand film — slow, measured,
      //    each element blooms into place with silky easing.
      // ─────────────────────────────────────────────────────
      const heroTl = gsap.timeline({ delay: 0.15 });

      // Background glow blooms in (scale 1.06 → 1, fade up)
      heroTl.from('.gs-hero-bg-glow', {
        opacity: 0,
        scale: 1.06,
        duration: 1.6,
        ease: 'power2.out',
      });

      // Gold top line draws across left→right
      heroTl.from('.gs-hero-topline', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.1,
        ease: 'power3.out',
      }, '-=1.1');

      // Eyebrow row: line extends, then text + dot fade in
      heroTl
        .from('.gs-eyebrow-line', {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.7,
          ease: 'power3.out',
        }, '-=0.5')
        .from('.gs-eyebrow-text', {
          opacity: 0, x: -16,
          duration: 0.55,
          ease: 'power2.out',
        }, '-=0.35')
        .from('.gs-live-dot', {
          opacity: 0, scale: 0,
          duration: 0.4,
          ease: 'back.out(2.5)',
        }, '-=0.25');

      // Headline lines stagger — large, slow, elegant
      heroTl.from('.gs-hero-title .line', {
        opacity: 0,
        y: 56,
        duration: 0.9,
        stagger: 0.2,
        ease: 'power3.out',
      }, '-=0.2');

      // Subtext & CTAs
      heroTl
        .from('.gs-hero-sub', {
          opacity: 0, y: 22,
          duration: 0.7,
          ease: 'power2.out',
        }, '-=0.4')
        .from('.gs-hero-ctas', {
          opacity: 0, y: 16,
          duration: 0.55,
          ease: 'power2.out',
        }, '-=0.3')
        .from('.gs-trust-pill', {
          opacity: 0, y: 12,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }, '-=0.2');

      // Product image: cinematic reveal from right, slight scale
      heroTl.from('.gs-hero-img-wrap', {
        opacity: 0,
        x: 64,
        scale: 0.94,
        duration: 1.1,
        ease: 'power3.out',
      }, 0.6);

      // Image glow bloom
      heroTl.from('.gs-img-glow', {
        opacity: 0,
        scale: 0.7,
        duration: 1.4,
        ease: 'power2.out',
      }, 1.0);

      // Glassmorphism cards stagger in (like they're floating into frame)
      heroTl
        .to('.gs-glass-card--tl', {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }, '-=0.4')
        .from('.gs-glass-card--tl', {
          y: 24, x: -12,
          duration: 0.8,
          ease: 'power2.out',
        }, '<')
        .to('.gs-glass-card--br', {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }, '-=0.5')
        .from('.gs-glass-card--br', {
          y: -20, x: 12,
          duration: 0.8,
          ease: 'power2.out',
        }, '<')
        .to('.gs-glass-pill--tr', {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.55')
        .from('.gs-glass-pill--tr', {
          scale: 0.6, y: 10,
          duration: 0.6,
          ease: 'back.out(2)',
        }, '<');

      // Scroll cue fades in last
      heroTl.to('.gs-scroll-cue', {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.2');

      // Marquee wrapper fades in
      heroTl.from('.gs-marquee-wrap', {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
      }, '-=0.6');

      // ─────────────────────────────────────────────────────
      // 2. SPARKLE PARTICLES — staggered fade + float up loop
      // ─────────────────────────────────────────────────────
      const particles = this.el.nativeElement.querySelectorAll('.gs-particle');
      particles.forEach((el: HTMLElement, i: number) => {
        // Staggered entrance
        gsap.to(el, {
          opacity: 0.6 + Math.random() * 0.35,
          duration: 0.6 + Math.random() * 0.4,
          delay: 1.2 + i * 0.15,
          ease: 'power2.out',
        });
        // Continuous float loop — each particle has its own rhythm
        gsap.to(el, {
          y: -(20 + Math.random() * 30),
          x: (Math.random() - 0.5) * 16,
          opacity: 0,
          duration: 3.5 + Math.random() * 2.5,
          delay: 1.8 + i * 0.2,
          repeat: -1,
          repeatDelay: Math.random() * 1.5,
          ease: 'power1.inOut',
          yoyo: false,
        });
      });

      // ─────────────────────────────────────────────────────
      // 3. CONTINUOUS FLOAT — product image gentle bob
      // ─────────────────────────────────────────────────────
      gsap.to('.gs-hero-img-float', {
        y: -16,
        duration: 4.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1.4,
      });

      // ─────────────────────────────────────────────────────
      // 4. GLASSMORPHISM CARDS — subtle float (opposite phase)
      // ─────────────────────────────────────────────────────
      gsap.to('.gs-glass-card--tl', {
        y: -8, duration: 3.8,
        yoyo: true, repeat: -1,
        ease: 'sine.inOut', delay: 1.8,
      });
      gsap.to('.gs-glass-card--br', {
        y: 8, duration: 4.6,
        yoyo: true, repeat: -1,
        ease: 'sine.inOut', delay: 2.2,
      });
      gsap.to('.gs-glass-pill--tr', {
        y: -5, duration: 3.2,
        yoyo: true, repeat: -1,
        ease: 'sine.inOut', delay: 2.0,
      });

      // ─────────────────────────────────────────────────────
      // 5. MOUSEMOVE PARALLAX — product tracks cursor elegantly
      // ─────────────────────────────────────────────────────
      this.heroEl = this.el.nativeElement.querySelector('.gs-hero');

      this.heroMouseMove = (e: MouseEvent) => {
        const rect = this.heroEl.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;

        // Background glow shifts opposite direction (depth illusion)
        gsap.to('.gs-hero-bg-glow', {
          x: x * -24, y: y * -16,
          duration: 1.4, ease: 'power2.out', overwrite: 'auto',
        });
        // Product image: main parallax movement
        gsap.to('.gs-hero-img-parallax', {
          x: x * 22, y: y * 14,
          duration: 0.9, ease: 'power2.out', overwrite: 'auto',
        });
        // Glass cards: slightly more movement (feels closer to viewer)
        gsap.to(['.gs-glass-card--tl', '.gs-glass-pill--tr'], {
          x: x * 30, y: y * 18,
          duration: 0.75, ease: 'power2.out', overwrite: 'auto',
        });
        gsap.to('.gs-glass-card--br', {
          x: x * 26, y: y * 16,
          duration: 0.85, ease: 'power2.out', overwrite: 'auto',
        });
      };

      this.heroMouseLeave = () => {
        gsap.to([
          '.gs-hero-bg-glow',
          '.gs-hero-img-parallax',
          '.gs-glass-card--tl',
          '.gs-glass-card--br',
          '.gs-glass-pill--tr',
        ], {
          x: 0, y: 0,
          duration: 1.1, ease: 'power2.out', stagger: 0.04,
        });
      };

      this.heroEl.addEventListener('mousemove', this.heroMouseMove);
      this.heroEl.addEventListener('mouseleave', this.heroMouseLeave);

      // ─────────────────────────────────────────────────────
      // 6. SCROLL PARALLAX — product rises on scroll
      // ─────────────────────────────────────────────────────
      gsap.to('.gs-hero-img-parallax', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gs-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 2,
        },
      });

      // Scroll cue fades out on scroll
      gsap.to('.gs-scroll-cue', {
        opacity: 0,
        y: 12,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: '.gs-hero',
          start: 'top top',
          end: '12% top',
          scrub: true,
        },
      });

      // ─────────────────────────────────────────────────────
      // 7. BELOW-FOLD SECTION ANIMATIONS (ScrollTrigger)
      // ─────────────────────────────────────────────────────

      // Section headers
      ScrollTrigger.create({
        trigger: '.gs-rankings-section',
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.gs-section-eyebrow, .gs-section-h2, .gs-section-sub', {
            opacity: 0, y: 30,
            duration: 0.7, stagger: 0.14,
            ease: 'power2.out',
          });
        },
        once: true,
      });

      // Product cards — stagger in with subtle scale
      ScrollTrigger.batch('.gs-prod-card', {
        onEnter: (els) => {
          gsap.from(els, {
            opacity: 0, y: 50,
            scale: 0.97,
            duration: 0.7,
            stagger: 0.07,
            ease: 'power2.out',
          });
        },
        start: 'top 90%',
        once: true,
      });

      // Trust items
      ScrollTrigger.batch('.gs-trust-item', {
        onEnter: (els) => {
          gsap.from(els, {
            opacity: 0, y: 28,
            duration: 0.6, stagger: 0.1,
            ease: 'power2.out',
          });
        },
        start: 'top 88%',
        once: true,
      });

      // Bundle section
      ScrollTrigger.create({
        trigger: '.gs-bundle-section',
        start: 'top 82%',
        onEnter: () => {
          gsap.from('.gs-bundle-left > *', {
            opacity: 0, y: 32,
            duration: 0.65, stagger: 0.12,
            ease: 'power2.out',
          });
          gsap.from('.gs-bundle-card-preview', {
            opacity: 0, x: 36,
            duration: 0.8,
            ease: 'power2.out',
          });
        },
        once: true,
      });

      // CTA section
      ScrollTrigger.create({
        trigger: '.gs-cta-section',
        start: 'top 84%',
        onEnter: () => {
          gsap.from('.gs-cta-inner > *', {
            opacity: 0, y: 36,
            duration: 0.7, stagger: 0.13,
            ease: 'power2.out',
          });
        },
        once: true,
      });

    }, this.el);
  }

  ngOnDestroy(): void {
    if (this.heroEl) {
      this.heroEl.removeEventListener('mousemove', this.heroMouseMove);
      this.heroEl.removeEventListener('mouseleave', this.heroMouseLeave);
    }
    if (this.gsapCtx) this.gsapCtx.revert();
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }

  getSalePct(price: number, sale: number): number {
    return Math.round((1 - sale / price) * 100);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
