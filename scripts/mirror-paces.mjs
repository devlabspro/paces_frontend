import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://www.paces.com";
const OUTPUT_ROOT = path.resolve("public/paces-mirror");
const EXTRA_ROUTES = ["/careers", "/faq", "/for-ai"];
const LOCAL_SITE_HOSTS = new Set([
  "paces.com",
  "www.paces.com",
  "paces-stg.webflow.io",
  "paces.webflow.io",
]);
const LOCAL_ROUTE_ALIASES = new Map([
  ["/privacy", "/privacy-policy"],
  ["/post/tomorrows-grid-today-paces-launches-automated-off-cycle-case-updates", "/blog"],
]);
const BLOCKED_SCRIPT_HOSTS = [
  "googletagmanager.com",
  "google-analytics.com",
  "snap.licdn.com",
  "hs-banner.com",
  "hsadspixel.net",
  "hs-analytics.net",
  "hs-scripts.com",
  "hsforms.net",
  "hscollectedforms.net",
  "hubspot.com",
  "hubspotonwebflow.com",
  "claydar.com",
  "b2bjsstore",
  "pingdom.net",
  "consentpro.com",
  "recaptcha",
  "facebook.net",
  "mtcdn.co",
  "@finsweet/attributes-modal",
];

const preferenceMarkup = `
<button class="consent_prefs_open-button clone-consent-button" type="button" aria-haspopup="dialog" aria-controls="clone-consent-dialog">
  <span class="clone-cookie-icon" aria-hidden="true"></span>
  <span>Preferences</span>
</button>
<div class="clone-consent-backdrop" id="clone-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="clone-consent-title" hidden>
  <div class="clone-consent-card">
    <button class="clone-consent-close" type="button" aria-label="Close preferences">×</button>
    <p class="clone-consent-kicker">Privacy preferences</p>
    <h2 id="clone-consent-title">Your privacy choices</h2>
    <p>Choose whether this local Paces experience may store optional preferences on this device.</p>
    <div class="clone-consent-row"><span><strong>Essential</strong><small>Required for core site functionality.</small></span><b>Always active</b></div>
    <div class="clone-consent-actions"><button type="button" data-consent="rejected">Reject optional</button><button type="button" data-consent="accepted">Accept all</button></div>
  </div>
</div>`;

const cloneStyles = `
<style>
.clone-consent-button{position:fixed!important;z-index:2147483000!important;left:16px!important;bottom:16px!important;height:40px!important;padding:8px 12px!important;display:flex!important;align-items:center!important;gap:8px!important;border:0!important;border-radius:8px!important;background:#003129!important;color:#fff!important;font:16px/24px Inter,Arial,sans-serif!important;cursor:pointer!important;box-shadow:0 8px 28px rgba(0,0,0,.18)!important}.clone-cookie-icon{display:block;width:24px!important;height:24px!important;background:url('/paces-assets/cookie-consent.svg') center/24px 24px no-repeat}.clone-consent-backdrop{position:fixed;z-index:2147483001;inset:0;padding:24px;place-items:center;background:rgba(4,23,19,.7)}.clone-consent-backdrop:not([hidden]){display:grid}.clone-consent-card{position:relative;width:min(620px,100%);padding:42px;background:#eff3f2;color:#173f3a;border-radius:6px;box-shadow:0 30px 90px rgba(0,0,0,.32);font-family:Inter,Arial,sans-serif}.clone-consent-card h2{margin:10px 0 14px;font:500 42px/1.05 Manrope,Inter,Arial,sans-serif;letter-spacing:-.04em}.clone-consent-card>p{color:#5f6865;line-height:1.5}.clone-consent-kicker{text-transform:uppercase;letter-spacing:.08em;font-size:12px}.clone-consent-close{position:absolute;right:18px;top:14px;width:40px;height:40px;border:0;background:transparent;color:#173f3a;font-size:32px;cursor:pointer}.clone-consent-row{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:25px;padding:18px 0;border-top:1px solid #c7d1ce}.clone-consent-row span{display:grid;gap:5px}.clone-consent-row small{color:#66706d}.clone-consent-row b{font-size:12px;text-transform:uppercase}.clone-consent-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.clone-consent-actions button{min-height:42px;padding:0 16px;border:1px solid #173f3a;border-radius:3px;background:#fff;color:#173f3a;cursor:pointer}.clone-consent-actions button:last-child{background:#173f3a;color:#fff}.clone-hs-form{display:grid;gap:12px;width:100%}.clone-hs-form input,.clone-hs-form textarea{width:100%;min-height:48px;padding:10px 12px;border:1px solid #cad3d1;border-radius:3px;background:#fff;color:#173f3a;font:14px/1.4 Inter,Arial,sans-serif}.clone-hs-form textarea{min-height:96px;resize:vertical}.clone-hs-form button{min-height:48px;padding:0 18px;border:0;border-radius:3px;background:#173f3a;color:#fff;text-transform:uppercase;cursor:pointer}.clone-form-success{padding:12px 0;color:#173f3a;font-weight:600}@media(max-width:560px){.clone-consent-card{padding:36px 20px 24px}.clone-consent-card h2{font-size:34px}.clone-consent-actions{flex-direction:column}.clone-consent-actions button{width:100%}}
</style>`;

