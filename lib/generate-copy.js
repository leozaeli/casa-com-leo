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
