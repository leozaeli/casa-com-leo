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
let revealFrame = 0;
function updateKeyReveal() {
  if (!keyHero) return;
  const rect = keyHero.getBoundingClientRect();
  const distance = Math.max(keyHero.offsetHeight - window.innerHeight, 1);
  const progress = Math.max(0, Math.min(1, -rect.top / distance));
  keyHero.style.setProperty('--reveal', progress.toFixed(3));
  revealFrame = 0;
}
function requestRevealUpdate() {
  if (!revealFrame) revealFrame = window.requestAnimationFrame(updateKeyReveal);
}
window.addEventListener('scroll', requestRevealUpdate, { passive: true });
window.addEventListener('resize', requestRevealUpdate, { passive: true });
updateKeyReveal();