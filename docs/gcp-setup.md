# Google Cloud Setup for MUSE

## Project
- **Project:** Project Shockwave
- **Project ID:** project-shockwave (Google Cloud Console)
- **Billing:** Active

## Services Used

### 1. Gemini API (Google AI Studio / Vertex AI)
- **Models:** `gemini-2.5-flash` (text), `gemini-3.1-flash-image-preview` (images)
- **SDK:** `@google/genai` (Google GenAI JavaScript SDK)
- **Auth:** API Key from Google AI Studio
- **Usage:** All 5 pipeline stages + storyboard image generation

### 2. Google Cloud Storage (Package Persistence)
- **Bucket:** `muse-creative-packages`
- **Purpose:** Stores completed creative packages (JSON + generated frame images)
- **Auth:** Service Account with Storage Object Admin role
- **Integration:** `src/lib/gcs.ts` — automatic upload on pipeline completion

## Setup Instructions

### Enable APIs
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable storage.googleapis.com
```

### Create GCS Bucket
```bash
gsutil mb -l us-central1 gs://muse-creative-packages
```

### Create Service Account
```bash
gcloud iam service-accounts create muse-agent \
  --display-name="MUSE Agent"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:muse-agent@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud iam service-accounts keys create muse-sa-key.json \
  --iam-account=muse-agent@PROJECT_ID.iam.gserviceaccount.com
```

### Set Vercel Environment Variables
```bash
npx vercel env add GCS_PROJECT_ID production    # your GCP project ID
npx vercel env add GCS_CLIENT_EMAIL production  # service account email
npx vercel env add GCS_PRIVATE_KEY production   # from JSON key file
npx vercel env add GCS_BUCKET production        # muse-creative-packages
```

## Cloud Run Deployment (Alternative)
```bash
# Build and deploy
gcloud run deploy muse-agent \
  --source=. \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_API_KEY=your-key"
```
