/* Muras — interactions. No libraries. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── Top bar turns solid after the hero ───────── */
  const topbar = $('.topbar'), hero = $('.hero');
  new IntersectionObserver(([e]) => topbar.classList.toggle('solid', !e.isIntersecting), { threshold: 0.12 }).observe(hero);

  /* ───────── Mountain parallax ───────── */
  const ridges = $$('.land .ridge');
  if (!reduced) {
    addEventListener('scroll', () => {
      const y = scrollY;
      if (y > innerHeight) return;
      ridges.forEach((r, i) => r.style.transform = `translateY(${y * (0.05 + i * 0.07)}px)`);
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

  /* ───────── Komuz strings pluck when seen or hovered ───────── */
  const strings = $('.strings');
  const pluck = () => { strings.classList.remove('play'); void strings.offsetWidth; strings.classList.add('play'); };
  new IntersectionObserver(([e]) => e.isIntersecting && pluck(), { threshold: 0.6 }).observe(strings);
  strings.addEventListener('pointerenter', pluck);

  // Hide the player until media/komuz.mp3 has actually been added.
  const audio = $('#komuz audio');
  if (audio) fetch(audio.getAttribute('src'), { method: 'HEAD' })
    .then(r => { if (!r.ok) audio.remove(); })
    .catch(() => audio.remove());

  /* ───────── At the table: who gets which part (from my own account) ───────── */
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
})();
