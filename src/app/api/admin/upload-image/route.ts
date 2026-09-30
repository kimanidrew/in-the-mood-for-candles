import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createHash, createHmac, randomUUID } from "node:crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function hash(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: string | Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function awsEncode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function canonicalPath(key: string) {
  return "/" + key.split("/").map(awsEncode).join("/");
}

function signingKey(secret: string, date: string, region: string, service: string) {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, GIF and AVIF images are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Please choose an image smaller than 12MB." }, { status: 400 });
    }

    const accountId = env("R2_ACCOUNT_ID");
    const accessKeyId = env("R2_ACCESS_KEY_ID");
    const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
    const bucket = env("R2_BUCKET_NAME");
    const publicUrl = env("R2_PUBLIC_URL").replace(/\/$/, "");

    const extensionByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
    };

    const extension = extensionByType[file.type] || "bin";
    const key = `storefront/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const body = Buffer.from(await file.arrayBuffer());

    const region = "auto";
    const service = "s3";
    const host = `${accountId}.r2.cloudflarestorage.com`;
    const endpoint = `https://${host}/${awsEncode(bucket)}${canonicalPath(key)}`;
    const amzDate = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = hash(body);

    const canonicalHeaders =
      `content-type:${file.type}\n` +
      `host:${host}\n` +
      `x-amz-content-sha256:${payloadHash}\n` +
      `x-amz-date:${amzDate}\n`;

    const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
    const canonicalRequest = [
      "PUT",
      canonicalPath(`${bucket}/${key}`),
      "",
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      hash(canonicalRequest),
    ].join("\n");

    const signature = createHmac(
      "sha256",
      signingKey(secretAccessKey, dateStamp, region, service),
    )
      .update(stringToSign)
      .digest("hex");

    const authorization =
      `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const upload = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Host": host,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        Authorization: authorization,
      },
      body,
    });

    if (!upload.ok) {
      const details = await upload.text().catch(() => "");
      console.error("Cloudflare R2 upload failed:", upload.status, details);
      return NextResponse.json(
        { error: "Cloudflare R2 could not store the image." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      url: `${publicUrl}/${key}`,
      key,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload image." },
      { status: 500 },
    );
  }
}
