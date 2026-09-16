const PROJECT = 'casa-com-leo';
const TEAM_ID = 'team_gLu1nj9q7bspPnnFxNE5WIKF';

export async function provisionLaunchDomain(subdomain) {
  const token = process.env.VERCEL_AUTOMATION_TOKEN;
  if (!token) return { error: 'A automação de subdomínios ainda precisa da credencial do Vercel.' };

  const hostname = `${subdomain}.casacomleo.com.br`;
  const endpoint = `https://api.vercel.com/v9/projects/${PROJECT}/domains?teamId=${TEAM_ID}`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: hostname }),
      cache: 'no-store',
    });
    if (!response.ok && response.status !== 409) return { error: 'Não foi possível reservar o subdomínio no Vercel.' };
    return { hostname };
  } catch {
    return { error: 'Não foi possível conectar ao Vercel para reservar o subdomínio.' };
  }
}
