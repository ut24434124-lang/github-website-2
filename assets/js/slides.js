/* ═══════════════════════════════════════════════════════════
   نظام التنقل بين الشرائح
   - في وضع RTL: السهم الأيسر يتقدّم، والسهم الأيمن يرجع
   - المسافة وPageDown: التالي   |   PageUp: السابق
   - Home / End: أول وآخر شريحة
   - لا انتقال خارج حدود الشرائح
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var total = slides.length;
  if (total === 0) return;

  var counterEl = document.getElementById("slide-counter");
  var progressEl = document.querySelector(".progress");
  var progressBarEl = document.getElementById("progress-bar");
  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");
  var progressTotalEl = progressEl
    ? progressEl.getAttribute("aria-valuemax") || String(total)
    : String(total);

  var index = 0;

  /* ── تحديد الشريحة الابتدائية من الرابط (#N) إن وُجدت ── */
  function readInitialSlide() {
    var match = window.location.hash.match(/^#(\d+)$/);
    if (!match) return 0;
    var n = parseInt(match[1], 10);
    if (isNaN(n) || n < 1) return 0;
    return Math.min(n - 1, total - 1);
  }

  /* ── تطبيق حالة الشريحة الحالية على الدوم ── */
  function apply() {
    for (var i = 0; i < total; i++) {
      var isActive = i === index;
      slides[i].classList.toggle("is-active", isActive);
      slides[i].setAttribute("aria-hidden", isActive ? "false" : "true");
      /* منع التركيز وقارئات الشاشة من الوصول للشرائح المخفية */
      if ("inert" in slides[i]) {
        slides[i].inert = !isActive;
      }
    }

    if (counterEl) {
      counterEl.textContent = (index + 1) + " / " + total;
    }

    if (progressBarEl) {
      progressBarEl.style.width = ((index + 1) / total) * 100 + "%";
    }

    if (progressEl) {
      progressEl.setAttribute("aria-valuenow", String(index + 1));
      progressEl.setAttribute("aria-valuemax", progressTotalEl);
    }

    if (prevBtn) {
      prevBtn.disabled = index === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = index === total - 1;
    }

    /* تحديث الرابط دون إعادة تحميل أو تنقّل مزعج */
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + (index + 1));
    }
  }

  /* ── الانتقال إلى شريحة محددة مع ضبط الحدود ── */
  function goTo(target) {
    var nextIndex = Math.max(0, Math.min(total - 1, target));
    if (nextIndex === index) return;
    index = nextIndex;
    apply();
  }

  function next() {
    if (index < total - 1) goTo(index + 1);
  }

  function previous() {
    if (index > 0) goTo(index - 1);
  }

  /* ── أزرار الشاشة ── */
  if (prevBtn) prevBtn.addEventListener("click", previous);
  if (nextBtn) nextBtn.addEventListener("click", next);

  /* ── لوحة المفاتيح ── */
  function isInteractiveTarget(target) {
    return !!(
      target &&
      target.closest &&
      target.closest('button, a, input, textarea, select, [contenteditable="true"]')
    );
  }

  document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    /* إذا كان التركيز على رابط أو زر، نترك المسافة وEnter لسلوكهما الافتراضي */
    if (isInteractiveTarget(event.target) && (event.key === " " || event.key === "Enter")) {
      return;
    }

    switch (event.key) {
      /* RTL: السهم الأيسر يتقدّم */
      case "ArrowLeft":
      case "PageDown":
      case " ":
      case "ArrowDown":
        event.preventDefault();
        next();
        break;

      /* RTL: السهم الأيمن يرجع */
      case "ArrowRight":
      case "PageUp":
      case "ArrowUp":
        event.preventDefault();
        previous();
        break;

      case "Home":
        event.preventDefault();
        goTo(0);
        break;

      case "End":
        event.preventDefault();
        goTo(total - 1);
        break;
    }
  });

  /* ── دعم الروابط المباشرة (#N) دون تنقّل مزعج ── */
  window.addEventListener("hashchange", function () {
    var match = window.location.hash.match(/^#(\d+)$/);
    if (match) {
      var n = parseInt(match[1], 10);
      if (!isNaN(n)) goTo(n - 1);
    }
  });

  /* ── البدء: الشريحة الأولى افتراضيًا ما لم يحدد الرابط غير ذلك ── */
  index = readInitialSlide();
  if (index === 0 && window.history && window.history.replaceState) {
    window.history.replaceState(null, "", "#1");
  }
  apply();
})();
