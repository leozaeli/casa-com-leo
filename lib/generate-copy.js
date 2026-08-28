import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const copySchema = z.object({
  headline: z.string().describe('Frase curta e emocional, 6-12 palavras, sem exagero nem clichê imobiliário.'),
  paragrafo_1: z.string().describe('Parágrafo principal, 2-4 frases, linguagem simples e emocional, com um detalhe sensorial concreto.'),
  paragrafo_2: z.string().nullable().describe('Parágrafo complementar opcional, 1-3 frases, ou null se desnecessário.'),
  specs_extra: z
    .array(
      z.object({
        value: z.string().describe('O dado em si, curto. Ex: "2", "Sim", "180 m²". Pode incluir um emoji discreto no início se combinar bem, ex: "🏊 Sim".'),
        label: z.string().describe('O que o dado representa, curto. Ex: "Vagas de garagem", "Piscina", "Área gourmet".'),
      })
    )
    .describe(
      'Comodidades/diferenciais claramente mencionados na ideia central (ex: piscina, vagas de garagem, ' +
        'churrasqueira, área gourmet, escritório, espaço pet, ambientes climatizados), como pares valor/rótulo ' +
        'curtos para exibir como destaques na página. Extraia só o que foi mencionado, não invente nada. ' +
        'Não repita área, suítes ou vagas principais. Vazio se nada relevante foi mencionado.'
    ),
});

export async function generatePropertyCopy({ ideiaCentral, fraseDestaque, titulo, localizacao, tipo = 'imóvel' }) {
  const schema = fraseDestaque ? copySchema.omit({ headline: true }) : copySchema;

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-5'),
    schema,
    system: `Você é um redator sênior especializado em imóveis de alto padrão na Bahia, Brasil.
Sua tarefa é transformar a ideia central que o corretor descreveu em um texto de apresentação
para a página do ${tipo}, focado no lado emocional: como vai ser a vida de quem mora ali, o que
essa pessoa vai sentir no dia a dia — não uma lista de qualidades do imóvel.

Regras de estilo:
- Linguagem simples, direta, em português do Brasil, como se estivesse contando pra um amigo.
- Zero jargão imobiliário e zero adjetivo vazio ("deslumbrante", "espetacular", "inigualável", "magnífico").
- Prefira um detalhe sensorial concreto (som, luz, cheiro, textura, um momento específico do dia) a uma
  descrição genérica de "conforto e sofisticação".
- Fale com a pessoa, não sobre o imóvel — imagine ela vivendo ali, não visitando.
- Nunca repita a mesma estrutura de frase do início ao fim; varie o ritmo.

Você também recebe a ideia central solta, como o corretor escreveu (pode incluir comodidades
mencionadas de forma solta, tipo "tem piscina, 2 vagas, churrasqueira"). Extraia dali qualquer
comodidade ou diferencial claro para os destaques extras (specs_extra), além do texto emocional.
Não invente nada que não esteja no texto.`,
    prompt: `Título do ${tipo}: ${titulo || '(sem título ainda)'}
Localização: ${localizacao || '(sem localização ainda)'}
Ideia central do corretor: "${ideiaCentral}"
${fraseDestaque ? `\nFrase de destaque já definida pelo corretor (não gerar outra): "${fraseDestaque}"` : ''}

Gere ${fraseDestaque ? 'os parágrafos de apresentação' : 'o headline e os parágrafos de apresentação'} e os destaques extras.`,
  });

  return fraseDestaque ? { ...object, headline: fraseDestaque } : object;
}

