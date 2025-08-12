(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav (progressive enhancement)
  const navToggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("primary-menu");
  if (navToggle && menu) {
    const isMobile = () => matchMedia("(max-width: 767px)").matches;
    const setCollapsed = () => {
      if (isMobile()) {
        navToggle.style.display = "inline-flex";
        menu.hidden = true;
        navToggle.setAttribute("aria-expanded", "false");
      } else {
        navToggle.style.display = "none";
        menu.hidden = false;
        navToggle.setAttribute("aria-expanded", "true");
      }
    };
    setCollapsed();
    window.addEventListener("resize", setCollapsed);
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
    });
  }

  // Sticky CTA visibility: hide near footer or CTA section
  const sticky = document.querySelector("[data-sticky-cta]");
  const ctaSection = document.getElementById("download");
  if (sticky && ctaSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            sticky.style.display = "none";
          } else {
            sticky.style.display = "";
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px" }
    );
    observer.observe(ctaSection);
  }

  // Simple waitlist submission with inline validation
  const form = document.getElementById("waitlist-form");
  const toast = document.querySelector(".toast");
  function showToast(message, isError) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.style.background = isError ? "#7f1d1d" : "#064e3b";
    toast.style.color = "#e5e7eb";
    toast.style.position = "fixed";
    toast.style.bottom = "80px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "10px";
    toast.style.boxShadow = "0 8px 20px rgba(0,0,0,.5)";
    setTimeout(() => (toast.hidden = true), 2200);
  }
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = /** @type {HTMLInputElement} */ (
        document.getElementById("email")
      )?.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email.", true);
        return;
      }
      try {
        const btn = form.querySelector("button");
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Joining…";
        }
        // Simulate network call
        await new Promise((r) => setTimeout(r, 900));
        form.reset();
        showToast("You’re on the list! 🎉");
      } catch (err) {
        showToast("Something went wrong. Try again?", true);
      } finally {
        const btn = form.querySelector("button");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Join waitlist";
        }
      }
    });
  }

  // Demo dialog
  const demoDialog = document.querySelector("[data-demo-dialog]");
  const openDemoBtn = document.querySelector("[data-open-demo]");
  const closeDemoBtn = document.querySelector("[data-close-demo]");
  if (demoDialog instanceof HTMLDialogElement && openDemoBtn && closeDemoBtn) {
    openDemoBtn.addEventListener("click", () => demoDialog.showModal());
    closeDemoBtn.addEventListener("click", () => demoDialog.close());
  }
})();
