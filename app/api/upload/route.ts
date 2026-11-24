import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const maxBytes = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.size) {
    return NextResponse.json({ error: "ပုံဖိုင်ရွေးပါ။" }, { status: 400 });
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "ပုံဖိုင်ကို 4 MB အောက် ထည့်ပါ။" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const signatures = [
    { ext: "png", type: "image/png", matches: bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
    { ext: "jpg", type: "image/jpeg", matches: bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) },
    { ext: "webp", type: "image/webp", matches: bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" },
  ];
  const image = signatures.find(({ matches }) => matches);
  if (!image) {
    return NextResponse.json({ error: "PNG၊ JPEG သို့မဟုတ် WebP ပုံဖိုင် ထည့်ပါ။" }, { status: 415 });
  }

  const filename = `${randomUUID()}.${image.ext}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = process.env.BLOB_STORE_ID?.trim();
  if (!token && !storeId && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "ပုံသိမ်းရန် Blob storage မချိတ်ထားသေးပါ။" }, { status: 503 });
  }

  try {
    if (token || storeId) {
      const blob = await put(`profile-images/${filename}`, file, {
        access: "public",
        contentType: image.type,
        token,
        storeId,
      });
      return NextResponse.json({ url: blob.url });
    }

    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), bytes);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Profile image upload failed", error);
    return NextResponse.json({ error: "ပုံသိမ်းလို့မရသေးပါ။ ပြန်စမ်းပါ။" }, { status: 500 });
  }
}
