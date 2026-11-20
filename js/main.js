/* どんぐりソフト — 共通スクリプト */
document.addEventListener('DOMContentLoaded', function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- イントロ(トップのみ / 1セッション1回) ---- */
  var intro = document.getElementById('intro');
  if (intro) {
    var seen = false;
    try {
      seen = sessionStorage.getItem('introSeen') === '1' || sessionStorage.getItem('wiping') === '1';
    } catch (e) {}
    if (reduced || seen) {
      intro.remove();
      document.body.classList.remove('has-intro');
    } else {
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
      setTimeout(function () {
        intro.classList.add('is-done');
        document.body.classList.remove('has-intro');
      }, 1900);
      setTimeout(function () { intro.remove(); }, 2800);
    }
  }

  /* ---- スクロールで出現 ---- */
  var targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- ヒーロー写真のゆるいパララックス ---- */
  var para = document.querySelector('[data-parallax]');
  if (para && !reduced) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < 900) para.style.transform = 'translateY(' + y * 0.12 + 'px)';
    }, { passive: true });
  }

  /* ---- ページ遷移ワイプ ---- */
  if (!reduced) {
    var wipe = document.createElement('div');
    wipe.className = 'page-wipe';
    wipe.setAttribute('aria-hidden', 'true');
    wipe.innerHTML = '<i></i><i></i>';
    document.body.appendChild(wipe);

    /* 入場: 遷移して来た場合は幕が右へ抜ける */
    var wiped = false;
    try { wiped = sessionStorage.getItem('wiping') === '1'; sessionStorage.removeItem('wiping'); } catch (e) {}
    if (wiped) {
      wipe.classList.add('is-cover');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          wipe.classList.remove('is-cover');
          wipe.classList.add('is-leave');
          setTimeout(function () { wipe.classList.remove('is-leave'); }, 800);
        });
      });
    }

    /* 退場: サイト内リンクのクリックで幕が画面を覆ってから遷移 */
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest ? ev.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (a.target === '_blank' || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
      if (!/\.html(#.*)?$/.test(href) || /^https?:/.test(href)) return;
      ev.preventDefault();
      try { sessionStorage.setItem('wiping', '1'); } catch (e) {}
      wipe.classList.add('is-enter');
      setTimeout(function () { location.href = href; }, 700);
    });
  }
});
