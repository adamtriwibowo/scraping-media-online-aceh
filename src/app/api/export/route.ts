import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getArticles } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const { rows } = await getArticles({
    siteId: searchParams.get("siteId") || undefined,
    category: searchParams.get("category") || undefined,
    keyword: searchParams.get("keyword") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    search: searchParams.get("search") || undefined,
    page: 1,
    pageSize: 5000,
  });

  const worksheetData = rows.map((row) => ({
    Judul: row.title,
    Sumber: row.siteName,
    Kategori: row.siteCategory,
    Tautan: row.url,
    "Tanggal Terbit": row.publishedAt ? new Date(row.publishedAt).toLocaleString("id-ID") : "",
    "Waktu Scraping": new Date(row.scrapedAt).toLocaleString("id-ID"),
    "Kata Kunci": row.matchedKeywords.join(", "),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Berita");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="serunee-berita-${Date.now()}.xlsx"`,
    },
  });
}
