import { supabaseAdmin } from "@/lib/supabase/client-service";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const { data: allBooks, error } = await supabaseAdmin
      .from("library_pdfs")
      .select(
        "id, title, author, is_published, is_hidden, is_recommended, storage_bucket, storage_path, public_url, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Error fetching from Supabase: ${error.message} (Code: ${error.code})`
      );
    }

    const total_count = allBooks.length;
    const published_count = allBooks.filter((b) => b.is_published).length;
    const hidden_count = allBooks.filter((b) => b.is_hidden).length;
    const recommended_count = allBooks.filter((b) => b.is_recommended).length;

    const bucket_count = allBooks.reduce((acc, book) => {
      const bucket = book.storage_bucket || "unknown";
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const latest = allBooks.slice(0, 10);

    const response = {
      total_count,
      published_count,
      hidden_count,
      recommended_count,
      bucket_count,
      latest,
    };

    return NextResponse.json(response);
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error("Unknown error");
    return NextResponse.json(
      {
        error: "Failed to generate library diagnostics",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
