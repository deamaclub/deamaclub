/**
 * Bunny.net Stream helpers for the admin upload flow.
 *
 * Required env vars:
 *   BUNNY_STREAM_LIBRARY_ID   numeric ID of the Stream library
 *   BUNNY_STREAM_API_KEY      API key for that library (Library → API)
 *   BUNNY_STREAM_PULL_ZONE    CDN hostname e.g. `vz-xxxxx-xxx.b-cdn.net`
 *                             (Library → API page, listed as "CDN Hostname")
 *
 * Flow:
 *   1. Server calls createDirectUpload() — creates an empty video record on
 *      Bunny via their REST API, then computes a TUS signature good for 1h.
 *   2. Browser uses tus-js-client to PATCH chunks to
 *      https://video.bunnycdn.com/tusupload with auth headers we returned.
 *   3. After upload completes, server polls getBunnyVideo() for the
 *      auto-generated thumbnail + duration.
 *
 * Docs: https://docs.bunny.net/reference/tus-resumable-uploads
 */

import { createHash } from "node:crypto";

const BUNNY_API = "https://video.bunnycdn.com";
const TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

function creds() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const pullZone = process.env.BUNNY_STREAM_PULL_ZONE;
  if (!libraryId || !apiKey || !pullZone) {
    throw new Error(
      "Bunny Stream env missing: set BUNNY_STREAM_LIBRARY_ID + BUNNY_STREAM_API_KEY + BUNNY_STREAM_PULL_ZONE"
    );
  }
  return { libraryId, apiKey, pullZone };
}

export interface DirectUploadResult {
  guid: string;
  libraryId: string;
  authorizationSignature: string;
  authorizationExpire: number;
  tusEndpoint: string;
  metadataBase64: { filetype: string; title: string };
}

/**
 * Create an empty Bunny Stream video record and return the credentials the
 * browser needs to TUS-upload bytes directly.
 */
export async function createDirectUpload(opts: {
  name: string;
  collectionId?: string;
}): Promise<DirectUploadResult> {
  const { libraryId, apiKey } = creds();

  const createRes = await fetch(`${BUNNY_API}/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: opts.name.slice(0, 200),
      collectionId: opts.collectionId,
    }),
  });
  if (!createRes.ok) {
    const body = await createRes.text().catch(() => "");
    throw new Error(
      `Bunny video create failed (${createRes.status}): ${body.slice(0, 240)}`
    );
  }
  const video = (await createRes.json()) as { guid: string };

  const expire = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
  const signature = createHash("sha256")
    .update(`${libraryId}${apiKey}${expire}${video.guid}`)
    .digest("hex");

  return {
    guid: video.guid,
    libraryId,
    authorizationSignature: signature,
    authorizationExpire: expire,
    tusEndpoint: TUS_ENDPOINT,
    metadataBase64: {
      filetype: "",
      title: "",
    },
  };
}

export interface BunnyVideo {
  guid: string;
  status: number; // see status map below
  length: number; // duration in seconds
  thumbnailUrl: string;
  embedUrl: string;
  hlsUrl: string;
  readyToStream: boolean;
}

/**
 * Bunny status codes (https://docs.bunny.net/reference/video_getvideo).
 *   0 Created, 1 Uploaded, 2 Processing, 3 Transcoding,
 *   4 Finished, 5 Error, 6 UploadFailed, 7 JitSegmenting,
 *   8 JitPlaylistsCreated
 */
const READY_STATUSES = new Set([3, 4, 7, 8]);

export async function getBunnyVideo(guid: string): Promise<BunnyVideo> {
  const { libraryId, apiKey, pullZone } = creds();
  const res = await fetch(
    `${BUNNY_API}/library/${libraryId}/videos/${guid}`,
    {
      headers: { AccessKey: apiKey, Accept: "application/json" },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Bunny video lookup failed (${res.status}): ${body.slice(0, 240)}`
    );
  }
  const v = (await res.json()) as {
    guid: string;
    status: number;
    length?: number;
    thumbnailFileName?: string;
  };

  const thumbnail =
    v.thumbnailFileName && v.thumbnailFileName.length > 0
      ? v.thumbnailFileName
      : "thumbnail.jpg";

  return {
    guid: v.guid,
    status: v.status,
    length: v.length ?? 0,
    thumbnailUrl: `https://${pullZone}/${v.guid}/${thumbnail}`,
    embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${v.guid}`,
    hlsUrl: `https://${pullZone}/${v.guid}/playlist.m3u8`,
    readyToStream: READY_STATUSES.has(v.status),
  };
}

export function embedUrlFor(guid: string): string {
  const { libraryId } = creds();
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`;
}
