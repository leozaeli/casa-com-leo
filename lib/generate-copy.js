import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const copySchema = z.object({
  headline: z.string().describe('Frase curta e emocional, 6-12 palavras, sem exagero nem clichê imobiliário.'),
  paragrafo_1: z
    .string()
    .describe(
      'UM único parágrafo de apresentação (3-5 frases), texto corrido em português, sem formatação de nenhum tipo ' +
        '(sem markdown, sem asteriscos, sem aspas, sem listas). Puxe da ideia central o que há de mais legal e monte ' +
        'um texto natural com isso — sem enfeitar demais, sem inventar, sem tentar encaixar cada detalhe.'
    ),
  specs_extra: z
    .array(
      z.object({
        value: z.string().describe('O dado em si, curto, sem emoji. Ex: "2", "Sim", "180 m²".'),
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
Sua tarefa é transformar a ideia central que o corretor descreveu em um único parágrafo de
apresentação para a página do ${tipo}, focado no lado emocional: como vai ser a vida de quem
mora ali — não uma lista de qualidades do imóvel.

Regras de estilo:
- Objetivo e direto. Curto de verdade — nada de encher linguiça ou tentar mencionar tudo que foi
  informado. Escolha só o que mais emociona e descarte o resto.
- Humano e pouco formal, como se estivesse contando pra um amigo — não como um anúncio.
- Zero jargão imobiliário e zero adjetivo vazio ("deslumbrante", "espetacular", "inigualável", "magnífico").
- Um detalhe sensorial concreto (som, luz, cheiro, textura, um momento do dia) vale mais que qualquer
  lista de qualidades.
- Fale com a pessoa, não sobre o imóvel — imagine ela vivendo ali, não visitando.
- Texto corrido, em frases normais. Nunca use markdown, asteriscos, aspas, travessões em excesso, emojis
  ou listas — é pra ler como uma conversa, não como um documento formatado.

Você também recebe a ideia central solta, como o corretor escreveu (pode incluir comodidades
mencionadas de forma solta, tipo "tem piscina, 2 vagas, churrasqueira"). Extraia dali qualquer
comodidade ou diferencial claro para os destaques extras (specs_extra), além do texto emocional.
Não invente nada que não esteja no texto.`,
    prompt: `Título do ${tipo}: ${titulo || '(sem título ainda)'}
Localização: ${localizacao || '(sem localização ainda)'}
Ideia central do corretor: "${ideiaCentral}"
${fraseDestaque ? `\nFrase de destaque já definida pelo corretor (não gerar outra): "${fraseDestaque}"` : ''}

Gere ${fraseDestaque ? 'o parágrafo de apresentação' : 'o headline e o parágrafo de apresentação'} e os destaques extras.`,
  });

  return fraseDestaque ? { ...object, headline: fraseDestaque } : object;
}
