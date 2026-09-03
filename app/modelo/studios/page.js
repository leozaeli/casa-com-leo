import Simulator from '@/components/modelo/Simulator';

// Ajuste os números da proposta aqui — nada disso está espalhado no JSX abaixo.
const CONFIG = {
  pctOriginador: 15,
  pctOriginadorTrafego: 25,
  simulador: {
    unitValue: 350000,
    unitsSold: 15,
    commissionPct: 5,
    participationPct: 15,
  },
  piloto: {
    quantidadeEmpreendimentos: 1,
    prazoDiasMin: 90,
    prazoDiasMax: 120,
  },
  whatsappNumber: '5571984266363',
  whatsappMessage: 'Olá Leo! Vi a proposta de parceria do StudioHUB e quero conversar.',
  ano: 2026,
};

export const metadata = {
  title: 'Modelo de Parceria — StudioHUB | Casa com Leo',
  description: 'Proposta de parceria de originação de produto para o StudioHUB.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const PAPEIS = {
  originador: {
    title: 'Você — originação de produto',
    items: [
      { text: 'Apresenta construtores e incorporadores e faz a ponte', not: false },
      { text: 'Ajuda a qualificar tecnicamente o produto (projeto, planta, obra, custo) — seu olhar vira filtro de carteira', not: false },
      { text: 'Opcional: conteúdo e material técnico com a sua assinatura', not: false },
      { text: 'Não vende, não atende comprador, não negocia', not: true },
    ],
  },
  casaComLeo: {
    title: 'Casa com Leo — comercialização',
    items: [
      { text: 'Negocia condição com o construtor (tabela, comissão, exclusividade, prazo)', not: false },
      { text: 'Estrutura completa: landing, tráfego, conteúdo, atendimento, visita, fechamento', not: false },
      { text: 'Investimento em mídia 100% por minha conta no modelo base', not: false },
      { text: 'Reporte transparente de vendas por empreendimento', not: false },
    ],
  },
};

const REGRAS = [
  'Base de cálculo: comissão líquida efetivamente recebida do construtor, nunca VGV',
  'Pagamento após o recebimento efetivo de cada comissão',
  'Construtor "trazido" = apresentado por você e formalizado por escrito no momento da apresentação; se eu já tiver relação prévia com ele, alinhamos antes',
  'Vigência: durante todo o contrato de comercialização do empreendimento; novos lançamentos do mesmo construtor continuam gerando participação (percentual a definir)',
  'Você não intermedia nem negocia com o comprador — a remuneração é por originação e consultoria, formalizada em contrato',
];

const CRITERIOS = ['Salvador', 'Lauro de Freitas', 'Litoral Norte', 'Studio', 'Quarto e sala', 'Tese clara de locação/liquidez', 'Comissão e exclusividade mínimas'];

const CICLO = [
  'Produto na carteira',
  'Tráfego + conteúdo',
  'Vendas',
  'Comissão',
  'Reinvestimento em mídia',
  'Mais velocidade de venda',
  'Construtor satisfeito',
  'Novo produto',
];

const GANHOS = [
  'Posicionamento como o arquiteto que também resolve a venda',
  'Relação mais forte com construtores, com chance real de puxar projeto de arquitetura nos próximos lançamentos',
  'Conteúdo e autoridade com sua assinatura técnica, sem custo de produção',
  'Zero risco: no piloto, todo o investimento é meu',
];

const TIMELINE = [
  {
    title: 'Piloto',
    text: `${CONFIG.piloto.quantidadeEmpreendimentos} empreendimento, ${CONFIG.piloto.prazoDiasMin} a ${CONFIG.piloto.prazoDiasMax} dias, investimento em mídia por minha conta.`,
  },
  {
    title: 'Escala',
    text: 'Mais produtos na carteira; você decide se entra como sócio de tráfego.',
  },
  {
    title: 'Marca conjunta',
    text: 'Conteúdo assinado pelos dois, eventos pra investidores, presença com construtores.',
  },
];

const whatsappHref = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;

