'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { enhanceImage } from '@/lib/image-enhance';
import { generatePropertyCopy, generateSurroundingsCopy } from '@/lib/generate-copy';
import { resolveMapEmbed, getNearbySurroundings, hasSurroundingsContent } from '@/lib/imoveis';
import { DEFAULT_HOME_HERO } from '@/lib/home-hero';
import { provisionLaunchDomain } from '@/lib/vercel-domains';
import { importLaunchReference } from '@/lib/launch-reference';

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function computeEntornoTexto({ mapaUrl, titulo, localizacao }) {
  if (!mapaUrl) return null;
  try {
    const mapEmbed = await resolveMapEmbed(mapaUrl);
    if (!mapEmbed) return null;
    const surroundings = await getNearbySurroundings(mapEmbed.lat, mapEmbed.lon);
    if (!hasSurroundingsContent(surroundings)) return null;
    const { texto } = await generateSurroundingsCopy({ localizacao, titulo, surroundings });
    return texto || null;
  } catch (err) {
    console.error('Erro ao gerar texto do entorno:', err);
    return null;
  }
}

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Não autorizado.');
  }
}

function plainTextFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function readPropertyReference(referenceUrl) {
  await assertAdmin();

  let url;
  try {
    url = new URL(referenceUrl);
  } catch {
    return { error: 'Informe um link válido.' };
  }
  if (!['http:', 'https:'].includes(url.protocol)) return { error: 'Use um link iniciado por http:// ou https://.' };
  if (['localhost', '127.0.0.1', '::1'].includes(url.hostname) || url.hostname.endsWith('.local')) {
    return { error: 'Use uma página pública como referência.' };
  }

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'CasaComLeo reference reader' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { error: `Não foi possível ler esse link (status ${response.status}).` };
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return { error: 'O link precisa apontar para uma página da web.' };
    const html = (await response.text()).slice(0, 120000);
    const description = plainTextFromHtml(html).slice(0, 7000);
    if (description.length < 80) return { error: 'Essa página não trouxe texto suficiente para preparar a apresentação.' };
    return { success: true, description };
  } catch (error) {
    console.error('Erro ao ler referência do imóvel:', error);
    return { error: 'Não foi possível ler esse link agora. Confira o endereço e tente novamente.' };
  }
}

export async function createUploadTickets(formData) {
  await assertAdmin();

  const bucket = formData.get('bucket')?.toString();
  const count = Number(formData.get('count') || 0);
  if (bucket !== 'imoveis-fotos' && bucket !== 'studios-fotos') return { error: 'Bucket inválido.' };
  if (!count || count < 1 || count > 30) return { error: 'Quantidade de fotos inválida.' };

  const admin = createAdminClient();
  const sessionId = crypto.randomUUID();
  const tickets = [];
  for (let i = 0; i < count; i += 1) {
    const path = `tmp/${sessionId}/${i}`;
    const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
    if (error) return { error: `Erro ao preparar upload: ${error.message}` };
    tickets.push({ path: data.path, signedUrl: data.signedUrl, token: data.token });
  }
  return { tickets };
}

export async function createLaunchBrief(formData) {
  await assertAdmin();
  const title = formData.get('title')?.toString().trim();
  const sourceMode = formData.get('source_mode')?.toString();
  const rawSubdomain = formData.get('subdomain')?.toString().trim() || title;
  const subdomain = slugify(rawSubdomain).replaceAll('-', '');
  if (!title || !subdomain || !['reference', 'manual'].includes(sourceMode)) return { error: 'Preencha o nome e escolha como deseja começar.' };
  if (sourceMode === 'reference' && !formData.get('reference_url')?.toString().trim()) return { error: 'Informe a URL de referência.' };
  if (sourceMode === 'manual' && (!formData.get('location')?.toString().trim() || !formData.get('description')?.toString().trim())) return { error: 'Preencha localização e apresentação.' };
  const admin = createAdminClient();
  const { data: current, error: readError } = await admin.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (readError) return { error: `Não foi possível abrir os lançamentos: ${readError.message}` };
  const launches = Array.isArray(current?.value) ? current.value : [];
  if (launches.some((launch) => launch.subdomain === subdomain)) return { error: 'Esse subdomínio já está reservado.' };
  const launch = {
    id: crypto.randomUUID(), title, subdomain, source_mode: sourceMode, status: 'briefing', created_at: new Date().toISOString(),
    reference_url: formData.get('reference_url')?.toString().trim() || null,
    reference_notes: formData.get('reference_notes')?.toString().trim() || null,
    location: formData.get('location')?.toString().trim() || null,
    developer: formData.get('developer')?.toString().trim() || null,
    description: formData.get('description')?.toString().trim() || null,
    highlights: formData.get('highlights')?.toString().trim() || null,
    assets_url: formData.get('assets_url')?.toString().trim() || null,
  };
  const { error } = await admin.from('site_content').upsert({ key: 'launches', value: [...launches, launch], updated_at: new Date().toISOString() });
  if (error) return { error: `Erro ao salvar lançamento: ${error.message}` };
  revalidatePath('/admin/lancamentos');
  return { success: true, url: `https://${subdomain}.casacomleo.com.br` };
}

