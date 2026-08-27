document.querySelectorAll('.menu-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    const menu = toggle.parentElement.querySelector('.nav-links');
    menu.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
});

function sendLead({ nome, contato, mensagem }) {
  fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, contato, mensagem, origem: window.location.pathname }),
    keepalive: true,
  }).catch(() => {});
}

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
    sendLead({ nome: form.nome.value.trim(), contato: form.email.value.trim(), mensagem: form.mensagem.value.trim() });
    form.reset();
    document.querySelector('.success')?.classList.add('show');
  });
}

const listingPage = document.querySelector('#property-results');
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
const rotatingWord = document.querySelector('#rotating-word');
if (rotatingWord) {
  const words = ['endereço', 'investimento', 'negócio'];
  let wordIndex = 0;
  setInterval(() => {
    rotatingWord.style.opacity = '0';
    setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      rotatingWord.textContent = words[wordIndex];
      rotatingWord.style.opacity = '1';
    }, 300);
  }, 2400);
}

if (window.location.pathname.replace(/\/+$/, '') === '/contato') {
  window.addEventListener('load', () => {
    document.querySelector('#contato')?.scrollIntoView();
  });
}

const WHATSAPP_NUMBER = '5571984266363';

const isStudiosPage = window.location.pathname.replace(/\/+$/, '') === '/studios';

function buildContactPopup() {
  if (document.querySelector('#contact-popup')) return document.querySelector('#contact-popup');
  const overlay = document.createElement('div');
  overlay.id = 'contact-popup';
  overlay.className = 'popup-overlay';
  overlay.innerHTML = isStudiosPage ? `
    <div class="popup-card" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <button class="popup-close" type="button" aria-label="Fechar">&times;</button>
      <span class="eyebrow-tag">✉ Lista de espera</span>
      <h2 id="popup-title">Quero ser avisado</h2>
      <p class="popup-copy">Entre na lista de espera dos Studios. Avisamos você assim que o projeto for lançado.</p>
      <form class="popup-form" id="popup-form">
        <label for="popup-nome">Seu nome</label>
        <input id="popup-nome" name="nome" required placeholder="Como posso te chamar?">
        <label for="popup-whatsapp">Seu WhatsApp</label>
        <input id="popup-whatsapp" name="whatsapp" required placeholder="(71) 99999-9999">
        <label for="popup-local">Tem preferência de localização para investir em um studio?</label>
        <input id="popup-local" name="local" placeholder="Escreva aqui...">
        <button class="button" type="submit">Entrar na lista de espera</button>
      </form>
    </div>` : `
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
    const lines = isStudiosPage ? [
      `Olá! Meu nome é ${nome}.`,
      'Quero entrar na lista de espera dos Studios da Casa com Leo.',
      form.local.value.trim() ? `Tenho preferência de localização: ${form.local.value.trim()}.` : 'Ainda não tenho uma localização definida.',
      `Pode me chamar por aqui: ${whatsapp}`,
    ] : [
      `Olá! Meu nome é ${nome}.`,
      form.mensagem.value.trim(),
      `Pode me chamar por aqui: ${whatsapp}`,
    ];
    const mensagemLead = isStudiosPage
      ? `Lista de espera Studios. Localização: ${form.local.value.trim() || 'não informada'}.`
      : form.mensagem.value.trim();
    sendLead({ nome, contato: whatsapp, mensagem: mensagemLead });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
    closePopup();
    form.reset();
  });

  return overlay;
}

function openContactPopup(trigger, prefillMessage) {
  const overlay = buildContactPopup();
  const textarea = overlay.querySelector('#popup-mensagem');
  if (textarea) textarea.value = prefillMessage || '';
  overlay.classList.add('open');
  document.body.classList.add('popup-open');
  overlay.querySelector('#popup-nome').focus();
}

const MODALITY_LABELS = { venda: 'Comprar', temporada: 'Aluguel por temporada' };
const MODALITY_MESSAGES = {
  venda: (property) => `Tenho interesse em comprar o imóvel: ${property}.`,
  temporada: (property) => `Tenho interesse na temporada do imóvel: ${property}.`,
};

function buildChoiceMenu() {
  if (document.querySelector('#interesse-choice')) return document.querySelector('#interesse-choice');
  const menu = document.createElement('div');
  menu.id = 'interesse-choice';
  menu.className = 'choice-menu';
  document.body.appendChild(menu);
  document.addEventListener('click', (event) => {
    if (menu.classList.contains('open') && !menu.contains(event.target) && !event.target.closest('[data-popup="interesse"]')) {
      menu.classList.remove('open');
    }
  });
  return menu;
}

function openInterestFlow(trigger) {
  const property = trigger.dataset.property;
  const modalities = (trigger.dataset.modalities || 'venda').split(' ').filter(Boolean);
  if (modalities.length <= 1) {
    openContactPopup(trigger, MODALITY_MESSAGES[modalities[0] || 'venda'](property));
    return;
  }
  const menu = buildChoiceMenu();
  menu.innerHTML = modalities.map((modality) => `<button type="button" class="choice-option" data-modality="${modality}">${MODALITY_LABELS[modality]}</button>`).join('');
  const rect = trigger.getBoundingClientRect();
  menu.style.left = `${Math.min(rect.left, window.innerWidth - 220)}px`;
  menu.style.bottom = `${window.innerHeight - rect.top + 10}px`;
  menu.classList.add('open');
  menu.querySelectorAll('.choice-option').forEach((option) => {
    option.addEventListener('click', () => {
      menu.classList.remove('open');
      openContactPopup(trigger, MODALITY_MESSAGES[option.dataset.modality](property));
    });
  });
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-popup]');
  if (!trigger) return;
  event.preventDefault();
  if (trigger.dataset.popup === 'interesse') {
    openInterestFlow(trigger);
  } else {
    openContactPopup(trigger, trigger.dataset.prefill);
  }
});
