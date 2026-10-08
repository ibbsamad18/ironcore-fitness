// IronCore Fitness - small, focused interactions

// Tell CSS that JavaScript is available (used by the .reveal animation)
document.documentElement.classList.add("js");

const header = document.getElementById("siteHeader");
const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menuToggle");

/* ---------- Mobile menu ---------- */
function setMenu(open) {
  nav.classList.toggle("is-open", open);
  menuToggle.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

menuToggle.addEventListener("click", () => {
  setMenu(!nav.classList.contains("is-open"));
});

// Close the menu after tapping a link, pressing Escape, or resizing to desktop
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
window.addEventListener("resize", () => { if (window.innerWidth > 1024) setMenu(false); });

/* ---------- Solid header after scrolling ---------- */
function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/* ---------- Reveal sections on scroll ---------- */
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ---------- Count-up numbers in the stats bar ---------- */
const counters = document.querySelectorAll("[data-count]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function runCounter(el) {
  const target = Number(el.dataset.count);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased).toLocaleString("en-US");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if (!reduceMotion && "IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach((counter) => counterObserver.observe(counter));
}

/* ---------- Join modal ---------- */
const joinModal = document.getElementById("joinModal");
const joinForm = document.getElementById("joinForm");
const joinFormView = document.getElementById("joinFormView");
const joinSuccess = document.getElementById("joinSuccess");
const planSelect = document.getElementById("joinPlan");

function openJoinModal(plan) {
  if (plan) planSelect.value = plan;
  setMenu(false);
  joinModal.showModal();
  document.body.classList.add("is-locked");
}

function closeJoinModal() {
  joinModal.close();
}

// Any element with data-join opens the form. data-plan preselects a plan.
document.querySelectorAll("[data-join]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openJoinModal(btn.dataset.plan);
  });
});

joinModal.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", closeJoinModal));

// Click on the dark backdrop closes the modal
joinModal.addEventListener("click", (e) => { if (e.target === joinModal) closeJoinModal(); });

// Reset everything when closed (also runs when Escape is pressed)
joinModal.addEventListener("close", () => {
  document.body.classList.remove("is-locked");
  joinForm.reset();
  joinForm.querySelectorAll(".has-error").forEach((f) => f.classList.remove("has-error"));
  joinForm.querySelectorAll(".form__error").forEach((p) => (p.textContent = ""));
  joinFormView.hidden = false;
  joinSuccess.hidden = true;
});

function setError(inputId, message) {
  const input = document.getElementById(inputId);
  input.closest(".form__field").classList.toggle("has-error", Boolean(message));
  joinForm.querySelector(`[data-error-for="${inputId}"]`).textContent = message;
  return !message;
}

function validateJoinForm() {
  const name = joinForm.name.value.trim();
  const email = joinForm.email.value.trim();
  const phone = joinForm.phone.value.trim();

  const okName = setError("joinName", name.length < 2 ? "Please enter your full name." : "");
  const okEmail = setError("joinEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email.");
  const okPhone = setError("joinPhone", phone.replace(/\D/g, "").length < 7 ? "Please enter a valid phone number." : "");
  return okName && okEmail && okPhone;
}

joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateJoinForm()) return;

  const data = Object.fromEntries(new FormData(joinForm));

  // TODO: send `data` to your backend or a form service (Formspree, Netlify Forms, etc.)
  // e.g. fetch("https://formspree.io/f/your-id", { method: "POST", body: JSON.stringify(data) })
  console.log("New member request:", data);

  document.getElementById("joinSuccessName").textContent = data.name.split(" ")[0];
  document.getElementById("joinSuccessPlan").textContent = data.plan;
  joinFormView.hidden = true;
  joinSuccess.hidden = false;
});

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
