/* Fiyatlarımız: Hattat Müşavir, mükellef sayısına göre yıllık tutar */
(function () {
  "use strict";
  var num = document.getElementById("mk-sayi");
  var rng = document.getElementById("mk-kaydir");
  if (!num || !rng) return;

  var BASE = 14950, LIMIT = 65, UNIT = 230, MAX = 5000;
  var $ = function (id) { return document.getElementById(id); };
  var tl = function (n, d) {
    return n.toLocaleString("tr-TR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }) + " ₺";
  };
  var out = { yil: $("mk-yil"), paket: $("mk-paket"), ekSatir: $("mk-ek-satir"), ekAd: $("mk-ek-ad"), ek: $("mk-ek"), basina: $("mk-basina"), gun: $("mk-gun"), wa: $("mk-wa") };
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-mk]"));

  var calc = function (n) {
    n = Math.max(1, Math.min(MAX, Math.round(n) || 1));
    var extra = Math.max(0, n - LIMIT);
    var total = BASE + extra * UNIT;
    out.yil.textContent = tl(total);
    out.paket.textContent = tl(BASE);
    out.ekSatir.classList.toggle("is-off", extra === 0);   /* satır hep yerinde kalır: sayı değişince alt kısım kaymasın */
    out.ekAd.textContent = "+ " + extra + " ek mükellef × " + UNIT + " ₺";
    out.ek.textContent = tl(extra * UNIT);
    var per = total / n;
    out.basina.textContent = tl(per, per % 1 ? 2 : 0);
    out.gun.textContent = tl(per / 365, 2);
    out.wa.href = "https://wa.me/905414413838?text=" + encodeURIComponent(
      "Merhaba, Hattat Müşavir için fiyat bilgisi almak istiyorum. Mükellef sayım: " + n + ", yıllık tutar: " + tl(total) + ".");
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(+c.getAttribute("data-mk") === n)); });
  };

  var set = function (v, from) {
    v = parseInt(v, 10);
    if (isNaN(v)) return;
    v = Math.max(1, Math.min(MAX, v));
    if (from !== num) num.value = v;
    if (from !== rng) rng.value = Math.min(v, +rng.max);
    calc(v);
  };

  num.addEventListener("input", function () { set(num.value, num); });
  num.addEventListener("blur", function () { if (num.value === "" || +num.value < 1) set(LIMIT); });
  rng.addEventListener("input", function () { set(rng.value, rng); });
  chips.forEach(function (c) { c.addEventListener("click", function () { set(c.getAttribute("data-mk")); }); });
  calc(parseInt(num.value, 10) || LIMIT);
})();
