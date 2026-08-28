export function uploadFileWithProgress(ticket, file, onLoaded) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', ticket.signedUrl, true);
    xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    xhr.setRequestHeader('authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('cache-control', 'max-age=3600');
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onLoaded(event.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload falhou (status ${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Erro de rede durante o upload.'));
    xhr.send(file);
  });
}

export async function uploadFilesWithProgress(tickets, files, onProgress) {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const loadedByFile = new Array(files.length).fill(0);

  const report = () => {
    const loadedTotal = loadedByFile.reduce((sum, loaded) => sum + loaded, 0);
    onProgress(totalBytes > 0 ? Math.round((loadedTotal / totalBytes) * 100) : 100);
  };

  await Promise.all(
    files.map((file, i) =>
      uploadFileWithProgress(tickets[i], file, (loaded) => {
        loadedByFile[i] = loaded;
        report();
      })
    )
  );
}
