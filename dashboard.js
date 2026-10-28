/* Navigation and search affect dashboard shortcuts only; original previews stay intact. */
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.dashboard-sidebar');
  const toggle = document.querySelector('.dashboard-mobile-toggle');
  const scrim = document.querySelector('.dashboard-scrim');
  const narrow = window.matchMedia('(max-width: 768px)');
  const setMenu = open => {
    sidebar.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    if (open) sidebar.querySelector('a').focus();
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  scrim.addEventListener('click', () => {setMenu(false); toggle.focus();});
  sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  narrow.addEventListener('change', () => setMenu(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {setMenu(false);toggle.focus();}
    if (event.key === 'Tab' && narrow.matches && toggle.getAttribute('aria-expanded') === 'true') {
      const links = [...sidebar.querySelectorAll('a')];
      if (!event.shiftKey && document.activeElement === links.at(-1)) {event.preventDefault();toggle.focus();}
      else if (event.shiftKey && document.activeElement === toggle) {event.preventDefault();links.at(-1).focus();}
    }
  });
  const search = document.getElementById('dashboard-search');
  const clear = document.getElementById('dashboard-search-clear');
  const services = [...document.querySelectorAll('.dashboard-service')];
  const result = document.getElementById('dashboard-search-status');
  const empty = document.getElementById('dashboard-search-empty');
  function filterServices() {
    const query = search.value.toLocaleLowerCase('id').trim();
    let count=0;
    services.forEach(service => {
      service.hidden = !service.textContent.toLocaleLowerCase('id').includes(query);
      if (!service.hidden) count++;
    });
    result.textContent = query ? `${count} layanan ditemukan` : 'Klik untuk masuk';
    empty.hidden = count > 0;
    clear.hidden = !query;
  }
  search.addEventListener('input', filterServices);
  search.addEventListener('keydown', event => {if(event.key === 'Escape'){search.value='';filterServices();}});
  clear.addEventListener('click', () => {search.value='';filterServices();search.focus();});
  const navLinks = [...sidebar.querySelectorAll('a[href^="#"]')];
  const sections = navLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  const activeLink = id => navLinks.forEach(link => {
    if (link.hash === '#'+id) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
  });
  const observer = new IntersectionObserver(entries => {
    const entry=entries.filter(item=>item.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(entry) activeLink(entry.target.id);
  }, {rootMargin:'-5% 0px -65% 0px',threshold:0});
  sections.forEach(section => observer.observe(section));
  navLinks.forEach(link => link.addEventListener('click',()=>activeLink(link.hash.slice(1))));
  if(!location.hash || location.hash === '#hero') activeLink('dashboard');
});
