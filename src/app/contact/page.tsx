"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className={styles.page}>
      <a className={styles.announcement} href="/webinar-ai-in-energy-development">Access the webinar on demand: AI in energy development. <span>›</span></a>
      <header>
        <Link href="/" aria-label="Paces home"><Image src="/paces-assets/92302db92292018f.svg" alt="Paces" width={110} height={38} /></Link>
        <nav><Link href="/login">Sign In</Link><span>Get in Touch</span><i>⇢</i><b>☰</b></nav>
      </header>
      <section className={styles.hero} aria-hidden="true">
        <video autoPlay muted loop playsInline poster="/paces-assets/c5c0e58ae6f6377c.jpg"><source src="/paces-assets/hero.mp4" type="video/mp4" /></video>
        <div><h1>De-risked projects.<br /><span>Powered faster.</span></h1><p>Paces helps energy infrastructure teams find viable sites, de-risk development, and get to power faster.</p></div>
      </section>
      <div className={styles.scrim} />

      <section className={styles.modal} aria-labelledby="contact-title">
        <Link className={styles.close} href="/" aria-label="Close Get in Touch form">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {!sent ? (
          <form onSubmit={submit}>
            <h1 id="contact-title" className={styles.srOnly}>Get in Touch</h1>
            <div className={styles.twoColumns}>
              <label>First Name<span>*</span><input name="firstName" autoComplete="given-name" required /></label>
              <label>Last Name<span>*</span><input name="lastName" autoComplete="family-name" required /></label>
            </div>
            <label>Company Name<span>*</span><input name="company" autoComplete="organization" required /></label>
            <label>Professional Email<span>*</span><input name="email" type="email" autoComplete="email" required /></label>
            <label>Do you have projects in the United States?<span>*</span><select name="usProjects" defaultValue="" required><option value="" disabled>Please Select</option><option>Yes</option><option>No</option></select></label>
            <label>How did you hear about us?<input name="source" /></label>
            <div className={styles.captcha}><strong>protected by reCAPTCHA</strong><span><img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="" /></span></div>
            <button type="submit">Choose a time to talk to us <b>→</b></button>
          </form>
        ) : (
          <div className={styles.success} role="status"><span>✓</span><h1 id="contact-title">Thanks for reaching out.</h1><p>Your information has been received. Our team will contact you to choose a time to talk.</p><Link href="/">Return to Paces <b>→</b></Link></div>
        )}
      </section>
    </main>
  );
}