const localFormBootstrap = `
<script>
window.hbspt = window.hbspt || { forms: { create(options = {}) {
  const host = document.currentScript?.parentElement || document.body;
  if (host.querySelector('.clone-hs-form')) return;
  const form = document.createElement('form');
  form.className = 'hs-form clone-hs-form';
  form.id = options.formId ? 'hsForm_' + options.formId : 'clone-hs-form';
  const isNewsletter = options.formId === 'be66f69f-3e3b-4f7a-9b3d-ff05a0179de0';
  const fields = isNewsletter
    ? [['email','email','Email Address']]
    : [['firstname','text','First name'],['lastname','text','Last name'],['email','email','Work email'],['phone','tel','Phone'],['company','text','Company']];
  for (const [name, type, placeholder] of fields) {
    const input = document.createElement('input');
    input.name = name; input.type = type; input.placeholder = placeholder; input.required = name === 'email';
    form.appendChild(input);
  }
  if (!isNewsletter) {
    const notes = document.createElement('textarea'); notes.name = 'how_did_you_hear_about_us_'; notes.placeholder = 'How can we help?'; form.appendChild(notes);
  }
  const submit = document.createElement('button'); submit.type = 'submit'; submit.textContent = isNewsletter ? 'Submit' : 'Get in touch'; form.appendChild(submit);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (typeof options.onFormSubmit === 'function' && window.jQuery) options.onFormSubmit(window.jQuery(form));
    form.replaceWith(Object.assign(document.createElement('div'), { className: 'clone-form-success', textContent: 'Thank you! Your submission has been received.' }));
  });
  host.appendChild(form);
  if (typeof options.onFormReady === 'function') options.onFormReady(form);
} } };
</script>`;

const cloneRuntime = `
<script>
(() => {
  const localSiteHosts = new Set(['paces.com', 'www.paces.com', 'paces-stg.webflow.io', 'paces.webflow.io']);
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link) return;
    try {
      const url = new URL(link.href, window.location.href);
      if (url.hostname === 'app.paces.ai') {
        event.preventDefault();
        window.location.assign('/login');
      } else if (localSiteHosts.has(url.hostname)) {
        event.preventDefault();
        window.location.assign(url.pathname + url.search + url.hash);
      }
    } catch {}
  }, true);
  const dialog = document.getElementById('clone-consent-dialog');
  const open = () => { if (dialog) dialog.hidden = false; };
  const close = () => { if (dialog) dialog.hidden = true; };
  document.querySelectorAll('.clone-consent-button').forEach((button) => button.addEventListener('click', open));
  dialog?.querySelector('.clone-consent-close')?.addEventListener('click', close);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  dialog?.querySelectorAll('[data-consent]').forEach((button) => button.addEventListener('click', () => {
    localStorage.setItem('paces-cookie-preference', button.dataset.consent || 'rejected');
    close();
  }));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.querySelectorAll('form').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    const wrapper = form.closest('.w-form');
    if (wrapper) {
      const done = wrapper.querySelector('.w-form-done');
      if (done) done.style.display = 'block';
      form.style.display = 'none';
    }
  }));
})();
</script>`;

function stripTrackingScripts(html) {
  return html
    .replace(/<script\b[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi, (tag, src) => {
      const lower = src.toLowerCase();
      if (lower.startsWith(`${ORIGIN.toLowerCase()}/nvhc`) || lower.startsWith("/nvhc")) return "";
      return BLOCKED_SCRIPT_HOSTS.some((host) => lower.includes(host)) ? "" : tag;
    })
    .replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, (tag) => {
      const lower = tag.toLowerCase();
      const isTracker = [
        "googletagmanager.com",
        "google_tags_first_party",
        "gtag('",
        "gtag(\"",
        "reb2b",
        "_linkedin_partner_id",
        "snap.licdn.com",
      ].some((token) => lower.includes(token));
      return isTracker ? "" : tag;
    })
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, (tag) =>
      /linkedin|googletagmanager|facebook/i.test(tag) ? "" : tag,
    );
}

