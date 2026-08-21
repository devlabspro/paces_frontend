(() => {
  const initializeNavigation = () => {
    // Webflow adds this after its interaction runtime boots. The local mirror
    // supplies the same ready state so animated button arrows never stay hidden
    // if the remote runtime is delayed or unavailable.
    document.documentElement.classList.add("w-mod-ix3");

    const dropdowns = Array.from(
      document.querySelectorAll(".navbar .nav-dropdown-3.w-dropdown"),
    );

    if (!dropdowns.length) return;

    const closeDropdown = (dropdown) => {
      window.clearTimeout(dropdown.__pacesCloseTimer);
      dropdown.classList.remove("w--open");

      const toggle = dropdown.querySelector(":scope > .w-dropdown-toggle");
      const list = dropdown.querySelector(":scope > .w-dropdown-list");
      toggle?.classList.remove("w--open");
      toggle?.setAttribute("aria-expanded", "false");
      list?.classList.remove("w--open");
    };

    const closeOthers = (current) => {
      dropdowns.forEach((dropdown) => {
        if (dropdown !== current) closeDropdown(dropdown);
      });
    };

    const openDropdown = (dropdown) => {
      window.clearTimeout(dropdown.__pacesCloseTimer);
      closeOthers(dropdown);
      dropdown.classList.add("w--open");

      const toggle = dropdown.querySelector(":scope > .w-dropdown-toggle");
      const list = dropdown.querySelector(":scope > .w-dropdown-list");
      toggle?.classList.add("w--open");
      toggle?.setAttribute("aria-expanded", "true");
      list?.classList.add("w--open");
    };

    const scheduleClose = (dropdown) => {
      window.clearTimeout(dropdown.__pacesCloseTimer);
      dropdown.__pacesCloseTimer = window.setTimeout(
        () => closeDropdown(dropdown),
        650,
      );
    };

    dropdowns.forEach((dropdown) => {
      if (dropdown.dataset.pacesNavigationReady === "true") return;
      dropdown.dataset.pacesNavigationReady = "true";

      const toggle = dropdown.querySelector(":scope > .w-dropdown-toggle");
      const list = dropdown.querySelector(":scope > .w-dropdown-list");
      if (!toggle || !list) return;

      toggle.setAttribute("aria-haspopup", "menu");
      toggle.setAttribute("aria-expanded", "false");

      dropdown.addEventListener("mouseenter", () => openDropdown(dropdown));
      dropdown.addEventListener("mouseleave", () => scheduleClose(dropdown));
      dropdown.addEventListener("focusin", () => openDropdown(dropdown));
      dropdown.addEventListener("focusout", (event) => {
        if (!dropdown.contains(event.relatedTarget)) scheduleClose(dropdown);
      });

      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (list.classList.contains("w--open")) closeDropdown(dropdown);
        else openDropdown(dropdown);
      });

      list.addEventListener("mouseenter", () => {
        window.clearTimeout(dropdown.__pacesCloseTimer);
      });
      list.addEventListener("mouseleave", () => scheduleClose(dropdown));
      list.querySelectorAll("a[href]").forEach((link) => {
        link.addEventListener("click", () => closeDropdown(dropdown));
      });
    });

    document.addEventListener("click", (event) => {
      if (!dropdowns.some((dropdown) => dropdown.contains(event.target))) {
        dropdowns.forEach(closeDropdown);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      dropdowns.forEach(closeDropdown);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavigation, {
      once: true,
    });
  } else {
    initializeNavigation();
  }
})();
