'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { enhanceImage } from '@/lib/image-enhance';
import { generatePropertyCopy } from '@/lib/generate-copy';

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
  const suites = Number(formData.get('suites') || 0);
  const vagas = Number(formData.get('vagas') || 0);
  if (!preco || !areaM2) return { error: 'Preço e área são obrigatórios.' };

  const headline = formData.get('headline')?.toString().trim();
  if (!headline) return { error: 'Preencha a frase de destaque.' };
  const descricao = formData.get('descricao')?.toString().trim();
  if (!descricao) return { error: 'Descreva o imóvel.' };
  const eyebrow = formData.get('eyebrow')?.toString().trim() || 'Imóvel · Exclusivo';
  const areaLabel = formData.get('area_label')?.toString() || 'Área construída';
  const destaque = formData.get('destaque') === 'on';
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
  try {
    const copy = await generatePropertyCopy({ ideiaCentral: descricao, fraseDestaque: headline, titulo, localizacao, tipo: 'imóvel' });
    paragrafo1 = copy.paragrafo_1;
    paragrafo2 = copy.paragrafo_2 || null;
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

  const { error: insertError } = await admin.from('imoveis').insert({
    slug,
    titulo,
    eyebrow,
    localizacao,
    localizacao_filtro: localizacaoFiltro,
    categoria,
    modalidades,
    preco,
    area_m2: areaM2,
    area_label: areaLabel,
    suites,
    vagas,
    headline,
    paragrafo_1: paragrafo1,
    paragrafo_2: paragrafo2,
    specs_extra: manualSpecsExtra,
    fotos: fotoUrls,
    destaque,
    mapa_url: mapaUrl,
  });

  if (insertError) return { error: `Erro ao salvar imóvel: ${insertError.message}` };

  revalidatePath('/imoveis');
  revalidatePath('/');
  revalidatePath('/admin/imoveis');
  return { success: true, slug, url: `https://www.casacomleo.com.br/imoveis/${slug}` };
}

export async function updateImovel(formData) {
  await assertAdmin();

  const id = formData.get('id')?.toString();
  if (!id) return { error: 'Imóvel não encontrado.' };

  const admin = createAdminClient();
  const { data: existing } = await admin.from('imoveis').select('slug').eq('id', id).maybeSingle();
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
  const suites = Number(formData.get('suites') || 0);
  const vagas = Number(formData.get('vagas') || 0);
  if (!preco || !areaM2) return { error: 'Preço e área são obrigatórios.' };

  const headline = formData.get('headline')?.toString().trim();
  if (!headline) return { error: 'Preencha a frase de destaque.' };
  const descricao = formData.get('descricao')?.toString().trim();
  if (!descricao) return { error: 'Descreva o imóvel.' };
  const eyebrow = formData.get('eyebrow')?.toString().trim() || 'Imóvel · Exclusivo';
  const areaLabel = formData.get('area_label')?.toString() || 'Área construída';
  const destaque = formData.get('destaque') === 'on';
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
  try {
    const copy = await generatePropertyCopy({ ideiaCentral: descricao, fraseDestaque: headline, titulo, localizacao, tipo: 'imóvel' });
    paragrafo1 = copy.paragrafo_1;
    paragrafo2 = copy.paragrafo_2 || null;
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
      area_label: areaLabel,
      suites,
      vagas,
      headline,
      paragrafo_1: paragrafo1,
      paragrafo_2: paragrafo2,
      specs_extra: manualSpecsExtra,
      fotos,
      destaque,
      vendido,
      mapa_url: mapaUrl,
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
