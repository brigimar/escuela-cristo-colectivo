import { supabaseService } from "../src/lib/supabase/client-service";

const BUCKET = "libros-pdf";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

async function loadEditorial() {
  console.log("--- INITIAL EDITORIAL LOAD ---");

  // 1. Fetch current records to avoid duplicates
  const { data: currentRecords } = await supabaseService.from("library_pdfs").select("*");
  const { data: files } = await supabaseService.storage.from(BUCKET).list("", { recursive: true });

  if (!files) {
    console.error("No files found in bucket.");
    return;
  }

  const realFiles = files.filter(f => f.id !== null);
  console.log(`Found ${realFiles.length} files in bucket.`);

  let stats = { updated: 0, inserted: 0, skipped: 0 };

  for (const f of realFiles) {
    let title = f.name.replace(".pdf", "").replace(/-/g, " ").replace(/_/g, " ");
    let author = null;

    if (title.toLowerCase().includes("watchman nee")) {
      author = "Watchman Nee";
      title = title.replace(/watchman nee/gi, "").replace(/^\s*-\s*/, "").trim();
    } else if (title.toLowerCase().includes("t. austin spark")) {
      author = "T. Austin Sparks";
      title = title.replace(/t\. austin sparks?/gi, "").replace(/^\s*-\s*/, "").trim();
    } else if (title.toLowerCase().includes("t_austin_sparks")) {
      author = "T. Austin Sparks";
      title = title.replace(/t_austin_sparks/gi, "").replace(/^\s*-\s*/, "").trim();
    }

    // Special cases
    if (title === "Madurez Espiritual") author = "Watchman Nee";
    if (title === "una lectura de romanos") author = "Watchman Nee";
    if (title.startsWith("Mensajes Para Creyentes Nuevos")) author = "Watchman Nee";

    // Clean up title
    title = title.split("(")[0].trim(); // Remove (1) etc

    const existing = currentRecords?.find(r => r.storage_path === f.name);

    // Metadata normalization for the poor "Igle" record
    if (existing && existing.title === "Igle") {
        title = "La Iglesia y su Ministerio";
        author = "Watchman Nee";
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${f.name}`;

    const recommendedTitles = [
      "La Escuela de Cristo",
      "La Vida Cristiana Normal",
      "El Cuerpo de Cristo",
      "La Iglesia y su Ministerio"
    ];
    const isRecommended = recommendedTitles.some(rt => title.toLowerCase().includes(rt.toLowerCase()));

    const recordData = {
      title,
      author,
      description: existing?.description || `Obra de ${author || "estudio bíblico"} disponible para la Escuela de Cristo.`,
      storage_bucket: BUCKET,
      storage_path: f.name,
      public_url: publicUrl,
      is_published: true,
      is_hidden: false,
      is_recommended: isRecommended,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { error } = await supabaseService.from("library_pdfs").update(recordData).eq("id", existing.id);
      if (!error) stats.updated++;
    } else {
      const { error } = await supabaseService.from("library_pdfs").insert(recordData);
      if (!error) stats.inserted++;
    }
  }

  console.log("Stats:", stats);
  console.log("Editorial load successful!");
}

loadEditorial();
