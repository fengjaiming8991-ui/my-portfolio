(function () {
  const body = document.body;
  const menuBtn = document.querySelector(".site-header__menu");
  const drawer = document.getElementById("mobile-nav");

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", () => {
      const open = drawer.hidden;
      drawer.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }

  const GALLERY_IMAGES = {
    shokz: [
      "shokz 弹窗01@3X.png",
      "shokz 弹窗02@3X.png",
      "shokz 弹窗03@3X.png",
      "shokz 弹窗04@3X.png",
      "shokz 弹窗05@3X.png",
      "shokz 弹窗06@3X.png",
    ],
    fintech: [
      "pinsen 金融01@3X.png",
      "pinsen 金融02@3X.png",
      "pinsen 金融03@3X.png",
      "pinsen 金融04@3X.png",
      "pinsen 金融05@3X.png",
      "pinsen 金融06@3X.png",
      "pinsen 金融07@3X.png",
    ],
    generative: ["AI 辅助01@3X.png", "AI 辅助02@3X.png"],
  };

  const GALLERY_TITLES = {
    shokz: "韶音全球官网重建 — 案例画廊",
    fintech: "金融体验设计项目 — 案例画廊",
    generative: "AI 驱动原型开发 — 案例画廊",
  };

  function assetUrl(filename) {
    return "web%20image/" + encodeURIComponent(filename);
  }

  const galleryModal = document.getElementById("gallery-modal");

  function getViewport() {
    return document.querySelector("[data-gallery-viewport]");
  }

  function getTrack() {
    return document.querySelector("[data-gallery-track]");
  }

  function getPagination() {
    return document.querySelector("[data-gallery-pagination]");
  }

  function getSlides() {
    return getTrack()?.querySelectorAll(".gallery-modal__slide") ?? [];
  }

  function scrollSlideIntoCenter(i, smooth) {
    const vp = getViewport();
    const slides = getSlides();
    if (!vp || !slides[i]) return;
    const slide = slides[i];
    const left = slide.offsetLeft - (vp.clientWidth - slide.offsetWidth) / 2;
    vp.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "auto" });
  }

  let currentKey = null;
  let currentIndex = 0;
  let scrollTicking = false;

  function syncFromScroll() {
    const vp = getViewport();
    const slides = getSlides();
    if (!vp || !slides.length) return;
    const mid = vp.scrollLeft + vp.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const c = slide.offsetLeft + slide.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    currentIndex = best;
    updatePagination();
    updateSlideActiveStates();
  }

  function updateSlideActiveStates() {
    getSlides().forEach((slide, i) => {
      slide.classList.toggle("is-active", i === currentIndex);
    });
  }

  function updatePagination() {
    const dots = getPagination()?.querySelectorAll(".gallery-pagination__item");
    dots?.forEach((d, i) => {
      d.classList.toggle("is-active", i === currentIndex);
      if (i === currentIndex) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }

  function goTo(i, smooth) {
    const slides = getSlides();
    if (!slides.length) return;
    const total = slides.length;
    const idx = ((i % total) + total) % total;
    currentIndex = idx;
    scrollSlideIntoCenter(idx, smooth !== false);
    updatePagination();
    updateSlideActiveStates();
  }

  function buildGallery(key) {
    const filenames = GALLERY_IMAGES[key];
    const track = getTrack();
    if (!filenames || !track) return;
    track.innerHTML = "";
    filenames.forEach((name) => {
      const slide = document.createElement("article");
      slide.className = "gallery-modal__slide";
      slide.setAttribute("role", "group");
      const inner = document.createElement("div");
      inner.className = "gallery-modal__card";
      const img = document.createElement("img");
      img.className = "gallery-modal__img";
      img.src = assetUrl(name);
      img.alt = "";
      img.loading = "lazy";
      inner.appendChild(img);
      slide.appendChild(inner);
      track.appendChild(slide);
    });

    const pag = getPagination();
    if (pag) {
      pag.innerHTML = "";
      pag.className = "gallery-modal__pagination gallery-pagination";
      filenames.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gallery-pagination__item" + (idx === 0 ? " is-active" : "");
        btn.setAttribute("aria-label", `第 ${idx + 1} 屏`);
        if (idx === 0) btn.setAttribute("aria-current", "true");
        btn.addEventListener("click", () => goTo(idx, true));
        pag.appendChild(btn);
      });
    }

    currentIndex = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => goTo(0, false));
    });
  }

  function openGallery(key) {
    if (!galleryModal || !GALLERY_IMAGES[key]) return;
    currentKey = key;
    const titleEl = document.getElementById("gallery-modal-title");
    if (titleEl) titleEl.textContent = GALLERY_TITLES[key] || "案例画廊";
    buildGallery(key);
    galleryModal.hidden = false;
    body.classList.add("lightbox-open");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        galleryModal.classList.add("gallery-modal--visible");
        galleryModal.querySelector(".gallery-modal__close")?.focus();
      });
    });
  }

  function closeGallery() {
    if (!galleryModal) return;
    galleryModal.classList.remove("gallery-modal--visible");
    currentKey = null;
    window.setTimeout(() => {
      galleryModal.hidden = true;
      body.classList.remove("lightbox-open");
    }, 380);
  }

  document.querySelectorAll("[data-gallery]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const key = el.getAttribute("data-gallery");
      if (key) {
        e.preventDefault();
        openGallery(key);
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-gallery]")) closeGallery();
  });

  document.addEventListener("keydown", (e) => {
    if (!galleryModal || galleryModal.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeGallery();
      return;
    }
    if (!currentKey) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(currentIndex - 1, true);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(currentIndex + 1, true);
    }
  });

  const viewportEl = getViewport();
  if (viewportEl) {
    viewportEl.addEventListener("scroll", () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        syncFromScroll();
        scrollTicking = false;
      });
    });
  }

  window.addEventListener("resize", () => {
    if (!currentKey || galleryModal?.hidden) return;
    goTo(currentIndex, false);
  });

  document.querySelectorAll("[data-viewport-video]").forEach((video) => {
    let savedTime = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.currentTime = savedTime;
            video.play().catch(() => {});
          } else {
            savedTime = video.currentTime;
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
  });
})();
