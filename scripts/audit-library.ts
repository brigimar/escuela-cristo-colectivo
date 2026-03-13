import { supabaseService } from "../src/lib/supabase/client-service";

async function audit() {
  console.log("--- AUDIT: public.library_pdfs ---");
  
  const { data: records, error } = await supabaseService
    .from("library_pdfs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching library_pdfs:", error);
    return;
  }

  console.log(`Total records: ${records.length}`);
  
  const stats = {
    published: records.filter(r => r.is_published).length,
    hidden: records.filter(r => r.is_hidden).length,
    recommended: records.filter(r => r.is_recommended).length,
    visible_in_web: records.filter(r => r.is_published && !r.is_hidden).length
  };
  
  console.log("Stats:", stats);

  console.log("\n--- BUCKET AUDIT: libros-pdf ---");
  const { data: files, error: storageError } = await supabaseService
    .storage
    .from("libros-pdf")
    .list("", { recursive: true });

  if (storageError) {
    console.error("Error listing storage files:", storageError);
  } else {
    // Filter out directories (folders in Supabase storage list are usually marked by metadata or lack of it)
    const realFiles = files.filter(f => f.id !== null); 
    console.log(`Total files in bucket: ${realFiles.length}`);
    realFiles.forEach(f => {
      const existsInTable = records.some(r => r.storage_path.includes(f.name));
      if (!existsInTable) {
        console.log(`[ORPHAN FILE] ${f.name} (Not in DB)`);
      }
    });
  }

  console.log("\n--- RECORDS ---");
  records.forEach(r => {
    console.log(`- ID: ${r.id} | Title: ${r.title} | Author: ${r.author || "N/A"} | Published: ${r.is_published} | Hidden: ${r.is_hidden} | Recommended: ${r.is_recommended}`);
    console.log(`  Path: ${r.storage_path} | URL: ${r.public_url ? "YES" : "NO"}`);
    if (!r.title || r.title === "Igle") {
      console.log(`  [!] POOR METADATA: Title="${r.title}", Author="${r.author}", Desc="${r.description?.substring(0, 20)}..."`);
    }
  });
}

audit();
