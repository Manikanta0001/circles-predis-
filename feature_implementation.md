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
