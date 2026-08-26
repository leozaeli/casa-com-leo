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

const listingPage = document.querySelector('.listing-page');
if (listingPage) {
  const locationFilter = document.querySelector('#location-filter');
  const typeFilter = document.querySelector('#type-filter');
  const modalityFilter = document.querySelector('#modality-filter');
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
    const modality = modalityFilter.value;
    const price = priceFilter.value;
    const bedrooms = bedroomFilter.value;
    const visibleCards = listingCards.filter((card) => {
      const matches = (location === 'todos' || card.dataset.location === location)
        && (type === 'todos' || card.dataset.category === type)
        && (modality === 'todos' || card.dataset.modality.split(' ').includes(modality))
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
    [locationFilter, typeFilter, modalityFilter, priceFilter, bedroomFilter].forEach((control) => { control.value = 'todos'; });
    sortFilter.value = 'featured';
    applyListingFilters();
  }

  [locationFilter, typeFilter, modalityFilter, priceFilter, bedroomFilter, sortFilter].forEach((control) => control.addEventListener('change', applyListingFilters));
  document.querySelector('#clear-filters')?.addEventListener('click', clearListingFilters);
  document.querySelector('#empty-clear')?.addEventListener('click', clearListingFilters);
  applyListingFilters();
}
if (window.location.pathname.replace(/\/+$/, '') === '/contato') {
  window.addEventListener('load', () => {
    document.querySelector('#contato')?.scrollIntoView();
  });
}

const WHATSAPP_NUMBER = '5571984266363';

function buildContactPopup() {
  if (document.querySelector('#contact-popup')) return document.querySelector('#contact-popup');
  const overlay = document.createElement('div');
  overlay.id = 'contact-popup';
  overlay.className = 'popup-overlay';
  overlay.innerHTML = `
    <div class="popup-card" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <button class="popup-close" type="button" aria-label="Fechar">&times;</button>
      <span class="eyebrow-tag">✉ Fale comigo</span>
      <h2 id="popup-title">Vamos conversar?</h2>
      <p class="popup-copy">Preencha e o WhatsApp abre com sua mensagem pronta pra enviar.</p>
      <form class="popup-form" id="popup-form">
        <label for="popup-nome">Seu nome</label>
        <input id="popup-nome" name="nome" required placeholder="Como posso te chamar?">
        <label for="popup-whatsapp">Seu WhatsApp</label>
        <input id="popup-whatsapp" name="whatsapp" required placeholder="(71) 99999-9999">
        <label for="popup-mensagem">O que você procura?</label>
        <textarea id="popup-mensagem" name="mensagem" required placeholder="Conte um pouco sobre o que você busca."></textarea>
        <button class="button" type="submit">Enviar pelo WhatsApp</button>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  function closePopup() {
    overlay.classList.remove('open');
    document.body.classList.remove('popup-open');
  }

  overlay.querySelector('.popup-close').addEventListener('click', closePopup);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closePopup(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePopup(); });

  overlay.querySelector('#popup-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const nome = form.nome.value.trim();
    const whatsapp = form.whatsapp.value.trim();
    const mensagem = form.mensagem.value.trim();
    const lines = [
      `Olá! Meu nome é ${nome}.`,
      mensagem,
      `Pode me chamar por aqui: ${whatsapp}`,
    ];
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
    closePopup();
    form.reset();
  });

  return overlay;
}

function openContactPopup(trigger) {
  const overlay = buildContactPopup();
  const textarea = overlay.querySelector('#popup-mensagem');
  const property = trigger?.dataset.property;
  const kind = trigger?.dataset.popup;
  if (kind === 'interesse-compra' && property) {
    textarea.value = `Tenho interesse em comprar o imóvel: ${property}.`;
  } else if (kind === 'interesse-temporada' && property) {
    textarea.value = `Tenho interesse na temporada do imóvel: ${property}.`;
  } else {
    textarea.value = '';
  }
  overlay.classList.add('open');
  document.body.classList.add('popup-open');
  overlay.querySelector('#popup-nome').focus();
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-popup]');
  if (!trigger) return;
  event.preventDefault();
  openContactPopup(trigger);
});