export default function ModeloStudiosPage() {
  return (
    <div className="modelo-page">
      <header className="mp-topbar">
        <div className="wrap">
          <span className="mp-brand">
            <span className="mp-brand-mark">L</span> Casa Com Leo
          </span>
          <span className="mp-confidential">Documento confidencial</span>
        </div>
      </header>

      <main>
        {/* 1 — Hero */}
        <section className="mp-hero">
          <div className="wrap">
            <span className="pill-badge">
              <span className="dot"></span> Proposta de parceria
            </span>
            <h1>Você abre a porta. Eu vendo.</h1>
            <p className="mp-lede">
              Um modelo de originação de produto para o StudioHUB: você traz o construtor, eu comercializo, e você
              ganha em cada unidade vendida.
            </p>
            <span className="mp-signature">Casa com Leo · Salvador, Lauro de Freitas e Litoral Norte</span>
          </div>
        </section>

        {/* 2 — O contexto */}
        <section className="mp-contexto">
          <div className="wrap-narrow">
            <span className="mp-kicker">O contexto</span>
            <h2 className="mp-title">O gargalo de quem vende lançamento não é lead. É produto bom.</h2>
            <p className="mp-body">
              Construtores e incorporadores de pequeno e médio porte têm produto na mão e não têm canal de venda
              estruturado. Eu tenho a máquina de comercialização de studios (site, tráfego pago, produção de
              conteúdo, atendimento, CRM, funil de investidores) pronta e rodando no StudioHUB.
            </p>
            <p className="mp-body">O que falta pra escalar é carteira. É aí que você entra.</p>
          </div>
        </section>

        {/* 3 — A tese */}
        <section className="mp-tese">
          <div className="wrap-narrow">
            <blockquote>
              Você conhece os construtores que estão com produto pronto ou em lançamento e sem canal de venda
              decente. Eu tenho a máquina de vender studios. <strong>Traz o produto pra minha carteira e você ganha
              em toda unidade vendida daquele empreendimento — sem vender nada.</strong>
            </blockquote>
          </div>
        </section>

        {/* 4 — Papéis */}
        <section className="mp-papeis">
          <div className="wrap-narrow">
            <span className="mp-kicker">Divisão de papéis</span>
            <h2 className="mp-title">Cada um faz o que sabe fazer melhor.</h2>
            <div className="mp-roles-grid">
              <div className="mp-role-card">
                <h3>{PAPEIS.originador.title}</h3>
                <ul>
                  {PAPEIS.originador.items.map((item) => (
                    <li key={item.text} className={item.not ? 'mp-not' : undefined}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mp-role-card mp-role-casa">
                <h3>{PAPEIS.casaComLeo.title}</h3>
                <ul>
                  {PAPEIS.casaComLeo.items.map((item) => (
                    <li key={item.text} className={item.not ? 'mp-not' : undefined}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5 — Remuneração */}
        <section className="mp-remuneracao">
          <div className="wrap-narrow">
            <span className="mp-kicker">Remuneração</span>
            <h2 className="mp-title">Uma apresentação vira receita recorrente.</h2>
            <p className="mp-support">
              Sua participação não é sobre uma venda. É sobre todas as unidades vendidas do empreendimento que você
              trouxe, durante toda a comercialização.
            </p>

            <div className="mp-plans-grid">
              <div className="mp-plan-card">
                <span className="mp-plan-label">Originador</span>
                <span className="mp-plan-pct">{CONFIG.pctOriginador}%</span>
                <p>Traz o construtor → recebe {CONFIG.pctOriginador}% da minha comissão líquida em cada unidade vendida daquele produto.</p>
              </div>
              <div className="mp-plan-card mp-plan-featured">
                <span className="mp-plan-label">Originador + tráfego</span>
                <span className="mp-plan-pct">{CONFIG.pctOriginadorTrafego}%</span>
                <p>Traz o construtor e coinveste em mídia → recebe {CONFIG.pctOriginadorTrafego}% da comissão nas unidades daquele produto.</p>
              </div>
            </div>

            <Simulator defaults={CONFIG.simulador} />

            <div className="mp-rules">
              <h4>Regras claras</h4>
              <ul>
                {REGRAS.map((regra) => (
                  <li key={regra}>{regra}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 6 — Critério de carteira */}
        <section className="mp-criterio">
          <div className="wrap-narrow">
            <span className="mp-kicker">Critério de carteira</span>
            <h2 className="mp-title">Não é qualquer produto. É curadoria.</h2>
            <p className="mp-body">
              A parceria só funciona se a carteira mantiver o padrão. Critérios que definimos juntos: localização,
              tipologia, tese clara de locação/liquidez e condição comercial mínima. Seu papel aqui é de curadoria
              técnica, não de indicação a qualquer custo.
            </p>
            <div className="mp-criterio-tags">
              {CRITERIOS.map((criterio) => (
                <span key={criterio}>{criterio}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 7 — O ciclo */}
        <section className="mp-ciclo">
          <div className="wrap-narrow">
            <span className="mp-kicker">O ciclo</span>
            <h2 className="mp-title">Cada empreendimento alimenta o próximo.</h2>
            <div className="mp-cycle-ring">
              {CICLO.map((step, index) => (
                <div className="mp-cycle-step" key={step}>
                  <span className="mp-cycle-step-num">{String(index + 1).padStart(2, '0')}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <p className="mp-ciclo-quote">Cada empreendimento vendido bem é o argumento pro próximo.</p>
          </div>
        </section>

        {/* 8 — O que você ganha além do percentual */}
        <section className="mp-ganhos">
          <div className="wrap-narrow">
            <span className="mp-kicker">Além do percentual</span>
            <h2 className="mp-title">O que você ganha além do percentual</h2>
            <div className="mp-ganhos-grid">
              {GANHOS.map((ganho) => (
                <div className="mp-ganho-card" key={ganho}>
                  <p>{ganho}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9 — Como começamos */}
        <section className="mp-como-comecamos">
          <div className="wrap-narrow">
            <span className="mp-kicker">Como começamos</span>
            <h2 className="mp-title">Três etapas, sem risco pra você.</h2>
            <div className="mp-timeline-list">
              {TIMELINE.map((etapa, index) => (
                <div className="mp-timeline-item" key={etapa.title}>
                  <span className="mp-timeline-num">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{etapa.title}</h3>
                    <p>{etapa.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mp-governanca">
              <strong>Governança:</strong> contrato de parceria de originação (registro de construtores,
              percentuais, prazo, exclusividade, saída) + encontro mensal de pipeline e vendas.
            </div>
          </div>
        </section>

        {/* 10 — Fechamento */}
        <section className="mp-fechamento">
          <div className="wrap">
            <h2>Vamos conversar?</h2>
            <p>
              Se fizer sentido, o próximo passo é uma conversa de 30 minutos pra alinhar percentuais, critérios e o
              primeiro produto do piloto.
            </p>
            <a className="button" href={whatsappHref} target="_blank" rel="noreferrer">
              Chamar o Leo no WhatsApp
            </a>
          </div>
        </section>
      </main>

      <footer className="mp-footer">
        <div className="wrap">Documento confidencial. Casa com Leo · {CONFIG.ano}</div>
      </footer>
    </div>
  );
}
