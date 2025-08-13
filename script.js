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

  // Promo dialog: Independence Day offer until 14 August
  const promoDialog = document.querySelector("[data-promo-dialog]");
  const closePromoBtn = document.querySelector("[data-close-promo]");
  try {
    if (promoDialog instanceof HTMLDialogElement) {
      const today = new Date();
      const year = today.getFullYear();
      const offerEnd = new Date(year, 7, 14, 23, 59, 59);
      const hasSeenKey = `promo_seen_${year}`;
      const shouldShow = today <= offerEnd && !localStorage.getItem(hasSeenKey);
      if (shouldShow) {
        setTimeout(() => promoDialog.showModal(), 350);
      }
      if (closePromoBtn) {
        closePromoBtn.addEventListener("click", () => {
          localStorage.setItem(hasSeenKey, "1");
          promoDialog.close();
        });
      }
    }
  } catch (_) {}

  // Query form submission
  const qForm = document.getElementById("query-form");
  const apiBaseMeta = document.querySelector('meta[name="api-base"]');
  let API_BASE = (apiBaseMeta && apiBaseMeta.getAttribute("content")) || "";
  const fb = {
    apiKey: (document.querySelector('meta[name="firebase-apiKey"]')?.getAttribute('content') || '').trim(),
    authDomain: (document.querySelector('meta[name="firebase-authDomain"]')?.getAttribute('content') || '').trim(),
    projectId: (document.querySelector('meta[name="firebase-projectId"]')?.getAttribute('content') || '').trim(),
    appId: (document.querySelector('meta[name="firebase-appId"]')?.getAttribute('content') || '').trim(),
  };
  const hasFirebase = fb.apiKey && fb.projectId && fb.appId;
  try {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get("api");
    if (qp) {
      const cleaned = qp.replace(/\/$/, "");
      localStorage.setItem("api_base", cleaned);
      API_BASE = cleaned;
    } else if (!API_BASE) {
      const stored = localStorage.getItem("api_base");
      if (stored) API_BASE = stored;
    }
  } catch (_) {}
  if (qForm) {
    qForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = /** @type {HTMLInputElement} */ (
        document.getElementById("q_name")
      )?.value.trim();
      const email = /** @type {HTMLInputElement} */ (
        document.getElementById("q_email")
      )?.value.trim();
      const device = /** @type {HTMLInputElement} */ (
        document.getElementById("q_device")
      )?.value.trim();
      const message = /** @type {HTMLTextAreaElement} */ (
        document.getElementById("q_message")
      )?.value.trim();
      if (
        !name ||
        !email ||
        !device ||
        !message ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        showToast("Please complete all fields with a valid email.", true);
        return;
      }
      const btn = qForm.querySelector("button");
      try {
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Sending…";
        }
        if (API_BASE) {
          const endpoint = `${API_BASE}/api/queries`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, device, message }),
          });
          if (!res.ok) throw new Error("Bad response");
        } else if (hasFirebase) {
          // Lazy-load Firebase from CDN and write to Firestore
          // No auth; public write is not recommended for production — use security rules
          await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
          await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
          // @ts-ignore
          const app = firebase.initializeApp(fb);
          // @ts-ignore
          const db = firebase.firestore();
          await db.collection('queries').add({ name, email, device, message, created_at: new Date().toISOString() });
        } else {
          throw new Error("No API configured");
        }
        qForm.reset();
        showToast("Query sent! We'll reach out soon.");
      } catch (err) {
        showToast("Could not send. Please try again.", true);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Send query";
        }
      }
    });
  }
})();
