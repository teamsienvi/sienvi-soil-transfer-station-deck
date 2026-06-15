const slides = Array.from(document.querySelectorAll(".slide"));
const slideLabel = document.getElementById("slide-label");
const progressBar = document.getElementById("progress-bar");
const slideDots = document.getElementById("slide-dots");
const controls = Array.from(document.querySelectorAll("[data-direction]"));

let currentIndex = 0;
let wheelLocked = false;
let touchStartX = 0;
let touchDeltaX = 0;

const isMobileLayout = () => window.innerWidth <= 900;

function buildDots() {
  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slide-dot";
    button.ariaLabel = `Go to slide ${index + 1}: ${slide.dataset.title}`;
    button.addEventListener("click", () => activateSlide(index));
    slideDots.appendChild(button);
  });
}

function updateHud(index) {
  const total = slides.length;
  slideLabel.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  progressBar.style.width = `${((index + 1) / total) * 100}%`;

  Array.from(slideDots.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

function syncHash(index) {
  const hash = `slide-${index + 1}`;
  if (location.hash !== `#${hash}`) {
    history.replaceState(null, "", `#${hash}`);
  }
}

function activateSlide(index, options = {}) {
  const { instant = false } = options;
  const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
  currentIndex = nextIndex;

  if (instant) {
    document.documentElement.classList.add("is-instant");
  }

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === nextIndex);
    slide.classList.toggle("is-before", slideIndex < nextIndex);
  });

  updateHud(nextIndex);
  syncHash(nextIndex);
  slides[nextIndex].scrollTop = 0;

  if (instant) {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove("is-instant");
    });
  }
}

function moveSlides(delta) {
  activateSlide(currentIndex + delta);
}

function handleKeydown(event) {
  if (isMobileLayout()) {
    return;
  }

  const key = event.key;
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(key)) {
    event.preventDefault();
    moveSlides(1);
  }

  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(key)) {
    event.preventDefault();
    moveSlides(-1);
  }

  if (key === "Home") {
    event.preventDefault();
    activateSlide(0);
  }

  if (key === "End") {
    event.preventDefault();
    activateSlide(slides.length - 1);
  }
}

function handleWheel(event) {
  if (isMobileLayout() || wheelLocked) {
    return;
  }

  if (Math.abs(event.deltaY) < 24) {
    return;
  }

  wheelLocked = true;
  moveSlides(event.deltaY > 0 ? 1 : -1);

  window.setTimeout(() => {
    wheelLocked = false;
  }, 550);
}

function handleTouchStart(event) {
  touchStartX = event.changedTouches[0].clientX;
  touchDeltaX = 0;
}

function handleTouchMove(event) {
  touchDeltaX = event.changedTouches[0].clientX - touchStartX;
}

function handleTouchEnd() {
  if (Math.abs(touchDeltaX) < 50) {
    return;
  }

  moveSlides(touchDeltaX < 0 ? 1 : -1);
}

function setSlideFromHash() {
  const match = location.hash.match(/slide-(\d+)/);
  const hashIndex = match ? Number(match[1]) - 1 : 0;
  activateSlide(Number.isNaN(hashIndex) ? 0 : hashIndex, { instant: true });
}

buildDots();
setSlideFromHash();

controls.forEach((button) => {
  button.addEventListener("click", () => {
    moveSlides(Number(button.dataset.direction));
  });
});

window.addEventListener("keydown", handleKeydown);
window.addEventListener("wheel", handleWheel, { passive: true });
window.addEventListener("hashchange", setSlideFromHash);
window.addEventListener("touchstart", handleTouchStart, { passive: true });
window.addEventListener("touchmove", handleTouchMove, { passive: true });
window.addEventListener("touchend", handleTouchEnd, { passive: true });
window.addEventListener("resize", () => activateSlide(currentIndex));
