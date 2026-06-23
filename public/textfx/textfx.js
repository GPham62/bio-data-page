/* ============================================================
   Text FX — drop-in per-character text animation engine
   ------------------------------------------------------------
   Usage (vanilla):
     <link rel="stylesheet" href="textfx.css">
     <script src="textfx.js"></script>
     <h1 class="textfx">[wave]Hello[/] [fire]world[/]</h1>
     // auto-inits on DOMContentLoaded. Manual: TextFX.init()

   Tags use square brackets so they're safe inside real HTML
   markup. Angle brackets (<wave>...</>) are also accepted for
   plain-text contexts (e.g. an editor). Close with [/] (last)
   or [/name] (specific). Stack tags freely.

   Per-tag arguments:   [wave a=1.4 f=0.8 w=1.2]...[/]
     a = intensity/amplitude   f = speed   w = per-char wavelength
     (fade adds: min=0.2 ; rainb adds: s=92 l=66)

   Global theme:  TextFX.configure({ speed: 1, amp: 0.16 })
   ============================================================ */
(function (global) {
  'use strict';

  var theme = { speed: 1, amp: 0.16, autoDetect: true, particles: true };

  var BEHAVIORS = ['wave','bounce','shake','wiggle','swing','pend','dangle',
                   'slide','rot','pulse','wobble','fade','rainb'];
  var ELEMENTAL = { fire:1, smoke:1, metal:1, wind:1, ice:1, electric:1 };
  var TRIGGER = /\b(fire|smoke|metal|wind|ice|electric)\b/gi;
  var ALIAS = { rainbow:'rainb', pendulum:'pend', rotate:'rot', spin:'rot',
                incr:'pulse', size:'pulse', wob:'wobble' };
  function norm(n){ n = n.toLowerCase(); return ALIAS[n] || n; }

  var instances = [];        // every mounted instance (for API/destroy)
  var active = [];           // instances currently animating (drive the rAF loop)
  var reduced = global.matchMedia &&
                global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- intensity envelope (gain 0→1) ---- */
  // IN_MS/OUT_MS drive hover-mode in/out blends; the reveal/hover "pop" uses
  // per-instance durations (data-tfx-pop="in,hold,out") with these as defaults.
  var IN_MS = 200, OUT_MS = 360, POP_IN = 120, POP_HOLD = 180, POP_OUT = 300;
  function easeInSine(x){ return 1 - Math.cos((x * Math.PI) / 2); }
  function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }
  function clamp01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }

  /* ---------------- parsing ---------------- */
  // detect a tag token at position i; supports [name a=1] / [/] / <name> / </>
  function readTag(s, i){
    var open = s[i];
    if (open !== '[' && open !== '<') return null;
    var close = open === '[' ? ']' : '>';
    var end = s.indexOf(close, i);
    if (end < 0) return null;
    var inner = s.slice(i + 1, end).trim();
    if (inner === '/' ) return { closing:true, name:null, len:end + 1 - i };
    var m = inner.match(/^(\/?)([a-z][a-z0-9]*)((?:\s+[a-z][a-z0-9]*=-?\d*\.?\d+)*)\s*$/i);
    if (!m) return null;
    var name = norm(m[2]);
    var spec = { n:name };
    if (m[3]) m[3].trim().split(/\s+/).forEach(function(kv){
      var p = kv.split('='); spec[p[0].toLowerCase()] = parseFloat(p[1]);
    });
    return { closing: m[1] === '/', name:name, spec:spec, len:end + 1 - i };
  }

  // strip all control tags, returning the plain visible text (reduced-motion path)
  function stripTags(src){
    var out = '', i = 0;
    while (i < src.length){
      var tag = readTag(src, i);
      if (tag){ i += tag.len; continue; }
      out += src[i++];
    }
    return out;
  }

  // build per-character DOM from tag-annotated source
  function build(src){
    var stack = [], frag = document.createDocumentFragment();
    var word = null, gi = 0, chars = [], fxChars = [];
    var pending = [];           // char records for elemental keyword scan
    var vis = '';

    function flushWord(){ if (word){ frag.appendChild(word); word = null; } }

    var i = 0;
    while (i < src.length){
      var tag = readTag(src, i);
      if (tag){
        if (tag.closing){
          if (tag.name){ var k = -1;
            for (var j = stack.length - 1; j >= 0; j--) if (stack[j].n === tag.name){ k = j; break; }
            if (k >= 0) stack.splice(k, 1); else stack.pop();
          } else stack.pop();
        } else stack.push(tag.spec);
        i += tag.len; continue;
      }
      var ch = src[i++];
      if (ch === '\n'){ flushWord(); frag.appendChild(document.createElement('br')); vis += '\n'; continue; }
      if (ch === ' '){ flushWord(); frag.appendChild(document.createTextNode(' ')); vis += ' '; continue; }
      var span = document.createElement('span');
      span.className = 'tfx-char';
      span.textContent = ch;
      span.__fx = stack.slice();
      span.__i = gi++;
      if (!word){ word = document.createElement('span'); word.className = 'tfx-word'; }
      word.appendChild(span);
      chars.push(span);
      pending.push(span);
      vis += ch;
    }
    flushWord();

    // auto-detect elemental keywords in the visible text
    if (theme.autoDetect){
      TRIGGER.lastIndex = 0; var mm;
      while ((mm = TRIGGER.exec(vis)) !== null){
        var nm = mm[0].toLowerCase();
        for (var p = mm.index; p < mm.index + mm[0].length; p++){
          var sp = pending[p];
          if (sp && !sp.__fx.some(function(f){ return f.n === nm; })) sp.__fx.push({ n:nm });
        }
      }
    }

    // tag elemental cells: add glow class + collect for particles
    chars.forEach(function(sp){
      var elem = sp.__fx.filter(function(f){ return ELEMENTAL[f.n]; });
      if (elem.length){
        sp.__elem = elem;
        elem.forEach(function(f){ sp.classList.add('tfx-' + f.n); });
        fxChars.push(sp);
      }
    });

    return { frag:frag, chars:chars, fxChars:fxChars };
  }

  /* ---------------- instance ---------------- */
  function Instance(el, src){
    this.el = el;
    this.src = src != null ? src : (el.getAttribute('data-textfx') || el.textContent);
    this.fs = 16;
    // trigger mode: always | hover | reveal  (default keeps text live)
    this.mode = (el.getAttribute('data-tfx-mode') || 'always').toLowerCase();
    if (['always','hover','reveal'].indexOf(this.mode) < 0) this.mode = 'always';
    // per-effect pop envelope: ease-in, hold-at-full, ease-out (ms)
    var pop = (el.getAttribute('data-tfx-pop') || '').split(',');
    this.popIn   = parseFloat(pop[0]) || POP_IN;
    this.popHold = isNaN(parseFloat(pop[1])) ? POP_HOLD : parseFloat(pop[1]);
    this.popOut  = parseFloat(pop[2]) || POP_OUT;
    this.curHold = this.popHold;        // active hold for the current pop (hover trims it)
    this.gain = 0;
    this.phase = 'idle';     // idle | in | hold | out | pop
    this.t0 = 0;
    this.g0 = 0;             // gain captured at the start of an in/out blend
    this.observer = null;
    this._onEnter = this._onLeave = null;
    this.render();
    this.setup();
  }
  Instance.prototype.render = function(){
    var built = build(this.src);
    this.el.textContent = '';
    this.el.appendChild(built.frag);
    this.el.setAttribute('data-tfx-ready', '');
    this.chars = built.chars;
    this.fxChars = built.fxChars;
    this.measure();
  };
  // wire the trigger for this instance's mode
  Instance.prototype.setup = function(){
    var self = this;
    if (this.mode === 'always'){
      this.phase = 'hold'; this.gain = 1;
      this.el.setAttribute('data-tfx-on', '');
      this.el.style.setProperty('--tfx-gain', '1');
      activate(this);                       // permanently animating
    } else if (this.mode === 'hover'){
      this._onEnter = function(){ self.trigger('in'); };
      this._onLeave = function(){ self.trigger('out'); };
      this.el.addEventListener('pointerenter', this._onEnter);
      this.el.addEventListener('pointerleave', this._onLeave);
    } else if (this.mode === 'reveal'){
      // one-shot pop the first time it scrolls into view (visible in BOTH axes,
      // so it only fires once the user can actually see it), then a fresh
      // one-shot pop on every hover.
      this._onEnter = function(){ self.pop(true); };       // hover: trimmed hold
      this.el.addEventListener('pointerenter', this._onEnter);
      if ('IntersectionObserver' in global){
        this.observer = new IntersectionObserver(function(entries){
          if (entries[0].isIntersecting){
            self.observer.disconnect(); self.observer = null;   // reveal is one-shot
            self.pop(false);                                    // first view: full hold
          }
        }, { threshold: 0.4 });
        this.observer.observe(this.el);
      } else { this.pop(false); }
    }
  };
  // begin an envelope phase ('in' on hover-enter, 'out' on leave, 'pop' on reveal)
  Instance.prototype.trigger = function(kind){
    this.t0 = performance.now();
    this.g0 = this.gain;
    if (kind === 'out'){ this.phase = 'out'; }
    else if (kind === 'pop'){ this.phase = 'pop'; }
    else { this.phase = 'in'; }
    this.el.setAttribute('data-tfx-on', '');
    activate(this);
  };
  // one-shot reveal/hover pop: ease-in → hold-at-full → ease-out, then settle.
  Instance.prototype.pop = function(hover){
    this.t0 = performance.now();
    // hover replays are snappier: no hold for motion/colour, a short puff for particles
    this.curHold = hover ? (this.fxChars.length ? 150 : 0) : this.popHold;
    this.phase = 'pop';
    this.el.setAttribute('data-tfx-on', '');
    activate(this);
  };
  Instance.prototype.measure = function(){
    this.fs = parseFloat(getComputedStyle(this.el).fontSize) || 16;
  };
  // reset every char to rest — visually identical to plain text, zero idle cost
  Instance.prototype.rest = function(){
    for (var i = 0; i < this.chars.length; i++){
      var s = this.chars[i].style;
      s.transform = ''; s.transformOrigin = ''; s.opacity = ''; s.color = '';
    }
    this.el.removeAttribute('data-tfx-on');
    this.el.style.removeProperty('--tfx-gain');
  };
  Instance.prototype.destroy = function(){
    var k = instances.indexOf(this);
    if (k >= 0) instances.splice(k, 1);
    deactivate(this);
    if (this.observer){ this.observer.disconnect(); this.observer = null; }
    if (this._onEnter){ this.el.removeEventListener('pointerenter', this._onEnter); }
    if (this._onLeave){ this.el.removeEventListener('pointerleave', this._onLeave); }
    this.el.removeAttribute('data-tfx-ready');
    this.el.removeAttribute('data-tfx-on');
    this.el.style.removeProperty('--tfx-gain');
    this.el.textContent = this.src;
  };

  /* ---- active-set management (drives whether the loop runs) ---- */
  function activate(inst){
    if (active.indexOf(inst) < 0) active.push(inst);
    if (inst.fxChars.length && theme.particles && !reduced) ensureCanvas();
    ensureLoop();
  }
  function deactivate(inst){
    var k = active.indexOf(inst);
    if (k >= 0) active.splice(k, 1);
  }
  // advance every active instance's gain; settle/unmount those that reach rest
  function tickGain(now){
    for (var i = active.length - 1; i >= 0; i--){
      var inst = active[i], ph = inst.phase, e = now - inst.t0;
      if (ph === 'hold'){ inst.gain = 1; }
      else if (ph === 'in'){
        var p = clamp01(e / IN_MS);
        inst.gain = inst.g0 + (1 - inst.g0) * easeInSine(p);
        if (p >= 1){ inst.gain = 1; inst.phase = 'hold'; }
      }
      else if (ph === 'out'){
        var po = clamp01(e / OUT_MS);
        inst.gain = inst.g0 * (1 - easeOutCubic(po));
        if (po >= 1){ inst.gain = 0; inst.phase = 'idle'; inst.rest(); deactivate(inst); continue; }
      }
      else if (ph === 'pop'){
        var pin = inst.popIn, phd = inst.curHold, pout = inst.popOut;
        if (e < pin) inst.gain = easeInSine(e / pin);
        else if (e < pin + phd) inst.gain = 1;                       // hold at full
        else if (e < pin + phd + pout) inst.gain = 1 - easeOutCubic((e - pin - phd) / pout);
        else { inst.gain = 0; inst.phase = 'idle'; inst.rest(); deactivate(inst); continue; }
      }
      if (inst.mode !== 'always') inst.el.style.setProperty('--tfx-gain', inst.gain.toFixed(3));
    }
  }

  /* ---------------- per-character motion ---------------- */
  function applyFx(spec, t, i, a, amp, g){
    var n = spec.n,
        F = (spec.f || 1) * theme.speed,
        W = (spec.w || 1),
        A = (spec.a || 1),
        D = amp * A;
    switch (n){
      case 'wave':   a.ty += Math.sin(t*5*F + i*0.45*W) * D; break;
      case 'bounce': a.ty += -Math.abs(Math.sin(t*4*F + i*0.4*W)) * D * 1.5; break;
      case 'shake':  a.tx += (Math.random()-0.5)*D*0.6; a.ty += (Math.random()-0.5)*D*0.6; break;
      case 'wiggle': a.tx += Math.sin(t*3.1*F + i*1.3*W)*D*0.45; a.ty += Math.cos(t*2.7*F + i*1.1*W)*D*0.45; break;
      case 'swing':  a.rot += Math.sin(t*4*F + i*0.3*W)*14*A; break;
      case 'pend':   a.rot += Math.sin(t*3*F + i*0.2*W)*16*A; a.origin = 'top'; break;
      case 'dangle': a.rot += Math.sin(t*2.4*F + i*0.6*W)*20*A; a.origin = 'top'; break;
      case 'slide':  a.tx += Math.sin(t*4*F + i*0.3*W)*D*0.8; break;
      case 'rot':    a.rot += (t*140*F + i*25*W) % 360; break;
      case 'pulse':  a.scale *= 1 + Math.sin(t*5*F + i*0.4*W)*0.22*A; break;
      case 'wobble': a.rot += Math.sin(t*7*F + i*W)*9*A; a.scale *= 1 + Math.sin(t*5*F + i*W)*0.08; break;
      case 'fade':   a.opacity = (spec.min!=null?spec.min:0.22) + (1-(spec.min!=null?spec.min:0.22))*(0.5+0.5*Math.sin(t*4*F + i*0.5*W)); break;
      case 'rainb':  var hu = spec.c!=null ? spec.c + Math.sin(t*1.2*F + i*0.5*W)*(spec.r!=null?spec.r:40)   // banded around c (on-brand)
                                           : (t*110*F + i*22*W) % 360;                                       // full spectrum (default)
                     a.color = 'hsl(' + hu + ',' + ((spec.s!=null?spec.s:92) * g).toFixed(1) + '%,' + (spec.l!=null?spec.l:66) + '%)'; break;
      /* elemental motion accents (glow = CSS, particles = canvas) */
      case 'fire':   a.scale *= 1 + Math.sin(t*22*F + i*1.7)*0.05; a.ty += Math.sin(t*13*F + i)*amp*0.07; break;
      case 'wind':   a.tx += Math.sin(t*6*F + i*0.5)*amp*0.5; a.rot += Math.sin(t*5*F + i*0.3)*4; break;
      case 'electric': a.tx += (Math.random()-0.5)*1.6; a.ty += (Math.random()-0.5)*1.6; break;
      case 'smoke':  a.ty += Math.sin(t*2*F + i*0.6)*amp*0.12; break;
    }
  }

  function tickMotion(t){
    for (var n = 0; n < active.length; n++){
      var inst = active[n], amp = inst.fs * theme.amp, cs = inst.chars, g = inst.gain;
      for (var c = 0; c < cs.length; c++){
        var el = cs[c], fx = el.__fx;
        if (!fx.length) continue;
        var a = { tx:0, ty:0, rot:0, scale:1, origin:null, color:null, opacity:null };
        for (var f = 0; f < fx.length; f++) applyFx(fx[f], t, el.__i, a, amp, g);
        // gain scales every deviation from rest
        el.style.transform = 'translate(' + (a.tx*g).toFixed(2) + 'px,' + (a.ty*g).toFixed(2) +
                             'px) rotate(' + (a.rot*g).toFixed(2) + 'deg) scale(' + (1+(a.scale-1)*g).toFixed(3) + ')';
        el.style.transformOrigin = a.origin === 'top' ? '50% 0%' : '50% 50%';
        el.style.opacity = a.opacity == null ? '' : (1+(a.opacity-1)*g).toFixed(2);
        el.style.color = a.color || '';
      }
    }
  }

  /* ---------------- particle system ---------------- */
  var canvas = null, cx = null, W = 0, H = 0, dpr = 1, P = [];
  var MAX = 2000, rnd = function(a, b){ return a + Math.random()*(b - a); };

  function ensureCanvas(){
    if (canvas) return;
    // single layer over the page — fire/smoke on an opaque card were invisible
    // on a back canvas, so every element renders here (ponytail: one canvas).
    canvas = document.createElement('canvas');
    canvas.className = 'tfx-canvas';
    document.body.appendChild(canvas);
    cx = canvas.getContext('2d');
    sizeCanvas();
    global.addEventListener('resize', function(){
      sizeCanvas();
      for (var i = 0; i < instances.length; i++) instances[i].measure();
    });
  }
  function sizeCanvas(){
    dpr = Math.min(global.devicePixelRatio || 1, 2);
    W = global.innerWidth; H = global.innerHeight;
    if (!canvas) return;
    canvas.width = W*dpr; canvas.height = H*dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function emit(type, r, mul){
    var w = r.width, n;
    switch (type){
      case 'fire':
        n = Math.min(4, Math.max(1, w*0.06)) * mul;
        for (var i=0;i<n;i++) P.length<MAX && P.push({ type:type, x:r.left+Math.random()*w, y:r.bottom-rnd(0,r.height*0.4),
          vx:rnd(-0.4,0.4), vy:rnd(-2.6,-1.1), life:rnd(18,34), max:34, size:rnd(3,8), hue:rnd(18,46) });
        break;
      case 'smoke':
        if (Math.random()<0.3*mul) P.length<MAX && P.push({ type:type, x:r.left+Math.random()*w, y:r.top+rnd(-2,6),
          vx:rnd(-0.2,0.5), vy:rnd(-0.9,-0.35), life:rnd(34,60), max:60, size:rnd(6,14) });
        break;
      case 'metal':
        if (Math.random()<0.22*mul) { var edgeTop = Math.random()<0.5;
          P.length<MAX && P.push({ type:type, x:r.left+Math.random()*w, y:(edgeTop?r.top:r.bottom)+rnd(-3,3),
            vx:0, vy:0, life:rnd(9,18), max:18, size:rnd(1,2.2) }); }
        break;
      case 'wind':
        n = Math.min(2, Math.max(1, w*0.02));
        for (var j=0;j<n;j++){ if (Math.random()<0.5) continue; var sp=rnd(4,9);
          P.length<MAX && P.push({ type:type, x:r.left-rnd(8,46), y:r.top+Math.random()*r.height, vx:sp, vy:rnd(-0.3,0.3), life:rnd(24,44), max:44, size:sp }); }
        break;
      case 'ice':
        if (Math.random()<0.45*mul) P.length<MAX && P.push({ type:type, x:r.left+Math.random()*w, y:r.bottom-rnd(0,4),
          vx:rnd(-0.4,0.4), vy:rnd(0.5,1.6), life:rnd(30,54), max:54, size:rnd(1.4,3.2) });
        break;
      case 'electric':
        if (Math.random()<0.4*mul){ var ex=r.left+Math.random()*w, ey=r.top+Math.random()*r.height;
          P.length<MAX && P.push({ type:type, x:ex, y:ey, life:rnd(5,13), max:13, size:rnd(2,5), x2:ex+rnd(-14,14), y2:ey+rnd(-14,14) }); }
        break;
    }
  }
  function tickParticles(){
    if (!canvas) return;
    cx.clearRect(0, 0, W, H);
    for (var n = 0; n < active.length; n++){
      var inst = active[n], g = inst.gain, fxC = inst.fxChars;
      if (g < 0.04) continue;                 // no emission until the effect ramps in
      for (var c = 0; c < fxC.length; c++){
        var el = fxC[c], r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        for (var e = 0; e < el.__elem.length; e++) emit(el.__elem[e].n, r, (el.__elem[e].a || 1) * g);
      }
    }
    for (var i = P.length - 1; i >= 0; i--){
      var p = P[i]; p.life--;
      if (p.life <= 0){ P.splice(i, 1); continue; }
      var a = p.life / p.max;
      switch (p.type){
        case 'fire':
          p.x+=p.vx; p.y+=p.vy; p.vy+=0.012; p.vx*=0.99;
          cx.globalCompositeOperation='lighter';
          cx.fillStyle='hsla('+p.hue+',100%,'+(48+a*22)+'%,'+(a*0.85)+')';
          cx.beginPath(); cx.arc(p.x,p.y,p.size*a,0,6.283); cx.fill(); break;
        case 'smoke':
          p.x+=p.vx; p.y+=p.vy; p.size+=0.22; p.vx+=0.004;
          cx.globalCompositeOperation='source-over';
          cx.fillStyle='rgba(155,155,165,'+(a*0.16)+')';
          cx.beginPath(); cx.arc(p.x,p.y,p.size,0,6.283); cx.fill(); break;
        case 'metal':
          cx.globalCompositeOperation='lighter';
          var tw=Math.sin((1-a)*Math.PI);
          cx.fillStyle='rgba(255,255,255,'+(tw*0.7)+')';
          cx.beginPath(); cx.arc(p.x,p.y,p.size*tw,0,6.283); cx.fill();
          cx.strokeStyle='rgba(255,255,255,'+(tw*0.45)+')'; cx.lineWidth=0.7;
          cx.beginPath();
          cx.moveTo(p.x-p.size*2*tw,p.y); cx.lineTo(p.x+p.size*2*tw,p.y);
          cx.moveTo(p.x,p.y-p.size*2*tw); cx.lineTo(p.x,p.y+p.size*2*tw); cx.stroke(); break;
        case 'wind':
          p.x+=p.vx; p.y+=p.vy; p.vx*=0.985;
          cx.globalCompositeOperation='lighter';
          cx.strokeStyle='rgba(200,222,255,'+(a*0.5)+')'; cx.lineWidth=1.2;
          cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(p.x-p.size*3,p.y); cx.stroke(); break;
        case 'ice':
          p.x+=p.vx; p.y+=p.vy; p.vy+=0.006;
          cx.globalCompositeOperation='source-over';
          cx.fillStyle='rgba(196,236,255,'+(a*0.9)+')';
          cx.beginPath(); cx.arc(p.x,p.y,p.size,0,6.283); cx.fill(); break;
        case 'electric':
          cx.globalCompositeOperation='lighter';
          cx.strokeStyle='rgba(150,245,255,'+a+')'; cx.lineWidth=rnd(0.8,2);
          var mx=(p.x+p.x2)/2+rnd(-5,5), my=(p.y+p.y2)/2+rnd(-5,5);
          cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(mx,my); cx.lineTo(p.x2,p.y2); cx.stroke();
          cx.fillStyle='rgba(220,252,255,'+a+')';
          cx.beginPath(); cx.arc(p.x,p.y,p.size*0.4,0,6.283); cx.fill(); break;
      }
    }
    cx.globalCompositeOperation='source-over';
  }

  /* ---------------- loop ---------------- */
  var running = false;
  function loop(){
    // keep running while anything animates OR particles are still draining
    if (!active.length && !P.length){ running = false; return; }
    var now = performance.now();
    tickGain(now);
    tickMotion(now / 1000);
    if (theme.particles) tickParticles();
    requestAnimationFrame(loop);
  }
  function ensureLoop(){
    if (!running && (active.length || P.length)){ running = true; requestAnimationFrame(loop); }
  }

  /* ---------------- public API ---------------- */
  function mount(el, src){
    if (el.__tfx) el.__tfx.destroy();
    var source = src != null ? src : (el.getAttribute('data-textfx') || el.textContent);
    // reduced motion: render plain visible text, no engine, no particles
    if (reduced){ el.textContent = stripTags(source); el.setAttribute('data-tfx-ready',''); return null; }
    var inst = new Instance(el, src);
    el.__tfx = inst;
    instances.push(inst);
    return inst;
  }
  function init(selector){
    var sel = selector || '.textfx,[data-textfx]';
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) if (!nodes[i].__tfx) mount(nodes[i]);
    return instances;
  }
  function configure(opts){ for (var k in opts) theme[k] = opts[k]; ensureLoop(); return theme; }
  function refresh(){ for (var i = 0; i < instances.length; i++) instances[i].measure(); }
  function destroy(el){ if (el && el.__tfx){ el.__tfx.destroy(); el.__tfx = null; } }

  var TextFX = {
    init: init, mount: mount, configure: configure, refresh: refresh,
    destroy: destroy, theme: theme,
    behaviors: BEHAVIORS, elemental: Object.keys(ELEMENTAL),
    get reduced(){ return reduced; }, set reduced(v){ reduced = v; }
  };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function(){ init(); });
  else init();

  global.TextFX = TextFX;
  if (typeof module !== 'undefined' && module.exports) module.exports = TextFX;
})(typeof window !== 'undefined' ? window : this);
