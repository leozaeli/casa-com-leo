import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const copySchema = z.object({
  headline: z.string().describe('Frase curta e emocional, 6-12 palavras, sem exagero nem clichê imobiliário.'),
  paragrafo_1: z.string().describe('Parágrafo principal, 2-4 frases, linguagem simples e emocional.'),
  paragrafo_2: z.string().nullable().describe('Parágrafo complementar opcional, 1-3 frases, ou null se desnecessário.'),
  specs_extra: z
    .array(
      z.object({
        value: z.string().describe('O dado em si, curto. Ex: "2", "Sim", "180 m²".'),
        label: z.string().describe('O que o dado representa, curto. Ex: "Vagas de garagem", "Piscina", "Área gourmet".'),
      })
    )
    .describe(
      'Comodidades/diferenciais extraídos do texto de comodidades fornecido, como pares valor/rótulo curtos ' +
        'para exibir como destaques na página. Extraia apenas o que foi mencionado, não invente. Vazio se nada foi informado.'
    ),
});

export async function generatePropertyCopy({ ideiaCentral, comodidades, titulo, localizacao, tipo = 'imóvel' }) {
  const { object } = await generateObject({
    model: anthropic('claude-sonnet-5'),
    schema: copySchema,
    system: `Você é um redator especializado em imóveis de alto padrão na Bahia, Brasil.
Sua tarefa é transformar a ideia central que o corretor descreveu em um texto de apresentação
para a página do ${tipo}, focado no lado emocional (como a pessoa vai viver e se sentir ali),
mas escrito em linguagem simples e direta, sem jargão imobiliário nem adjetivos vazios
("deslumbrante", "espetacular", "inigualável"). Escreva em português do Brasil.

Você também recebe uma lista solta de comodidades e diferenciais do ${tipo} (como o corretor
digitou, sem formatação). Extraia dali os destaques mais relevantes e vendáveis como pares
valor/rótulo curtos para exibir na página (ex: {value: "2", label: "Vagas de garagem"},
{value: "Sim", label: "Piscina"}). Não invente nada que não esteja no texto. Não repita dados
que já aparecem como área, suítes ou vagas principais — foque no que é diferencial.`,
    prompt: `Título do ${tipo}: ${titulo || '(sem título ainda)'}
Localização: ${localizacao || '(sem localização ainda)'}
Ideia central do corretor: "${ideiaCentral}"
Comodidades e diferenciais informados: "${comodidades || '(nenhuma informada)'}"

Gere o headline, os parágrafos de apresentação e os destaques extras.`,
  });

  return object;
}
