'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

const LOCATION_LABELS = {
  salvador: 'Salvador · Bahia',
  'praia-do-forte': 'Praia do Forte · Bahia',
  itacimirim: 'Itacimirim · Bahia',
  guarajuba: 'Guarajuba · Bahia',
};

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

export async function createImovel(prevState, formData) {
  await assertAdmin();

  const titulo = formData.get('titulo')?.toString().trim();
  if (!titulo) return { error: 'Título é obrigatório.' };

  let slug = formData.get('slug')?.toString().trim();
  slug = slug ? slugify(slug) : slugify(titulo);
  if (!slug) return { error: 'Não foi possível gerar um slug a partir do título.' };

  const categoria = formData.get('categoria')?.toString();
  const localizacaoFiltro = formData.get('localizacao_filtro')?.toString();
  const localizacaoCustom = formData.get('localizacao_custom')?.toString().trim();
  const localizacao = localizacaoCustom || LOCATION_LABELS[localizacaoFiltro] || localizacaoFiltro;

  const modalidades = formData.getAll('modalidades');
  if (modalidades.length === 0) return { error: 'Selecione ao menos uma modalidade (venda ou temporada).' };

  const preco = Number(formData.get('preco'));
  const areaM2 = Number(formData.get('area_m2'));
  const suites = Number(formData.get('suites') || 0);
  const vagas = Number(formData.get('vagas') || 0);
  if (!preco || !areaM2) return { error: 'Preço e área são obrigatórios.' };

  const headline = formData.get('headline')?.toString().trim();
  const paragrafo1 = formData.get('paragrafo_1')?.toString().trim();
  if (!headline || !paragrafo1) return { error: 'Preencha o texto de apresentação do imóvel.' };
  const paragrafo2 = formData.get('paragrafo_2')?.toString().trim() || null;
  const eyebrow = formData.get('eyebrow')?.toString().trim() || 'Imóvel · Exclusivo';
  const areaLabel = formData.get('area_label')?.toString() || 'Área construída';
  const destaque = formData.get('destaque') === 'on';

  const specsExtra = [1, 2, 3]
    .map((i) => ({
      label: formData.get(`spec_${i}_label`)?.toString().trim(),
      value: formData.get(`spec_${i}_value`)?.toString().trim(),
    }))
    .filter((spec) => spec.label && spec.value);

  const admin = createAdminClient();

  const { data: existing } = await admin.from('imoveis').select('id').eq('slug', slug).maybeSingle();
  if (existing) return { error: `Já existe um imóvel com o endereço /imoveis/${slug}. Escolha outro.` };

  const photos = formData.getAll('fotos').filter((file) => file instanceof File && file.size > 0);
  if (photos.length === 0) return { error: 'Envie ao menos uma foto.' };

  const fotoUrls = [];
  for (let i = 0; i < photos.length; i += 1) {
    const file = photos[i];
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${slug}/${Date.now()}-${i}.${ext}`;
    const { error: uploadError } = await admin.storage.from('imoveis-fotos').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) return { error: `Erro ao enviar foto: ${uploadError.message}` };
    const { data: publicUrl } = admin.storage.from('imoveis-fotos').getPublicUrl(path);
    fotoUrls.push(publicUrl.publicUrl);
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
    specs_extra: specsExtra,
    fotos: fotoUrls,
    destaque,
  });

  if (insertError) return { error: `Erro ao salvar imóvel: ${insertError.message}` };

  revalidatePath('/imoveis');
  revalidatePath('/');
  revalidatePath('/admin/imoveis');
  redirect(`https://www.casacomleo.com.br/imoveis/${slug}`);
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

  const headline = formData.get('headline')?.toString().trim();
  const paragrafo1 = formData.get('paragrafo_1')?.toString().trim();
  if (!headline || !paragrafo1) return { error: 'Preencha o texto de apresentação da unidade.' };
  const paragrafo2 = formData.get('paragrafo_2')?.toString().trim() || null;
  const eyebrow = formData.get('eyebrow')?.toString().trim() || 'Studio · StudioHUB';
  const destaque = formData.get('destaque') === 'on';

  const specsExtra = [1, 2, 3]
    .map((i) => ({
      label: formData.get(`spec_${i}_label`)?.toString().trim(),
      value: formData.get(`spec_${i}_value`)?.toString().trim(),
    }))
    .filter((spec) => spec.label && spec.value);

  const admin = createAdminClient();

  const { data: existing } = await admin.from('studios').select('id').eq('slug', slug).maybeSingle();
  if (existing) return { error: `Já existe uma unidade com o endereço /studios/${slug}. Escolha outro.` };

  const photos = formData.getAll('fotos').filter((file) => file instanceof File && file.size > 0);
  if (photos.length === 0) return { error: 'Envie ao menos uma foto.' };

  const fotoUrls = [];
  for (let i = 0; i < photos.length; i += 1) {
    const file = photos[i];
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${slug}/${Date.now()}-${i}.${ext}`;
    const { error: uploadError } = await admin.storage.from('studios-fotos').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) return { error: `Erro ao enviar foto: ${uploadError.message}` };
    const { data: publicUrl } = admin.storage.from('studios-fotos').getPublicUrl(path);
    fotoUrls.push(publicUrl.publicUrl);
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
  redirect(`https://www.casacomleo.com.br/studios/${slug}`);
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
