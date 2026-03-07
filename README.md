# Escuela Cristo - Arquitectura Base

## IDs requeridos

- YouTube
  - channel_id: obtener desde la URL del canal o vía YouTube Data API `channels.list`.
  - uploads_playlist_id: con `channels.list?part=contentDetails&id=<channel_id>` → `relatedPlaylists.uploads`.
  - Guardar en `youtube_channels` junto con `last_seen_published_at`.
- Telegram
  - chat_id permitido: iniciar chat con el bot o agregarlo a un grupo/canal y leer `update.message.chat.id` con `getUpdates` (temporal) o en logs del webhook.
  - Configurar `TELEGRAM_ALLOWED_CHAT_IDS` con ese ID y `TELEGRAM_SECRET_TOKEN` en BotFather y en `.env`.

## Variables de entorno

Ver `.env.example` para el listado completo.
