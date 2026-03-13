import { supabaseService } from "../src/lib/supabase/client-service.ts";

const BUCKET = "libros-pdf";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

async function refineEditorial() {
  console.log("--- REFINING EDITORIAL ---");

  const { data: records } = await supabaseService.from("library_pdfs").select("*");

  if (!records) return;

  for (const r of records) {
    let title = r.title;
    let author = r.author;
    let isRecommended = r.is_recommended;
    let isHidden = r.is_hidden;
    let isPublished = r.is_published;

    // 1. Fix "Igle"
    if (title === "Igle" || r.storage_path.includes("cac5855d-0d54-4305-b9c2-73f8b1cd7a3b")) {
      title = "La Iglesia y su Ministerio";
      author = "Watchman Nee";
      isRecommended = true;
    }

    // 2. Fix Author N/A for T. Austin Sparks
    if (r.storage_path.includes("T_Austin_Sparks")) {
      author = "T. Austin Sparks";
      title = title.replace(/T Austin Sparks/gi, "").trim();
    }

    // 3. Clean up titles with (1)
    if (title.endsWith("(1)")) {
      title = title.replace("(1)", "").trim();
    }

    // 4. Recommendation logic
    const recommendedTitles = [
      "La Escuela de Cristo",
      "La Vida Cristiana Normal",
      "El Cuerpo de Cristo",
      "La Iglesia y su Ministerio",
      "El Camino y la Meta de Dios"
    ];
    if (recommendedTitles.some(rt => title.toLowerCase().includes(rt.toLowerCase()))) {
      isRecommended = true;
    }

    // 5. Hide duplicates (very basic)
    const duplicates = records.filter(other => 
      other.id !== r.id && 
      other.title.toLowerCase() === title.toLowerCase() && 
      other.author === author
    );
    if (duplicates.length > 0 && r.storage_path.includes("(1)")) {
      isHidden = true;
      isPublished = false;
    }

    // Update if changed
    if (title !== r.title || author !== r.author || isRecommended !== r.is_recommended || isHidden !== r.is_hidden) {
      console.log(`Updating [${r.id}] ${r.title} -> ${title} (${author})`);
      await supabaseService.from("library_pdfs").update({
        title,
        author,
        is_recommended: isRecommended,
        is_hidden: isHidden,
        is_published: isPublished,
        updated_at: new Date().toISOString()
      }).eq("id", r.id);
    }
  }

  console.log("Refinement complete!");
}

refineEditorial();
