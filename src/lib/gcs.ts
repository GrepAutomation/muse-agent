/**
 * Google Cloud Storage integration for persisting creative packages.
 * Satisfies hackathon requirement: at least one Google Cloud service.
 */

import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = process.env.GCS_BUCKET || "muse-creative-packages";

let storage: Storage | null = null;

function getStorage(): Storage | null {
  if (!process.env.GCS_PROJECT_ID || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY) {
    return null;
  }
  if (!storage) {
    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });
  }
  return storage;
}

export async function savePackageToGCS(
  projectName: string,
  data: {
    script: unknown;
    styleBible: unknown;
    storyboard: unknown;
    review: unknown;
    images: Array<{ frame: number; data?: string; prompt: string }>;
  }
): Promise<string | null> {
  const gcs = getStorage();
  if (!gcs) return null;

  try {
    const bucket = gcs.bucket(BUCKET_NAME);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const prefix = `packages/${projectName}-${timestamp}`;

    const packageData = {
      projectName,
      createdAt: new Date().toISOString(),
      script: data.script,
      styleBible: data.styleBible,
      storyboard: data.storyboard,
      review: data.review,
      imageCount: data.images.filter((i) => i.data).length,
    };

    await bucket.file(`${prefix}/package.json`).save(JSON.stringify(packageData, null, 2), {
      contentType: "application/json",
    });

    for (const img of data.images) {
      if (img.data) {
        const buffer = Buffer.from(img.data, "base64");
        await bucket.file(`${prefix}/frames/frame_${String(img.frame).padStart(3, "0")}.png`).save(buffer, {
          contentType: "image/png",
        });
      }
    }

    return `gs://${BUCKET_NAME}/${prefix}`;
  } catch (e) {
    console.error("GCS save failed (non-fatal):", e);
    return null;
  }
}
