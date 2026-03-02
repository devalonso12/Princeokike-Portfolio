// Smooth scroll for nav links + subtle parallax for blobs
(function(){
  const siteHeader = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  const closeMobileMenu = () => {
    if(!siteHeader || !navToggle || !mobileMenu) return;
    siteHeader.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  const openMobileMenu = () => {
    if(!siteHeader || !navToggle || !mobileMenu) return;
    siteHeader.classList.add('menu-open');
    navToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
  };

  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const isOpen = siteHeader && siteHeader.classList.contains('menu-open');
      if(isOpen) closeMobileMenu();
      else openMobileMenu();
    });
  }

  // smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if(href.length > 1 && document.querySelector(href)){
        e.preventDefault();
        document.querySelector(href).scrollIntoView({behavior: 'smooth', block: 'start'});
        if(window.innerWidth <= 900) closeMobileMenu();
      }
    });
  });

  document.addEventListener('click', e=>{
    if(!siteHeader || !siteHeader.classList.contains('menu-open')) return;
    if(navToggle && navToggle.contains(e.target)) return;
    if(mobileMenu && mobileMenu.contains(e.target)) return;
    closeMobileMenu();
  });

  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape') closeMobileMenu();
  });

  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 900) closeMobileMenu();
  });

  // parallax blobs
  const b1 = document.querySelector('.b1');
  const b2 = document.querySelector('.b2');
  const b3 = document.querySelector('.b3');
  window.addEventListener('mousemove', e=>{
    const x = (e.clientX / window.innerWidth - 0.5) * 30; // range -15..15
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    if(b1) b1.style.transform = `translate3d(${x*0.6}px, ${y*0.4}px, 0) scale(1.02)`;
    if(b2) b2.style.transform = `translate3d(${x*-0.7}px, ${y*0.5}px, 0) scale(1.01)`;
    if(b3) b3.style.transform = `translate3d(${x*0.3}px, ${y*-0.6}px, 0) scale(1.03)`;
  });

  // rotating hero role text (one by one)
  const roleEl = document.querySelector('.role-rotator');
  const roles = [
    'Full-Stack Developer',
    'Programmer',
    'Software Developer',
    'Cybersecurity Specialist',
    'Photographer'
  ];

  if(roleEl && roles.length){
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const current = roles[roleIndex];

      if(!deleting){
        charIndex += 1;
        roleEl.textContent = current.slice(0, charIndex);
        if(charIndex === current.length){
          deleting = true;
          setTimeout(tick, 1200);
          return;
        }
        setTimeout(tick, 75);
        return;
      }

      charIndex -= 1;
      roleEl.textContent = current.slice(0, charIndex);
      if(charIndex === 0){
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, 250);
        return;
      }
      setTimeout(tick, 40);
    };

    tick();
  }

  // reveal sections/cards on scroll
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const sectionRevealEls = Array.from(document.querySelectorAll('.hero, .panel')).filter(el=>{
    if(!isMobile) return true;
    // On mobile, keep the projects section itself visible and animate cards individually.
    return !el.querySelector('.projects-grid');
  });
  const cardRevealEls = isMobile ? Array.from(document.querySelectorAll('.project-card')) : [];
  const cardRevealSet = new Set(cardRevealEls);
  const revealEls = Array.from(new Set([...sectionRevealEls, ...cardRevealEls]));

  const isPartiallyInView = el => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.95 && rect.bottom > vh * 0.05;
  };

  if(revealEls.length){
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    revealEls.forEach(el => {
      el.classList.add('reveal-on-scroll');
      if(cardRevealSet.has(el)) el.classList.add('reveal-mild');
    });

    if(prefersReducedMotion || typeof window.IntersectionObserver !== 'function'){
      revealEls.forEach(el => el.classList.add('is-visible'));
    }else{
      const revealObserver = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
          }else{
            entry.target.classList.remove('is-visible');
          }
        });
      }, {
        threshold:isMobile ? 0.08 : 0.18,
        rootMargin:isMobile ? '0px 0px -4% 0px' : '0px 0px -8% 0px'
      });

      revealEls.forEach(el=>{
        if(isPartiallyInView(el)) el.classList.add('is-visible');
        revealObserver.observe(el);
      });
    }
  }

  // auto-update footer year
  const currentYearEl = document.querySelector('[data-current-year]');
  if(currentYearEl){
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  // submit contact form to Web3Forms
  const form = document.querySelector('.contact-form');
  if(form){
    if(typeof window.fetch !== 'function' || typeof window.FormData !== 'function') return;

    const btn = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');

    form.addEventListener('submit', async e=>{
      e.preventDefault();
      if(!btn) return;

      const defaultLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      if(status){
        status.textContent = '';
        status.classList.remove('is-success', 'is-error');
      }

      try{
        const formData = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json'
          }
        });

        const data = await res.json();
        if(!res.ok || !data.success){
          throw new Error(data.message || 'Unable to send message right now.');
        }

        form.reset();
        if(status){
          status.textContent = 'Message sent successfully.';
          status.classList.add('is-success');
        }
      }catch(err){
        if(status){
          status.textContent = err.message || 'Submission failed. Please try again.';
          status.classList.add('is-error');
        }
      }finally{
        btn.disabled = false;
        btn.textContent = defaultLabel;
      }
    });
  }
})();
