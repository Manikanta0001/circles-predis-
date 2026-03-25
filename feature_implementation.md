## Task 4 - AI model fallback support for text generation

### Goal
Add reliable multi-provider fallback for AI text generation so requests do not fail immediately when a single model/provider is down, slow, or returns empty output.

### What was implemented
- Implemented fallback orchestration in `Predis-Amealio-Backend/src/integrations/ai/ai.service.ts` inside `generateText`.
- Added provider chain selection based on user-selected model:
  - `llama` (or default) -> `ollama` -> `openai` -> `hf`
  - `gpt`/`openai` -> `openai` -> `ollama` -> `hf`
  - `hf`/`huggingface` -> `hf` -> `openai` -> `ollama`
- Added provider-specific text generation methods with individual timeouts:
  - Ollama local API
  - OpenAI Chat Completions API
  - Hugging Face Inference API
- Added robust empty-response handling so empty payloads trigger fallback.
- Added structured success metadata:
  - `textModelUsed` (for example `ollama:phi3:mini`)
  - `fallbackUsed` (`true` when a non-primary provider succeeds)

### API response updates
- Updated `Predis-Amealio-Backend/src/content/content.service.ts`:
  - `generateContent` now includes `meta` for text responses when applicable.
  - `generatePromptSuggestions` now includes `meta` and uses the new text result object.

### Why this location
- Fallback logic is centralized in `AIService.generateText`, so all text-generation entry points get reliability improvements automatically.
- Keeps `ContentService` focused on content workflows, not provider retry orchestration.

### Required environment configuration
- Ollama:
  - `OLLAMA_BASE_URL`
  - `OLLAMA_MODEL`
- OpenAI:
  - `OPENAI_API_KEY`
  - optional `OPENAI_TEXT_MODEL` (defaults to `gpt-4o-mini`)
- Hugging Face:
  - `HUGGINGFACE_API_TOKEN`
  - optional `HF_TEXT_MODEL`

### Notes
- If a provider is not configured (missing API key/token), it is skipped via controlled failure and fallback continues.
- Request only fails after all providers in the chain fail.

---

## Task 5 - Merchant dashboard charts and visual analytics

### Goal
Add charts and visual analytics to the merchant dashboard so users can see engagement trends, platform comparison, and content-type mix for a selectable time window.

### What was implemented

**Backend (`Predis-Amealio-Backend`)**
- Extended `GET /api/merchant/dashboard` with optional query `range`: `7d`, `30d` (default), or `90d`.
- `ContentService.getDashboardStats` now:
  - Sums **all-time** views, likes, and shares across every content item’s analytics (fixes the previous behavior that only summed the five most recent items).
  - Loads analytics rows in the selected window for trend and breakdown charts.
  - Returns:
    - `range`, `rangeDays`
    - `dailyTrend`: per-day views, likes, shares, and new posts created that day
    - `platformBreakdown`: per-platform stacked engagement and `engagementRate` in range
    - `contentTypeBreakdown`: counts and average engagement by content type for items **created** in range

**Frontend (`Predis-Amealio-Frontend`)**
- `contentApi.getDashboardStats(range?)` passes the `range` query param.
- Merchant dashboard (`src/app/merchant/dashboard/page.tsx`): range selector (7 / 30 / 90 days), KPI cards unchanged, three charts below KPIs, then recent content.
- New components:
  - `EngagementTrendChart` — line chart (views, likes, shares)
  - `PlatformBreakdownChart` — stacked bar chart by platform
  - `ContentTypeChart` — donut chart for content mix

### Data notes
- Daily engagement uses `analytics.recorded_at` within the window.
- “Posts per day” counts **content** rows whose `created_at` falls on that calendar day (UTC).
- Platform labels are normalized for display (e.g. `instagram` → `Instagram`).
- Empty states explain when there is no analytics or no content in the range.

### How to verify
- Open `/merchant/dashboard` logged in; switch **Chart range** and confirm charts refetch.
- With seeded analytics, confirm totals on KPI cards match summed analytics across all content, not only recent rows.

### Routing note (important)
- There was a route conflict where **both** `ContentController` and `UserController` exposed `GET /api/merchant/dashboard`.
- Fixed by moving the user dashboard endpoint to `GET /api/user/dashboard`, so `GET /api/merchant/dashboard` reliably returns the chart datasets.

### Dev-only demo analytics seeding (to preview charts)
- Added a dev-only admin endpoint to seed deterministic demo analytics rows so the “Engagement over time” chart renders with non-zero values in local development.
- Endpoint: `POST /api/admin/dev/seed-analytics?days=30`
  - Available only when `NODE_ENV=development` (otherwise returns 404).
  - Requires an **admin** JWT (uses the existing admin controller guards).
  - Idempotent: skips rows that already exist for the same `contentId` + day.
- After calling it, refresh `/merchant/dashboard` and the line chart should populate.

- Also added a dev-only merchant endpoint to seed for the **currently logged-in merchant** (useful when you’re logged in as merchant and want to see charts immediately):
  - Endpoint: `POST /api/merchant/dev/seed-analytics?days=30`
  - Available only when `NODE_ENV=development` (otherwise returns 404).

### Dev-only UI preview (dummy engagement line chart)
- Updated `EngagementTrendChart` to optionally render a **demo preview** curve in development when the dataset exists but all `views/likes/shares` are 0.
- This helps designers/QA validate the chart UI even before real analytics ingestion is implemented.

### Dev-only UI preview (dummy platform stacked bars)
- Updated `PlatformBreakdownChart` to optionally render a **demo preview** stacked bar dataset in development when platforms exist but all `views/likes/shares` are 0.
