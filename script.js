const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.property-card');

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle('hidden', category !== 'todos' && card.dataset.category !== category);
    });
  });
});

const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();
    document.querySelector('.success')?.classList.add('show');
  });
}

const keyHero = document.querySelector('.key-hero');
let scrollTicking = false;
const updateKeyReveal = () => {
  if (!keyHero) return;
  const bounds = keyHero.getBoundingClientRect();
  const travel = Math.max(keyHero.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(1, Math.max(0, -bounds.top / travel));
  keyHero.style.setProperty('--reveal', progress.toFixed(3));
  scrollTicking = false;
};
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateKeyReveal);
    scrollTicking = true;
  }
}, { passive: true });
updateKeyReveal();
