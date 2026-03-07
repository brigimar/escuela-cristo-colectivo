# Backfill editorial v1

## 1. Qué clasifica
- Clasifica videos ya existentes en `public.videos`.
- Resuelve dos dimensiones:
  - `content_type`
  - `series_collection`
- Usa solo tres fuentes:
  - `manual`
  - `title_rule`
  - `fallback`

## 2. Reglas aplicadas
- `content_type`
  - `#shorts`, `#shortsvideo`, `#viralshorts` -> `short`
  - `Cortes LIVE`, `Corte LIVE` -> `clip`
  - `LIVE`, `EN VIVO`, `Transmisión en vivo`, `está en vivo`, o título que empieza con `🔴` -> `live`
  - `El Club del Libro` -> `book_club`
  - `AUDIOLIBRO` -> `audiobook`
  - `Desafío M28` -> `series_episode`
  - `Reflexiones Cortas` -> `reflection`
  - sin match -> `teaching`
- `series_collection`
  - `Desafío M28` -> `desafio_m28`
  - `Watchman Nee` -> `watchman_nee`
  - `Reflexiones Cortas` -> `reflexiones_cortas`
  - `El Club del Libro` -> `club_del_libro`
  - `ORACIONES APOSTÓLICAS` -> `oraciones_apostolicas`
  - `Cortes LIVE`, `Corte LIVE` -> `cortes_live`
  - `LIVE 1/4`, `LIVE 2/4`, `LIVE 3/4`, `LIVE 4/4` -> `lives_espiritu_santo`
  - `Hechos` -> `hechos`
  - `Mateo` -> `mateo`
  - sin match -> no se escribe fila
- Overrides manuales activos en `video_editorial_overrides` siempre ganan.
- Confianza:
  - `manual = 1.0000`
  - `title_rule = 0.7500`
  - `fallback = 0.3000`

## 3. Cómo ejecutar
- Precondición: las tablas editoriales v1 deben existir en Supabase.
- Dry run:
```bash
node scripts/backfill-editorial-v1.mjs
```
- Aplicar escritura:
```bash
node scripts/backfill-editorial-v1.mjs --apply
```

## 4. Qué tablas escribe
- Lee:
  - `public.videos`
  - `public.editorial_dimensions`
  - `public.editorial_terms`
  - `public.video_editorial_overrides`
  - `public.video_editorial_classification_current`
- Escribe:
  - `public.video_editorial_classification_current`
  - `public.video_editorial_classification_log`

## 5. Limitaciones de v1
- No clasifica `topic`.
- No usa playlists editoriales.
- No se integra todavía al cron ni a runtime productivo.
- `series_collection` puede quedar sin fila.
- Si un video tenía `series_collection` previa y ya no matchea por título ni override, el script elimina esa fila actual para evitar estado obsoleto.

## 6. Resumen de salida
- El script imprime JSON tanto en dry run como en apply.
- El resumen separa contadores por dimensión:
  - `source_counts.content_type.manual`
  - `source_counts.content_type.title_rule`
  - `source_counts.content_type.fallback`
  - `source_counts.series_collection.manual`
  - `source_counts.series_collection.title_rule`
  - `source_counts.series_collection.fallback`
- El resumen agrega conteos por slug clasificado:
  - `slug_counts.content_type`
  - `slug_counts.series_collection`
- El modo por defecto sigue siendo dry run. Solo escribe con `--apply`.
