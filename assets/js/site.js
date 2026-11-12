/* Hattat Yazılım — tema taslağı betiği (bağımlılıksız).
   Next.js'e taşırken her blok bir React bileşenine/hook'una dönüşür. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobil menü ---------- */
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  if (header && toggle) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
    });
  }

  /* ---------- Ürünler menüsü: bağlantı sayfaya gider; üzerine gelince/odakta panel açılır; telefonda ok düğmesiyle ---------- */
  var subItem = document.querySelector("[data-sub]");
  if (subItem) {
    var link = subItem.querySelector(".nav__link");
    var tgl = subItem.querySelector(".nav__sub-toggle");
    var desktop = function () { return window.matchMedia("(min-width:1040px)").matches; };
    var setSubOpen = function (open) {
      subItem.classList.toggle("is-open", open);
      if (tgl) tgl.setAttribute("aria-expanded", String(open));
      link.setAttribute("aria-expanded", String(open));
    };
    var subTimer = null;
    var subClose = function () { clearTimeout(subTimer); subTimer = setTimeout(function () { setSubOpen(false); }, 200); };
    var subKeep = function () { clearTimeout(subTimer); };
    subItem.addEventListener("mouseenter", function () { if (desktop()) { subKeep(); setSubOpen(true); } });
    subItem.addEventListener("mouseleave", function () { if (desktop()) subClose(); });
    subItem.addEventListener("focusin", function () { if (desktop()) { subKeep(); setSubOpen(true); } });
    subItem.addEventListener("focusout", function (e) { if (!subItem.contains(e.relatedTarget)) setSubOpen(false); });
    if (tgl) tgl.addEventListener("click", function () { setSubOpen(!subItem.classList.contains("is-open")); });
    link.addEventListener("keydown", function (e) { if (e.key === "ArrowDown") { e.preventDefault(); setSubOpen(true); var f = subItem.querySelector(".mega a"); if (f) f.focus(); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && subItem.classList.contains("is-open")) { setSubOpen(false); link.focus(); } });
    document.addEventListener("click", function (e) { if (!subItem.contains(e.target)) setSubOpen(false); });
  }

  /* ---------- Ürün panel görselleri (şablondan yerleştir, genişliğe göre ölçekle) ---------- */
  var fitScene = function (frame) {
    var app = frame.firstElementChild;
    if (app) app.style.setProperty("--k", String(frame.clientWidth / 560));
  };
  var fitAllScenes = function () { document.querySelectorAll(".scene-frame").forEach(fitScene); };
  var sceneObserver = "ResizeObserver" in window ? new ResizeObserver(function (entries) { entries.forEach(function (e) { fitScene(e.target); }); }) : null;
  function mountScenes(root) {
    (root || document).querySelectorAll("[data-image]").forEach(function (slot) {
      if (slot.firstElementChild) return;
      var src = slot.getAttribute("data-image");
      var im = document.createElement("img");
      im.src = src; im.alt = ""; im.loading = "lazy"; im.decoding = "async";
      slot.appendChild(im);
      var card = slot.closest(".product");
      var detail = card && card.querySelector(".product__title"), name = card && card.querySelector("h3");
      if (detail && name) {
        var ov = document.createElement("a"); ov.className = "glass-hover"; ov.tabIndex = -1; ov.href = detail.getAttribute("href");
        ov.setAttribute("aria-label", name.textContent + " ürün sayfası");
        slot.appendChild(ov);
      }
    });
    (root || document).querySelectorAll("[data-scene]").forEach(function (slot) {
      if (slot.firstElementChild) return;
      var tpl = document.getElementById("scene-" + slot.getAttribute("data-scene"));
      if (!tpl) return;
      slot.appendChild(tpl.content.cloneNode(true));
      var frame = slot.querySelector(".scene-frame");
      if (frame) { fitScene(frame); if (sceneObserver) sceneObserver.observe(frame); }
    });
  }
  mountScenes();
  if (!sceneObserver) window.addEventListener("resize", fitAllScenes);

  /* ---------- Hero kaydırıcısı (içerik assets/data/slides.json'dan; admin paneli bunu API ile besleyecek) ---------- */
  var slider = document.querySelector("[data-slider]");
  if (slider) {
    var FALLBACK = { settings: { interval: 7000 }, slides: [{ id: "marka", enabled: true, type: "brand", tab: "Hattat Yazılım", eyebrow: "Hattat Yazılım · 1993'ten beri", title: "Siz hayal edin, {{biz yazalım.}}", lead: "Mali müşavir ofisleri için yazılım, Türkiye'nin her yerinde.", actions: [{ label: "İletişime Geç", href: "#iletisim", variant: "primary" }], visual: { kind: "scene", id: "musavir" } }] };

    var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
    var safeHref = function (h) { return /^(\/|#|https?:\/\/|tel:|mailto:)/.test(h || "") ? h : "#"; };
    var accentInto = function (node, text) {
      String(text || "").split(/(\{\{.*?\}\})/).forEach(function (part) {
        if (/^\{\{.*\}\}$/.test(part)) node.appendChild(el("em", "", part.slice(2, -2)));
        else if (part) node.appendChild(document.createTextNode(part));
      });
    };
    var fmtDate = function (iso) { try { return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return iso; } };

    var buildSlide = function (d, i, n) {
      var art = el("div", "slide");
      art.setAttribute("role", "group"); art.setAttribute("aria-roledescription", "slide");
      art.setAttribute("aria-label", (i + 1) + " / " + n); art.setAttribute("aria-hidden", "true");

      var copy = el("div", "slide__copy");
      var meta = el("div", "slide__meta");
      if (d.badge) meta.appendChild(el("span", "badge", d.badge));
      if (d.eyebrow) meta.appendChild(el("span", "eyebrow", d.eyebrow));
      if (d.date) meta.appendChild(el("span", "slide__date", fmtDate(d.date)));
      copy.appendChild(meta);
      var h = el(i === 0 ? "h1" : "h2"); accentInto(h, d.title); copy.appendChild(h);
      if (d.lead) copy.appendChild(el("p", "lead", d.lead));
      if (d.actions && d.actions.length) {
        var act = el("div", "hero__actions");
        d.actions.slice(0, 2).forEach(function (a) {
          var link = el("a", "btn " + (a.variant === "ghost" ? "btn--ghost" : "btn--primary"), a.label);
          link.href = safeHref(a.href);
          if (/^https?:/.test(link.href)) link.rel = "noopener";
          act.appendChild(link);
        });
        copy.appendChild(act);
      }
      art.appendChild(copy);

      var vis = el("div", "slide__visual");
      var v = d.visual || {};
      if (v.kind === "image" && v.src) {
        var fig = el("figure", "shot shot--" + (v.frame || "light"));
        var im = el("img"); if (i > 0) im.setAttribute("data-src", v.src); else { im.src = v.src; im.setAttribute("fetchpriority", "high"); } im.alt = v.alt || ""; im.decoding = "async";
        im.width = 1280; im.height = 800;
        fig.appendChild(im);
        if (d.actions && d.actions[0]) {
          var ov = el("a", "glass-hover glass-hover--hero"); ov.href = safeHref(d.actions[0].href);
          ov.setAttribute("aria-label", d.actions[0].label);
          fig.appendChild(ov);
        }
        vis.appendChild(fig);
      } else if (v.kind === "scene" && v.id) {
        vis.setAttribute("data-scene", v.id);
      }
      art.appendChild(vis);
      return art;
    };

    var initSlider = function (data) {
      var list = (data.slides || []).filter(function (s) { return s.enabled !== false; });
      if (!list.length) list = FALLBACK.slides;
      var interval = (data.settings && data.settings.interval) || 7000;
      slider.style.setProperty("--slide-dur", interval + "ms");

      var host = slider.querySelector("[data-slides]");
      var tabsHost = slider.querySelector("[data-slider-tabs]");
      var label = slider.querySelector("[data-slider-label]");
      var pauseBtn = slider.querySelector("[data-slider-pause]");
      /* HTML'deki ilk (statik) slayt, slides.json'daki ilk slaytla aynıysa yeniden kurulmaz: görsel ve animasyon baştan oynamasın, başlık yerinde kalsın */
      var existing = host.querySelector(".slide");
      var plain = function (t) { return String(t || "").replace(/\{\{|\}\}/g, "").trim(); };
      var firstTitle = existing && existing.querySelector("h1, h2");
      if (!(existing && firstTitle && list[0] && plain(list[0].title) === firstTitle.textContent.trim())) existing = null;
      Array.prototype.slice.call(host.children).forEach(function (c) { if (c !== existing) host.removeChild(c); });
      tabsHost.innerHTML = "";

      var slides = [], tabs = [], names = [], current = 0;
      list.forEach(function (d, i) {
        var art = (i === 0 && existing) ? existing : buildSlide(d, i, list.length); if (art !== existing) host.appendChild(art); slides.push(art);
        var t = el("button", "slider__tab"); t.type = "button"; t.setAttribute("role", "tab"); t.setAttribute("aria-selected", "false");
        names.push(d.tab || d.eyebrow || "");
        t.setAttribute("aria-label", (i + 1) + ". " + names[i]);
        t.appendChild(el("i", "fill"));
        tabsHost.appendChild(t); tabs.push(t);
      });
      mountScenes(host);
      host.querySelectorAll("img:not([data-src])").forEach(function (im) { im.loading = "eager"; if (im.decode) im.decode().catch(function () {}); });
      /* ilk slayttan sonrakilerin görselleri sayfa yüklendikten sonra gelir (ilk boyama hızlansın); slayta geçilirse hemen yüklenir */
      var loadImg = function (im) { im.src = im.getAttribute("data-src"); im.removeAttribute("data-src"); im.loading = "eager"; if (im.decode) im.decode().catch(function () {}); };
      var late = function () { host.querySelectorAll("img[data-src]").forEach(loadImg); };
      if (document.readyState === "complete") setTimeout(late, 1200); else window.addEventListener("load", function () { setTimeout(late, 1200); });

      var show = function (i) {
        current = (i + slides.length) % slides.length;
        slides.forEach(function (s, n) {
          var on = n === current;
          s.classList.toggle("is-active", on);
          s.setAttribute("aria-hidden", String(!on));
          if (on) { var di = s.querySelector("img[data-src]"); if (di) loadImg(di); }
          s.querySelectorAll("a, button").forEach(function (x) { x.tabIndex = on ? 0 : -1; });
        });
        tabs.forEach(function (t, n) { t.setAttribute("aria-selected", String(n === current)); t.classList.toggle("is-done", n < current); });
        var af = tabs[current].querySelector(".fill");
        if (af) { af.style.animation = "none"; void af.offsetWidth; af.style.animation = ""; }
        if (label) {
          label.textContent = "";
          label.appendChild(el("span", "", String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0")));
          label.appendChild(document.createTextNode(names[current]));
        }
      };
      var setPaused = function (p, byUser) {
        if (p) slider.setAttribute("data-paused", ""); else slider.removeAttribute("data-paused");
        if (byUser && pauseBtn) {
          pauseBtn.setAttribute("aria-pressed", String(p));
          pauseBtn.querySelector("use").setAttribute("href", p ? "#i-play" : "#i-pause");
          pauseBtn.setAttribute("aria-label", p ? "Otomatik geçişi başlat" : "Otomatik geçişi durdur");
          slider.dataset.userPaused = p ? "1" : "";
        }
      };
      tabs.forEach(function (t, n) {
        t.addEventListener("click", function () { show(n); });
        t.addEventListener("animationend", function (e) { if (e.animationName === "fill" && n === current) show(current + 1); });
        t.addEventListener("keydown", function (e) {
          if (e.key === "ArrowRight") { show(current + 1); tabs[current].focus(); }
          if (e.key === "ArrowLeft") { show(current - 1); tabs[current].focus(); }
        });
      });
      slider.querySelector("[data-slider-prev]").addEventListener("click", function () { show(current - 1); });
      slider.querySelector("[data-slider-next]").addEventListener("click", function () { show(current + 1); });
      if (pauseBtn) pauseBtn.addEventListener("click", function () { setPaused(!slider.dataset.userPaused, true); });

      var hoverPause = function (p) { if (!slider.dataset.userPaused) setPaused(p, false); };
      document.addEventListener("visibilitychange", function () { hoverPause(document.hidden); });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { hoverPause(!en[0].isIntersecting); }).observe(slider);

      var x0 = null;
      host.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
      slider.addEventListener("pointerup", function (e) {
        if (x0 === null) return;
        var dx = e.clientX - x0; x0 = null;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      });

      if (reduceMotion) setPaused(true, true);
      show(0);
    };

    fetch("assets/data/slides.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("slides.json " + r.status); return r.json(); })
      .then(initSlider)
      .catch(function () { initSlider(FALLBACK); });
  }

  /* ---------- Ürün süzgeci ---------- */
  var filters = document.querySelectorAll("[data-filter]");
  var products = document.querySelectorAll("[data-products] .product");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var key = f.getAttribute("data-filter");
      filters.forEach(function (x) { x.setAttribute("aria-pressed", String(x === f)); });
      products.forEach(function (p) {
        var show = key === "hepsi" || (p.getAttribute("data-audience") || "").split(" ").indexOf(key) !== -1;
        p.hidden = !show;
      });
      fitAllScenes();
    });
  });

  /* ---------- Referans kaydırıcısı ---------- */
  var quotes = document.querySelector("[data-quotes]");
  if (quotes) {
    var step = function (dir) { quotes.scrollBy({ left: dir * (quotes.querySelector(".quote").offsetWidth + 16), behavior: "smooth" }); };
    var prev = document.querySelector("[data-quotes-prev]");
    var next = document.querySelector("[data-quotes-next]");
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
  }

  /* ---------- İl listesi (81 il) ---------- */
  var cities = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"];
  document.querySelectorAll("[data-cities]").forEach(function (citySelect) { cities.forEach(function (c) { var o = document.createElement("option"); o.textContent = c; o.value = c; citySelect.appendChild(o); }); });

  /* ---------- Özel açılır liste: sistem menüsü yerine; seçim yerel select'e yazılır ---------- */
  document.querySelectorAll(".qfield select").forEach(function (sel, n) {
    var field = sel.closest(".qfield"), label = field.querySelector("label");
    var wrap = document.createElement("div"); wrap.className = "qsel";
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
    sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
    var items = [].slice.call(sel.options).filter(function (o) { return o.value !== ""; });
    var placeholder = (sel.options[0] && sel.options[0].value === "") ? sel.options[0].textContent : "Seçiniz";

    var btn = document.createElement("button"); btn.type = "button"; btn.className = "qsel__btn";
    btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
    var val = document.createElement("span"); val.className = "qsel__val is-placeholder"; val.textContent = placeholder; btn.appendChild(val);
    var chev = document.createElementNS("http://www.w3.org/2000/svg", "svg"); chev.setAttribute("class", "qsel__chev"); chev.setAttribute("viewBox", "0 0 24 24"); chev.setAttribute("aria-hidden", "true");
    chev.innerHTML = '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    var list = document.createElement("ul"); list.className = "qsel__list"; list.setAttribute("role", "listbox"); list.id = "qsel-" + n;
    if (label) { label.id = label.id || "qsel-l-" + n; btn.setAttribute("aria-labelledby", label.id); list.setAttribute("aria-labelledby", label.id); label.addEventListener("click", function () { btn.focus(); }); }
    btn.setAttribute("aria-controls", list.id);
    var active = -1, typed = "", typedTimer = null;
    var opts = [];
    var setActive = function (i) {
      opts.forEach(function (li, k) { li.classList.toggle("is-active", k === i); });
      active = i;
      if (i >= 0) { btn.setAttribute("aria-activedescendant", opts[i].id); opts[i].scrollIntoView({ block: "nearest" }); }
    };
    var choose = function (i) {
      sel.value = items[i].value;
      val.textContent = items[i].textContent; val.classList.remove("is-placeholder");
      opts.forEach(function (li, k) { li.setAttribute("aria-selected", String(k === i)); });
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    };
    var isOpen = function () { return wrap.classList.contains("is-open"); };
    var open = function () {
      var r = btn.getBoundingClientRect();
      wrap.classList.toggle("qsel--up", window.innerHeight - r.bottom < 300 && r.top > window.innerHeight - r.bottom);
      wrap.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
      var cur = opts.findIndex(function (li) { return li.getAttribute("aria-selected") === "true"; });
      setActive(cur >= 0 ? cur : 0);
    };
    var close = function (refocus) { wrap.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); btn.removeAttribute("aria-activedescendant"); if (refocus) btn.focus(); };
    items.forEach(function (o, i) {
      var li = document.createElement("li"); li.className = "qsel__opt"; li.setAttribute("role", "option"); li.id = list.id + "-" + i; li.textContent = o.textContent; li.setAttribute("aria-selected", "false");
      li.addEventListener("mousedown", function (e) { e.preventDefault(); });
      li.addEventListener("click", function () { choose(i); close(true); });
      li.addEventListener("mousemove", function () { if (active !== i) setActive(i); });
      list.appendChild(li); opts.push(li);
    });
    wrap.appendChild(btn); wrap.appendChild(chev); wrap.appendChild(list);

    btn.addEventListener("click", function () { isOpen() ? close() : open(); });
    btn.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); if (!isOpen()) { open(); return; } setActive(Math.min(opts.length - 1, Math.max(0, active + (k === "ArrowDown" ? 1 : -1)))); }
      else if (k === "Home" && isOpen()) { e.preventDefault(); setActive(0); }
      else if (k === "End" && isOpen()) { e.preventDefault(); setActive(opts.length - 1); }
      else if (k === "Enter" || k === " ") { if (isOpen()) { e.preventDefault(); if (active >= 0) choose(active); close(true); } }
      else if (k === "Escape" || k === "Tab") { if (isOpen()) close(k === "Escape"); }
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        typed += k.toLocaleLowerCase("tr"); clearTimeout(typedTimer); typedTimer = setTimeout(function () { typed = ""; }, 700);
        var hit = opts.findIndex(function (li) { return li.textContent.toLocaleLowerCase("tr").indexOf(typed) === 0; });
        if (hit >= 0) { if (!isOpen()) open(); setActive(hit); }
      }
    });
    document.addEventListener("click", function (e) { if (isOpen() && !wrap.contains(e.target)) close(); });
    sel.focus = function () { btn.focus(); };
  });

  /* ---------- İletişim formu (taslak: gönderim yok; Next.js'te .NET API'ye POST edilecek) ---------- */
  document.querySelectorAll("[data-form]").forEach(function (form) {
    var status = form.querySelector("[data-form-status]");
    var fieldOf = function (el) { return el.closest(".qfield"); };
    var invalid = function (el, on) { var f = fieldOf(el); if (f) f.classList.toggle("is-invalid", on); };
    form.addEventListener("input", function (e) { invalid(e.target, false); });
    form.addEventListener("change", function (e) { invalid(e.target, false); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = [];
      form.querySelectorAll("input[required], select[required], textarea[required]").forEach(function (el) { var no = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value.trim())); invalid(el, no); if (no) bad.push(el); });
      status.classList.toggle("is-error", bad.length > 0);
      if (bad.length) { status.textContent = "Lütfen işaretli alanları kontrol edin."; bad[0].focus(); return; }
      status.textContent = "Taslak sürüm: form henüz bir sunucuya bağlı değil.";
    });
  });

  /* ---------- "Yorum Yap" penceresi (ana sayfa ve Referanslar sayfası) ---------- */
  var commentDlg = document.getElementById("yorum-penceresi");
  if (commentDlg) {
    document.querySelectorAll("[data-open-comment]").forEach(function (b) { b.addEventListener("click", function () { if (commentDlg.showModal) commentDlg.showModal(); else commentDlg.setAttribute("open", ""); }); });
    document.querySelectorAll("[data-close-comment]").forEach(function (b) { b.addEventListener("click", function () { commentDlg.close(); }); });
    commentDlg.addEventListener("click", function (ev) { if (ev.target === commentDlg) commentDlg.close(); });
  }

  /* ---------- Sayfa genelinde aşağı kaydırınca belirme (tek efekt; kartlar satır içinde sıralı) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; el.classList.add("is-in"); io.unobserve(el);
        /* belirme bitince efekt sınıfı kalkar: kartların kendi hover geçişleri bozulmasın */
        setTimeout(function () { el.classList.remove("reveal", "is-in"); el.style.removeProperty("--d"); }, 1600);
      });
    }, { threshold: 0, rootMargin: "0px 0px -60px 0px" });
    var pending = [];
    var add = function (el, delay) { el.classList.add("reveal"); if (delay) el.style.setProperty("--d", delay + "ms"); io.observe(el); pending.push(el); };
    /* güvence: hızlı kaydırma / anchor zıplamasında ekranı geçip gözlemcinin kaçırdığı öğeleri göster */
    var sweepTick = false;
    var sweep = function () {
      sweepTick = false;
      pending = pending.filter(function (el) {
        if (!el.classList.contains("reveal") || el.classList.contains("is-in")) return false;
        if (el.getBoundingClientRect().top < window.innerHeight - 60) { el.classList.add("is-in"); setTimeout(function () { el.classList.remove("reveal", "is-in"); el.style.removeProperty("--d"); }, 1600); return false; }
        return true;
      });
    };
    window.addEventListener("scroll", function () { if (!sweepTick) { sweepTick = true; setTimeout(sweep, 120); } }, { passive: true });

    /* tek parça alanlar */
    document.querySelectorAll(".section-head, .orbit, .why-lead, .refs-slider, .contact__info, .qform").forEach(function (el) { add(el, 0); });

    /* sayfaya özel: [data-reveal] tek parça, [data-reveal-item] ızgara öğesi */
    document.querySelectorAll("[data-reveal]").forEach(function (el) { add(el, 0); });
    var groups = [];
    document.querySelectorAll("[data-reveal-item]").forEach(function (el) { if (groups.indexOf(el.parentElement) < 0) groups.push(el.parentElement); });
    groups.forEach(function (g) {
      var kids = g.querySelectorAll(":scope > [data-reveal-item]");
      var cols = getComputedStyle(g).gridTemplateColumns.split(" ").length || 1;
      kids.forEach(function (el, i) { add(el, 0); });
    });

    /* ızgaradaki öğeler: aynı satırda 90 ms arayla */
    [".products > .product", ".values > .value", ".why-cells > .why-cell"].forEach(function (sel) {
      var items = document.querySelectorAll(sel);
      if (!items.length) return;
      var cols = getComputedStyle(items[0].parentElement).gridTemplateColumns.split(" ").length || 1;
      items.forEach(function (el, i) { add(el, 0); });
    });
  }

  /* ---------- Süzülen telefonlar yalnız ekrandayken hareket eder ---------- */
  var orbit = document.querySelector(".orbit");
  if (orbit && "IntersectionObserver" in window) new IntersectionObserver(function (en) { orbit.classList.toggle("is-live", en[0].isIntersecting); }).observe(orbit);

  /* ---------- Referans slider: aktif kart, ilerleme, oklar, sürükleme ---------- */
  var refsTrack = document.querySelector("[data-refs-track]");
  if (refsTrack) {
    var rcards = refsTrack.querySelectorAll("[data-rcard]");
    var rbar = document.querySelector("[data-refs-progress]");
    var rcount = document.querySelector("[data-refs-count]");
    var rIndex = 0, rTick = false;
    var rStep = function () { return rcards.length > 1 ? rcards[1].offsetLeft - rcards[0].offsetLeft : refsTrack.clientWidth; };
    var rUpdate = function () {
      rTick = false;
      var max = refsTrack.scrollWidth - refsTrack.clientWidth;
      var i = Math.min(rcards.length - 1, Math.max(0, Math.round(refsTrack.scrollLeft / rStep())));
      if (max > 0 && refsTrack.scrollLeft >= max - 4) i = rcards.length - 1;
      if (i !== rIndex || !rcards[i].classList.contains("is-active")) {
        rIndex = i;
        rcards.forEach(function (c, n) { c.classList.toggle("is-active", n === i); });
        if (rcount) rcount.textContent = String(i + 1).padStart(2, "0") + " / " + String(rcards.length).padStart(2, "0");
      }
      if (rbar) rbar.style.transform = "scaleX(" + (max > 0 ? Math.max(1 / rcards.length, refsTrack.scrollLeft / max) : 1) + ")";
    };
    refsTrack.addEventListener("scroll", function () { if (!rTick) { rTick = true; requestAnimationFrame(rUpdate); } }, { passive: true });
    window.addEventListener("resize", rUpdate);
    var rTarget = null, rTimer = null;
    var rGo = function (dir) {
      var base = rTarget === null ? rIndex : rTarget;
      rTarget = Math.min(rcards.length - 1, Math.max(0, base + dir));
      refsTrack.scrollTo({ left: rcards[rTarget].offsetLeft - rcards[0].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
      clearTimeout(rTimer); rTimer = setTimeout(function () { rTarget = null; }, 900);
    };
    document.querySelector("[data-refs-prev]").addEventListener("click", function () { rGo(-1); });
    document.querySelector("[data-refs-next]").addEventListener("click", function () { rGo(1); });
    /* fareyle sürükleme */
    var rx = null, rs = 0, rMoved = false;
    refsTrack.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; rx = e.clientX; rs = refsTrack.scrollLeft; rMoved = false; });
    window.addEventListener("pointermove", function (e) {
      if (rx === null) return;
      var dx = e.clientX - rx;
      if (!rMoved && Math.abs(dx) > 4) { rMoved = true; refsTrack.classList.add("is-drag"); }
      if (rMoved) refsTrack.scrollLeft = rs - dx;
    });
    window.addEventListener("pointerup", function () {
      if (rx === null) return;
      rx = null;
      if (rMoved) { refsTrack.classList.remove("is-drag"); refsTrack.scrollTo({ left: Math.round(refsTrack.scrollLeft / rStep()) * rStep(), behavior: "smooth" }); }
    });
    rUpdate();
  }

  /* ---------- Mobil Teknolojiler: fayda üzerine gelince ilgili uygulama ikonu vurgulanır ---------- */
  document.querySelectorAll("[data-value]").forEach(function (v) {
    var chip = document.querySelector('[data-chip="' + v.getAttribute("data-value") + '"]');
    if (!chip) return;
    var on = function () { v.classList.add("is-lit"); chip.classList.add("is-lit"); };
    var off = function () { v.classList.remove("is-lit"); chip.classList.remove("is-lit"); };
    v.addEventListener("mouseenter", on); v.addEventListener("mouseleave", off);
  });

  /* ---------- Sohbet asistanı ---------- */
  var chat = document.querySelector("[data-chat]");
  if (chat) {
    var launcher = chat.querySelector("[data-chat-launcher]");
    var panel = chat.querySelector("[data-chat-panel]");
    var log = chat.querySelector("[data-chat-log]");
    var replies = chat.querySelector("[data-chat-replies]");
    var cform = chat.querySelector("[data-chat-form]");
    var input = cform.querySelector("input");
    var started = false, expect = null, lead = {}, busy = false;

    var PHONES = [["0541 441 38 38", "+905414413838"]];
    var PRODUCTS = ["Hattat Müşavir", "Hattat Mevzuat", "Hattat YMM", "Hattat E-Arşiv Portal", "Web Sitesi", "Hattat e-Defter", "Hattat Entegre", "Online Teklif"];

    var scrollDown = function () { log.scrollTop = log.scrollHeight; };
    var clearReplies = function () { replies.innerHTML = ""; };

    /* parts: string | {href,label} | {links:[{href,label}]} */
    var bubble = function (cls, parts) {
      var d = document.createElement("div");
      d.className = "msg " + cls;
      (Array.isArray(parts) ? parts : [parts]).forEach(function (p) {
        if (typeof p === "string") { d.appendChild(document.createTextNode(p)); return; }
        if (p.links) {
          var w = document.createElement("div"); w.className = "msg__links";
          p.links.forEach(function (l) { var a = document.createElement("a"); a.href = l.href; a.textContent = l.label; w.appendChild(a); });
          d.appendChild(w); return;
        }
        var a = document.createElement("a"); a.href = p.href; a.textContent = p.label; d.appendChild(a);
      });
      log.appendChild(d); scrollDown(); return d;
    };
    var userSay = function (t) { bubble("msg--user", t); };
    var botSay = function (parts, delay) {
      return new Promise(function (resolve) {
        var t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>";
        log.appendChild(t); scrollDown();
        setTimeout(function () { t.remove(); bubble("msg--bot", parts); resolve(); }, reduceMotion ? 0 : (delay || 650));
      });
    };
    var setReplies = function (list) {
      clearReplies();
      list.forEach(function (r) {
        var b = document.createElement("button"); b.type = "button"; b.className = "reply"; b.textContent = r[0];
        b.addEventListener("click", function () { if (busy) return; userSay(r[0]); clearReplies(); run(r[1]); });
        replies.appendChild(b);
      });
    };
    var run = function (fn) { busy = true; Promise.resolve(fn()).then(function () { busy = false; }); };

    var menu = function () { setReplies([["Ürünleri tanımak istiyorum", flowProducts], ["Bilgi / demo talebi bırakmak istiyorum", flowLead], ["Teknik destek", flowSupport], ["Bizi arayın", flowCall]]); };
    var more = function () { setReplies([["Başka bir konu", function () { return botSay("Elbette, başka nasıl yardımcı olabiliriz?").then(menu); }], ["Talep bırakmak istiyorum", flowLead]]); };

    var flowStart = function () {
      return botSay("Merhaba! Ben Hattat Yazılım'ın sanal asistanıyım.", 400)
        .then(function () { return botSay("Size nasıl yardımcı olabiliriz?", 600); }).then(menu);
    };
    var flowProducts = function () {
      return botSay("Hangi alanda yardım arıyorsunuz?").then(function () {
        setReplies([
          ["Mali müşavir ofisi", function () { return botSay(["Mali müşavir ofisleri için öne çıkan yazılımlarımız:", { links: [{ href: "/urun/hattat-musavir/", label: "Hattat Müşavir" }, { href: "/urun/hattat-mevzuat/", label: "Hattat Mevzuat" }, { href: "/urun/hattat-entegre/", label: "Hattat Entegre" }, { href: "/urun/hattat-e-defter/", label: "Hattat e-Defter" }] }]).then(more); }],
          ["YMM", function () { return botSay(["YMM'ler için karşıt inceleme, YMM teyit ve KDV iade süreçlerini otomatikleştiren:", { links: [{ href: "/urun/hattat-ymm/", label: "Hattat YMM Otomasyon" }] }]).then(more); }],
          ["Fatura ve teklif", function () { return botSay(["E-Arşiv faturayı cep telefonundan kesmek ve PDF teklif hazırlamak için:", { links: [{ href: "/urun/hattat-e-arsiv-portal/", label: "Hattat E-Arşiv Portal" }, { href: "/urun/online-teklif/", label: "Online Teklif" }] }]).then(more); }]
        ]);
      });
    };
    var flowSupport = function () {
      return botSay("Teknik destek için bu numaradan bize ulaşabilirsiniz (telefon ve WhatsApp):", 500)
        .then(function () { return botSay([{ links: PHONES.map(function (p) { return { href: "tel:" + p[1], label: p[0] }; }) }], 300); })
        .then(function () { return botSay("Hattat Müşavir kullanıcıları ayrıca programın Destek bölümünden talep oluşturup takip edebilir."); }).then(more);
    };
    var flowCall = function () {
      return botSay("Bizi şu numaradan arayabilir veya WhatsApp'tan yazabilirsiniz:", 500)
        .then(function () { return botSay([{ links: PHONES.map(function (p) { return { href: "tel:" + p[1], label: p[0] }; }) }], 300); }).then(more);
    };
    var flowLead = function () {
      lead = {}; expect = "name";
      return botSay("Memnuniyetle! Size dönüş yapabilmemiz için birkaç bilgi alalım. Adınızı ve soyadınızı yazar mısınız?");
    };
    var askPhone = function () { expect = "phone"; return botSay("Teşekkürler " + lead.name.split(" ")[0] + ". Size ulaşabileceğimiz telefon numaranız nedir?"); };
    var askProduct = function () {
      expect = null;
      return botSay("Hangi ürünle ilgileniyorsunuz?").then(function () {
        setReplies(PRODUCTS.concat(["Henüz karar vermedim"]).map(function (p) {
          return [p, function () { lead.product = p; return botSay("Teşekkürler! " + lead.name + " adına, " + lead.phone + " numarası için \"" + p + "\" talebinizi not ettik. Ekibimiz en kısa sürede sizinle iletişime geçecek.", 800).then(more); }];
        }));
      });
    };

    var handleText = function (text) {
      if (expect === "name") { lead.name = text; return askPhone(); }
      if (expect === "phone") {
        if (text.replace(/\D/g, "").length < 10) return botSay("Telefon numarasını başında 0 ile, 10-11 haneli olarak yazabilir misiniz?");
        lead.phone = text; return askProduct();
      }
      return botSay("Mesajınız için teşekkürler. Sizi doğru yönlendirebilmemiz için aşağıdan bir konu seçebilirsiniz.").then(menu);
    };

    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim(); if (!v || busy) return;
      input.value = ""; userSay(v); clearReplies(); run(function () { return handleText(v); });
    });

    var setChatOpen = function (open) {
      chat.classList.toggle("is-open", open);
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", String(open));
      if (open) {
        if (!started) { started = true; run(flowStart); }
        setTimeout(function () { input.focus(); }, 50);
      } else { launcher.focus(); }
    };
    launcher.addEventListener("click", function () { setChatOpen(panel.hidden); });
    chat.querySelector("[data-chat-close]").addEventListener("click", function () { setChatOpen(false); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") setChatOpen(false); });
  }
})();