function localizePage(html) {
  let localized = stripTrackingScripts(html).replace(
    /\b(href|action)=(['"])(.*?)\2/gi,
    (attribute, name, quote, value) => {
      try {
        const isRootRelative = value.startsWith("/") && !value.startsWith("//");
        const isAbsolute = /^(?:https?:)?\/\//i.test(value);
        if (!isRootRelative && !isAbsolute) return attribute;
        const url = new URL(value, ORIGIN);
        const pathname = LOCAL_ROUTE_ALIASES.get(url.pathname) || url.pathname;
        if (url.hostname === "app.paces.ai") return `${name}=${quote}/login${quote}`;
        if (LOCAL_SITE_HOSTS.has(url.hostname)) {
          return `${name}=${quote}${pathname}${url.search}${url.hash}${quote}`;
        }
      } catch {
        // Leave malformed or non-navigation attributes untouched.
      }
      return attribute;
    },
  );

  localized = localized
    .replace(/https?:\\?\/\\?\/(?:www\\?\.)?paces\\?\.com(?=\\?\/|["'<\s]|$)/gi, "")
    .replace(/(?:https?:)?\\?\/\\?\/(?:paces-stg|paces)\\?\.webflow\\?\.io(?=\\?\/|["'<\s]|$)/gi, "")
    .replace(/https?:\\?\/\\?\/app\\?\.paces\\?\.ai(?:\\?\/login)?(?:\\?\/[^\"'<\s]*)?/gi, "/login");

  localized = localized.replace(
    /<head>/i,
    `<head><base href="/">${cloneStyles}${localFormBootstrap}<link href="/paces-assets/clone-navigation.css" rel="stylesheet"><link href="/paces-assets/clone-contact-modal.css" rel="stylesheet"><script src="/paces-assets/clone-navigation.js" defer></script><script src="/paces-assets/clone-contact-modal.js" defer></script>`,
  );
  localized = localized.replace(/<\/body>/i, `${preferenceMarkup}${cloneRuntime}</body>`);
  return localized;
}

function validateLocalizedPage(route, source, localized) {
  const sourceSections = source.match(/<section\b/gi)?.length ?? 0;
  const localizedSections = localized.match(/<section\b/gi)?.length ?? 0;
  const requiredMarkers = ["</html>", "footer_section"];
  const cloneRuntimeMarkers = [
    "/paces-assets/clone-navigation.js",
    "/paces-assets/clone-contact-modal.css",
    "/paces-assets/clone-contact-modal.js",
  ];

  if (sourceSections !== localizedSections) {
    throw new Error(
      `${route} failed completeness validation: expected ${sourceSections} sections, received ${localizedSections}`,
    );
  }

  for (const marker of requiredMarkers) {
    if (source.includes(marker) && !localized.includes(marker)) {
      throw new Error(
        `${route} failed completeness validation: missing ${marker}`,
      );
    }
  }

  for (const marker of cloneRuntimeMarkers) {
    if (!localized.includes(marker)) {
      throw new Error(
        `${route} failed local runtime validation: missing ${marker}`,
      );
    }
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Paces local frontend mirror/1.0" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

async function mirrorRoute(route) {
  const url = `${ORIGIN}${route}`;
  try {
    const html = await fetchText(url);
    const directory = path.join(OUTPUT_ROOT, route.replace(/^\/+/, ""));
    const localized = localizePage(html);
    validateLocalizedPage(route, html, localized);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), localized);
    return { route, ok: true };
  } catch (error) {
    return { route, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const requestedRoutes = process.argv
  .slice(2)
  .filter((route) => route.startsWith("/"));

let routes;
if (requestedRoutes.length) {
  routes = [...new Set(requestedRoutes)];
} else {
  const sitemap = await fetchText(`${ORIGIN}/sitemap.xml`);
  routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((route) => route !== "/");

  for (const route of EXTRA_ROUTES) if (!routes.includes(route)) routes.push(route);
}

await mkdir(OUTPUT_ROOT, { recursive: true });
const results = [];
const queue = [...routes];
const workers = Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const route = queue.shift();
    if (!route) return;
    const result = await mirrorRoute(route);
    results.push(result);
    process.stdout.write(result.ok ? `✓ ${route}\n` : `✗ ${route}: ${result.error}\n`);
  }
});

await Promise.all(workers);
const succeeded = results.filter((result) => result.ok).map((result) => result.route).sort();
const failed = results.filter((result) => !result.ok);
if (!requestedRoutes.length) {
  await writeFile(
    path.join(OUTPUT_ROOT, "manifest.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), routes: succeeded, failed }, null, 2),
  );
}
console.log(`Mirrored ${succeeded.length}/${results.length} routes.`);
if (failed.length) process.exitCode = 1;
