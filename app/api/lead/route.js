import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const nome = body.nome?.toString().trim().slice(0, 200);
  const contato = body.contato?.toString().trim().slice(0, 200) || null;
  const mensagem = body.mensagem?.toString().trim().slice(0, 2000) || null;
  const origem = body.origem?.toString().trim().slice(0, 300) || '/';
  if (!nome) return new Response(null, { status: 400 });

  const admin = createAdminClient();
  await admin.from('leads').insert({ nome, contato, mensagem, origem });

  return new Response(null, { status: 204 });
}
