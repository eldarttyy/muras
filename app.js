/* Muras — interactions. No libraries. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  /* ───────── Intro: my own lines over the valley ───────── */
  const lines = $$('.intro-line');
  let introTimers = [];
  function endIntro() {
    introTimers.forEach(clearTimeout);
    lines.forEach(l => l.classList.remove('on'));
    document.body.classList.remove('is-intro');
    store.set('muras-seen-intro', true);
  }
  if (reduced || store.get('muras-seen-intro', false) || location.hash.length > 1) {
    endIntro();
  } else {
    lines.forEach((l, i) => {
      introTimers.push(setTimeout(() => l.classList.add('on'), 600 + i * 3000));
      introTimers.push(setTimeout(() => l.classList.remove('on'), 600 + i * 3000 + 2000));
    });
    introTimers.push(setTimeout(endIntro, 600 + lines.length * 3000));
  }
  $('.skip-intro').addEventListener('click', endIntro);

  /* ───────── Top bar turns solid after the hero ───────── */
  const topbar = $('.topbar'), hero = $('.hero');
  new IntersectionObserver(([e]) => topbar.classList.toggle('solid', !e.isIntersecting), { threshold: 0.12 }).observe(hero);

  /* ───────── Mountain parallax ───────── */
  const ridges = $$('.land .ridge');
  if (!reduced) {
    addEventListener('scroll', () => {
      const y = scrollY;
      if (y > innerHeight) return;
      ridges.forEach((r, i) => r.style.transform = `translateY(${y * (0.04 + i * 0.05)}px)`);
    }, { passive: true });
  }

  /* ───────── Menu ───────── */
  const menuBtn = $('.menu-btn');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    $('.menu').setAttribute('aria-hidden', !open);
  }
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ───────── Scroll reveals ───────── */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ───────── 2. Sacred cards open on tap ───────── */
  $$('.card').forEach(c => c.addEventListener('click', () => c.classList.toggle('open')));

  /* ───────── 3. A day in Kyrchyn: the sun crosses the sky ───────── */
  const DAY = [
    ['Dawn', 'Morning', 'Wake up in the morning, collect the horses and milk them. After drinking very warm milk, I bring more milk to my aunt.', '#f3b58a', '#f7e3c4'],
    ['Early morning', 'Kymyz', 'Next she would make kymyz out of it. Everything is homemade.', '#9fcbe6', '#f1ead0'],
    ['Morning', 'The sheep', 'Next we would let the sheep go out, to a specific place.', '#7fb9dc', '#d8ecd9'],
    ['Midday', 'The hunt', 'My brother and I would go hunting, usually rabbits, or a deer if we got lucky, and fish.', '#5ea7d6', '#cfe9ef'],
    ['Afternoon', 'The yaks', 'We would go up high to check on our yaks at the top of the mountains. We would just count them and come back, because usually they can defend themselves from the wolves.', '#7fb9dc', '#e6efd4'],
    ['Evening', 'The prayer', 'Then we would come back and eat. We would pray for the food, for nature, for the mountains. And we pray that there is going to be rain, because our animals would die without the grass if there is a drought.', '#e58c5a', '#f4c98a'],
  ];
  const sky = $('.day-sky'), dBody = $('.day-body'), dDots = $('.day-dots');
  let d = 0;
  DAY.forEach(([, t], i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.setAttribute('aria-label', t);
    b.addEventListener('click', () => showDay(i));
    li.appendChild(b); dDots.appendChild(li);
  });
  function showDay(i) {
    d = (i + DAY.length) % DAY.length;
    const [time, title, text, top, bottom] = DAY[d];
    const f = d / (DAY.length - 1);                        // 0..1 across the sky
    const x = 6 + f * 88, y = 92 - Math.sin(f * Math.PI) * 78;
    sky.style.setProperty('--sx', x + '%'); sky.style.setProperty('--sy', y + '%');
    sky.style.setProperty('--sky-top', top); sky.style.setProperty('--sky-bottom', bottom);
    $('.kicker', dBody).textContent = time;
    $('h3', dBody).textContent = title;
    $('p', dBody).textContent = text;
    $$('button', dDots).forEach((b, j) => b.setAttribute('aria-selected', j === d));
    dBody.classList.remove('swap'); void dBody.offsetWidth; dBody.classList.add('swap');
  }
  $('#prevDay').addEventListener('click', () => showDay(d - 1));
  $('#nextDay').addEventListener('click', () => showDay(d + 1));
  showDay(0);

  /* ───────── 4. Wolf eyes appear in the dark ───────── */
  const wolf = $('#wolf');
  new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => wolf.classList.add('seen'), 1500); }, { threshold: 0.4 }).observe(wolf);

  /* ───────── 5. Komuz: pluck a string, hear it, read its story ───────── */
  let actx;
  function pluckSound(freq) {
    // Karplus–Strong: a burst of noise through a short feedback delay sounds like a plucked string.
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const sr = actx.sampleRate, len = Math.round(sr * 1.6), period = Math.round(sr / freq);
      const buf = actx.createBuffer(1, len, sr), out = buf.getChannelData(0);
      const ring = new Float32Array(period).map(() => Math.random() * 2 - 1);
      for (let i = 0; i < len; i++) {
        const j = i % period, next = ring[(j + 1) % period];
        out[i] = ring[j];
        ring[j] = (ring[j] + next) * 0.497;
      }
      const src = actx.createBufferSource(), g = actx.createGain();
      g.gain.value = 0.35;
      src.buffer = buf; src.connect(g).connect(actx.destination); src.start();
    } catch {}
  }
  const NOTES = [196, 262, 220];   // the komuz's three strings, roughly G, C, A
  const strBtns = $$('.strings button'), strArts = $$('.string-text article');
  strBtns.forEach((b, i) => b.addEventListener('click', () => {
    strBtns.forEach(x => x.setAttribute('aria-selected', x === b));
    strArts.forEach((a, j) => a.hidden = i !== j);
    b.classList.remove('play'); void b.offsetWidth; b.classList.add('play');
    pluckSound(NOTES[i]);
  }));

  // Hide the player until media/komuz.mp3 has actually been added.
  const audio = $('#komuz audio');
  if (audio) fetch(audio.getAttribute('src'), { method: 'HEAD' })
    .then(r => { if (!r.ok) audio.remove(); })
    .catch(() => audio.remove());

  /* ───────── 6. At the table: who gets which part (from my own account) ───────── */
  const PORTIONS = [
    ['The elders', 'They sit at the top, and they are given the most respected part of the sheep, horse or cow, dedicated just for them.'],
    ['My father', 'He used to get the rump of the sheep, or the meaty parts like the shoulders or the hips, because he is the eldest son of his family.'],
    ['The youngest boy', 'The head of the sheep is given to the youngest boy in the house where the ceremony is, usually older than twelve. Every father has to teach his son how to cut it. You cut half into small pieces and give them to everybody else, to show respect and effort; the other half you eat.'],
    ['Favourite brother', 'The ears go to your favourite brother, to make sure you do not hurt his feelings, as a sign of respect.'],
    ['Sister-in-law', 'The tongue goes to the favourite sister-in-law.'],
    ['The children', 'As kids we were usually given the legs of the sheep and the cleaned intestines. Later on I got the neck and the ribs.'],
    ['The one who cuts', 'Usually it is done by one of our relatives who is really good at it, and he eventually teaches a few students how to do it.'],
  ];
  const who = $('.who'), pc = $('.portion-card');
  PORTIONS.forEach(([name], i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.textContent = name;
    b.addEventListener('click', () => show(i));
    who.appendChild(b);
  });
  function show(i) {
    $$('button', who).forEach((b, j) => b.setAttribute('aria-selected', i === j));
    $('h3', pc).textContent = PORTIONS[i][0];
    $('p', pc).textContent = PORTIONS[i][1];
    pc.classList.remove('swap'); void pc.offsetWidth; pc.classList.add('swap');
  }
  show(0);

  /* ───────── 7. Then / now ───────── */
  const tnBtns = $$('.then-now button'), tnArts = $$('.tn-body article');
  tnBtns.forEach(b => b.addEventListener('click', () => {
    tnBtns.forEach(x => x.setAttribute('aria-selected', x === b));
    tnArts.forEach(a => a.hidden = a.dataset.t !== b.dataset.t);
  }));
})();
