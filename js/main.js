/* ============================================================
   Fotos Por Ahí — shared behaviour (gallery, filters, lightbox)
   Data comes from js/photos.js as window.FPA_PHOTOS.
   Page language comes from <html lang> ("en" | "es").
   ============================================================ */

(function () {
  "use strict";

  var PHOTOS = window.FPA_PHOTOS || [];
  var LANG = document.documentElement.lang.indexOf("es") === 0 ? "es" : "en";
  var BASE = window.FPA_BASE || "assets/";

  var STR = {
    en: {
      tag: { live: "Live", portrait: "Portrait", still: "Still life" },
      bw: "b&w",
      ariaClose: "Close",
      ariaPrev: "Previous photo",
      ariaNext: "Next photo",
      ariaDialog: "Photo viewer"
    },
    es: {
      tag: { live: "En vivo", portrait: "Retrato", still: "Bodegón" },
      bw: "b&n",
      ariaClose: "Cerrar",
      ariaPrev: "Foto anterior",
      ariaNext: "Foto siguiente",
      ariaDialog: "Visor de fotos"
    }
  }[LANG];

  /* ---------- header ---------- */

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- gallery ---------- */

  var gallery = document.getElementById("gallery");
  var cards = [];

  if (gallery) {
    PHOTOS.forEach(function (p, i) {
      var fig = document.createElement("figure");
      fig.className = "photo-card";
      fig.dataset.index = i;
      fig.dataset.cat = p.cat;
      fig.dataset.bw = p.bw ? "1" : "0";

      var img = document.createElement("img");
      img.loading = "lazy";
      img.src = BASE + "thumbs/" + p.slug + ".jpg";
      img.alt = p.cap[LANG];
      if (p.w && p.h) img.style.aspectRatio = p.w + " / " + p.h;

      var meta = document.createElement("figcaption");
      meta.className = "meta";

      var cap = document.createElement("span");
      cap.className = "caption";
      cap.textContent = p.cap[LANG];

      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = STR.tag[p.cat] + (p.bw ? " · " + STR.bw : "");

      meta.appendChild(cap);
      meta.appendChild(tag);
      fig.appendChild(img);
      fig.appendChild(meta);
      gallery.appendChild(fig);
      cards.push(fig);

      fig.addEventListener("click", function () {
        openLightbox(visibleIndexes().indexOf(i));
      });
    });
  }

  /* ---------- filters ---------- */

  var filterButtons = document.querySelectorAll(".filters button[data-filter]");

  function visibleIndexes() {
    var out = [];
    cards.forEach(function (c) {
      if (!c.classList.contains("hidden")) out.push(+c.dataset.index);
    });
    return out;
  }

  function applyFilter(value) {
    cards.forEach(function (c) {
      var show =
        value === "all" ||
        c.dataset.cat === value ||
        (value === "bw" && c.dataset.bw === "1");
      c.classList.toggle("hidden", !show);
      if (show) revealObserver.observe(c);
    });
    updateCounts();
  }

  function updateCounts() {
    filterButtons.forEach(function (btn) {
      var count = btn.querySelector(".count");
      if (!count) return;
      var value = btn.dataset.filter;
      var n = cards.filter(function (c) {
        return (
          value === "all" ||
          c.dataset.cat === value ||
          (value === "bw" && c.dataset.bw === "1")
        );
      }).length;
      count.textContent = String(n).padStart(2, "0");
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      applyFilter(btn.dataset.filter);
    });
  });

  if (filterButtons.length) updateCounts();

  /* ---------- reveal on scroll ---------- */

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );

  document.querySelectorAll(".photo-card, .reveal").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- lightbox ---------- */

  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector(".lightbox-stage img");
    var lbCap = lightbox.querySelector(".lb-caption");
    var lbCount = lightbox.querySelector(".lb-counter");
    var currentList = [];
    var currentIndex = 0;
    var lastFocus = null;

    lightbox.setAttribute("aria-label", STR.ariaDialog);
    lightbox.querySelector(".lb-close").setAttribute("aria-label", STR.ariaClose);
    lightbox.querySelector(".lb-prev").setAttribute("aria-label", STR.ariaPrev);
    lightbox.querySelector(".lb-next").setAttribute("aria-label", STR.ariaNext);

    function loadImage(index) {
      currentIndex = (index + currentList.length) % currentList.length;
      var p = PHOTOS[currentList[currentIndex]];
      lbImg.classList.remove("ready");
      var url = BASE + "photos/" + p.slug + ".jpg";
      var tmp = new Image();
      tmp.onload = function () {
        lbImg.src = url;
        lbImg.alt = p.cap[LANG];
        lbImg.style.aspectRatio = p.w + " / " + p.h;
        requestAnimationFrame(function () { lbImg.classList.add("ready"); });
      };
      tmp.src = url;
      lbCap.textContent = p.cap[LANG];
      lbCount.textContent =
        (currentIndex + 1) + " / " + currentList.length;
    }

    function openLightbox(visiblePosition) {
      currentList = visibleIndexes();
      if (!currentList.length) return;
      lastFocus = document.activeElement;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      loadImage(Math.max(0, visiblePosition));
      lightbox.querySelector(".lb-close").focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lb-prev").addEventListener("click", function () {
      loadImage(currentIndex - 1);
    });
    lightbox.querySelector(".lb-next").addEventListener("click", function () {
      loadImage(currentIndex + 1);
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lightbox-stage")) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") loadImage(currentIndex - 1);
      else if (e.key === "ArrowRight") loadImage(currentIndex + 1);
    });
  }
})();
