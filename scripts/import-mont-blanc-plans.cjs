const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = {};
for (const line of fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8').split(/\r?\n/)) {
  const separator = line.indexOf('=');
  if (separator > 0) env[line.slice(0, separator)] = line.slice(separator + 1).replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const slug = 'mont-blanc-hill';
const sourceBase = 'https://azinunes.com.br/empreendimentos/mont-blanc-hill/plantas';
const plans = ['planta-tipo-01.jpg', 'planta-tipo-02.jpg', 'planta-tipo-03.jpg', 'planta-tipo-04.jpg'];

async function main() {
  const { data: imovel, error: readError } = await supabase.from('imoveis').select('id,fotos').eq('slug', slug).single();
  if (readError) throw readError;

  const photoUrls = [];
  for (const filename of plans) {
    const response = await fetch(`${sourceBase}/${filename}`);
    if (!response.ok) throw new Error(`Não foi possível obter ${filename} (${response.status}).`);

    const uploadPath = `${slug}/${filename}`;
    const { error: uploadError } = await supabase.storage.from('imoveis-fotos').upload(uploadPath, Buffer.from(await response.arrayBuffer()), {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (uploadError) throw uploadError;
    photoUrls.push(supabase.storage.from('imoveis-fotos').getPublicUrl(uploadPath).data.publicUrl);
  }

  const fotos = [...(imovel.fotos || []).filter((foto) => !/planta-tipo-\d/.test(foto)), ...photoUrls];
  const { error: updateError } = await supabase.from('imoveis').update({ fotos }).eq('id', imovel.id);
  if (updateError) throw updateError;

  console.log(JSON.stringify({ success: true, plantas: photoUrls.length }));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
