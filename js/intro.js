/*!
 * RW Capital y Estrategia — Logo Formation Intro
 * One-time per session. Zero loops after finish. Zero libraries.
 */
!function () {
  'use strict';

  /* ── 1. Guard: already played this session ── */
  try { if (sessionStorage.getItem('rw_intro')) return; } catch (_) { return; }

  /* ── 2. Respect prefers-reduced-motion ── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try { sessionStorage.setItem('rw_intro', '1'); } catch (_) {}
    return;
  }

  /* ── Tiny helpers ── */
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function lerp(a, b, t)  { return a + (b - a) * t; }
  function clamp(t)       { return t < 0 ? 0 : t > 1 ? 1 : t; }

  /* ── Main ── */
  function run() {
    var logoEl = document.querySelector('.nav__logo img');
    if (!logoEl || !logoEl.complete) {
      /* logo image not yet loaded — wait for it */
      if (logoEl) logoEl.addEventListener('load', run, { once: true });
      return;
    }

    /* Preserve layout space while hiding the real PNG */
    logoEl.style.visibility = 'hidden';

    var DPR    = Math.min(window.devicePixelRatio || 1, 2);
    var VW     = window.innerWidth;
    var VH     = window.innerHeight;
    var mobile = VW < 768;

    /* ── Canvas overlay (full viewport, non-interactive) ── */
    var cvs = document.createElement('canvas');
    cvs.width  = VW * DPR;
    cvs.height = VH * DPR;
    cvs.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:'  + VW + 'px', 'height:' + VH + 'px',
      'pointer-events:none', 'z-index:99999', 'will-change:contents'
    ].join(';');
    document.body.appendChild(cvs);
    var ctx = cvs.getContext('2d');
    ctx.scale(DPR, DPR);

    /* ── Sample logo pixels → build target list ── */
    var sampler   = new Image();
    sampler.onload = function () {
      var rect = logoEl.getBoundingClientRect();
      if (rect.width < 1) { abort(); return; }

      var LW = Math.ceil(rect.width);
      var LH = Math.ceil(rect.height);

      /* Offscreen canvas to read pixel data */
      var oc  = document.createElement('canvas');
      oc.width = LW; oc.height = LH;
      var ot  = oc.getContext('2d');
      ot.drawImage(sampler, 0, 0, LW, LH);
      var px  = ot.getImageData(0, 0, LW, LH).data;

      /* Grid sampling — denser on desktop, sparser on mobile */
      var STEP = mobile ? 3 : 2;
      var targets = [];

      for (var y = 0; y < LH; y += STEP) {
        for (var x = 0; x < LW; x += STEP) {
          var i = (y * LW + x) * 4;
          if (px[i + 3] > 80) {               /* non-transparent pixel */
            targets.push({
              tx: rect.left + x,              /* screen X of this logo pixel */
              ty: rect.top  + y,              /* screen Y of this logo pixel */
              r:  px[i],
              g:  px[i + 1],
              b:  px[i + 2]
            });
          }
        }
      }

      if (!targets.length) { abort(); return; }

      /* ── Hero area for scatter start ── */
      var hero = document.querySelector('.hero');
      var SH   = hero ? Math.min(hero.offsetHeight, VH * 0.85) : VH * 0.7;

      /* ── Build particle array ── */
      var P = targets.map(function (t) {
        return {
          sx:  Math.random() * VW,          /* start x — scattered in hero */
          sy:  Math.random() * SH,          /* start y */
          tx:  t.tx,                         /* target x — exact logo pixel */
          ty:  t.ty,                         /* target y */
          r:   t.r, g: t.g, b: t.b,        /* logo color */
          del: Math.random() * 0.28         /* stagger delay 0–28 % of duration */
        };
      });

      /* ── Animation ── */
      var DUR = mobile ? 1050 : 1400;       /* ms */
      var t0  = performance.now();
      var raf;

      function frame(now) {
        var glob = clamp((now - t0) / DUR);  /* 0 → 1, global progress */
        ctx.clearRect(0, 0, VW, VH);

        for (var i = 0; i < P.length; i++) {
          var p  = P[i];

          /* Per-particle progress: delayed start, same end */
          var pt = clamp((glob - p.del) / (1 - p.del + 1e-6));
          var et = easeOutExpo(pt);           /* position progress   */

          /* Current position */
          var cx = lerp(p.sx, p.tx, et);
          var cy = lerp(p.sy, p.ty, et);

          /*
           * Color: starts as a bright ice-blue (visible on dark hero),
           * transitions smoothly to the actual logo color in the second half.
           * This ensures readability against the dark hero background.
           */
          var blend = clamp((et - 0.4) / 0.6);
          var cr = Math.round(lerp(195, p.r, blend)) | 0;
          var cg = Math.round(lerp(220, p.g, blend)) | 0;
          var cb = Math.round(lerp(255, p.b, blend)) | 0;

          /* Opacity: fades in quickly, full by ~50 % of particle journey */
          ctx.globalAlpha = clamp(pt * 2.5);
          ctx.fillStyle   = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
          ctx.fillRect(cx, cy, STEP, STEP);
        }

        if (glob < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          /* Final frame — all particles at exact target positions */
          ctx.clearRect(0, 0, VW, VH);
          ctx.globalAlpha = 1;
          for (var j = 0; j < P.length; j++) {
            var q = P[j];
            ctx.fillStyle = 'rgb(' + q.r + ',' + q.g + ',' + q.b + ')';
            ctx.fillRect(q.tx, q.ty, STEP, STEP);
          }
          finalize();
        }
      }

      raf = requestAnimationFrame(frame);

      /* ── Finish: crossfade canvas → real logo ── */
      function finalize() {
        setTimeout(function () {
          /* Real logo fades in */
          logoEl.style.opacity    = '0';
          logoEl.style.visibility = 'visible';
          logoEl.style.transition = 'opacity 0.4s ease';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              logoEl.style.opacity = '1';
            });
          });

          /* Canvas fades out simultaneously */
          cvs.style.transition = 'opacity 0.4s ease';
          cvs.style.opacity    = '0';

          setTimeout(function () {
            cvs.remove();
            logoEl.style.transition = '';
            try { sessionStorage.setItem('rw_intro', '1'); } catch (_) {}
            /* raf is already done — no loop to cancel */
          }, 450);
        }, 220);   /* brief hold so user sees the fully-formed logo */
      }
    };

    sampler.onerror = abort;
    /* Use currentSrc (responsive images) falling back to src */
    sampler.src = logoEl.currentSrc || logoEl.src;

    function abort() {
      logoEl.style.visibility = 'visible';
      cvs.remove();
      try { sessionStorage.setItem('rw_intro', '1'); } catch (_) {}
    }
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}();
