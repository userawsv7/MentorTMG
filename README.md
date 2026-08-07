# Relay

A chat webapp that routes each message through **your own free-tier API keys**
(Groq, Gemini, OpenRouter, Mistral, Cohere, DeepInfra, Cerebras, SambaNova,
Fireworks, Hugging Face, Replicate, Cloudflare Workers AI) or through a single
**KodeKey** (KodeKloud's Anthropic/OpenAI-compatible gateway), automatically
ranking models for the purpose you pick and falling back to the next model —
or the next provider — the moment one errors, hits a rate limit, or runs out
of quota.

No database. Everything — sessions, messages, and API keys — lives only in
the browser's `localStorage`. The server (a couple of stateless Next.js API
routes) never stores anything; it just forwards your request to whichever
provider is next in the ranked chain and reports back what happened.

## How routing works

1. You pick a **purpose** (general chat, code, deep reasoning, fast & cheap,
   long context, images/vision) and, optionally, a **preferred model**.
2. `lib/router.ts` builds a ranked chain: models tagged for that purpose
   first (best rank first), everything else after. If you picked a specific
   model, the chain rotates so that model is tried first and the rest still
   follow in ranked order, wrapping back to the top — so if you deliberately
   pick the *last*-ranked model and it fails, Relay falls back all the way
   around to the *first*-ranked one instead of just stopping.
3. Each attempt is logged (`components/Relay.tsx` renders this live as a
   chain of chips: gray → amber "trying" → teal "ok" or red "failed"). On a
   401/403 the key is called out as bad; on 429 it's called out as rate/quota
   limited; anything else gets a plain "server error" or "couldn't reach it"
   message — then the router moves on automatically.
4. Free-key mode only tries providers you've actually entered a key for.
   KodeKey mode has one provider with many models, ranked from the plan
   table you supplied.

## Project layout

```
app/
  api/chat/route.ts          stateless routing + fallback endpoint
  api/validate-key/route.ts  instant "is this key alive" check
  page.tsx                   the whole UI shell (sidebar, purpose bar, chat)
  layout.tsx, globals.css
components/
  Sidebar.tsx        session list, collapsible, human-readable names
  KeySettings.tsx     key entry + Test button per provider
  PurposeBar.tsx       purpose chips + "prefer this model" dropdown
  Relay.tsx             the live fallback-chain visualization
  ChatWindow.tsx      messages + composer + token estimate
lib/
  providers.ts   the full provider/model catalog (edit this to add models)
  router.ts        ranking + fallback engine + provider adapters
  tokens.ts          dependency-free token estimator
  sessionNames.ts    "Curious Falcon"-style session name generator
  store.ts             localStorage persistence
```

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, click **Manage keys**, paste in whichever free
API keys you have (or your KodeKey), hit **Test** next to each to confirm
it's live, then start chatting.

## Deploying

### GitHub

```bash
git init
git add -A
git commit -m "Relay: multi-provider key router"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

### Vercel

1. Go to vercel.com → **Add New Project** → import the GitHub repo you just
   pushed.
2. Framework preset: **Next.js** (auto-detected). No environment variables
   are required — keys are entered by each user in their own browser, not
   stored server-side.
3. Deploy. That's it.

You can also deploy straight from the CLI:

```bash
npm i -g vercel
vercel
```

## Notes, limits, and things worth improving

- **Model catalogs and base URLs go stale.** Free-tier providers change
  their model line-ups often. `lib/providers.ts` is the single file to
  edit — update a model id, add a new one, or add a whole new provider by
  adding an entry to `FREE_PROVIDERS`.
- **Token counts are estimates**, not exact billed counts, whenever a
  provider doesn't return real `usage` data (marked with a leading `~` in
  the UI). Providers that do return usage (most OpenAI-compatible ones)
  show the real number instead.
- **Cloudflare Workers AI** needs an Account ID in addition to the API
  key (a field for it appears once you paste a Cloudflare key).
- **Replicate** uses the async predictions API with `Prefer: wait`, which
  works for short-running models but can time out on slower ones — a real
  production version would poll the prediction instead of waiting inline.
- **Image/vision purpose** currently routes to vision-capable chat models
  (Gemini, Replicate's FLUX, etc.) rather than a dedicated image-generation
  UI (image preview, download, etc.) — worth adding if image generation is
  the primary use case rather than an occasional one.
- Nothing here is a substitute for reading each provider's own free-tier
  limits — Relay reacts to whatever error message a provider sends back, it
  doesn't know a limit in advance.
