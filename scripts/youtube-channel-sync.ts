
import { fetchUploadsPlaylistIdForChannel, fetchPlaylistItems } from '../src/lib/youtube/client';
import { supabaseService } from '../src/lib/supabase/client-service';
import { loadServerEnv } from '../src/lib/env/server';

async function main() {
  const { YOUTUBE_API_KEY } = loadServerEnv();
  const CHANNEL_ID = 'UCSConnZVxPbFDPxZm22He_g';

  // 1. Get uploads playlist ID
  console.log('Fetching uploads playlist ID...');
  const uploadsPlaylistId = await fetchUploadsPlaylistIdForChannel(YOUTUBE_API_KEY, CHANNEL_ID);
  console.log(`Uploads playlist ID: ${uploadsPlaylistId}`);

  // 2. List all videos from the playlist
  console.log('Fetching all videos from playlist...');
  let allVideos = [];
  let pageToken = undefined;
  let positionOffset = 0;

  do {
    const response = await fetchPlaylistItems({
      apiKey: YOUTUBE_API_KEY,
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
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        position: positionOffset + allVideos.length
      });
    }

    pageToken = response.nextPageToken;
  } while (pageToken);

  console.log(`Fetched ${allVideos.length} total videos.`);

  // 3. Format the first JSON output
  const youtubeData = {
    channel_id: CHANNEL_ID,
    uploads_playlist: uploadsPlaylistId,
    total_videos: allVideos.length,
    videos: allVideos.map(v => ({
      videoId: v.videoId,
      title: v.title,
      publishedAt: v.publishedAt,
      thumbnail: v.thumbnail,
      position: v.position
    }))
  };

  // 4. Compare with Supabase
  console.log('Fetching videos from Supabase...');
  const { data: dbVideos, error } = await supabaseService
    .from('videos')
    .select('youtube_video_id');

  if (error) {
    console.error('Error fetching videos from Supabase:', error);
    return;
  }

  const dbVideoIds = new Set(dbVideos.map(v => v.youtube_video_id));
  const youtubeVideoIds = new Set(allVideos.map(v => v.videoId));

  const missing_in_db = [...youtubeVideoIds].filter(id => !dbVideoIds.has(id));
  const extra_in_db = [...dbVideoIds].filter(id => !youtubeVideoIds.has(id));

  const comparisonData = {
    total_youtube_videos: youtubeVideoIds.size,
    total_db_videos: dbVideoIds.size,
    missing_in_db,
    extra_in_db
  };

  // 5. Get 10 most recent videos
  const recentVideos = allVideos
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 10);

  // 6. Output the results
  console.log('\n# Lista completa de videos del canal (resumen)');
  console.log(JSON.stringify({
      channel_id: youtubeData.channel_id,
      uploads_playlist: youtubeData.uploads_playlist,
      total_videos: youtubeData.total_videos,
  }, null, 2));


  console.log('\n# 10 videos más recientes');
  console.log(JSON.stringify(recentVideos.map(v => ({title: v.title, publishedAt: v.publishedAt, videoId: v.videoId})), null, 2));

  console.log('\n# Diferencias con Supabase');
  console.log(JSON.stringify(comparisonData, null, 2));

  console.log('\n# Conteo total');
  console.log(`Total de videos en YouTube: ${comparisonData.total_youtube_videos}`);
  console.log(`Total de videos en Supabase: ${comparisonData.total_db_videos}`);
}

main().catch(console.error);
