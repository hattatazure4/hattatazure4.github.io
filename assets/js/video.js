/* Videolarımız: ürün başlıklarına göre bölümler, her bölümde "Daha fazla"; arama tüm bölümlerde */
(function () {
  var root = document.querySelector('[data-videos]');
  if (!root) return;
  var STEP = 8;
  var blocks = Array.prototype.slice.call(root.querySelectorAll('[data-vblock]')).map(function (b) {
    return { el: b, figs: Array.prototype.slice.call(b.querySelectorAll('.vfig')), more: b.querySelector('[data-vmore-btn]'), limit: STEP };
  });
  var input = root.querySelector('[data-vsearch]');
  var empty = root.querySelector('[data-vempty]');
  var chips = root.querySelectorAll('.vchip');

  var norm = function (s) { return s.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, ''); };

  function render() {
    var q = norm(input.value), total = 0;
    blocks.forEach(function (b, i) {
      var hits = 0, shown = 0;
      b.figs.forEach(function (f) {
        var ok = !q || f.getAttribute('data-text').indexOf(q) !== -1;
        if (ok) hits++;
        // aramada tüm eşleşmeler görünür; aksi halde bölüm başına sınır
        var show = ok && (q || shown < b.limit);
        if (show) shown++;
        f.hidden = !show;
      });
      total += hits;
      b.el.hidden = hits === 0;
      if (chips[i]) chips[i].classList.toggle('is-dim', hits === 0);
      b.more.hidden = !!q || hits <= shown;
      if (!b.more.hidden) b.more.textContent = 'Daha fazla (' + (hits - shown) + ')';
    });
    empty.hidden = total !== 0;
  }

  blocks.forEach(function (b) {
    b.more.addEventListener('click', function () { b.limit += STEP; render(); });
  });
  input.addEventListener('input', render);
  render();
})();