export async function publishPropertyLaunchPage(formData) {
  await assertAdmin();
  const propertyId = formData.get('property_id')?.toString();
  const subdomain = slugify(formData.get('subdomain')?.toString().trim() || '').replaceAll('-', '');
  const referenceUrl = formData.get('reference_url')?.toString().trim() || null;
  if (!propertyId || !subdomain) return { error: 'Informe o subdomínio da página.' };

  const admin = createAdminClient();
  const { data: property, error: propertyError } = await admin
    .from('imoveis')
    .select('id, slug, titulo, localizacao, headline, paragrafo_1, paragrafo_2, reference_url')
    .eq('id', propertyId)
    .maybeSingle();
  if (propertyError || !property) return { error: 'Imóvel não encontrado.' };

  const { data: current, error: readError } = await admin.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (readError) return { error: 'Não foi possível abrir as páginas de lançamento: ' + readError.message };
  const launches = Array.isArray(current?.value) ? current.value : [];
  const existing = launches.find((launch) => launch.property_slug === property.slug);
  const owner = launches.find((launch) => launch.subdomain === subdomain && launch.property_slug !== property.slug);
  if (owner) return { error: 'Esse subdomínio já está sendo usado por outro imóvel.' };

  const domain = await provisionLaunchDomain(subdomain);
  if (domain.error) return domain;

  const now = new Date().toISOString();
  const launch = {
    ...(existing || {}),
    id: existing?.id || crypto.randomUUID(),
    title: property.titulo,
    property_slug: property.slug,
    subdomain,
    source_mode: referenceUrl || property.reference_url ? 'reference' : 'manual',
    reference_url: referenceUrl || property.reference_url || null,
    location: property.localizacao,
    description: [property.headline, property.paragrafo_1, property.paragrafo_2].filter(Boolean).join(' '),
    status: 'published',
    created_at: existing?.created_at || now,
    published_at: now,
    updated_at: now,
  };
  const updated = existing
    ? launches.map((item) => (item.id === existing.id ? launch : item))
    : [...launches, launch];
  const { error: saveError } = await admin.from('site_content').upsert({ key: 'launches', value: updated, updated_at: now });
  if (saveError) return { error: 'Não foi possível salvar a página de lançamento: ' + saveError.message };

  revalidatePath('/admin/imoveis');
  revalidatePath('/lancamentos');
  revalidatePath('/lancamentos/' + subdomain);
  revalidatePath('/imoveis/' + property.slug);
  return { success: true, url: 'https://' + subdomain + '.casacomleo.com.br' };
}

export async function importAndPublishPropertyLaunchPage(formData) {
  await assertAdmin();
  const propertyId = formData.get('property_id')?.toString();
  const subdomain = slugify(formData.get('subdomain')?.toString().trim() || '').replaceAll('-', '');
  const referenceUrl = formData.get('reference_url')?.toString().trim();
  if (!propertyId || !subdomain || !referenceUrl) return { error: 'Informe o subdomínio e o link de referência.' };

  const admin = createAdminClient();
  const { data: property, error: propertyError } = await admin.from('imoveis').select('id, slug, titulo, localizacao, headline, paragrafo_1, paragrafo_2').eq('id', propertyId).maybeSingle();
  if (propertyError || !property) return { error: 'Imóvel não encontrado.' };

  let imported;
  try {
    imported = await importLaunchReference(referenceUrl);
  } catch (error) {
    console.error('Erro ao importar referência do lançamento:', error);
    return { error: error.message || 'Não foi possível importar a página de referência.' };
  }

  const { data: current, error: readError } = await admin.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (readError) return { error: 'Não foi possível abrir as páginas de lançamento: ' + readError.message };
  const launches = Array.isArray(current?.value) ? current.value : [];
  const existing = launches.find((launch) => launch.property_slug === property.slug);
  const owner = launches.find((launch) => launch.subdomain === subdomain && launch.property_slug !== property.slug);
  if (owner) return { error: 'Esse subdomínio já está sendo usado por outro imóvel.' };

  const domain = await provisionLaunchDomain(subdomain);
  if (domain.error) return domain;
  const now = new Date().toISOString();
  const launch = {
    ...(existing || {}),
    id: existing?.id || crypto.randomUUID(),
    title: imported.pageContent.title || property.titulo,
    property_slug: property.slug,
    subdomain,
    source_mode: 'reference',
    reference_url: referenceUrl,
    location: property.localizacao,
    description: imported.pageContent.summary || [property.headline, property.paragrafo_1, property.paragrafo_2].filter(Boolean).join(' '),
    page_content: imported.pageContent,
    source_images: imported.images,
    status: 'published',
    created_at: existing?.created_at || now,
    published_at: now,
    updated_at: now,
  };
  const updated = existing ? launches.map((item) => (item.id === existing.id ? launch : item)) : [...launches, launch];
  const { error: saveError } = await admin.from('site_content').upsert({ key: 'launches', value: updated, updated_at: now });
  if (saveError) return { error: 'Não foi possível salvar a página de lançamento: ' + saveError.message };

  revalidatePath('/admin/imoveis');
  revalidatePath('/lancamentos');
  revalidatePath('/lancamentos/' + subdomain);
  return { success: true, url: 'https://' + subdomain + '.casacomleo.com.br' };
}

