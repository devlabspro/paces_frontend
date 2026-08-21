"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/context/LoginContext";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remembered, setRemembered] = useState(true);
  const [verified, setVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useLogin();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!verified) {
      setError("Please confirm that you are not a robot.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password, remember: remembered }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "The email address or password is incorrect.");
        return;
      }
      login(email, Boolean(data.is_subaccount));
      router.push("/datasets");
    } catch {
      setError("We could not sign you in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.shell}>
      <div className={styles.center}>
        <section className={styles.card} aria-labelledby="login-title">
          <Image className={styles.logo} src="/paces-assets/login-logo.jpg" alt="Paces" width={50} height={50} priority />
          <h1 id="login-title">Hi, welcome back</h1>
          <p className={styles.subtitle}>Enter your credentials to continue</p>
          <form onSubmit={submit}>
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="password">Password</label>
            <div className={styles.passwordField}>
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <div className={styles.options}>
              <label className={styles.checkLabel}><input type="checkbox" checked={remembered} onChange={(event) => setRemembered(event.target.checked)} /><span>Remember me</span></label>
              <a href="https://api.prod.paces.ai/api/auth/reset_password">Forgot Password?</a>
            </div>
            <label className={styles.captcha}>
              <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} />
              <span>I&apos;m not a robot</span>
              <span className={styles.recaptchaMark}><b>↻</b><small>reCAPTCHA</small></span>
            </label>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
          </form>
        </section>
      </div>
      <footer><Link href="/" target="_blank" rel="noreferrer">paces.com</Link><span>Carbon Neutral since 2021</span></footer>
    </main>
  );
}
