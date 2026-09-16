import { deleteLaunchBrief, updateLaunchBrief } from '@/app/admin/actions';

export default function LaunchBriefActions({ launch }) {
  return <div className="admin-launch-brief-actions">
    <details>
      <summary>Editar briefing</summary>
      <form action={updateLaunchBrief} className="admin-launch-edit-form">
        <input type="hidden" name="id" value={launch.id} />
        <div className="admin-form-row"><label>Nome<input name="title" required defaultValue={launch.title} /></label><label>Modo<select name="source_mode" defaultValue={launch.source_mode}><option value="reference">Referência</option><option value="manual">Manual</option></select></label></div>
        <p className="admin-hint">Endereço reservado: {launch.subdomain}.casacomleo.com.br</p>
        <label>URL de referência<input name="reference_url" type="url" defaultValue={launch.reference_url || ''} placeholder="https://..." /></label>
        <label>Orientações da referência<textarea name="reference_notes" defaultValue={launch.reference_notes || ''} /></label>
        <div className="admin-form-row"><label>Localização<input name="location" defaultValue={launch.location || ''} /></label><label>Incorporadora / construtora<input name="developer" defaultValue={launch.developer || ''} /></label></div>
        <label>Apresentação<textarea name="description" defaultValue={launch.description || ''} /></label>
        <label>Dados principais<input name="highlights" defaultValue={launch.highlights || ''} /></label>
        <label>Link ou pasta com imagens<input name="assets_url" type="url" defaultValue={launch.assets_url || ''} placeholder="https://..." /></label>
        <button className="button" type="submit">Salvar alterações</button>
      </form>
    </details>
    <form action={deleteLaunchBrief}><input type="hidden" name="id" value={launch.id} /><button className="admin-launch-delete" type="submit">Excluir briefing</button></form>
  </div>;
}
