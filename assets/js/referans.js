/* Referanslar: arama, şehir filtresi, "Daha fazla" (yorum yazma penceresi site.js'te) */
(function () {
  var root = document.querySelector('[data-refs]');

  if (!root) return;

  var STEP = 12;
  var cards = Array.prototype.slice.call(root.querySelectorAll('.rcard'));
  var input = root.querySelector('[data-rsearch]');
  var city = root.querySelector('[data-rcity]');
  var count = root.querySelector('[data-rcount]');
  var empty = root.querySelector('[data-rempty]');
  var more = root.querySelector('[data-rmore]');
  var limit = STEP;

  var norm = function (s) { return s.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, ''); };

  function render() {
    var q = norm(input.value), c = city.value, hits = 0, shown = 0;
    cards.forEach(function (card) {
      var ok = (!c || card.getAttribute('data-city') === c) && (!q || card.getAttribute('data-text').indexOf(q) !== -1);
      if (ok) hits++;
      var show = ok && shown < limit;
      if (show) shown++;
      card.hidden = !show;
    });
    count.textContent = hits;
    empty.hidden = hits !== 0;
    more.hidden = hits <= shown;
    if (!more.hidden) more.textContent = 'Daha fazla (' + (hits - shown) + ')';
  }

  input.addEventListener('input', function () { limit = STEP; render(); });
  city.addEventListener('change', function () { limit = STEP; render(); });
  more.addEventListener('click', function () { limit += STEP; render(); });
  render();
})();
