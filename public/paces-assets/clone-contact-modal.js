(() => {
  const triggerSelector = '[fs-modal-element="open"], [data-paces-contact-open]';
  let modalRoot = null;
  let previousFocus = null;
  let previousOverflow = "";
  let previousPaddingRight = "";

  const modalMarkup = `
    <div class="paces-contact-scrim" data-paces-contact-close></div>
    <section class="paces-contact-modal" role="dialog" aria-modal="true" aria-labelledby="paces-contact-title" tabindex="-1">
      <button class="paces-contact-close" type="button" data-paces-contact-close aria-label="Close Get in Touch form">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <form class="paces-contact-form">
        <h2 id="paces-contact-title" class="paces-contact-sr-only" tabindex="-1">Get in Touch</h2>
        <div class="paces-contact-two-columns">
          <label>First Name<span>*</span><input name="firstName" autocomplete="given-name" required /></label>
          <label>Last Name<span>*</span><input name="lastName" autocomplete="family-name" required /></label>
        </div>
        <label>Company Name<span>*</span><input name="company" autocomplete="organization" required /></label>
        <label>Professional Email<span>*</span><input name="email" type="email" autocomplete="email" required /></label>
        <label>Do you have projects in the United States?<span>*</span><select name="usProjects" required><option value="" selected disabled>Please Select</option><option>Yes</option><option>No</option></select></label>
        <label>How did you hear about us?<input name="source" /></label>
        <div class="paces-contact-captcha"><strong>protected by reCAPTCHA</strong><span><img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="" /></span></div>
        <button class="paces-contact-submit" type="submit">Choose a time to talk to us <b>→</b></button>
      </form>
      <div class="paces-contact-success" role="status" hidden>
        <span>✓</span>
        <h2>Thanks for reaching out.</h2>
        <p>Your information has been received. Our team will contact you to choose a time to talk.</p>
        <button type="button" data-paces-contact-close>Return to Paces <b>→</b></button>
      </div>
    </section>`;

  const closeModal = () => {
    if (!modalRoot) return;
    modalRoot.remove();
    modalRoot = null;
    document.documentElement.classList.remove("paces-contact-active");
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  };

  const trapFocus = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab" || !modalRoot) return;

    const focusable = Array.from(
      modalRoot.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hidden);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const openModal = () => {
    if (modalRoot) return;
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.documentElement.classList.add("paces-contact-active");

    modalRoot = document.createElement("div");
    modalRoot.className = "paces-contact-root";
    modalRoot.innerHTML = modalMarkup;
    document.body.appendChild(modalRoot);

    modalRoot.querySelectorAll("[data-paces-contact-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    const form = modalRoot.querySelector(".paces-contact-form");
    const success = modalRoot.querySelector(".paces-contact-success");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      form.hidden = true;
      success.hidden = false;
      success.focus?.();
    });

    requestAnimationFrame(() => {
      modalRoot?.querySelector(".paces-contact-sr-only")?.focus();
    });
  };

  document.documentElement.classList.add("paces-unified-contact");
  document.querySelectorAll('[fs-modal-element="modal"].popup').forEach((popup) => {
    popup.setAttribute("aria-hidden", "true");
    popup.inert = true;
  });
  document.addEventListener("keydown", trapFocus);
  document.addEventListener(
    "click",
    (event) => {
      const trigger = event.target instanceof Element
        ? event.target.closest(triggerSelector)
        : null;
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openModal();
    },
    true,
  );
})();
