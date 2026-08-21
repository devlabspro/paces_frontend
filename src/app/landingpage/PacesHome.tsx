"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  CircleDot,
  Database,
  Monitor,
  PanelsTopLeft,
  RadioTower,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import styles from "./paces.module.css";

const A = "/paces-assets/";

const partners = [
  "a7d48b74430ad97c.png",
  "ad3215a522420042.png",
  "665a8c5368a60c64.png",
  "53d7fb466429ade3.png",
  "f2f4940302e16bfd.png",
  "db34cadcf6c88594.png",
  "d7b848a184222594.png",
];

const testimonials = [
  {
    quote: "Every mistake you make in the beginning process of a project costs 10x down the line or could kill a project. Paces provides the data that eliminates a lot of those mistakes.",
    name: "Scott Aaronson",
    role: "CEO and Founder of Demeter Land Development",
  },
  {
    quote: "Paces gives us the intelligence to move quickly, evaluate more opportunities, and stay focused on the projects with a real path to power.",
    name: "Energy Development Leader",
    role: "Utility-scale development team",
  },
  {
    quote: "The platform brings the data and diligence workflows together in one place, so our team can make better decisions much earlier.",
    name: "Director of Development",
    role: "National power developer",
  },
];

const footerGroups = [
  { title: "Solutions", links: [["Power Developers", "https://www.paces.com/power-developers"], ["Data Center Developers", "https://www.paces.com/data-center-developers"]] },
  { title: "Product", links: [["Overview", "https://www.paces.com/products/overview"], ["Software", "https://www.paces.com/products/software"], ["Reports", "https://www.paces.com/products/reports"], ["Services", "https://www.paces.com/products/services"]] },
  { title: "Resources", links: [["Case Studies", "https://www.paces.com/case-studies"], ["Reports", "https://www.paces.com/reports"], ["Blog", "https://www.paces.com/blog"], ["Podcast", "https://www.paces.com/podcast"], ["News", "https://www.paces.com/news"], ["White Papers", "https://www.paces.com/white-papers"]] },
  { title: "Company", links: [["About us", "https://www.paces.com/about"], ["Careers", "https://www.paces.com/careers"], ["Contact", "/contact"], ["FAQ", "https://www.paces.com/faq"], ["For AI", "https://www.paces.com/for-ai"], ["Login", "/login"]] },
];

const loginUrl = "/login";

const navMenus = [
  {
    label: "Solutions",
    links: [["Power Developers", "https://www.paces.com/power-developers", RadioTower], ["Data Center Developers", "https://www.paces.com/data-center-developers", Database]],
  },
  {
    label: "Product",
    links: [["Overview", "https://www.paces.com/products/overview", CircleDot], ["AI Agent", "https://www.paces.com/products/ai", Bot], ["Software", "https://www.paces.com/products/software", Monitor], ["Reports", "https://www.paces.com/products/reports", PanelsTopLeft], ["Services", "https://www.paces.com/products/services", Wrench]],
  },
  {
    label: "Resources",
    links: [["Case Studies", "https://www.paces.com/case-studies", ArrowRight], ["Reports", "https://www.paces.com/reports", ArrowRight], ["Blog", "https://www.paces.com/blog", ArrowRight], ["Podcast", "https://www.paces.com/podcast", ArrowRight], ["News", "https://www.paces.com/news", ArrowRight], ["White Papers", "https://www.paces.com/white-papers", ArrowRight]],
  },
] as const;

type ArrowButtonProps = {
  label: string;
  light?: boolean;
  onClick?: () => void;
};

function ArrowButton({ label, light = false, onClick }: ArrowButtonProps) {
  return (
    <button className={`${styles.arrowButton} ${light ? styles.arrowButtonLight : ""}`} type="button" onClick={onClick}>
      <span className={styles.buttonLabel}>{label}</span>
      <span className={styles.arrow} aria-hidden="true">
        <span className={styles.arrowTrack}><span>⇢</span><span>⇢</span></span>
      </span>
    </button>
  );
}

