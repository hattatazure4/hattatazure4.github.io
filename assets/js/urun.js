/* Ürün detay sayfası: video oynatıcı (tıklayınca yüklenir) + özellik arama */
(function () {
  var player = document.querySelector('[data-vplayer]');
  var frame = document.querySelector('[data-vframe]');
  var vtitle = document.querySelector('[data-vtitle]');

  function play(id, title) {
    if (!frame) return;
    frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0" title="' + (title || 'Video').replace(/"/g, '&quot;') + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    if (vtitle && title) vtitle.textContent = title;
    document.querySelectorAll('.vcard.is-on').forEach(function (c) { c.classList.remove('is-on'); });
    var card = document.querySelector('.vcard[data-vid="' + id + '"]');
    if (card) card.classList.add('is-on');
    var r = player.getBoundingClientRect();
    if (r.top < 70 || r.bottom > window.innerHeight) {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      player.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  }

  // Özelliğin yanındaki video: kapağa tıklayınca aynı yerde oynar
  document.addEventListener('click', function (ev) {
    var v = ev.target.closest('[data-vin]');
    if (!v) return;
    var box = v.parentNode;
    box.classList.add('is-playing');
    box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.getAttribute('data-vin')) + '?autoplay=1&rel=0" title="' + (v.getAttribute('aria-label') || 'Video').replace(/"/g, '&quot;') + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
  });

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-vid]');
    if (!b || !player) return;
    var title = '';
    if (b.classList.contains('vcard')) title = (b.querySelector('.vcard__t') || {}).textContent;
    else if (b.classList.contains('acc__vid')) title = (b.closest('.acc__item').querySelector('.acc__t') || {}).textContent;
    else title = vtitle ? vtitle.textContent : '';
    play(b.getAttribute('data-vid'), title);
  });

  // Çok videolu ürünlerde ilk 8'i göster, gerisi düğmeyle açılır
  var grid = document.querySelector('[data-vgrid]');
  var more = document.querySelector('[data-vmore]');
  if (grid && more) {
    var cards = grid.querySelectorAll('.vcard'), LIMIT = 8;
    if (cards.length > LIMIT) {
      for (var i = LIMIT; i < cards.length; i++) cards[i].hidden = true;
      more.hidden = false;
      more.textContent = 'Tüm videoları göster (' + cards.length + ')';
      more.addEventListener('click', function () {
        cards.forEach(function (c) { c.hidden = false; });
        more.hidden = true;
      });
    }
  }

  // Özellik arama
  var acc = document.querySelector('[data-acc]');
  if (acc) {
    var input = acc.querySelector('[data-acc-search]');
    var empty = acc.querySelector('[data-acc-empty]');
    var items = acc.querySelectorAll('.acc__item');
    var norm = function (s) { return s.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, ''); };
    input.addEventListener('input', function () {
      var q = norm(input.value), n = 0;
      items.forEach(function (it) {
        var hit = !q || it.getAttribute('data-text').indexOf(q) !== -1;
        it.hidden = !hit;
        if (hit) n++;
      });
      empty.hidden = n !== 0;
    });
  }
})();

// Karttaki "Devamını oku": tam listedeki maddeyi açıp oraya kaydırır
document.addEventListener('click', function (ev) {
  var a = ev.target.closest('[data-open]');
  if (!a) return;
  var d = document.getElementById('ozellik-' + a.getAttribute('data-open'));
  if (!d) return;
  ev.preventDefault();
  var input = document.querySelector('[data-acc-search]');
  if (input && input.value) { input.value = ''; input.dispatchEvent(new Event('input')); }
  d.open = true;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
});
