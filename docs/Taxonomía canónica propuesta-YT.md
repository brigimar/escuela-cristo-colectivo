Taxonomía canónica propuesta
1) content_type

Esta dimensión debe clasificar todos los videos.

Valores:

series_episode

live

clip

short

teaching

book_club

audiobook

reflection

Criterio

series_episode: episodios de una serie claramente secuencial o branded.

live: vivos completos o transmisiones.

clip: cortes o extractos de vivos.

short: piezas cortas verticales detectables por #shorts, #shortsvideo, etc.

teaching: enseñanza standalone normal.

book_club: piezas de “El Club del Libro”.

audiobook: piezas marcadas como AUDIOLIBRO.

reflection: piezas cortas no-short, devocionales/reflexivas.

2) series_collection

Solo cuando haya evidencia fuerte en título.

Valores iniciales:

desafio_m28

watchman_nee

reflexiones_cortas

club_del_libro

oraciones_apostolicas

cortes_live

lives_espiritu_santo

hechos

mateo

romanos

none

Criterio

none no hace falta persistir como término si prefieres null.

mateo, hechos, romanicos sirven como colección solo cuando el título lo marca claramente.

watchman_nee funciona como colección editorial fuerte en este canal.

club_del_libro y cortes_live son familias operativas reales.

3) topic

Solo inferencia prudente. No forzar en todos.

Valores iniciales:

reino_de_dios

iglesia

evangelio

espiritu_santo

oracion

vida_espiritual

madurez

salvacion

cruz

autoridad

none

Criterio

Solo asignar si aparece una señal clara:

“Reino”, “Mateo X – El Reino...”

“Espíritu Santo”, “bautismo”, “llenura”

“oración”, “orando”

“evangelio”

“iglesia”

“salvación”

“cruz”

“autoridad”

Familias editoriales reales detectables

Del inventario se ven, como mínimo, estas familias sólidas: 

youtube-channel-videos

Desafío M28

Watchman Nee

Reflexiones Cortas

El Club del Libro

Lives / En vivo / Transmisión en vivo

Cortes LIVE

Shorts

Enseñanzas standalone de Joaco Pensa

Enseñanzas standalone de invitados/referentes como Fabian Liendo, Gino Iafrancesco, Paul Washer, Witness Lee, Charles Spurgeon, Martyn Lloyd-Jones. 

youtube-channel-videos

Reglas canónicas de clasificación
Prioridad

short

clip

live

book_club

audiobook

series_episode

reflection

teaching

Esto evita choques como:

un video con Watchman Nee + AUDIOLIBRO → debe caer en audiobook, no solo teaching

un video con Joaco Pensa (Cortes LIVE) → debe caer en clip, no live

Reglas de content_type
Regla 10

Si el título contiene #shorts o #shortsvideo o #viralshorts
→ content_type = short

Regla 20

Si el título contiene Cortes LIVE o Corte LIVE
→ content_type = clip

Regla 30

Si el título contiene LIVE, EN VIVO, Transmisión en vivo, está en vivo, o empieza con 🔴
→ content_type = live

Regla 40

Si el título contiene El Club del Libro
→ content_type = book_club

Regla 50

Si el título contiene AUDIOLIBRO
→ content_type = audiobook

Regla 60

Si el título contiene Desafío M28
→ content_type = series_episode

Regla 70

Si el título contiene Reflexiones Cortas
→ content_type = reflection

Regla 80

Fallback
→ content_type = teaching

Reglas de series_collection
Regla 100

Si contiene Desafío M28
→ series_collection = desafio_m28

Regla 110

Si contiene Watchman Nee
→ series_collection = watchman_nee

Regla 120

Si contiene Reflexiones Cortas
→ series_collection = reflexiones_cortas

Regla 130

Si contiene El Club del Libro
→ series_collection = club_del_libro

Regla 140

Si contiene ORACIONES APOSTÓLICAS
→ series_collection = oraciones_apostolicas

Regla 150

Si contiene Cortes LIVE o Corte LIVE
→ series_collection = cortes_live

Regla 160

Si contiene LIVE 1/4, LIVE 2/4, LIVE 3/4, LIVE 4/4
→ series_collection = lives_espiritu_santo

Regla 170

Si contiene Mateo y además Desafío M28
→ series_collection = desafio_m28
No hace falta crear doble asignación en Fase 1.

Regla 180

Si contiene Hechos y además El Club del Libro o en vivo
→ series_collection = hechos

Reglas de topic
Regla 200

Si contiene Reino
→ topic = reino_de_dios

Regla 210

Si contiene Iglesia
→ topic = iglesia

Regla 220

Si contiene Evangelio
→ topic = evangelio

Regla 230

Si contiene Espíritu Santo, Espiritu Santo, bautismo, llenura
→ topic = espiritu_santo

Regla 240

Si contiene Oración, Oracion, Orando
→ topic = oracion

Regla 250

Si contiene vida espiritual, alma, espíritu, espiritu
→ topic = vida_espiritual

Regla 260

Si contiene salvación, salvacion, nuevo nacimiento
→ topic = salvacion

Regla 270

Si contiene cruz
→ topic = cruz

Regla 280

Si contiene autoridad
→ topic = autoridad

Decisiones de ingeniería
Lo que haría yo

content_type obligatorio

series_collection opcional pero fuertemente poblado

topic opcional y conservador

Lo que no haría todavía

No meter subtemas finos.

No intentar NLP.

No intentar múltiples topics por video en Fase 1.

No mezclar autor/persona con topic.

Mapa operativo simple para Telegram

Para navegación del owner, no mostrar toda la taxonomía interna. Mostrar buckets humanos:

Series bíblicas

Watchman Nee

Lives

Cortes

Shorts

Club del Libro

Reflexiones

Enseñanzas

Mapeo sugerido

Series bíblicas → content_type=series_episode

Watchman Nee → series_collection=watchman_nee

Lives → content_type=live

Cortes → content_type=clip

Shorts → content_type=short

Club del Libro → content_type=book_club

Reflexiones → content_type=reflection

Enseñanzas → content_type=teaching