function NavChevron() {
  return (
    <span aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 13.171 16.95 8.222l1.414 1.414L12 16 5.636 9.636 7.05 8.222 12 13.171Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function ConsentCookieIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 29 28" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.377 4.2453C20.9009 4.2453 21.3264 4.67081 21.3264 5.19476C21.3264 5.7187 20.9009 6.14421 20.377 6.14421C19.853 6.14421 19.4275 5.7187 19.4275 5.19476C19.4291 4.67081 19.853 4.2453 20.377 4.2453ZM20.631 12.5141C21.4503 13.7367 22.4871 14.1114 23.8335 13.2842C23.8779 13.7446 23.889 14.2146 23.8652 14.6909C23.6001 19.9558 19.1179 24.0092 13.853 23.7441C8.58975 23.4774 4.53631 18.9952 4.80146 13.7319C5.06502 8.46705 9.70275 4.36914 14.966 4.63429C14.4992 6.09499 14.8946 7.39216 16.0822 7.83355C15.0057 11.2916 17.4095 13.5541 20.631 12.5141ZM9.55668 11.833C10.3458 11.833 10.984 12.4729 10.984 13.2604C10.984 14.0479 10.3442 14.6877 9.55668 14.6877C8.76758 14.6877 8.12932 14.0479 8.12932 13.2604C8.12932 12.4729 8.76917 11.833 9.55668 11.833ZM14.0531 13.6525C14.5072 13.6525 14.8755 14.0209 14.8755 14.475C14.8755 14.9291 14.5072 15.2974 14.0531 15.2974C13.599 15.2974 13.2307 14.9291 13.2307 14.475C13.2291 14.0209 13.5974 13.6525 14.0531 13.6525ZM10.4839 17.0407C11.038 17.0407 11.4873 17.4901 11.4873 18.0442C11.4873 18.5983 11.038 19.0476 10.4839 19.0476C9.92979 19.0476 9.48047 18.5983 9.48047 18.0442C9.48047 17.4885 9.92979 17.0407 10.4839 17.0407ZM12.6464 9.36252C13.0814 9.36252 13.4323 9.715 13.4323 10.1484C13.4323 10.5835 13.0798 10.9344 12.6464 10.9344C12.2113 10.9344 11.8605 10.5819 11.8605 10.1484C11.8605 9.715 12.2129 9.36252 12.6464 9.36252ZM16.9173 17.3916C17.6461 17.3916 18.2352 17.9823 18.2352 18.7094C18.2352 19.4382 17.6445 20.0272 16.9173 20.0272C16.1886 20.0272 15.5995 19.4366 15.5995 18.7094C15.5995 17.9823 16.1902 17.3916 16.9173 17.3916ZM19.6927 7.91293C20.1817 7.91293 20.5786 8.30986 20.5786 8.79888C20.5786 9.2879 20.1817 9.68483 19.6927 9.68483C19.2037 9.68483 18.8067 9.2879 18.8067 8.79888C18.8067 8.30986 19.2037 7.91293 19.6927 7.91293Z"
        fill="currentColor"
      />
    </svg>
  );
}