export async function updateLaunchSoldPercentage(propertySlug, percentage) {
  await assertAdmin();
  const soldPercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
  const admin = createAdminClient();
  const { data: current, error: readError } = await admin.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (readError) throw new Error('Não foi possível abrir os lançamentos.');
  const launches = Array.isArray(current?.value) ? current.value : [];
  const updated = launches.map((launch) => (launch.property_slug === propertySlug || launch.id === propertySlug) ? { ...launch, sold_percentage: soldPercentage } : launch);
  if (updated.every((launch) => launch.property_slug !== propertySlug && launch.id !== propertySlug)) throw new Error('Lançamento não encontrado.');
  const { error } = await admin.from('site_content').upsert({ key: 'launches', value: updated, updated_at: new Date().toISOString() });
  if (error) throw new Error('Não foi possível salvar o percentual vendido.');
  revalidatePath('/admin/imoveis');
  revalidatePath('/admin/lancamentos');
}

export async function toggleLaunchSold(formData) {
  const id = formData.get('id')?.toString();
  const sold = formData.get('sold') === 'true';
  if (!id) return;
  return updateLaunchSoldPercentage(id, sold ? 100 : 0);
}

export async function publishLaunch(id) {
  await assertAdmin();
  const admin = createAdminClient();
  const { data: current, error: readError } = await admin.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (readError) return { error: 'Não foi possível abrir os lançamentos.' };
  const launches = Array.isArray(current?.value) ? current.value : [];
  const launch = launches.find((item) => item.id === id);
  if (!launch) return { error: 'Lançamento não encontrado.' };
  const domain = await provisionLaunchDomain(launch.subdomain);
  if (domain.error) return domain;
  const updated = launches.map((item) => item.id === id ? { ...item, status: 'published', published_at: new Date().toISOString() } : item);
  const { error } = await admin.from('site_content').upsert({ key: 'launches', value: updated, updated_at: new Date().toISOString() });
  if (error) return { error: 'Não foi possível publicar o lançamento.' };
  revalidatePath('/admin/lancamentos');
  revalidatePath('/lancamentos');
  revalidatePath(`/lancamentos/${launch.subdomain}`);
  return { success: true, url: `https://${launch.subdomain}.casacomleo.com.br` };
}

