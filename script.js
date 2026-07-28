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
  const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  const distance = Math.max(keyHero.offsetHeight - viewportHeight, 1);
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

const listingPage = document.querySelector('.listing-page');
if (listingPage) {
  const locationFilter = document.querySelector('#location-filter');
  const typeFilter = document.querySelector('#type-filter');
  const priceFilter = document.querySelector('#price-filter');
  const bedroomFilter = document.querySelector('#bedroom-filter');
  const sortFilter = document.querySelector('#sort-filter');
  const resultsGrid = document.querySelector('#property-results');
  const resultsCount = document.querySelector('#results-count');
  const emptyResults = document.querySelector('#empty-results');
  const listingCards = [...document.querySelectorAll('.listing-card')];

  function matchesPrice(price, range) {
    if (range === 'ate-7') return price <= 7000000;
    if (range === '7-10') return price > 7000000 && price <= 10000000;
    if (range === 'acima-10') return price > 10000000;
    return true;
  }

  function applyListingFilters() {
    const location = locationFilter.value;
    const type = typeFilter.value;
    const price = priceFilter.value;
    const bedrooms = bedroomFilter.value;
    const visibleCards = listingCards.filter((card) => {
      const matches = (location === 'todos' || card.dataset.location === location)
        && (type === 'todos' || card.dataset.category === type)
        && matchesPrice(Number(card.dataset.price), price)
        && (bedrooms === 'todos' || Number(card.dataset.bedrooms) >= Number(bedrooms));
      card.hidden = !matches;
      return matches;
    });

    const sort = sortFilter.value;
    visibleCards.sort((first, second) => {
      if (sort === 'price-asc') return Number(first.dataset.price) - Number(second.dataset.price);
      if (sort === 'price-desc') return Number(second.dataset.price) - Number(first.dataset.price);
      if (sort === 'area-desc') return Number(second.dataset.area) - Number(first.dataset.area);
      return listingCards.indexOf(first) - listingCards.indexOf(second);
    }).forEach((card) => resultsGrid.appendChild(card));

    resultsCount.textContent = `${visibleCards.length} ${visibleCards.length === 1 ? 'imóvel' : 'imóveis'}`;
    emptyResults.hidden = visibleCards.length > 0;
  }

  function clearListingFilters() {
    [locationFilter, typeFilter, priceFilter, bedroomFilter].forEach((control) => { control.value = 'todos'; });
    sortFilter.value = 'featured';
    applyListingFilters();
  }

  [locationFilter, typeFilter, priceFilter, bedroomFilter, sortFilter].forEach((control) => control.addEventListener('change', applyListingFilters));
  document.querySelector('#clear-filters')?.addEventListener('click', clearListingFilters);
  document.querySelector('#empty-clear')?.addEventListener('click', clearListingFilters);
  applyListingFilters();
}