function NavDropdown({ label, links }: { label: string; links: ReadonlyArray<readonly [string, string, LucideIcon]> }) {
  return (
    <details
      onMouseEnter={(event) => { event.currentTarget.open = true; }}
      onMouseLeave={(event) => { event.currentTarget.open = false; }}
      onFocus={(event) => { event.currentTarget.open = true; }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false;
      }}
    >
      <summary
        onClick={(event) => {
          event.preventDefault();
          (event.currentTarget.parentElement as HTMLDetailsElement).open = true;
        }}
      >
        {label} <NavChevron />
      </summary>
      <div className={styles.navDropdownPanel}>
        {links.map(([text, href, Icon]) => (
          <a href={href} key={text}>
            <Icon aria-hidden="true" strokeWidth={1.55} />
            <span>{text}</span>
          </a>
        ))}
      </div>
    </details>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="contact-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close contact form">×</button>
        {!sent ? (
          <>
            <p className={styles.eyebrow}>Talk to Paces</p>
            <h2 id="contact-title">Get your projects to power faster.</h2>
            <p>Tell us a little about your team and we&apos;ll show you how Paces can accelerate development.</p>
            <form onSubmit={submit}>
              <div className={styles.formRow}>
                <label>First name<input required name="firstName" /></label>
                <label>Last name<input required name="lastName" /></label>
              </div>
              <label>Work email<input required type="email" name="email" /></label>
              <label>Company<input required name="company" /></label>
              <button className={styles.formSubmit} type="submit">Submit <span>⇢</span></button>
            </form>
          </>
        ) : (
          <div className={styles.successMessage}>
            <div>✓</div><h2>Thanks for reaching out.</h2><p>This frontend demo is ready for a backend form integration when you are.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PacesHome() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  const [emailMessage, setEmailMessage] = useState("");
  const [cookieBannerOpen, setCookieBannerOpen] = useState(false);
  const [cookiePreferencesOpen, setCookiePreferencesOpen] = useState(false);

  useEffect(() => {
    setCookieBannerOpen(!window.localStorage.getItem("paces-cookie-preference"));
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add(styles.revealed));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(styles.revealed);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function saveCookiePreference(preference: "accepted" | "rejected") {
    window.localStorage.setItem("paces-cookie-preference", preference);
    setCookieBannerOpen(false);
    setCookiePreferencesOpen(false);
  }

  function signup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailMessage("Thanks — you’re on the list.");
  }

  const currentTestimonial = testimonials[testimonial];
  const openContact = () => router.push("/contact");

  return (
    <div className={styles.site}>
      <a className={styles.announcement} href="https://www.paces.com/webinar-ai-in-energy-development">
        Access the webinar on demand: AI in energy development. <span>›</span>
      </a>

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Paces home">
          <Image src={`${A}92302db92292018f.svg`} alt="Paces" width={145} height={46} priority />
        </a>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navMenus.map((menu) => <NavDropdown key={menu.label} label={menu.label} links={menu.links} />)}
          <a href="https://www.paces.com/about">About Us</a>
        </nav>
        <div className={styles.headerActions}>
          <a href={loginUrl}>Sign In</a>
          <ArrowButton label="Get in Touch" onClick={openContact} />
          <button className={styles.menu} type="button" aria-label="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "×" : "☰"}</button>
        </div>
      </header>

      {menuOpen ? (
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          <a href="https://www.paces.com/power-developers" onClick={() => setMenuOpen(false)}>Solutions</a>
          <a href="https://www.paces.com/products/overview" onClick={() => setMenuOpen(false)}>Product</a>
          <a href="https://www.paces.com/blog" onClick={() => setMenuOpen(false)}>Resources</a>
          <a href="https://www.paces.com/about" onClick={() => setMenuOpen(false)}>About Us</a>
          <a href={loginUrl}>Sign In</a>
          <ArrowButton label="Get in Touch" onClick={() => { setMenuOpen(false); openContact(); }} />
        </nav>
      ) : null}

      <main id="top">
        <section className={styles.hero}>
          <video autoPlay muted loop playsInline poster={`${A}c5c0e58ae6f6377c.jpg`} aria-label="Aerial views of energy infrastructure development">
            <source src={`${A}hero.mp4`} type="video/mp4" />
          </video>
          <div className={styles.heroShade} />
          <div className={styles.heroContent}>
            <h1>
              <span className={styles.heroLine}>De-risked projects.</span><br />
              <span className={`${styles.heroLine} ${styles.heroAccent}`}>Powered faster.</span>
            </h1>
            <p>Paces helps energy infrastructure teams find viable sites, de-risk development, and get to power faster.</p>
            <ArrowButton label="Get in Touch" onClick={openContact} />
          </div>
        </section>

        <section className={styles.trust} aria-label="Trusted customers">
          <p>Trusted by the leaders in energy development</p>
          <div className={styles.logoViewport}>
            <div className={styles.logoRail}>
              {[...partners, ...partners].map((partner, index) => (
                <Image key={`${partner}-${index}`} src={`${A}${partner}`} alt="Paces customer" width={150} height={70} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.benefits}>
          <div className={styles.splitHeading} data-reveal="fade">
            <h2>More viable projects in the pipeline, faster</h2>
            <p>Don&apos;t let unexpected risks or costs derail your projects. De-risk development and identify the path to power earlier with intelligent data and expert-backed services.</p>
          </div>
          <div className={styles.benefitGrid}>
            <article data-reveal="card"><Image src={`${A}607e706ea4196169.svg`} alt="" width={242} height={242} /><h3>De-risk earlier</h3><p>Catch grid, environmental, and permitting risks before investing time and resources.</p></article>
            <article data-reveal="card"><Image src={`${A}2291b536e92fa297.svg`} alt="" width={242} height={242} /><h3>Accelerate development</h3><p>Shorten timelines by automating diligence. Move from origination to construction-ready in half the time.</p></article>
            <article data-reveal="card"><Image src={`${A}fb9a0735d08c1f0d.svg`} alt="" width={242} height={242} /><h3>Scale confidently</h3><p>Do more with fewer resources through automation and expert support.</p></article>
          </div>
          <div className={styles.centerCta}><ArrowButton label="Get in Touch" onClick={openContact} /></div>
        </section>

        <section className={styles.comparison}>
          <h2 data-reveal="fade">Traditional development is broken</h2>
          <div className={styles.timelineCard} data-reveal="expand">
            <div className={styles.timelineRow}>
              <div className={styles.timelineLabel}>Traditional<br />Development</div>
              <div className={styles.timeline}>
                <span>Siting</span><span>Due Diligence</span><span>Submission</span><span>Shovel Ready</span>
                <i>Land</i><i>Power</i><i>Permitting</i><i>Interconnection</i><i>Permitting</i>
              </div>
            </div>
            <div className={styles.timelineRow}>
              <div className={styles.timelineLabel}>Development<br />with Paces</div>
              <div className={`${styles.timeline} ${styles.pacesTimeline}`}>
                <span>Siting</span><span>Due Diligence</span><span>Submission</span><span />
                <b>Shovel<br />Ready</b><i>Land</i><i>Power</i><i>Interconnection</i><i>Permitting</i><i>Permitting</i>
              </div>
            </div>
          </div>
          <div className={styles.comparisonFoot} data-reveal="fade">
            <p>Projects lag because of sequential, manual, and siloed workflows. Paces enables the future of renewable development with a new model. Built to automate work, enable parallel development stages, and reach power up to <strong>3× faster.</strong></p>
            <div><ArrowButton label="Get in Touch" onClick={openContact} /><a href="https://www.paces.com/products/overview">Explore the product <span>↗</span></a></div>
          </div>
        </section>

        <section className={styles.audiences} id="audiences">
          <div className={styles.splitHeading} data-reveal="fade">
            <h2>Built for every player of power development</h2>
            <p>Paces accelerates how power gets built by helping developers and utilities move faster, together.</p>
          </div>
          <div className={styles.audienceGrid}>
            <article data-reveal="card"><div className={styles.audienceImage}><Image src={`${A}81059286160703c1.avif`} alt="Solar energy development" fill sizes="(max-width: 800px) 100vw, 50vw" /></div><h3>Power Developers</h3><p>Grow pipeline faster by de-risking and automating diligence to focus only on the projects most likely to succeed.</p><a href="https://www.paces.com/power-developers">Learn More <span>⇢</span></a></article>
            <article data-reveal="card"><div className={styles.audienceImage}><Image src={`${A}1fadaa458721740b.avif`} alt="Data center campus" fill sizes="(max-width: 800px) 100vw, 50vw" /></div><h3>Data Center Developers</h3><p>Secure power faster by identifying viable sites and assessing grid and permitting constraints early.</p><a href="https://www.paces.com/data-center-developers">Learn More <span>⇢</span></a></article>
          </div>
        </section>

        <section className={styles.testimonialSection} aria-label="Customer testimonial">
          <div className={styles.testimonialCard} data-reveal="expand">
            <div className={styles.testimonialLogo}><Image src={`${A}74354aef214b7b56.svg`} alt="Demeter Land Development" width={360} height={190} /></div>
            <div className={styles.testimonialCopy}>
              <blockquote>“{currentTestimonial.quote}”</blockquote>
              <div className={styles.testimonialBottom}><p>{currentTestimonial.name}<em>{currentTestimonial.role}</em></p><div><button type="button" aria-label="previous slide" onClick={() => setTestimonial((current) => (current - 1 + testimonials.length) % testimonials.length)}>←</button><button type="button" aria-label="next slide" onClick={() => setTestimonial((current) => (current + 1) % testimonials.length)}>→</button></div></div>
            </div>
          </div>
        </section>

        <section className={styles.product} id="product">
          <div className={styles.productHeading} data-reveal="fade"><h2>AI, Software and Services for speed and scale</h2><p>An AI Agent that orchestrates a unified stack of software, modular reports, and expert validated services to accelerate site viability, identify grid constraints, and unlock new scale in power development.</p></div>
          <ProductPanel reveal title="AI Agent and Software for faster development" intro="Accelerate your project pipeline and halve the time to shovel-ready, with AI and software backed by world-class data and human expert validation." bullets={[["9f02e72d4f5fbb05.svg","AI Agent autonomously completes key workflows"],["4cd24002349508e0.svg","Find better sites and obtain site control, faster"],["b4dae62b6c32e8f8.svg","De-risk projects early and with confidence"]]} buttons={[["Explore AI Agent","https://www.paces.com/products/ai"],["Explore Software","https://www.paces.com/products/software"]]} image="4736602776b2cc1d.avif" imageAlt="Paces software interface" />
          <ProductPanel reveal title="Expert-grade Services and Reports, built for speed" intro="Combining human expertise and AI to help energy move faster from concept to power." bullets={[["6e826cdc57e3053b.svg","Power and Permitting Reports, delivered at 5x the speed"],["b4dae62b6c32e8f8.svg","Expert-validated results you can act on with confidence"],["558584dc301f094c.svg","Scale your pipeline without scaling your headcount"]]} buttons={[["Explore Reports","https://www.paces.com/products/reports"],["Explore Services","https://www.paces.com/products/services"]]} image="fa14653ac0d2453f.avif" imageAlt="Paces expert services interface" />
        </section>

        <section className={styles.resources} id="resources">
          <div className={styles.resourcesHead} data-reveal="fade"><h2>Stay up to date on all things power development</h2><a href="https://www.paces.com/blog">Read More <span>⇢</span></a></div>
          <div className={styles.resourceGrid}>
            <ResourceCard reveal tag="Report" title="Hansford County, Texas Power Flow Study: How ERCOT can enable 1,345 MW of new load by 2030" image="8161752acbde9480.avif" href="https://www.paces.com/reports/hansford-county-texas-power-flow-study" />
            <ResourceCard reveal tag="Blog" title="The One-Person, Billion-Dollar Power Development Company" image="aedc26130d79d83d.avif" href="https://www.paces.com/post/the-one-person-billion-dollar-power-development-company" />
            <ResourceCard reveal tag="Case Study" title="How Demeter Land Development de-risks origination and triples success with Paces" image="82df18a11753ffd9.avif" href="https://www.paces.com/case-studies/how-demeter-land-development-de-risks-origination-and-triples-success-with-paces" />
          </div>
        </section>

        <section className={styles.ctaSection} id="contact">
          <div className={styles.signup} data-reveal="expand">
            <Image src={`${A}1fa8e5c10cc58d82.avif`} alt="Aerial energy development landscape" fill sizes="100vw" />
            <div className={styles.signupShade} />
            <div className={styles.signupContent}><h2>Sign up for emails</h2><p>Find the right sites faster, assess feasibility with world class data, and track progress across your entire project pipeline with software built to compress your workflow.</p><form onSubmit={signup}><input type="email" required aria-label="Email Address" placeholder="EMAIL ADDRESS" /><button aria-label="Submit email" type="submit">⇢</button></form>{emailMessage ? <div className={styles.emailMessage} role="status">{emailMessage}</div> : null}</div>
          </div>
        </section>
      </main>

      <footer className={styles.footer} id="about">
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}><Image src={`${A}4287cedd0410ac74.svg`} alt="Paces" width={145} height={50} /></div>
          {footerGroups.map((group) => (
            <div className={styles.footerColumn} key={group.title}>
              <h3>{group.title}</h3>
              <div>{group.links.map(([label, href]) => <a key={label} href={href}>{label}<span>↗</span></a>)}</div>
            </div>
          ))}
          <div className={styles.footerCta}>
            <ArrowButton label="Get in Touch" onClick={openContact} />
            <div><a href="https://twitter.com/paces_ai" aria-label="X">𝕏</a><i /><a href="https://www.linkedin.com/company/pacesai" aria-label="LinkedIn">in</a></div>
          </div>
        </div>
        <div className={styles.footerBottom}><span>© Copyright 2025 Paces&nbsp;&nbsp;|&nbsp;&nbsp;All Rights Reserved</span><span><a href="https://www.paces.com/terms-and-conditions">Terms and Conditions</a><i /> <a href="https://www.paces.com/privacy-policy">Privacy Policy</a></span></div>
      </footer>

      {contactOpen ? <ContactModal onClose={() => setContactOpen(false)} /> : null}
      <button className={styles.cookiePreferencesButton} type="button" onClick={() => setCookiePreferencesOpen(true)}>
        <ConsentCookieIcon />
        <span>Preferences</span>
      </button>
      {cookieBannerOpen ? (
        <aside className={styles.cookieBanner} aria-label="Cookie consent">
          <p>We use cookies to improve your experience and understand how our site is used.</p>
          <div><button type="button" onClick={() => setCookiePreferencesOpen(true)}>Preferences</button><button type="button" onClick={() => saveCookiePreference("rejected")}>Reject</button><button type="button" onClick={() => saveCookiePreference("accepted")}>Accept</button></div>
        </aside>
      ) : null}
      {cookiePreferencesOpen ? (
        <div className={styles.cookieBackdrop} role="presentation" onMouseDown={() => setCookiePreferencesOpen(false)}>
          <section className={styles.cookieModal} role="dialog" aria-modal="true" aria-labelledby="cookie-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={() => setCookiePreferencesOpen(false)} aria-label="Close cookie preferences">×</button>
            <p className={styles.eyebrow}>Privacy preferences</p><h2 id="cookie-title">Cookie preferences</h2>
            <p>Choose whether optional analytics cookies may be used. Necessary cookies remain enabled for core site behavior.</p>
            <div className={styles.cookieChoice}><span><strong>Necessary</strong><small>Required for the site to function.</small></span><b>Always on</b></div>
            <div className={styles.cookieChoice}><span><strong>Analytics</strong><small>Helps improve site performance.</small></span><b>Optional</b></div>
            <div className={styles.cookieActions}><button type="button" onClick={() => saveCookiePreference("rejected")}>Reject optional</button><button type="button" onClick={() => saveCookiePreference("accepted")}>Accept all</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

type ProductPanelProps = { title: string; intro: string; bullets: string[][]; buttons: string[][]; image: string; imageAlt: string; reveal?: boolean };

function ProductPanel({ title, intro, bullets, buttons, image, imageAlt, reveal = false }: ProductPanelProps) {
  return <article className={styles.productPanel} data-reveal={reveal ? "expand" : undefined}><h3>{title}</h3><p>{intro}</p><div className={styles.productBullets}>{bullets.map(([icon,label]) => <div key={label}><Image src={`${A}${icon}`} alt="" width={34} height={34} /><span>{label}</span></div>)}</div><div className={styles.productActions}>{buttons.map(([label,href]) => <a href={href} key={label}>{label}<span>⇢</span></a>)}</div><div className={styles.productImage}><Image src={`${A}${image}`} alt={imageAlt} fill sizes="(max-width: 900px) 100vw, 90vw" /></div></article>;
}

function ResourceCard({ tag, title, image, href, reveal = false }: { tag: string; title: string; image: string; href: string; reveal?: boolean }) {
  return <article className={styles.resourceCard} data-reveal={reveal ? "card" : undefined}><div className={styles.resourceImage}><Image src={`${A}${image}`} alt="" fill sizes="(max-width: 900px) 100vw, 33vw" /></div><span>{tag}</span><h3>{title}</h3><a href={href}>Read More <b>⇢</b></a></article>;
}