export async function updateLaunchBrief(formData) {
  await assertAdmin();
  const id = formData.get('id')?.toString();
  const title = formData.get('title')?.toString().trim();
  const sourceMode = formData.get('source_mode')?.toString();
  if (!id || !title || !['reference', 'manual'].includes(sourceMode)) return { error: 'Preencha o nome e o modo de cadastro.' };
  if (sourceMode === 'reference' && !formData.get('reference_url')?.toString().trim()) return { error: 'Informe a URL de referência.' };
  if (sourceMode === 'manual' && (!formData.get('location')?.toString().trim() || !formData.get('description')?.toString().trim())) return { error: 'Preencha localização e apresentação.' };
  const admin = createAdminClient();
  const { data: current, error: readError } = await admin.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (readError) return { error: 'Não foi possível abrir os lançamentos.' };
  const launches = Array.isArray(current?.value) ? current.value : [];
  const existing = launches.find((launch) => launch.id === id);
  if (!existing) return { error: 'Lançamento não encontrado.' };
  const updatedLaunch = {
    ...existing,
    title,
    source_mode: sourceMode,
    reference_url: formData.get('reference_url')?.toString().trim() || null,
    reference_notes: formData.get('reference_notes')?.toString().trim() || null,
    location: formData.get('location')?.toString().trim() || null,
    developer: formData.get('developer')?.toString().trim() || null,
    description: formData.get('description')?.toString().trim() || null,
    highlights: formData.get('highlights')?.toString().trim() || null,
    assets_url: formData.get('assets_url')?.toString().trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin.from('site_content').upsert({ key: 'launches', value: launches.map((launch) => launch.id === id ? updatedLaunch : launch), updated_at: new Date().toISOString() });
  if (error) return { error: 'Não foi possível salvar o briefing.' };
  revalidatePath('/admin/lancamentos');
  revalidatePath(`/lancamentos/${existing.subdomain}`);
  return { success: true };
}

export async function deleteLaunchBrief(formData) {
  await assertAdmin();
  const id = formData.get('id')?.toString();
  if (!id) return { error: 'Lançamento não encontrado.' };
  const admin = createAdminClient();
  const { data: current, error: readError } = await admin.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (readError) return { error: 'Não foi possível abrir os lançamentos.' };
  const launches = Array.isArray(current?.value) ? current.value : [];
  const launch = launches.find((item) => item.id === id);
  if (!launch) return { error: 'Lançamento não encontrado.' };
  const { error } = await admin.from('site_content').upsert({ key: 'launches', value: launches.filter((item) => item.id !== id), updated_at: new Date().toISOString() });
  if (error) return { error: 'Não foi possível excluir o briefing.' };
  revalidatePath('/admin/lancamentos');
  revalidatePath(`/lancamentos/${launch.subdomain}`);
  return { success: true };
}

export async function updateHomeHero(formData) {
  await assertAdmin();
  const required = ['kicker', 'titleLineOne', 'titleLineTwo', 'intro', 'ctaLabel'];
  const copy = Object.fromEntries(required.map((key) => [key, formData.get(key)?.toString().trim() || '']));
  if (Object.values(copy).some((value) => !value)) return { error: 'Preencha todos os textos da sessão.' };
  let imagePaths = {};
  try { imagePaths = JSON.parse(formData.get('image_paths')?.toString() || '{}'); } catch { return { error: 'Não foi possível ler as imagens enviadas.' }; }
  const admin = createAdminClient();
  const { data: current } = await admin.from('site_content').select('value').eq('key', 'home_hero').maybeSingle();
  const existing = current?.value?.scenes || DEFAULT_HOME_HERO.scenes;
  const scenes = [];
  for (let index = 0; index < 3; index += 1) {
    const number = index + 1;
    const scene = { label: formData.get(`scene-${number}-label`)?.toString().trim(), alt: formData.get(`scene-${number}-alt`)?.toString().trim(), desktop: existing[index]?.desktop || '', mobile: existing[index]?.mobile || '' };
    if (!scene.label || !scene.alt) return { error: `Preencha o rótulo e a descrição da cena ${number}.` };
    for (const format of ['desktop', 'mobile']) {
      const tempPath = imagePaths[`scene-${number}-${format}`];
      if (!tempPath) continue;
      const { data: downloaded, error: downloadError } = await admin.storage.from('imoveis-fotos').download(tempPath);
      if (downloadError) return { error: `Erro ao processar a imagem: ${downloadError.message}` };
      const original = Buffer.from(await downloaded.arrayBuffer()); const enhanced = await enhanceImage(original); const content = enhanced ? enhanced.buffer : original; const extension = enhanced ? enhanced.extension : 'jpg';
      const path = `home-hero/${number}/${format}-${Date.now()}.${extension}`;
      const { error: uploadError } = await admin.storage.from('imoveis-fotos').upload(path, content, { contentType: enhanced ? enhanced.contentType : downloaded.type, upsert: false });
      if (uploadError) return { error: `Erro ao salvar a imagem: ${uploadError.message}` };
      scene[format] = admin.storage.from('imoveis-fotos').getPublicUrl(path).data.publicUrl;
      await admin.storage.from('imoveis-fotos').remove([tempPath]);
    }
    if (!scene.desktop) return { error: `Envie uma imagem desktop para a cena ${number}.` };
    scenes.push(scene);
  }
  const { error } = await admin.from('site_content').upsert({ key: 'home_hero', value: { ...copy, scenes }, updated_at: new Date().toISOString() });
  if (error) return { error: `Erro ao salvar a sessão: ${error.message}` };
  revalidatePath('/'); revalidatePath('/admin/home'); return { success: true };
}

export async function createLocalizacao(prevState, formData) {
  await assertAdmin();

  const nome = formData.get('nome')?.toString().trim();
  if (!nome) return { error: 'Nome é obrigatório.' };

  const slug = slugify(nome);
  if (!slug) return { error: 'Não foi possível gerar um identificador a partir do nome.' };

  const admin = createAdminClient();
  const { data: existing } = await admin.from('localizacoes').select('id').eq('slug', slug).maybeSingle();
  if (existing) return { error: 'Essa localização já existe.' };

  const { error: insertError } = await admin.from('localizacoes').insert({ nome, slug });
  if (insertError) return { error: `Erro ao salvar localização: ${insertError.message}` };

  revalidatePath('/admin/imoveis/localizacoes');
  revalidatePath('/admin/imoveis/novo');
  revalidatePath('/imoveis');
  revalidatePath('/');
  return { success: true };
}

export async function createImovel(prevState, formData) {
  await assertAdmin();

  const titulo = formData.get('titulo')?.toString().trim();
  if (!titulo) return { error: 'Título é obrigatório.' };

  const categoria = formData.get('categoria')?.toString();
  const localizacaoFiltro = formData.get('localizacao_filtro')?.toString();
  if (!localizacaoFiltro) return { error: 'Selecione a localização.' };

  const modalidades = formData.getAll('modalidades');
  if (modalidades.length === 0) return { error: 'Selecione ao menos uma modalidade (venda ou temporada).' };

  const preco = Number(formData.get('preco'));
  const areaM2 = Number(formData.get('area_m2'));
  const areaTotalM2 = Number(formData.get('area_total_m2') || 0);
  const quartos = Number(formData.get('quartos') || 0);
  const suites = Number(formData.get('suites') || 0);
  const vagas = Number(formData.get('vagas') || 0);
  const valorSobConsulta = formData.get('valor_sob_consulta') === 'on';
  if ((!preco && !valorSobConsulta) || !areaM2) return { error: 'Informe o preço ou marque “Valor sob consulta”, além da área.' };

  const headline = formData.get('headline')?.toString().trim();
  if (!headline) return { error: 'Preencha a frase de destaque.' };
  const descricao = formData.get('descricao')?.toString().trim();
  if (!descricao) return { error: 'Descreva o imóvel.' };
  const eyebrow = formData.get('eyebrow')?.toString().trim() || 'Imóvel · Exclusivo';
  const destaque = formData.get('destaque') === 'on';
  const isLaunch = formData.get('is_launch') === 'on';
  const referenceUrl = formData.get('reference_url')?.toString().trim() || null;
  const mapaUrl = formData.get('mapa_url')?.toString().trim() || null;

  let manualSpecsExtra;
  try {
    manualSpecsExtra = JSON.parse(formData.get('specs_extra')?.toString() || '[]');
  } catch {
    manualSpecsExtra = [];
  }
  if (!Array.isArray(manualSpecsExtra)) manualSpecsExtra = [];
  manualSpecsExtra = manualSpecsExtra
    .map((spec) => ({
      value: spec?.value?.toString().trim() || '',
      label: spec?.label?.toString().trim() || '',
    }))
    .filter((spec) => spec.value || spec.label);

  const admin = createAdminClient();

  const { data: localizacaoRow } = await admin.from('localizacoes').select('nome').eq('slug', localizacaoFiltro).maybeSingle();
  if (!localizacaoRow) return { error: 'Localização inválida.' };
  const localizacao = `${localizacaoRow.nome} · Bahia`;

  let paragrafo1;
  let paragrafo2;
  let entornoTexto;
  try {
    const [copy, entorno] = await Promise.all([
      generatePropertyCopy({ ideiaCentral: descricao, fraseDestaque: headline, titulo, localizacao, tipo: 'imóvel' }),
      computeEntornoTexto({ mapaUrl, titulo, localizacao }),
    ]);
    paragrafo1 = copy.paragrafo_1;
    paragrafo2 = copy.paragrafo_2 || null;
    entornoTexto = entorno;
  } catch (aiError) {
    console.error('Erro ao gerar copy com IA:', aiError);
    return { error: 'Não foi possível gerar o texto automático agora. Tente novamente em instantes.' };
  }
  const baseSlug = slugify(titulo);
  if (!baseSlug) return { error: 'Não foi possível gerar um endereço de página a partir do título identificado.' };
  let slug = baseSlug;
  let suffix = 2;
  for (;;) {
    const { data: existing } = await admin.from('imoveis').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  let fotoPaths;
  try {
    fotoPaths = JSON.parse(formData.get('foto_paths')?.toString() || '[]');
  } catch {
    fotoPaths = [];
  }
  if (!Array.isArray(fotoPaths) || fotoPaths.length === 0) return { error: 'Envie ao menos uma foto.' };

  const fotoUrls = [];
  for (let i = 0; i < fotoPaths.length; i += 1) {
    const tempPath = fotoPaths[i];
    const { data: downloaded, error: downloadError } = await admin.storage.from('imoveis-fotos').download(tempPath);
    if (downloadError) return { error: `Erro ao processar foto: ${downloadError.message}` };
    const originalBuffer = Buffer.from(await downloaded.arrayBuffer());
    const enhanced = await enhanceImage(originalBuffer);
    const uploadBuffer = enhanced ? enhanced.buffer : originalBuffer;
    const contentType = enhanced ? enhanced.contentType : downloaded.type;
    const ext = enhanced ? enhanced.extension : 'jpg';
    const path = `${slug}/${Date.now()}-${i}.${ext}`;
    const { error: uploadError } = await admin.storage.from('imoveis-fotos').upload(path, uploadBuffer, {
      contentType,
      upsert: false,
    });
    if (uploadError) return { error: `Erro ao enviar foto: ${uploadError.message}` };
    const { data: publicUrl } = admin.storage.from('imoveis-fotos').getPublicUrl(path);
    fotoUrls.push(publicUrl.publicUrl);
    await admin.storage.from('imoveis-fotos').remove([tempPath]);
  }

  const { data: inserted, error: insertError } = await admin.from('imoveis').insert({
    slug,
    titulo,
    eyebrow,
    localizacao,
    localizacao_filtro: localizacaoFiltro,
    categoria,
    modalidades,
    preco,
    area_m2: areaM2,
    area_total_m2: areaTotalM2 || null,
    quartos,
    suites,
    vagas,
    headline,
    paragrafo_1: paragrafo1,
    paragrafo_2: paragrafo2,
    specs_extra: manualSpecsExtra,
    fotos: fotoUrls,
    destaque,
    is_launch: isLaunch,
    reference_url: isLaunch ? referenceUrl : null,
    mapa_url: mapaUrl,
    entorno_texto: entornoTexto,
  }).select('id').single();

  if (insertError) return { error: `Erro ao salvar imóvel: ${insertError.message}` };

  revalidatePath('/imoveis');
  revalidatePath('/');
  revalidatePath('/admin/imoveis');
  return {
    success: true,
    slug,
    url: 'https://www.casacomleo.com.br/imoveis/' + slug,
    editUrl: isLaunch ? '/admin/imoveis/' + inserted.id + '/editar' : null,
  };
}

export async function updateImovel(formData) {
  await assertAdmin();

  const id = formData.get('id')?.toString();
  if (!id) return { error: 'Imóvel não encontrado.' };

  const admin = createAdminClient();
  const { data: existing } = await admin.from('imoveis').select('slug, mapa_url, entorno_texto').eq('id', id).maybeSingle();
  if (!existing) return { error: 'Imóvel não encontrado.' };
  const slug = existing.slug;

  const titulo = formData.get('titulo')?.toString().trim();
  if (!titulo) return { error: 'Título é obrigatório.' };

  const categoria = formData.get('categoria')?.toString();
  const localizacaoFiltro = formData.get('localizacao_filtro')?.toString();
  if (!localizacaoFiltro) return { error: 'Selecione a localização.' };
  const { data: localizacaoRow } = await admin.from('localizacoes').select('nome').eq('slug', localizacaoFiltro).maybeSingle();
  if (!localizacaoRow) return { error: 'Localização inválida.' };
  const localizacao = `${localizacaoRow.nome} · Bahia`;

  const modalidades = formData.getAll('modalidades');
  if (modalidades.length === 0) return { error: 'Selecione ao menos uma modalidade (venda ou temporada).' };

  const preco = Number(formData.get('preco'));
  const areaM2 = Number(formData.get('area_m2'));
  const areaTotalM2 = Number(formData.get('area_total_m2') || 0);
  const quartos = Number(formData.get('quartos') || 0);
  const suites = Number(formData.get('suites') || 0);
  const vagas = Number(formData.get('vagas') || 0);
  const valorSobConsulta = formData.get('valor_sob_consulta') === 'on';
  if ((!preco && !valorSobConsulta) || !areaM2) return { error: 'Informe o preço ou marque “Valor sob consulta”, além da área.' };

  const headline = formData.get('headline')?.toString().trim();
  if (!headline) return { error: 'Preencha a frase de destaque.' };
  const descricao = formData.get('descricao')?.toString().trim();
  if (!descricao) return { error: 'Descreva o imóvel.' };
  const eyebrow = formData.get('eyebrow')?.toString().trim() || 'Imóvel · Exclusivo';
  const destaque = formData.get('destaque') === 'on';
  const isLaunch = formData.get('is_launch') === 'on';
  const referenceUrl = formData.get('reference_url')?.toString().trim() || null;
  const vendido = formData.get('vendido') === 'on';
  const mapaUrl = formData.get('mapa_url')?.toString().trim() || null;

  let manualSpecsExtra;
  try {
    manualSpecsExtra = JSON.parse(formData.get('specs_extra')?.toString() || '[]');
  } catch {
    manualSpecsExtra = [];
  }
  if (!Array.isArray(manualSpecsExtra)) manualSpecsExtra = [];
  manualSpecsExtra = manualSpecsExtra
    .map((spec) => ({
      value: spec?.value?.toString().trim() || '',
      label: spec?.label?.toString().trim() || '',
    }))
    .filter((spec) => spec.value || spec.label);

  let paragrafo1;
  let paragrafo2;
  let entornoTexto = mapaUrl === existing.mapa_url ? existing.entorno_texto : undefined;
  try {
    const [copy, entorno] = await Promise.all([
      generatePropertyCopy({ ideiaCentral: descricao, fraseDestaque: headline, titulo, localizacao, tipo: 'imóvel' }),
      entornoTexto === undefined ? computeEntornoTexto({ mapaUrl, titulo, localizacao }) : Promise.resolve(entornoTexto),
    ]);
    paragrafo1 = copy.paragrafo_1;
    paragrafo2 = copy.paragrafo_2 || null;
    entornoTexto = entorno;
  } catch (aiError) {
    console.error('Erro ao gerar copy com IA:', aiError);
    return { error: 'Não foi possível gerar o texto automático agora. Tente novamente em instantes.' };
  }
  let fotos;
  try {
    fotos = JSON.parse(formData.get('fotos_atuais')?.toString() || '[]');
  } catch {
    fotos = [];
  }

  let novoFotoPaths;
  try {
    novoFotoPaths = JSON.parse(formData.get('foto_paths')?.toString() || '[]');
  } catch {
    novoFotoPaths = [];
  }

  for (let i = 0; i < novoFotoPaths.length; i += 1) {
    const tempPath = novoFotoPaths[i];
    const { data: downloaded, error: downloadError } = await admin.storage.from('imoveis-fotos').download(tempPath);
    if (downloadError) return { error: `Erro ao processar foto: ${downloadError.message}` };
    const originalBuffer = Buffer.from(await downloaded.arrayBuffer());
    const enhanced = await enhanceImage(originalBuffer);
    const uploadBuffer = enhanced ? enhanced.buffer : originalBuffer;
    const contentType = enhanced ? enhanced.contentType : downloaded.type;
    const ext = enhanced ? enhanced.extension : 'jpg';
    const path = `${slug}/${Date.now()}-${i}.${ext}`;
    const { error: uploadError } = await admin.storage.from('imoveis-fotos').upload(path, uploadBuffer, {
      contentType,
      upsert: false,
    });
    if (uploadError) return { error: `Erro ao enviar foto: ${uploadError.message}` };
    const { data: publicUrl } = admin.storage.from('imoveis-fotos').getPublicUrl(path);
    fotos.push(publicUrl.publicUrl);
    await admin.storage.from('imoveis-fotos').remove([tempPath]);
  }

  if (fotos.length === 0) return { error: 'O imóvel precisa de ao menos uma foto.' };

  const { error: updateError } = await admin
    .from('imoveis')
    .update({
      titulo,
      eyebrow,
      localizacao,
      localizacao_filtro: localizacaoFiltro,
      categoria,
      modalidades,
      preco,
      area_m2: areaM2,
      area_total_m2: areaTotalM2 || null,
      quartos,
      suites,
      vagas,
      headline,
      paragrafo_1: paragrafo1,
      paragrafo_2: paragrafo2,
      specs_extra: manualSpecsExtra,
      fotos,
      destaque,
      is_launch: isLaunch,
      reference_url: isLaunch ? referenceUrl : null,
      vendido,
      mapa_url: mapaUrl,
      entorno_texto: entornoTexto,
    })
    .eq('id', id);

  if (updateError) return { error: `Erro ao salvar alterações: ${updateError.message}` };

  revalidatePath('/imoveis');
  revalidatePath('/');
  revalidatePath('/admin/imoveis');
  revalidatePath(`/imoveis/${slug}`);
  return { success: true, slug, url: `https://www.casacomleo.com.br/imoveis/${slug}` };
}

export async function toggleVendido(formData) {
  await assertAdmin();
  const id = formData.get('id')?.toString();
  const slug = formData.get('slug')?.toString();
  const vendido = formData.get('vendido') === 'true';
  if (!id) return;

  const admin = createAdminClient();
  await admin.from('imoveis').update({ vendido }).eq('id', id);

  revalidatePath('/imoveis');
  revalidatePath('/');
  revalidatePath('/admin/imoveis');
  if (slug) revalidatePath(`/imoveis/${slug}`);
}

export async function toggleDestaque(formData) {
  await assertAdmin();
  const id = formData.get('id')?.toString();
  const slug = formData.get('slug')?.toString();
  const itemType = formData.get('item_type')?.toString();
  const destaque = formData.get('destaque') === 'on';
  if (!id) return;

  const admin = createAdminClient();
  let error;
  if (itemType === 'lancamento') {
    const { data: current, error: readError } = await admin.from('site_content').select('value').eq('key', 'launches').maybeSingle();
    if (readError) throw new Error(`Não foi possível abrir os lançamentos: ${readError.message}`);
    const launches = Array.isArray(current?.value) ? current.value : [];
    if (!launches.some((launch) => launch.id === id)) throw new Error('Lançamento não encontrado.');
    ({ error } = await admin.from('site_content').upsert({
      key: 'launches',
      value: launches.map((launch) => launch.id === id ? { ...launch, destaque } : launch),
      updated_at: new Date().toISOString(),
    }));
  } else {
    ({ error } = await admin.from('imoveis').update({ destaque }).eq('id', id));
  }
  if (error) throw new Error(`Não foi possível atualizar o destaque: ${error.message}`);

  revalidatePath('/');
  revalidatePath('/imoveis');
  revalidatePath('/admin/imoveis');
  if (itemType === 'lancamento') revalidatePath('/admin/lancamentos');
  if (slug) revalidatePath(`/imoveis/${slug}`);
}

export async function deleteImovel(formData) {
  await assertAdmin();
  const id = formData.get('id')?.toString();
  const slug = formData.get('slug')?.toString();
  if (!id) return;

  const admin = createAdminClient();
  await admin.from('imoveis').delete().eq('id', id);

  revalidatePath('/imoveis');
  revalidatePath('/');
  revalidatePath('/admin/imoveis');
  if (slug) revalidatePath(`/imoveis/${slug}`);
}

export async function createStudio(prevState, formData) {
  await assertAdmin();

  const titulo = formData.get('titulo')?.toString().trim();
  if (!titulo) return { error: 'Título é obrigatório.' };

  let slug = formData.get('slug')?.toString().trim();
  slug = slug ? slugify(slug) : slugify(titulo);
  if (!slug) return { error: 'Não foi possível gerar um slug a partir do título.' };

  const tipologia = formData.get('tipologia')?.toString();
  const localizacao = formData.get('localizacao')?.toString().trim();
  if (!localizacao) return { error: 'Localização é obrigatória.' };

  const preco = Number(formData.get('preco'));
  const areaM2 = Number(formData.get('area_m2'));
  if (!preco || !areaM2) return { error: 'Preço e área são obrigatórios.' };

  const ideiaCentral = formData.get('ideia_central')?.toString().trim();
  if (!ideiaCentral) return { error: 'Descreva a ideia central da unidade.' };
  const fraseDestaque = formData.get('frase_destaque')?.toString().trim() || undefined;

  let manualSpecsExtra;
  try {
    manualSpecsExtra = JSON.parse(formData.get('specs_extra')?.toString() || '[]');
  } catch {
    manualSpecsExtra = [];
  }
  if (!Array.isArray(manualSpecsExtra)) manualSpecsExtra = [];
  manualSpecsExtra = manualSpecsExtra
    .map((spec) => ({
      value: spec?.value?.toString().trim() || '',
      label: spec?.label?.toString().trim() || '',
    }))
    .filter((spec) => spec.value || spec.label);

  let headline;
  let paragrafo1;
  let paragrafo2;
  let specsExtra;
  try {
    const copy = await generatePropertyCopy({ ideiaCentral, fraseDestaque, titulo, localizacao, tipo: 'studio' });
    headline = copy.headline;
    paragrafo1 = copy.paragrafo_1;
    paragrafo2 = copy.paragrafo_2 || null;
    specsExtra = [...(copy.specs_extra || []), ...manualSpecsExtra];
  } catch (aiError) {
    console.error('Erro ao gerar copy com IA:', aiError);
    return { error: 'Não foi possível gerar o texto automático agora. Tente novamente em instantes.' };
  }
  const eyebrow = formData.get('eyebrow')?.toString().trim() || 'Studio · StudioHUB';
  const destaque = formData.get('destaque') === 'on';

  const admin = createAdminClient();

  const { data: existing } = await admin.from('studios').select('id').eq('slug', slug).maybeSingle();
  if (existing) return { error: `Já existe uma unidade com o endereço /studios/${slug}. Escolha outro.` };

  let fotoPaths;
  try {
    fotoPaths = JSON.parse(formData.get('foto_paths')?.toString() || '[]');
  } catch {
    fotoPaths = [];
  }
  if (!Array.isArray(fotoPaths) || fotoPaths.length === 0) return { error: 'Envie ao menos uma foto.' };

  const fotoUrls = [];
  for (let i = 0; i < fotoPaths.length; i += 1) {
    const tempPath = fotoPaths[i];
    const { data: downloaded, error: downloadError } = await admin.storage.from('studios-fotos').download(tempPath);
    if (downloadError) return { error: `Erro ao processar foto: ${downloadError.message}` };
    const originalBuffer = Buffer.from(await downloaded.arrayBuffer());
    const enhanced = await enhanceImage(originalBuffer);
    const uploadBuffer = enhanced ? enhanced.buffer : originalBuffer;
    const contentType = enhanced ? enhanced.contentType : downloaded.type;
    const ext = enhanced ? enhanced.extension : 'jpg';
    const path = `${slug}/${Date.now()}-${i}.${ext}`;
    const { error: uploadError } = await admin.storage.from('studios-fotos').upload(path, uploadBuffer, {
      contentType,
      upsert: false,
    });
    if (uploadError) return { error: `Erro ao enviar foto: ${uploadError.message}` };
    const { data: publicUrl } = admin.storage.from('studios-fotos').getPublicUrl(path);
    fotoUrls.push(publicUrl.publicUrl);
    await admin.storage.from('studios-fotos').remove([tempPath]);
  }

  const { error: insertError } = await admin.from('studios').insert({
    slug,
    titulo,
    eyebrow,
    tipologia,
    localizacao,
    preco,
    area_m2: areaM2,
    headline,
    paragrafo_1: paragrafo1,
    paragrafo_2: paragrafo2,
    specs_extra: specsExtra,
    fotos: fotoUrls,
    destaque,
  });

  if (insertError) return { error: `Erro ao salvar unidade: ${insertError.message}` };

  revalidatePath('/studios');
  revalidatePath('/admin/studios');
  return { success: true, slug, url: `https://www.casacomleo.com.br/studios/${slug}` };
}

export async function deleteStudio(formData) {
  await assertAdmin();
  const id = formData.get('id')?.toString();
  const slug = formData.get('slug')?.toString();
  if (!id) return;

  const admin = createAdminClient();
  await admin.from('studios').delete().eq('id', id);

  revalidatePath('/studios');
  revalidatePath('/admin/studios');
  if (slug) revalidatePath(`/studios/${slug}`);
}

export async function updateLead(formData) {
  await assertAdmin();
  const id = formData.get('id')?.toString();
  if (!id) return;

  const updates = {};
  if (formData.has('status')) updates.status = formData.get('status').toString();
  if (formData.has('intencao')) updates.intencao = formData.get('intencao').toString();
  if (formData.has('notas')) updates.notas = formData.get('notas').toString().slice(0, 2000);
  if (Object.keys(updates).length === 0) return;

  const admin = createAdminClient();
  await admin.from('leads').update(updates).eq('id', id);

  revalidatePath('/admin/leads');
  revalidatePath('/admin');
}

export async function deleteLead(formData) {
  await assertAdmin();
  const id = formData.get('id')?.toString();
  if (!id) return;

  const admin = createAdminClient();
  await admin.from('leads').delete().eq('id', id);

  revalidatePath('/admin/leads');
  revalidatePath('/admin');
}
