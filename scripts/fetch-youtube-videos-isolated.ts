
import { fetchUploadsPlaylistIdForChannel, fetchPlaylistItems, YouTubePlaylistItem } from '../src/lib/youtube/client';

// Este script es una vía aislada para consultar la API de YouTube.
// No importa ni depende de Supabase ni de la validación de entorno global del servidor Next.js.
// Lee YOUTUBE_API_KEY directamente de process.env.

interface VideoDetails {
  videoId: string;
  title: string;
  publishedAt: string;
  description: string;
  thumbnail: string;
  position: number;
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('Missing YOUTUBE_API_KEY');
    // Abortar si la API key no está disponible.
    // El comando de ejecución debería proveerla, ej:
    // YOUTUBE_API_KEY="AIza..." npx tsx scripts/fetch-youtube-videos-isolated.ts
    process.exit(1);
  }

  const CHANNEL_ID = 'UCSConnZVxPbFDPxZm22He_g';

  // 1. Obtener la playlist de uploads
  const uploadsPlaylistId = await fetchUploadsPlaylistIdForChannel(apiKey, CHANNEL_ID);

  // 2. Iterar para obtener todos los videos
  const allVideos: VideoDetails[] = [];
  let pageToken: string | undefined;
  let position = 0;

  while (true) {
    const response = await fetchPlaylistItems({
      apiKey: apiKey,
      playlistId: uploadsPlaylistId,
      pageToken: pageToken,
      maxResults: 50
    });

    for (const item of response.items) {
      allVideos.push({
        videoId: item.contentDetails.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        position: position++
      });
    }

    if (!response.nextPageToken) {
      break;
    }
    pageToken = response.nextPageToken;
  }

  // 3. Crear el JSON de salida
  const output = {
    channel_id: CHANNEL_ID,
    uploads_playlist: uploadsPlaylistId,
    total_videos: allVideos.length,
    videos: allVideos,
  };

  console.log(JSON.stringify(output, null, 2));

  // 4. Crear el resumen legible
  // Ordenar por fecha para el resumen
  const sortedVideos = [...allVideos].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const newestVideos = sortedVideos.slice(0, 10);
  const oldestVideos = sortedVideos.slice(-10).reverse();

  console.log('\n\n--- RESUMEN ---');
  console.log(`uploads_playlist_id: ${uploadsPlaylistId}`);
  console.log(`total_videos: ${allVideos.length}`);

  console.log('\n## 10 videos más recientes:');
  newestVideos.forEach(v => console.log(`- [${v.publishedAt.split('T')[0]}] ${v.title}`));

  console.log('\n## 10 videos más antiguos:');
  oldestVideos.forEach(v => console.log(`- [${v.publishedAt.split('T')[0]}] ${v.title}`));
}

main().catch(err => {
  console.error("Script falló:", err.message);
  process.exit(1);
});
