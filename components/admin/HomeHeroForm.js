'use client';

import { useState } from 'react';
import { createUploadTickets, updateHomeHero } from '@/app/admin/actions';
import { uploadFilesWithProgress } from '@/lib/client-upload';

const IMAGE_KEYS = ['scene-1-desktop', 'scene-1-mobile', 'scene-2-desktop', 'scene-2-mobile', 'scene-3-desktop', 'scene-3-mobile'];

export default function HomeHeroForm({ hero }) {
  const [files, setFiles] = useState({}); const [pending, setPending] = useState(false); const [message, setMessage] = useState(null); const [progress, setProgress] = useState(null);
  async function submit(event) {
    event.preventDefault(); setPending(true); setMessage(null); setProgress(null);
    const formData = new FormData(event.currentTarget); const selected = IMAGE_KEYS.map((key) => ({ key, file: files[key] })).filter((item) => item.file); const paths = {};
    if (selected.length) {
      const ticketData = new FormData(); ticketData.set('bucket', 'imoveis-fotos'); ticketData.set('count', String(selected.length));
      const tickets = await createUploadTickets(ticketData);
      if (tickets?.error) { setMessage({ error: tickets.error }); setPending(false); return; }
      const results = await uploadFilesWithProgress(tickets.tickets, selected.map((item) => item.file), setProgress);
      results.forEach((result, index) => { if (result.ok) paths[selected[index].key] = result.path; });
      if (results.some((result) => !result.ok)) { setMessage({ error: 'Uma ou mais imagens não puderam ser enviadas. Tente novamente.' }); setPending(false); return; }
    }
    formData.set('image_paths', JSON.stringify(paths)); const result = await updateHomeHero(formData); setPending(false); setProgress(null);
    setMessage(result?.error ? { error: result.error } : { success: 'Sessão 1 atualizada. A home já está usando o novo conteúdo.' });
  }
  return <form className="admin-form admin-home-form" onSubmit={submit}>
    <div className="admin-form-section"><h2>Sessão 1 · Abertura da home</h2><p className="admin-hint">Envie uma imagem horizontal para desktop e uma vertical para mobile em cada cena. Se o campo mobile ficar vazio, a imagem de desktop será usada.</p><div className="admin-form-row"><label>Texto de apoio<input name="kicker" defaultValue={hero.kicker} required /></label><label>Texto do botão<input name="ctaLabel" defaultValue={hero.ctaLabel} required /></label></div><div className="admin-form-row"><label>Primeira linha do título<input name="titleLineOne" defaultValue={hero.titleLineOne} required /></label><label>Segunda linha do título<input name="titleLineTwo" defaultValue={hero.titleLineTwo} required /></label></div><label>Texto de apresentação<textarea name="intro" defaultValue={hero.intro} required /></label></div>
    {hero.scenes.map((scene, index) => <section className="admin-form-section admin-home-scene" key={index}><h2>Cena {index + 1}</h2><div className="admin-form-row"><label>Rótulo da cena<input name={`scene-${index + 1}-label`} defaultValue={scene.label} required /></label><label>Descrição da imagem<input name={`scene-${index + 1}-alt`} defaultValue={scene.alt} required /></label></div><div className="admin-home-image-grid"><label className="admin-home-image-field">Imagem desktop <span>Horizontal · recomendado 1920 × 1080</span><input type="file" accept="image/*" onChange={(event) => setFiles((current) => ({ ...current, [`scene-${index + 1}-desktop`]: event.target.files?.[0] }))} />{scene.desktop && <img src={scene.desktop} alt="Prévia da imagem desktop" />}</label><label className="admin-home-image-field">Imagem mobile <span>Vertical · recomendado 1080 × 1440</span><input type="file" accept="image/*" onChange={(event) => setFiles((current) => ({ ...current, [`scene-${index + 1}-mobile`]: event.target.files?.[0] }))} />{scene.mobile ? <img src={scene.mobile} alt="Prévia da imagem mobile" /> : <em>Usa a imagem desktop enquanto nenhuma versão mobile for enviada.</em>}</label></div></section>)}
    {progress !== null && <div className="admin-upload-progress"><div className="admin-upload-progress-track"><div className="admin-upload-progress-fill" style={{ width: `${progress}%` }} /></div><span>Enviando imagens… {progress}%</span></div>}{message?.error && <p className="admin-form-error">{message.error}</p>}{message?.success && <p className="admin-form-success">{message.success}</p>}<div className="admin-submit-row"><button className="button" type="submit" disabled={pending}>{pending ? 'Salvando sessão…' : 'Salvar sessão 1'}</button></div>
  </form>;
}
