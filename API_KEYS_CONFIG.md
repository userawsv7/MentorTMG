# API Keys Configuration

## Provider Configuration Status

### OpenRouter (PRIMARY FREE PROVIDER)
- **Base URL**: `https://openrouter.ai/api/v1`
- **Endpoint**: `/chat/completions`
- **Auth**: `Authorization: Bearer <API_KEY>`
- **Primary Model**: `openrouter/free` (automatically selects available free model)
- **Classification**: FREE
- **Status**: ✅ FIXED

### Cerebras (FREE TRIAL PROVIDER)
- **Base URL**: `https://api.cerebras.ai/v1`
- **Endpoint**: `/chat/completions`
- **Auth**: `Authorization: Bearer <API_KEY>`
- **Models**:
  - `gpt-oss-120b` — PRIMARY (FREE TRIAL)
  - `gemma-4-31b` — SECONDARY (FREE TRIAL)
- **Classification**: FREE TRIAL
- **Status**: ✅ FIXED

## Files Modified
- `/root/MentorTMG/lib/providers.ts`

### Changes Made:
1. **OpenRouter**:
   - Removed broken model IDs (Llama 3.3 70B, Gemini 2.0 Flash, Mistral 7B)
   - Added `openrouter/free` as the primary free model
   - Base URL confirmed: `https://openrouter.ai/api/v1`

2. **Cerebras**:
   - Removed broken models (`llama3.1-8b`, `llama-3.3-70b`)
   - Added current public models:
     - `gpt-oss-120b` (PRIMARY)
     - `gemma-4-31b` (SECONDARY)
   - Excluded `zai-glm-4.7` (scheduled for deprecation)

## Test Results

| Provider | Model | Endpoint | Result |
|----------|-------|----------|--------|
| OpenRouter | `openrouter/free` | `/api/v1/chat/completions` | PASS |
| Cerebras | `gpt-oss-120b` | current endpoint | PASS |
| Cerebras | `gemma-4-31b` | current endpoint | PASS |

## Notes
- `openrouter/free` is the preferred default as it automatically selects an available free model
- Cerebras endpoints are available on free-trial tier only (not permanently free)
- All model classifications updated according to specifications