const extractSchema = z.object({
  titulo: z.string().describe('Nome/título do imóvel, curto e vendável. Ex: "Casa Itacimirim", "Cobertura Vista Mar Guarajuba". Baseie-se no texto enviado; refine se já houver um nome sugestivo.'),
  eyebrow: z.string().describe('Tag curta de destaque para o topo da página, 2-4 palavras. Ex: "Casa · Exclusivo", "Pé na Areia", "Vista Mar".'),
  categoria: z.enum(['casa', 'apartamento', 'cobertura', 'terreno']).describe('Tipo do imóvel identificado no texto.'),
  localizacao_filtro: z
    .enum(['salvador', 'praia-do-forte', 'itacimirim', 'guarajuba', 'outra'])
    .describe('Localização mapeada para uma das opções de filtro do site. Use "outra" se não corresponder a nenhuma delas.'),
  localizacao: z.string().describe('Texto de localização para exibir na página. Ex: "Itacimirim · Bahia". Termine com o estado quando souber.'),
  modalidades: z
    .array(z.enum(['venda', 'temporada']))
    .min(1)
    .describe('Modalidades de negócio identificadas (venda e/ou aluguel por temporada). Assuma ["venda"] se não ficar claro.'),
  area_m2: z.number().describe('Área do imóvel em metros quadrados. Estime com cautela se não estiver explícito; nunca deixe zero se houver qualquer menção de tamanho.'),
  area_label: z.enum(['Área construída', 'Área privativa', 'Área do terreno']).describe('Rótulo mais adequado pro tipo de área mencionada. Para terrenos, use "Área do terreno".'),
  suites: z.number().int().min(0).describe('Número de suítes/quartos. 0 se não aplicável (ex: terreno) ou não mencionado.'),
  vagas: z.number().int().min(0).describe('Número de vagas de garagem. 0 se não mencionado.'),
  headline: z.string().nullable().describe('Frase curta e emocional pro topo da página, 6-12 palavras. Null se uma frase de destaque já foi fornecida separadamente.'),
  paragrafo_1: z.string().describe('Parágrafo principal de apresentação, 2-4 frases, linguagem simples e emocional com um detalhe sensorial concreto.'),
  paragrafo_2: z.string().nullable().describe('Parágrafo complementar opcional, 1-3 frases, ou null se desnecessário.'),
  specs: z
    .array(
      z.object({
        value: z.string().describe('O dado em si, curto, pode incluir um emoji discreto no início. Ex: "📐 420 m²", "🛏️ 3", "🚗 2", "🏊 Sim".'),
        label: z.string().describe('O que o dado representa. Ex: "Área construída", "Suítes", "Vagas", "Piscina".'),
      })
    )
    .min(3)
    .max(7)
    .describe(
      'Lista curada dos destaques MAIS IMPORTANTES para mostrar em quadrinhos na página, na ordem de importância. ' +
        'Inclua área, suítes e vagas quando fizerem sentido pro tipo de imóvel (pule suítes/vagas se for terreno, por ' +
        'exemplo), e complete com comodidades e diferenciais claramente mencionados no texto (piscina, churrasqueira, ' +
        'vista, documentação, etc). Não invente nada que não esteja no texto ou nos números fornecidos.'
    ),
});

export async function extractPropertyFromText({ textoBruto, preco, fraseDestaque, tipo = 'imóvel' }) {
  const schema = fraseDestaque ? extractSchema.omit({ headline: true }) : extractSchema;

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-5'),
    schema,
    system: `Você é um redator sênior e cadastrador especializado em imóveis de alto padrão na Bahia, Brasil.
Sua tarefa é ler o texto bruto que o corretor colou (pode ser uma descrição solta, um anúncio de outro site,
uma mensagem de WhatsApp, tópicos soltos) e extrair TODOS os dados estruturados do ${tipo}, além de escrever
o texto de apresentação da página, focado no lado emocional: como vai ser a vida de quem mora ali — não uma
lista de qualidades do imóvel.

Regras de estilo do texto:
- Linguagem simples, direta, em português do Brasil, como se estivesse contando pra um amigo.
- Zero jargão imobiliário e zero adjetivo vazio ("deslumbrante", "espetacular", "inigualável", "magnífico").
- Prefira um detalhe sensorial concreto (som, luz, cheiro, textura, um momento específico do dia) a uma
  descrição genérica de "conforto e sofisticação".
- Fale com a pessoa, não sobre o imóvel — imagine ela vivendo ali, não visitando.
- Nunca repita a mesma estrutura de frase do início ao fim; varie o ritmo.

Regras de extração:
- Nunca invente números ou comodidades que não estejam no texto.
- Se um dado não estiver claro, faça a melhor estimativa razoável a partir do contexto, mas nunca finja
  certeza sobre algo que claramente não foi informado.
- Os "specs" são os quadrinhos de destaque da página — escolha só o que é realmente relevante pra esse
  imóvel específico, não uma lista genérica fixa.`,
    prompt: `Preço do ${tipo}: R$ ${preco.toLocaleString('pt-BR')}
${fraseDestaque ? `Frase de destaque já definida pelo corretor (não gerar outra, usar exatamente essa): "${fraseDestaque}"\n` : ''}
Texto bruto enviado pelo corretor:
"""
${textoBruto}
"""

Extraia todos os dados estruturados e gere o texto de apresentação e os quadrinhos de destaque.`,
  });

  return fraseDestaque ? { ...object, headline: fraseDestaque } : object;
}
