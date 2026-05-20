/**
 * Cloudflare Stream helpers used by admin upload flow.
 *
 * Requires:
 *   CLOUDFLARE_ACCOUNT_ID    — found in the Cloudflare dashboard URL
 *   CLOUDFLARE_STREAM_TOKEN  — API token with the "Stream: Edit" permission
 *
 * Uses the TUS resumable-upload spec so large videos can be uploaded
 * straight from the browser without going through our server.
 *   https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/
 */

const CF_API = "https://api.cloudflare.com/client/v4";

function creds() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_TOKEN;
  if (!accountId || !token) {
    throw new Error(
      "Cloudflare Stream env vars missing: set CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_STREAM_TOKEN"
    );
  }
  return { accountId, token };
}

/** Base64-encode a UTF-8 string (Node + Edge safe). */
function b64(input: string): string {
  if (typeof Buffer !== "undefined") return Buffer.from(input, "utf8").toString("base64");
  return btoa(unescape(encodeURIComponent(input)));
}

export interface DirectUploadResult {
  uid: string;
  uploadUrl: string;
}

/**
 * Initiate a TUS direct creator upload. Returns the one-time URL the
 * browser PATCHes chunks to and the eventual video UID.
 */
export async function createDirectUpload(opts: {
  size: number;
  name?: string;
  /** Max video length CF will accept (default 4 hours). */
  maxDurationSeconds?: number;
}): Promise<DirectUploadResult> {
  const { accountId, token } = creds();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Tus-Resumable": "1.0.0",
    "Upload-Length": String(opts.size),
  };

  const metadataParts: string[] = [];
  if (opts.name) metadataParts.push(`name ${b64(opts.name)}`);
  if (opts.maxDurationSeconds) {
    metadataParts.push(
      `maxDurationSeconds ${b64(String(opts.maxDurationSeconds))}`
    );
  }
  if (metadataParts.length) {
    headers["Upload-Metadata"] = metadataParts.join(",");
  }

  const res = await fetch(
    `${CF_API}/accounts/${accountId}/stream?direct_user=true`,
    { method: "POST", headers }
  );

  if (res.status !== 201) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Cloudflare Stream TUS init failed (${res.status}): ${body.slice(0, 240)}`
    );
  }
  const uploadUrl = res.headers.get("location");
  const uid = res.headers.get("stream-media-id");
  if (!uploadUrl || !uid) {
    throw new Error("Cloudflare Stream TUS init returned no Location / Stream-Media-Id");
  }
  return { uploadUrl, uid };
}

export interface CFStreamVideo {
  uid: string;
  status: { state: string; pctComplete?: string };
  thumbnail: string;
  preview: string;
  duration: number;
  playback: { hls: string; dash: string };
  meta?: Record<string, string>;
  readyToStream: boolean;
}

/** Fetch a video record from Stream (playback URLs, thumbnail, duration). */
export async function getStreamVideo(uid: string): Promise<CFStreamVideo> {
  const { accountId, token } = creds();
  const res = await fetch(`${CF_API}/accounts/${accountId}/stream/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Cloudflare Stream lookup failed (${res.status}): ${body.slice(0, 240)}`
    );
  }
  const json = (await res.json()) as { result: CFStreamVideo };
  return json.result;
}

/** Universal iframe embed URL (works without knowing customer subdomain). */
export function iframeUrl(uid: string): string {
  return `https://iframe.cloudflarestream.com/${uid}`;
}
