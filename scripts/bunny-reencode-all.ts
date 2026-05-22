/**
 * Re-encode every video in the Bunny Stream library so the
 * currently-configured library watermark (and any other encoding
 * settings) gets applied to existing uploads.
 *
 * Reads BUNNY_STREAM_LIBRARY_ID + BUNNY_STREAM_API_KEY from .env.
 *
 * Run with:  npm run bunny:reencode-all
 *
 * The actual re-encoding happens server-side on Bunny and takes a
 * few minutes per video. This script just kicks off the jobs; you
 * can close the terminal and let Bunny finish on its own.
 */

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const BUNNY_API = "https://video.bunnycdn.com";

const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
const apiKey = process.env.BUNNY_STREAM_API_KEY;
if (!libraryId || !apiKey) {
  console.error(
    "BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY must be set in .env"
  );
  process.exit(1);
}

interface BunnyVideoSummary {
  guid: string;
  title: string;
  status: number;
  length: number;
}

interface BunnyListResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: BunnyVideoSummary[];
}

async function listAllVideos(): Promise<BunnyVideoSummary[]> {
  const all: BunnyVideoSummary[] = [];
  let page = 1;
  for (;;) {
    const res = await fetch(
      `${BUNNY_API}/library/${libraryId}/videos?page=${page}&itemsPerPage=100&orderBy=date`,
      {
        headers: { AccessKey: apiKey!, Accept: "application/json" },
      }
    );
    if (!res.ok) {
      throw new Error(
        `List videos failed (${res.status}): ${(await res.text()).slice(0, 200)}`
      );
    }
    const json = (await res.json()) as BunnyListResponse;
    all.push(...json.items);
    if (json.items.length < json.itemsPerPage) break;
    page++;
  }
  return all;
}

async function reencode(guid: string): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch(
    `${BUNNY_API}/library/${libraryId}/videos/${guid}/reencode`,
    {
      method: "POST",
      headers: { AccessKey: apiKey!, Accept: "application/json" },
    }
  );
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  console.log(`Library: ${libraryId}`);
  console.log("Fetching video list...");
  const videos = await listAllVideos();
  console.log(`Found ${videos.length} video(s).`);
  if (videos.length === 0) {
    console.log("Nothing to re-encode.");
    return;
  }

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    process.stdout.write(
      `[${String(i + 1).padStart(2, " ")}/${videos.length}] ${v.guid.slice(0, 8)}… "${v.title.slice(0, 50)}" ... `
    );
    try {
      const r = await reencode(v.guid);
      if (r.ok) {
        ok++;
        console.log("queued");
      } else {
        fail++;
        console.log(`FAIL ${r.status} ${r.body.slice(0, 120)}`);
      }
    } catch (e) {
      fail++;
      console.log(`ERR ${e instanceof Error ? e.message : String(e)}`);
    }
    // Be polite — small delay between requests
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nDone. Queued: ${ok}. Failed: ${fail}.`);
  console.log(
    "Bunny will now re-encode each video in the background (a few min per video). " +
      "The video keeps its existing guid/embed/thumbnail URL — once re-encode " +
      "completes the watermark will appear on subsequent plays."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
