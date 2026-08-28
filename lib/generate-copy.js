import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const copySchema = z.object({
  headline: z.string().describe('Frase curta e emocional, 6-12 palavras, sem exagero nem clichê imobiliário.'),
  paragrafo_1: z.string().describe('Parágrafo principal, 2-4 frases, linguagem simples e emocional.'),
  paragrafo_2: z.string().nullable().describe('Parágrafo complementar opcional, 1-3 frases, ou null se desnecessário.'),
});

export async function generatePropertyCopy({ ideiaCentral, titulo, localizacao, tipo = 'imóvel' }) {
  const { object } = await generateObject({
    model: anthropic('claude-sonnet-5'),
    schema: copySchema,
    system: `Você é um redator especializado em imóveis de alto padrão na Bahia, Brasil.
Sua tarefa é transformar a ideia central que o corretor descreveu em um texto de apresentação
para a página do ${tipo}, focado no lado emocional (como a pessoa vai viver e se sentir ali),
mas escrito em linguagem simples e direta, sem jargão imobiliário nem adjetivos vazios
("deslumbrante", "espetacular", "inigualável"). Escreva em português do Brasil.`,
    prompt: `Título do ${tipo}: ${titulo || '(sem título ainda)'}
Localização: ${localizacao || '(sem localização ainda)'}
Ideia central do corretor: "${ideiaCentral}"

Gere o headline e os parágrafos de apresentação.`,
  });

  return object;
}
