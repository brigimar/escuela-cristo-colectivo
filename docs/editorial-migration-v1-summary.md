# Editorial migration v1 summary

## Tablas creadas
- `public.editorial_dimensions`
- `public.editorial_terms`
- `public.video_editorial_overrides`
- `public.video_editorial_classification_current`
- `public.video_editorial_classification_log`

## Seeds insertados
- Dimensiones:
  - `content_type`
  - `series_collection`
- Terminos de `content_type`:
  - `series_episode`
  - `live`
  - `clip`
  - `short`
  - `teaching`
  - `book_club`
  - `audiobook`
  - `reflection`
- Terminos de `series_collection`:
  - `desafio_m28`
  - `watchman_nee`
  - `reflexiones_cortas`
  - `club_del_libro`
  - `oraciones_apostolicas`
  - `cortes_live`
  - `lives_espiritu_santo`
  - `hechos`
  - `mateo`

## Proposito de cada tabla
- `editorial_dimensions`: define las dimensiones editoriales activas de v1.
- `editorial_terms`: catalogo de valores posibles por dimension.
- `video_editorial_overrides`: override manual por video y dimension.
- `video_editorial_classification_current`: clasificacion efectiva actual por video y dimension.
- `video_editorial_classification_log`: auditoria append-only por corrida o evaluacion.

## Ajustes de refinamiento
- La migracion reutiliza `public.set_updated_at()` ya presente en el proyecto.
- Se normalizaron labels editoriales al espanol para mantener consistencia operativa.

## Quedo fuera en v1
- `topic`
- soporte de playlists editoriales
- contexto efimero para Telegram
- reglas automaticas persistidas
- backfill de clasificaciones
