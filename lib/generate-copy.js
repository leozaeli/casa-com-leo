import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const copySchema = z.object({
  headline: z.string().describe('Frase curta e emocional, 6-12 palavras, sem exagero nem clichê imobiliário.'),
  paragrafo_1: z
    .string()
    .describe(
      'Parágrafo principal, robusto (4-6 frases), linguagem simples e emocional. Cubra a primeira impressão de ' +
        'chegar ali e pelo menos dois detalhes sensoriais concretos (som, luz, cheiro, textura, um momento específico do dia).'
    ),
  paragrafo_2: z
    .string()
    .describe(
      'Segundo parágrafo, também robusto (3-5 frases). Cubra o dia a dia de morar ali e o entorno/bairro — não repita ' +
        'o que já foi dito no primeiro parágrafo. Sempre presente, nunca vazio.'
    ),
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
- O texto precisa ser robusto e completo — os dois parágrafos juntos devem dar uma visão real de como é viver
  ali, não um resumo apressado. Não corte informação relevante que o corretor tenha passado.

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
  headline: z.string().nullable().describe('Frase curta e emocional pro topo da página, 6-12 palavras. Null se uma frase de destaque já foi fornecida separadamente.'),
  paragrafo_1: z
    .string()
    .describe(
      'Parágrafo principal, robusto (4-6 frases), linguagem simples e emocional. Cubra a primeira impressão de ' +
        'chegar ali e pelo menos dois detalhes sensoriais concretos (som, luz, cheiro, textura, um momento específico do dia).'
    ),
  paragrafo_2: z
    .string()
    .describe(
      'Segundo parágrafo, também robusto (3-5 frases). Cubra o dia a dia de morar ali e o entorno/bairro — não repita ' +
        'o que já foi dito no primeiro parágrafo. Sempre presente, nunca vazio.'
    ),
});

export async function extractPropertyFromText({ textoBruto, preco, fraseDestaque, tipo = 'imóvel' }) {
  const schema = fraseDestaque ? extractSchema.omit({ headline: true }) : extractSchema;

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-5'),
    schema,
    system: `Você é um redator sênior e cadastrador especializado em imóveis de alto padrão na Bahia, Brasil.
Sua tarefa é ler o texto bruto que o corretor colou (pode ser uma descrição solta, um anúncio de outro site,
uma mensagem de WhatsApp, tópicos soltos) e extrair os dados de identificação do ${tipo} (título, localização,
categoria, modalidade), além de escrever o texto de apresentação da página, focado no lado emocional: como vai
ser a vida de quem mora ali — não uma lista de qualidades do imóvel. Números e detalhes técnicos (área, suítes,
vagas, comodidades) são preenchidos manualmente à parte, então não é sua tarefa extraí-los.

Regras de estilo do texto:
- Linguagem simples, direta, em português do Brasil, como se estivesse contando pra um amigo.
- Zero jargão imobiliário e zero adjetivo vazio ("deslumbrante", "espetacular", "inigualável", "magnífico").
- Prefira um detalhe sensorial concreto (som, luz, cheiro, textura, um momento específico do dia) a uma
  descrição genérica de "conforto e sofisticação".
- Fale com a pessoa, não sobre o imóvel — imagine ela vivendo ali, não visitando.
- Nunca repita a mesma estrutura de frase do início ao fim; varie o ritmo.
- O texto precisa ser robusto e completo — os dois parágrafos juntos devem dar uma visão real de como é viver
  ali, não um resumo apressado. Não corte informação relevante que o corretor tenha passado.

Regras de extração:
- Nunca invente dados que não estejam no texto.
- Se um dado não estiver claro, faça a melhor estimativa razoável a partir do contexto, mas nunca finja
  certeza sobre algo que claramente não foi informado.`,
    prompt: `Preço do ${tipo}: R$ ${preco.toLocaleString('pt-BR')}
${fraseDestaque ? `Frase de destaque já definida pelo corretor (não gerar outra, usar exatamente essa): "${fraseDestaque}"\n` : ''}
Texto bruto enviado pelo corretor:
"""
${textoBruto}
"""

Extraia os dados de identificação e gere o texto de apresentação.`,
  });

  return fraseDestaque ? { ...object, headline: fraseDestaque } : object;
}
