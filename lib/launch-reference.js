import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const pageSchema = z.object({
  title: z.string().describe('Nome do empreendimento, somente se estiver explícito na fonte.'),
  hero: z.string().describe('Texto curto para o topo da página, baseado estritamente na fonte.'),
  summary: z.string().describe('Apresentação completa e objetiva do empreendimento, sem inventar informações.'),
  stats: z.array(z.object({ value: z.string(), label: z.string() })).max(12),
  sections: z.array(z.object({ title: z.string(), text: z.string() })).max(10),
  facts: z.array(z.object({ label: z.string(), value: z.string() })).max(30),
});

function decodeEntities(value) {
  return value.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&[a-z]+;/gi, ' ');
}

function textFromHtml(html) {
  return decodeEntities(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
}

function attr(tag, name) {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*["' + "'" + ']([^"' + "'" + ']+)["' + "'" + ']', 'i'));
  return match?.[1] || null;
}

function absoluteUrl(value, baseUrl) {
  try {
    const url = new URL(value, baseUrl);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function sourceImages(html, baseUrl) {
  const candidates = [];
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const property = (attr(tag, 'property') || attr(tag, 'name') || '').toLowerCase();
    if (property === 'og:image' || property === 'twitter:image') candidates.push(attr(tag, 'content'));
  }
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) candidates.push(attr(tag, 'src'), attr(tag, 'data-src'), attr(tag, 'data-lazy-src'));
  return [...new Set(candidates.map((candidate) => candidate && absoluteUrl(candidate, baseUrl)).filter(Boolean).filter((url) => !/(logo|icon|favicon|sprite)/i.test(url)))].slice(0, 18);
}

export async function importLaunchReference(referenceUrl) {
  let url;
  try {
    url = new URL(referenceUrl);
  } catch {
    throw new Error('Informe um link válido.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || ['localhost', '127.0.0.1', '::1'].includes(url.hostname) || url.hostname.endsWith('.local')) throw new Error('Use uma página pública como referência.');

  const response = await fetch(url, { cache: 'no-store', redirect: 'follow', headers: { 'User-Agent': 'CasaComLeo launch importer' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('Não foi possível ler esse link (status ' + response.status + ').');
  if (!(response.headers.get('content-type') || '').includes('text/html')) throw new Error('O link precisa apontar para uma página da web.');

  const html = (await response.text()).slice(0, 250000);
  const sourceText = textFromHtml(html).slice(0, 90000);
  if (sourceText.length < 200) throw new Error('A página não trouxe conteúdo suficiente para montar o lançamento.');
  const { object } = await generateObject({
    model: anthropic('claude-sonnet-5'),
    schema: pageSchema,
    system: 'Você extrai informações para uma página de empreendimento imobiliário. Use exclusivamente a fonte recebida. Não invente, não complete lacunas e não descarte fatos concretos relevantes. Organize todas as informações relevantes em português claro.',
    prompt: 'Página de referência: ' + url.href + '\n\nConteúdo extraído:\n' + sourceText,
  });
  return { pageContent: object, images: sourceImages(html, url.href) };
}
