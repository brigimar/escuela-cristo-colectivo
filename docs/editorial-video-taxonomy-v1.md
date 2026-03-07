# Taxonomía editorial v1 para videos del canal

## 1. Baseline
- total de videos: 154
- familias editoriales detectadas en títulos (conteo desde el inventario real):
  - Desafío M28 (23)
  - Watchman Nee (44)
  - Reflexiones Cortas (2)
  - El Club del Libro (5)
  - LIVE / EN VIVO / Transmisión en vivo (16)
  - Cortes LIVE (4)
  - Shorts (35)
  - AUDIOLIBRO (21)
  - ORACIONES APOSTÓLICAS (1)

## 2. Dimensiones canónicas
- content_type: clasifica el formato editorial principal del video. Debe resolver todos los videos.
- series_collection: colección o familia editorial cuando hay evidencia fuerte en título. Opcional.
- topic: tema doctrinal o pastoral con evidencia clara en título. Opcional y conservador.

## 3. Valores iniciales propuestos
- content_type:
  - series_episode
  - live
  - clip
  - short
  - teaching
  - book_club
  - audiobook
  - reflection
- series_collection:
  - desafio_m28
  - watchman_nee
  - reflexiones_cortas
  - club_del_libro
  - oraciones_apostolicas
  - cortes_live
  - lives_espiritu_santo
  - hechos
  - mateo
- topic (solo si hay señal explícita en título):
  - reino_de_dios
  - iglesia
  - evangelio
  - espiritu_santo
  - oracion
  - vida_espiritual
  - madurez
  - salvacion
  - cruz
  - autoridad

## 4. Reglas deterministas de clasificación
Prioridad por content_type (alta a baja):
short -> clip -> live -> book_club -> audiobook -> series_episode -> reflection -> teaching

Reglas (patrones reales del inventario):
1. Shorts
- Si el título contiene #shorts o #shortsvideo o #viralshorts -> content_type=short
2. Cortes LIVE
- Si el título contiene “Cortes LIVE” o “Corte LIVE” -> content_type=clip
3. LIVE / EN VIVO
- Si el título contiene “LIVE”, “EN VIVO”, “Transmisión en vivo”, “está en vivo”, o empieza con “🔴” -> content_type=live
4. El Club del Libro
- Si el título contiene “El Club del Libro” -> content_type=book_club
5. AUDIOLIBRO
- Si el título contiene “AUDIOLIBRO” -> content_type=audiobook
6. Desafío M28
- Si el título contiene “Desafío M28” -> content_type=series_episode
7. Reflexiones Cortas
- Si el título contiene “Reflexiones Cortas” -> content_type=reflection
8. Fallback
- Si ninguna regla aplica -> content_type=teaching

Reglas de series_collection (solo si hay señal fuerte):
- Desafío M28 -> series_collection=desafio_m28
- Watchman Nee -> series_collection=watchman_nee
- Reflexiones Cortas -> series_collection=reflexiones_cortas
- El Club del Libro -> series_collection=club_del_libro
- ORACIONES APOSTÓLICAS -> series_collection=oraciones_apostolicas
- Cortes LIVE / Corte LIVE -> series_collection=cortes_live
- LIVE 1/4, LIVE 2/4, LIVE 3/4, LIVE 4/4 -> series_collection=lives_espiritu_santo
- Mateo (cuando está marcado explícitamente, y especialmente con Desafío M28) -> series_collection=mateo
- Hechos (cuando está marcado explícitamente en título) -> series_collection=hechos

Reglas de topic (solo señal explícita):
- “Reino” -> topic=reino_de_dios
- “Iglesia” -> topic=iglesia
- “Evangelio” -> topic=evangelio
- “Espíritu Santo”, “Espiritu Santo”, “bautismo”, “llenura” -> topic=espiritu_santo
- “Oración”, “Oracion”, “Orando” -> topic=oracion
- “vida espiritual”, “alma”, “espíritu”, “espiritu” -> topic=vida_espiritual
- “salvación”, “salvacion”, “nuevo nacimiento” -> topic=salvacion
- “cruz” -> topic=cruz
- “autoridad” -> topic=autoridad

## 5. Mapeo operativo para Telegram
Categorías simples para navegación del owner:
- Series bíblicas -> content_type=series_episode (y series_collection=mateo/hechos si aplica)
- Watchman Nee -> series_collection=watchman_nee
- Lives -> content_type=live
- Cortes -> content_type=clip
- Shorts -> content_type=short
- Club del Libro -> content_type=book_club
- Reflexiones -> content_type=reflection
- Enseñanzas -> content_type=teaching

## 6. Recomendación final
- Obligatoria: content_type (debe resolverse siempre).
- Opcionales: series_collection y topic (solo si hay evidencia clara en título).
- Primera migración debería persistir:
  - content_type como clasificación efectiva
  - series_collection opcional
  - topic opcional y conservador

