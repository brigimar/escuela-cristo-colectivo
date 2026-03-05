## Manual de diseño — Bot Telegram “Panel de mando” (Owner)

### Rol

Bot de Telegram como **panel de control** del sitio Escuela de Cristo.
Modo **mixto (Opción C)**: `/menu` con botones + comandos “power tools”.

---

## 1) Roles y permisos

### Owner (único)

* Todo: preguntas, video recomendado, audios, lecturas, PDFs, diagnóstico.

### Moderadores (máx 2)

* Solo: **revisar lista de comentarios + publicar preguntas seleccionadas**.
* No: video recomendado, audios, lecturas, PDFs, sync, migración Notion, diagnóstico.

**Control de acceso**

* Allowlist por `TELEGRAM_ALLOWED_CHAT_IDS`
* Además allowlist por `TELEGRAM_OWNER_USER_ID` y `TELEGRAM_MOD_USER_IDS` (csv).

---

## 2) Navegación principal

### Comando

* `/menu`

### Botones (InlineKeyboard)

Fila 1: **Preguntas** | **Video recomendado**
Fila 2: **Audios** | **Lectura del día**
Fila 3: **PDFs** | **Estado**

> Moderadores ven solo: **Preguntas** | **Estado**

---

## 3) Módulo Preguntas de la Audiencia

### Fuente

Comentarios de YouTube (live actual o vivos pasados).

### Reglas de extracción

* Solo comentarios que contienen `?` **o** `¿`.
* La lista debe estar etiquetada:
  **“Extraídos de video: <Título>”**
* Cada ítem muestra:

  * **texto completo**
  * **autor** (handle si existe, sino display name)
  * **fecha**
  * **@usuario** como identificador visible
* Acción en lista: **solo Publicar**

### Flujo

1. Owner/mod abre **Preguntas**
2. Bot muestra lista de comentarios (paginada)
3. Botón **Publicar** por ítem
4. Publicar implica:

   * Upsert por `comment_id`
   * Set `is_selected=true`
   * Set `selected_at=now()`
   * Guardar `youtube_video_id`, `author_name`, `text_display` final, etc.

### Edición antes de publicar

* `/editar <comment_id>`
* Luego: **el siguiente mensaje** del owner se toma como texto final y se publica **directamente**
* `/cancelar` cancela la edición

### Paginación

* C) ambos:

  * Botones **Siguiente/Anterior**
  * Comando `/preguntas N offset K` (o equivalente)

### Output web

* Landing: muestra **6** preguntas
* “Ver más” → `/respuestas-a-preguntas`

---

## 4) Módulo Video Recomendado (uno activo)

### Requisito

* Siempre **uno solo activo** (reemplaza al anterior).

### UX mínima

* Botón “Video recomendado”
* Acciones:

  * “Elegir desde últimos videos” (lista)
  * “Pegar link” (extraer id)
* Persistencia sugerida:

  * tabla `site_state` o `recommended_video` (único row)

---

## 5) Módulo Audios (historial)

### Ingesta

* Owner envía **voice** o **archivo de audio**
* Bot pide **título editable**
* Luego:

  * subir a Storage bucket: **`respuestas-audio`**
  * insertar metadata en tabla: **`respuestas_audio`**
  * publicar en `/respuestas-a-preguntas` (sección “Audios”)

### Migración a Notion (automatizada)

* Umbral fijo por tamaño acumulado (`SUM(size_bytes)`)
* Límite base: **1 GB** Free → umbral **900 MB**
* Al superar umbral:

  * mover audios a Notion
  * actualizar records para apuntar a Notion URL
  * opcional: borrar del bucket para liberar espacio

---

## 6) Módulo Lectura del día (solo /lecturas)

### UX

* Botón “Lectura del día”
* Flujo:

  * “Nueva lectura” → bot pide texto → publica en `/lecturas`
  * “Editar última” → bot pide texto → reemplaza

---

## 7) Módulo PDFs (Últimos libros)

### UX

* Botón “PDFs”
* Owner sube archivo PDF → bot pide título → sube a Storage (bucket a definir) → aparece en `/lecturas` como “Últimos libros”.

---

## 8) Estado / Diagnóstico

### `/estado`

* Live ON/OFF
* Video activo (si aplica)
* Última sync videos
* Última sync comentarios
* Storage audios usado vs umbral

---

## 9) Mensajes y tono (criterio)

* Cortos, humanos, sin “debug speak”.
* Confirmaciones:

  * “Publicado ✅”
  * “Edición cancelada.”
  * “No autorizado.”

---

## 10) Checklist de implementación (para cerrar)

* [ ] Roles: owner + 2 mods (user_id allowlist)
* [ ] `/menu` + InlineKeyboard
* [ ] Preguntas: listar + publicar + editar + cancelar + paginación
* [ ] Video recomendado: set único activo
* [ ] Audios: pedir título + upload + tabla + publicar
* [ ] Migración Notion automática por umbral
* [ ] Lectura del día (solo owner)
* [ ] PDFs upload (solo owner)
* [ ] `/estado`

Si querés, el próximo paso es que me dictes **solo el orden** en que lo vas a implementar (ej: “Preguntas → Audios → Video recomendado → Lecturas → PDFs”), y yo te preparo los prompts uno por uno para el agente (sin adelantarme).