/* ---------- Yukarı çık: biraz aşağı kaydırınca solda belirir ---------- */
(function () {
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "to-top"; btn.setAttribute("aria-label", "Sayfanın başına dön"); btn.tabIndex = -1; btn.setAttribute("aria-hidden", "true");
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ticking = false, shown = false;
  var update = function () {
    ticking = false;
    var root = document.documentElement;
    var show = window.pageYOffset > 480 && root.scrollHeight > window.innerHeight * 1.5;
    if (show === shown) return;
    shown = show;
    btn.classList.toggle("is-on", shown);
    btn.tabIndex = shown ? 0 : -1;
    btn.setAttribute("aria-hidden", String(!shown));
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
  update();
})();

/* ---------- Çerez bildirimi ----------
   Seçim yalnız bu tarayıcıda (localStorage) saklanır. Zorunlu olmayan çerezler (analiz, pazarlama) eklenecekse
   window.hattatCerez.durum() === "kabul" olmadan yüklenmemeli; seçim değişince "hattat:cerez" olayı yayınlanır. */
(function () {
  "use strict";
  var KEY = "hattat-cerez", root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var read = function () { try { var v = JSON.parse(localStorage.getItem(KEY)); return v && v.durum ? v : null; } catch (e) { return null; } };
  var write = function (durum) { try { localStorage.setItem(KEY, JSON.stringify({ durum: durum, tarih: new Date().toISOString().slice(0, 10) })); } catch (e) {} };
  window.hattatCerez = { durum: function () { var v = read(); return v ? v.durum : null; } };
  if (read()) return;

  var bar = document.createElement("section");
  bar.className = "cookie"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Çerez bildirimi");
  bar.innerHTML = '<div class="container cookie__in"><p class="cookie__txt"><b>Çerezler</b>Sitemizi çalıştırmak ve deneyiminizi iyileştirmek için çerez kullanıyoruz. Zorunlu olmayan çerezleri siz seçersiniz. <a href="/cerez-politikasi/">Çerez Politikası</a></p>' +
    '<div class="cookie__act"><button class="btn btn--outline" type="button" data-cookie="red">Reddet</button><button class="btn btn--primary" type="button" data-cookie="kabul">Kabul et</button></div></div>';
  document.body.appendChild(bar);

  var fit = function () { root.style.setProperty("--cookie-h", bar.offsetHeight + "px"); };
  fit(); window.addEventListener("resize", fit);
  window.requestAnimationFrame(function () { bar.classList.add("is-in"); fit(); });

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cookie]"); if (!b) return;
    var durum = b.getAttribute("data-cookie"); write(durum);
    window.removeEventListener("resize", fit); root.style.removeProperty("--cookie-h");
    bar.classList.remove("is-in");
    setTimeout(function () { bar.remove(); }, reduce ? 0 : 500);
    document.dispatchEvent(new CustomEvent("hattat:cerez", { detail: { durum: durum } }));
  });
})();
