"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const entries = document.querySelectorAll(".tl-entry");
  const tabs    = document.querySelectorAll(".tl-tab");

  // ─────────────────────────────────────────────────────────────────────────
  //  3D FLIP ON CLICK
  //  Each card has a front face and a back face positioned absolutely on top
  //  of each other. We toggle the "flipped" class on the parent <li>, and CSS
  //  handles the rotateY(180deg) transform with a smooth 3D transition.
  //  Both click and keyboard (Enter/Space) are supported for accessibility.
  // ─────────────────────────────────────────────────────────────────────────
  entries.forEach(entry => {
    const card = entry.querySelector(".tl-flip-card");

    card.addEventListener("click", () => {
      entry.classList.toggle("flipped");
    });

    // We support keyboard navigation so the page is usable without a mouse
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // prevent page scroll on Space
        entry.classList.toggle("flipped");
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  CATEGORY TABS
  //  Each tab has a "data-cat" attribute. When clicked, we show only entries
  //  with a matching "data-category" attribute (or all if "all" is selected).
  //  We also unflip any hidden cards so they don't show the back face
  //  when they reappear in a different tab.
  // ─────────────────────────────────────────────────────────────────────────
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Deactivate all tabs, activate the clicked one
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const cat = tab.dataset.cat;
      entries.forEach(entry => {
        if (cat === "all" || entry.dataset.category === cat) {
          entry.classList.remove("hidden");
        } else {
          entry.classList.add("hidden");
          // Reset flipped state so the user doesn't land on the back face
          // when they switch back to a tab that includes this card
          entry.classList.remove("flipped");
        }
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  SCROLL REVEAL
  //  We use IntersectionObserver to add the "visible" class as each card
  //  enters the viewport. The CSS transition then plays a fade-in + slide-up.
  //  Once a card is visible we stop observing it — no need to watch it again.
  // ─────────────────────────────────────────────────────────────────────────
  const observer = new IntersectionObserver(observations => {
    observations.forEach(obs => {
      if (obs.isIntersecting) {
        obs.target.classList.add("visible");
        observer.unobserve(obs.target);
      }
    });
  }, { threshold: 0.1 }); // trigger when 10% of the card is visible

  entries.forEach(entry => observer.observe(entry));

  // Highlight the current page link in the navigation bar
  document.querySelectorAll(".sk-nav-links a").forEach(a => {
    if (a.href === location.href) a.classList.add("active");
  });
});
