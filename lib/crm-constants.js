export const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'visita_agendada', label: 'Visita agendada' },
  { value: 'proposta', label: 'Proposta enviada' },
  { value: 'fechado_ganho', label: 'Fechado (ganho)' },
  { value: 'fechado_perdido', label: 'Fechado (perdido)' },
];

export const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));

export const INTENCAO_OPTIONS = [
  { value: 'venda', label: 'Compra' },
  { value: 'temporada', label: 'Aluguel / Temporada' },
  { value: 'indefinido', label: 'Indefinido' },
];

export const INTENCAO_LABEL = Object.fromEntries(INTENCAO_OPTIONS.map((o) => [o.value, o.label]));

export const CANAL_LABEL = {
  formulario: 'Formulário',
  whatsapp: 'WhatsApp',
  lista_espera: 'Lista de espera',
};

export const TEMPERATURA_LABEL = {
  quente: 'Quente',
  morno: 'Morno',
  frio: 'Frio',
  fechado: 'Fechado',
};
