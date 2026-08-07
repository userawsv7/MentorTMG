# MENTORTMG RELAY - COMPLETE SYSTEM DOCUMENTATION

## DOCUMENT OVERVIEW

This document provides complete visual diagrams and explanations for the MentorTMG Relay system - a multi-provider AI chat application that intelligently routes messages through 12+ free AI providers with automatic fallback capabilities.

---

# SECTION 1: HIGH-LEVEL SYSTEM ARCHITECTURE

## 1.1 OVERALL SYSTEM LAYERS

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                           MENTORTMG RELAY - FOUR-LAYER ARCHITECTURE                                           ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: USER INTERFACE LAYER                                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│  │   SIDEBAR   │  │ PURPOSE BAR │  │ KEY SETTINGS│  │ CHAT WINDOW │  │    RELAY    │                        │
│  │             │  │             │  │             │  │             │  │             │                        │
│  │ Sessions    │  │ • general   │  │ Groq: [key] │  │ [Messages]  │  │ [Chain]     │                        │
│  │ • Chat 1    │  │ • coding    │  │ Gemini: []  │  │ User: Hi    │  │ ● trying    │                        │
│  │ • Chat 2    │  │ • reasoning │  │ [TEST]      │  │ Bot: Hello  │  │ ● ok        │                        │
│  │ [NEW CHAT]  │  │ [PREFER]    │  │ Cerebras:[] │  │ [Input]     │  │ ● failed    │                        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                        │
│                                                                                                              │
│  PURPOSE: Visual interface for all user interactions                                                         │
│  LOCATION: app/page.tsx coordinates all components                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: APPLICATION LOGIC LAYER                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              STATE MANAGEMENT (lib/store.ts)                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │   SESSIONS   │  │   MESSAGES   │  │  API KEYS    │  │  SETTINGS    │  │ PREFERENCES  │             │  │
│  │  │              │  │              │  │              │  │              │  │              │             │  │
│  │  │• ID          │  │• sessionId   │  │• provider    │  │• theme       │  │• purpose     │             │  │
│  │  │• name        │  │• role        │  │• keyValue    │  │• layout      │  │• modelPref   │             │  │
│  │  │• createdAt   │  │• content     │  │• timestamp   │  │• collapsed   │  │• imageGen    │             │  │
│  │  │• updatedAt   │  │• attachments │  │• validated   │  │• state       │  │• mode        │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  │                                                                                                        │  │
│  │  STORAGE: Browser localStorage - Zero server-side data persistence                                    │  │
│  │  PRIVACY: API keys never leave the browser                                                            │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                    │                                                         │
│  ┌─────────────────────────────────────────────────┴─────────────────────────────────────────────────────┐ │
│  │                              CORE BUSINESS LOGIC LIBRARIES                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │ │
│  │  │ providers.ts│  │  router.ts  │  │  tokens.ts  │  │sessionNames │  │fetchTimeout │                   │ │
│  │  │             │  │             │  │             │  │             │  │             │                   │ │
│  │  │• 12+ Free   │  │• buildChain │  │• estimate   │  │• "Curious   │  │• 10s timeout│                   │ │
│  │  │  Providers  │  │• routeChat  │  │• count      │  │  Falcon"    │  │• Abortable  │                   │ │
│  │  │• 40+ KodeKey│  │• classify   │  │• usage      │  │• Names      │  │• Network    │                   │ │
│  │  │• All Models │  │• Error Info │  │• tokens     │  │• Generator  │  │• Safety     │                   │ │
│  │  │• Adapters   │  │• Fallback   │  │• Costs      │  │             │  │             │                   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                   │ │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: API ROUTES LAYER (Next.js Serverless Functions)                                                    │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐                     │
│  │   /api/chat/route.ts    │  │ /api/validate-key/      │  │ /api/kodekey-advise/    │                     │
│  │                         │  │   route.ts              │  │   route.ts              │                     │
│  │ PURPOSE:                │  │ PURPOSE:                │  │ PURPOSE:                │                     │
│  │ Main relay endpoint     │  │ Test API key validity   │  │ KodeKey plan advice     │                     │
│  │                         │  │                         │  │                         │                     │
│  │ FLOW:                   │  │ FLOW:                   │  │ FLOW:                   │                     │
│  │ 1. Receive messages     │  │ 1. Receive provider+key │  │ 1. User requests advice │                     │
│  │ 2. Call routeChat()     │  │ 2. Make test API call   │  │ 2. Analyze usage needs  │                     │
│  │ 3. Return response      │  │ 3. Return status        │  │ 3. Recommend plan       │                     │
│  │                         │  │                         │  │                         │                     │
│  │ STATELESS: No data      │  │ INSTANT: Immediate      │  │ GUIDANCE: Helps choose  │                     │
│  │ storage on server       │  │ feedback on key status  │  │ right KodeKey tier      │                     │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: EXTERNAL AI PROVIDERS LAYER                                                                        │
│                                                                                                              │
│  FREE TIER PROVIDERS (12 Total):                                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  GROQ    │ │ GEMINI   │ │OPENROUTER│ │ MISTRAL  │ │  COHERE  │ │DEEPINFRA │ │ CEREBRAS │               │
│  │          │ │          │ │          │ │          │ │          │ │          │ │          │               │
│  │• Ultra   │ │• Vision  │ │• Free    │ │• Quality │ │• RAG     │ │• Open    │ │• 120B    │               │
│  │  Fast    │ │  Models  │ │  Models  │ │  European│ │  Focus   │ │  Source  │ │  Params  │               │
│  │• Llama   │ │• 1M+ ctx │ │• Various │ │• Models  │ │• Models  │ │• Models  │ │• Speed   │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                            │
│  │SAMBANOVA │ │FIREWORKS │ │HUGGING F │ │REPLICATE │ │CLOUDFLARE│ │          │                            │
│  │          │ │          │ │          │ │          │ │          │ │          │                            │
│  │• Llama   │ │• Mixtral │ │• Router  │ │• Images  │ │• Edge AI │ │          │                            │
│  │• 70B     │ │• 8x7B    │ │• Models  │ │• FLUX    │ │• Workers │ │          │                            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘                            │
│                                                                                                              │
│  KODEKEY GATEWAY (Premium Access - 40+ Models via Single API Key):                                           │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │ Claude Opus 5/4.8 │ GPT-5.6 Sol │ Gemini 3.1 Pro │ DeepSeek V4 │ Grok 4.3 │ Claude Sonnet 5/4.6 │       │ │
│  │ GPT-5.4/5.5 │ Qwen3 Coder │ Kimi K3/K2.5 │ Moonshot Models │ ... and 30+ more models ...              │ │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### EXPLANATION: Four-Layer Architecture

**LAYER 1 - USER INTERFACE**
- **Purpose**: Everything the user sees and interacts with
- **Key Point**: Five main panels work together to provide complete functionality
- **Data Flow**: User actions trigger state changes that flow down to Layer 2

**LAYER 2 - APPLICATION LOGIC**
- **Purpose**: All the "thinking" and decision-making happens here
- **Key Point**: State is stored ONLY in browser localStorage - nothing goes to any server
- **Critical**: API keys are kept private - they never leave the user's browser

**LAYER 3 - API ROUTES**
- **Purpose**: Serverless functions that act as middlemen to external providers
- **Key Point**: These routes are STATELESS - they don't store anything, just forward requests
- **Benefit**: Zero privacy concerns, instant scalability

**LAYER 4 - EXTERNAL PROVIDERS**
- **Purpose**: Where the actual AI processing happens
- **Key Point**: 12 free providers + 1 premium gateway with 40+ models
- **Selection**: Router intelligently picks the best available model for each request

---

# SECTION 2: DETAILED COMPONENT BREAKDOWN

## 2.1 COMPONENT HIERARCHY TREE

```
ROOT COMPONENT: page.tsx
│
├── SIDEBAR (Sidebar.tsx)
│   ├── PURPOSE: Manage chat sessions
│   ├── FEATURES:
│   │   • Display list of all conversations
│   │   • Create new chat sessions
│   │   • Delete existing sessions
│   │   • Show human-readable session names (e.g., "Curious Falcon")
│   │   • Collapsible/expandable interface
│   └── PROPS RECEIVED:
│       • sessions: Array of all chat sessions
│       • currentSessionId: Which session is active
│       • onSelect: Callback when user clicks a session
│       • onDelete: Callback when user deletes a session
│
├── PURPOSE BAR (PurposeBar.tsx)
│   ├── PURPOSE: Let users select what type of task they want to do
│   ├── VISUAL ELEMENTS:
│   │   • 6 purpose chips/buttons:
│   │     ┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────┐ ┌──────────────┐ ┌─────────┐
│   │     │ general │ │ coding  │ │ reasoning   │ │  fast   │ │ long_context │ │ vision  │
│   │     │  chat   │ │  code   │ │  deep     │ │  quick  │ │   large      │ │ images  │
│   │     └─────────┘ └─────────┘ └─────────────┘ └─────────┘ └──────────────┘ └─────────┘
│   │   • Model preference dropdown for each purpose
│   │   • Visual indicators showing which models excel at each purpose
│   └── PROPS RECEIVED:
│       • purpose: Currently selected purpose
│       • preferredModel: User's preferred model (optional)
│       • onPurposeChange: Callback when purpose is selected
│       • onModelPreference: Callback when preferred model is chosen
│
├── KEY SETTINGS (KeySettings.tsx)
│   ├── PURPOSE: Secure input and validation of API keys
│   ├── VISUAL STRUCTURE:
│   │   For each of the 12 providers:
│   │   ┌─────────────────────────────────────────────────────────────┐
│   │   │ [Provider Name]          [API Key Input Field]  [TEST]     │
│   │   │                           ••••••••••••••••••••              │
│   │   │ Status: ✅ Valid / ❌ Invalid / ⏳ Testing                   │
│   │   └─────────────────────────────────────────────────────────────┘
│   ├── FEATURES:
│   │   • Password-masked input fields
│   │   • Instant key validation via TEST button
│   │   • Visual status indicators
│   │   • Links to provider documentation
│   │   • Error messages with troubleshooting hints
│   └── PROPS RECEIVED:
│       • keys: Object containing all API keys
│       • onKeyChange: Callback when a key is entered/changed
│       • onTest: Callback to validate a specific key
│       • mode: "free" or "kodekey" mode
│
├── CHAT WINDOW (ChatWindow.tsx)
│   ├── PURPOSE: Main conversation interface
│   ├── VISUAL LAYOUT:
│   │   ┌─────────────────────────────────────────────────────────────┐
│   │   │                    CONVERSATION AREA                         │
│   │   │  ┌─────────────────────────────────────────────────────┐    │
│   │   │  │  👤 User: Hello, can you help me with React?       │    │
│   │   │  └─────────────────────────────────────────────────────┘    │
│   │   │  ┌─────────────────────────────────────────────────────┐    │
│   │   │  │  🤖 Assistant: Of course! What would you like...    │    │
│   │   │  │     [via Groq • llama-3.3-70b • 1,234 tokens]       │    │
│   │   │  └─────────────────────────────────────────────────────┘    │
│   │   └─────────────────────────────────────────────────────────────┘
│   │   ┌─────────────────────────────────────────────────────────────┐
│   │   │  [Attach Image] [Type your message here...] [SEND]         │
│   │   │  Estimated tokens: ~50                                       │
│   │   └─────────────────────────────────────────────────────────────┘
│   ├── FEATURES:
│   │   • Markdown rendering for formatted responses
│   │   • Image attachment support (drag & drop or paste)
│   │   • Real-time token estimation
│   │   • Shows which provider/model generated each response
│   │   • Loading indicators during AI processing
│   └── PROPS RECEIVED:
│       • messages: Array of all messages in current session
│       • onSend: Callback when user sends a message
│       • isLoading: Whether AI is currently generating
│       • usage: Token usage statistics
│
└── RELAY VISUALIZATION (Relay.tsx)
    ├── PURPOSE: Show real-time routing/fallback process
    ├── VISUAL REPRESENTATION:
    │   ┌─────────────────────────────────────────────────────────────────┐
    │   │                      ROUTING CHAIN                              │
    │   │  ┌─────────────────────────────────────────────────────────┐   │
    │   │  │ Provider      │ Model              │ Status              │   │
    │   │  ├─────────────────────────────────────────────────────────┤   │
    │   │  │ Groq          │ llama-3.3-70b      │ 🟡 TRYING           │   │
    │   │  │ Gemini        │ gemini-2.0-flash   │ 🟢 SUCCESS          │   │
    │   │  │ Cerebras      │ gpt-oss-120b       │ 🔴 FAILED           │   │
    │   │  │ OpenRouter    │ openrouter/free    │ ⚪ SKIPPED          │   │
    │   │  └─────────────────────────────────────────────────────────┘   │
    │   │                                                                 │
    │   │  STATUS LEGEND:                                                 │
    │   │  ⚪ Gray   = Not yet attempted (no API key or skipped)         │
    │   │  🟡 Amber  = Currently being tried                             │
    │   │  🟢 Teal   = Successfully returned a response                  │
    │   │  🔴 Red    = Failed with error (click for details)            │
    │   └─────────────────────────────────────────────────────────────────┘
    ├── INTERACTIVE FEATURES:
    │   • Click on failed attempts to see error details
    │   • Hover shows documentation links
    │   • Auto-scrolls to show the latest attempt
    │   • Expandable error details with suggested fixes
    └── PROPS RECEIVED:
        • attempts: Array of all routing attempts with their status
        • Each attempt contains: provider, model, status, error info, fixes
```

---

# SECTION 3: COMPLETE DATA FLOW DIAGRAMS

## 3.1 USER ACTION TO RESPONSE FLOW

```
STEP-BY-STEP USER JOURNEY:

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            USER OPENS APPLICATION                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  1. APPLICATION INITIALIZATION                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  page.tsx loads and executes:                                                                         │   │
│  │                                                                                                       │   │
│  │  a) Load from localStorage:                                                                           │   │
│  │     • All previous chat sessions                                                                      │   │
│  │     • All saved API keys (if any)                                                                     │   │
│  │     • User preferences and settings                                                                   │   │
│  │                                                                                                       │   │
│  │  b) Initialize state with loaded data                                                                 │   │
│  │                                                                                                       │   │
│  │  c) Render all UI components with initial state                                                       │   │
│  │                                                                                                       │   │
│  │  RESULT: User sees their previous conversations and any saved keys                                    │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  2. USER SELECTS A PURPOSE                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  User clicks a purpose chip (e.g., "coding"):                                                         │   │
│  │                                                                                                       │   │
│  │  a) PurposeBar updates visual state (highlights selected chip)                                        │   │
│  │                                                                                                       │   │
│  │  b) State updated: purpose = "coding"                                                                 │   │
│  │                                                                                                       │   │
│  │  c) If user has API keys, router will prioritize coding-optimized models                              │   │
│  │                                                                                                       │   │
│  │  RESULT: System now knows to route to coding-specialized models                                       │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  3. USER ENTERS API KEYS (First-time setup)                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  User pastes API key for a provider (e.g., Groq):                                                     │   │
│  │                                                                                                       │   │
│  │  a) KeySettings captures the input                                                                      │   │
│  │                                                                                                       │   │
│  │  b) User clicks [TEST] button                                                                           │   │
│  │                                                                                                       │   │
│  │  c) Validation flow:                                                                                  │   │
│  │     ├─ KeySettings calls onTest("groq", key)                                                          │   │
│  │     ├─ page.tsx sends request to /api/validate-key                                                    │   │
│  │     ├─ Server makes test API call to Groq                                                             │   │
│  │     ├─ Returns success/failure                                                                        │   │
│  │     └─ UI shows ✅ Valid or ❌ Invalid                                                                │   │
│  │                                                                                                       │   │
│  │  d) If valid, key is saved to localStorage and state                                                  │   │
│  │                                                                                                       │   │
│  │  RESULT: System now has authenticated access to Groq provider                                         │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  4. USER TYPES A MESSAGE AND SENDS                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  User types "Write a React component for a todo list" and clicks SEND:                               │   │
│  │                                                                                                       │   │
│  │  a) ChatWindow captures the message                                                                     │   │
│  │                                                                                                       │   │
│  │  b) Message added to current session's messages array                                                   │   │
│  │                                                                                                       │   │
│  │  c) UI immediately shows the user's message (optimistic update)                                       │   │
│  │                                                                                                       │   │
│  │  d) Loading state activated - shows "thinking..." indicator                                           │   │
│  │                                                                                                       │   │
│  │  e) Message persisted to localStorage                                                                   │   │
│  │                                                                                                       │   │
│  │  RESULT: User message is saved and system prepares to get AI response                                 │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  5. ROUTING CHAIN BUILDING (The Smart Part)                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  page.tsx calls router.buildChain() with parameters:                                                  │   │
│  │                                                                                                       │   │
│  │  INPUT PARAMETERS:                                                                                    │   │
│  │  • mode: "free" (or "kodekey" if using KodeKey)                                                       │   │
│  │  • purpose: "coding"                                                                                  │   │
│  │  • availableProviderKeys: ["groq", "gemini"] (only providers with keys)                               │   │
│  │  • preferredModelId: undefined (user didn't pick a specific model)                                    │   │
│  │                                                                                                       │   │
│  │  BUILDCHAIN PROCESS:                                                                                  │   │
│  │                                                                                                       │   │
│  │  Step 1: Select Provider Pool                                                                         │   │
│  │    if mode === "kodekey":                                                                             │   │
│  │      providers = [KODEKEY_PROVIDER]  // Single provider with 40+ models                               │   │
│  │    else:                                                                                              │   │
│  │      providers = FREE_PROVIDERS.filter(p => availableProviderKeys.includes(p.key))                    │   │
│  │      // Only providers where user has entered a key                                                   │   │
│  │                                                                                                       │   │
│  │  Step 2: Create All Possible Combinations                                                             │   │
│  │    For each provider, for each model:                                                                 │   │
│  │    ChainLink = { provider: "groq", model: "llama-3.3-70b-versatile" }                                 │   │
│  │    Results in array like:                                                                             │   │
│  │    [                                                                                                  │   │
│  │      {provider: "groq", model: "llama-3.3-70b"},                                                      │   │
│  │      {provider: "groq", model: "llama-3.1-8b"},                                                       │   │
│  │      {provider: "gemini", model: "gemini-2.0-flash"},                                                 │   │
│  │      ...                                                                                              │   │
│  │    ]                                                                                                  │   │
│  │                                                                                                       │   │
│  │  Step 3: Filter by Purpose                                                                            │   │
│  │    onPurpose = models where model.purposes includes "coding"                                          │   │
│  │    offPurpose = models where model.purposes does NOT include "coding"                                 │   │
│  │                                                                                                       │   │
│  │  Step 4: Sort by Rank                                                                                 │   │
│  │    Lower rank number = higher priority                                                                │   │
│  │    onPurpose.sort((a, b) => a.model.rank - b.model.rank)                                              │   │
│  │                                                                                                       │   │
│  │  Step 5: Combine Lists                                                                                │   │
│  │    finalChain = [...onPurpose, ...offPurpose]                                                         │   │
│  │    // Best coding models first, then everything else as fallback                                      │   │
│  │                                                                                                       │   │
│  │  Step 6: Handle Preferred Model (if any)                                                              │   │
│  │    If user picked a specific model, rotate chain so it comes first                                    │   │
│  │                                                                                                       │   │
│  │  OUTPUT: Ordered array of (provider, model) pairs to try                                              │   │
│  │  Example result for "coding" purpose with Groq + Gemini keys:                                         │   │
│  │  [                                                                                                    │   │
│  │    {provider: "groq", model: "llama-3.3-70b-versatile"},  // rank 1 for coding                         │   │
│  │    {provider: "gemini", model: "gemini-1.5-pro"},        // rank 3 for coding                         │   │
│  │    {provider: "groq", model: "llama-3.1-8b-instant"},    // rank 2 but not coding                     │   │
│  │    {provider: "gemini", model: "gemini-2.0-flash"},      // rank 1 but not coding                     │   │
│  │  ]                                                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  6. ROUTE EXECUTION - TRYING EACH PROVIDER IN ORDER                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  page.tsx calls router.routeChat(chain, messages, keys)                                               │   │
│  │                                                                                                       │   │
│  │  For EACH item in the chain (in order):                                                               │   │
│  │                                                                                                       │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  │  ITERATION 1: {provider: "groq", model: "llama-3.3-70b-versatile"}                               │  │
│  │  │                                                                                                  │  │
│  │  │  a) Check if API key exists:                                                                      │  │
│  │  │     if (!keys["groq"]) {                                                                          │  │
│  │  │       logAttempt("skipped", "No key entered")                                                     │  │
│  │  │       continue to next iteration                                                                  │  │
│  │  │     }                                                                                             │  │
│  │  │                                                                                                  │  │
│  │  │  b) Log attempt with status "trying"                                                              │  │
│  │  │     Relay UI shows: 🟡 Groq • llama-3.3-70b • trying                                             │  │
│  │  │                                                                                                  │  │
│  │  │  c) Determine adapter type:                                                                       │  │
│  │  │     groq.adapter = "openai" → use callOpenAICompatible()                                          │  │
│  │  │                                                                                                  │  │
│  │  │  d) Make API call:                                                                                │  │
│  │  │     POST https://api.groq.com/openai/v1/chat/completions                                          │  │
│  │  │     Headers: {                                                                                    │  │
│  │  │       "Authorization": "Bearer [user's groq key]",                                                │  │
│  │  │       "Content-Type": "application/json"                                                          │  │
│  │  │     }                                                                                             │  │
│  │  │     Body: {                                                                                       │  │
│  │  │       "model": "llama-3.3-70b-versatile",                                                         │  │
│  │  │       "messages": [...],                                                                          │  │
│  │  │       "max_tokens": 2000                                                                          │  │
│  │  │     }                                                                                             │  │
│  │  │                                                                                                  │  │
│  │  │  e) Wait for response with 10-second timeout                                                      │  │
│  │  │                                                                                                  │  │
│  │  │  f) Handle response:                                                                              │  │
│  │  │     ├─ If HTTP 200 (success):                                                                     │  │
│  │  │     │  • Log attempt as "ok"                                                                      │  │
│  │  │     │  • Relay UI shows: 🟢 Groq • llama-3.3-70b • ok                                            │  │
│  │  │     │  • Extract content from response                                                            │  │
│  │  │     │  • Extract token usage if available                                                         │  │
│  │  │     │  • RETURN SUCCESS - Stop trying other providers                                             │  │
│  │  │     │                                                                                             │  │
│  │  │     └─ If error (any status code != 200):                                                         │  │
│  │  │        • Log attempt as "error"                                                                   │  │
│  │  │        • Relay UI shows: 🔴 Groq • llama-3.3-70b • failed                                        │  │
│  │  │        • Classify the error using classifyErrorInfo()                                             │  │
│  │  │        • Store error message, suggested fixes, documentation URL                                  │  │
│  │  │        • Continue to next provider in chain                                                       │  │
│  │  └────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│  │                                                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  │  ITERATION 2: {provider: "gemini", model: "gemini-1.5-pro"} (if Groq failed)                     │  │
│  │  │  Repeat the same process with Gemini provider...                                                  │  │
│  │  └────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│  │                                                                                                       │  │
│  │  If ALL providers in chain fail:                                                                      │  │
│  │  • Return empty content with complete attempt log                                                     │  │
│  │  • UI shows error message with details about each failure                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  7. RESPONSE DELIVERY TO USER                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  routeChat() returns result to page.tsx:                                                              │   │
│  │                                                                                                       │   │
│  │  SUCCESS CASE:                                                                                        │   │
│  │  {                                                                                                    │   │
│  │    content: "Here's a React todo component...",                                                       │   │
│  │    provider: "groq",                                                                                  │   │
│  │    model: "llama-3.3-70b-versatile",                                                                  │   │
│  │    attempts: [...complete log...],                                                                    │   │
│  │    usage: { promptTokens: 45, completionTokens: 234, totalTokens: 279 }                               │   │
│  │  }                                                                                                    │   │
│  │                                                                                                       │   │
│  │  a) Create assistant message with the content                                                         │   │
│  │                                                                                                       │   │
│  │  b) Add to current session's messages array                                                           │   │
│  │                                                                                                       │   │
│  │  c) UI updates to show the AI response                                                                │   │
│  │                                                                                                       │   │
│  │  d) Show metadata: "via Groq • llama-3.3-70b • 279 tokens"                                            │   │
│  │                                                                                                       │   │
│  │  e) Persist everything to localStorage                                                                  │   │
│  │                                                                                                       │   │
│  │  f) Update Relay visualization with final attempt log                                                 │   │
│  │                                                                                                       │   │
│  │  FAILURE CASE:                                                                                        │   │
│  │  {                                                                                                    │   │
│  │    content: "",                                                                                       │   │
│  │    attempts: [                                                                                        │   │
│  │      {provider: "groq", status: "error", error: "Rate limit exceeded", fixes: [...]},               │   │
│  │      {provider: "gemini", status: "error", error: "Invalid API key", fixes: [...]},                 │   │
│  │    ]                                                                                                  │   │
│  │  }                                                                                                    │   │
│  │                                                                                                       │   │
│  │  a) Show error message in chat                                                                        │   │
│  │                                                                                                       │   │
│  │  b) Display Relay visualization with all failures                                                     │   │
│  │                                                                                                       │   │
│  │  c) Allow user to click on failures for suggested fixes                                               │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# SECTION 4: PROVIDER ARCHITECTURE DETAILS

## 4.1 PROVIDER SPECIFICATION STRUCTURE

```
PROVIDER DEFINITION (TypeScript Interface):

interface ProviderSpec {
  key: string;              // Unique identifier used throughout the system
  label: string;            // Human-readable display name
  envVarHint: string;       // Hint for environment variable naming
  baseUrl: string;          // Base URL for API calls
  adapter: string;          // Which adapter function handles this provider
  docsUrl: string;          // Link to provider documentation
  needsExtra?: Array<{      // Optional additional configuration fields
    field: string;          // Field name (e.g., "accountId")
    label: string;          // Display label
    placeholder: string;    // Example/placeholder text
  }>;
  models: ModelSpec[];      // Array of all available models for this provider
}

MODEL DEFINITION (TypeScript Interface):

interface ModelSpec {
  id: string;               // Model identifier sent to API
  label: string;            // Human-readable model name
  purposes: Purpose[];      // Which tasks this model excels at
  rank: number;             // Priority within each purpose (lower = better)
  contextTokens?: number;   // Maximum context window size in tokens
  vision?: boolean;         // Can this model process images?
  imageGen?: boolean;       // Can this model generate images?
}

PURPOSE TYPES:
type Purpose = "general" | "coding" | "reasoning" | "fast" | "long_context" | "vision";

ADAPTER TYPES EXPLAINED:

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        ADAPTER IMPLEMENTATIONS                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

ADAPTER 1: OPENAI-COMPATIBLE (adapter: "openai")
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
Used by: Groq, OpenRouter, Mistral, Cohere, DeepInfra, Cerebras, SambaNova, Fireworks, HuggingFace

Implementation Function: callOpenAICompatible()

HOW IT WORKS:
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                             │
│  REQUEST CONSTRUCTION:                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  Endpoint: POST {provider.baseUrl}/chat/completions                                                 │   │
│  │                                                                                                     │   │
│  │  Headers:                                                                                            │   │
│  │  {                                                                                                   │   │
│  │    "Content-Type": "application/json",                                                               │   │
│  │    "Authorization": "Bearer {user's API key}"                                                        │   │
│  │  }                                                                                                   │   │
│  │                                                                                                     │   │
│  │  Body:                                                                                               │   │
│  │  {                                                                                                   │   │
│  │    "model": "{model.id}",                                                                            │   │
│  │    "messages": [                                                                                     │   │
│  │      { "role": "user", "content": "Hello" }                                                          │   │
│  │    ],                                                                                                │   │
│  │    "max_tokens": 2000                                                                                │   │
│  │  }                                                                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                             │
│  VISION SUPPORT (if model.vision === true):                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  Instead of simple string content, messages use array format:                                       │   │
│  │                                                                                                     │   │
│  │  {                                                                                                   │   │
│  │    "role": "user",                                                                                   │   │
│  │    "content": [                                                                                      │   │
│  │      { "type": "text", "text": "What's in this image?" },                                          │   │
│  │      { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } }                  │   │
│  │    ]                                                                                                 │   │
│  │  }                                                                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                             │
│  RESPONSE HANDLING:                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  Expected Response Format:                                                                           │   │
│  │  {                                                                                                   │   │
│  │    "choices": [                                                                                      │   │
│  │      {                                                                                               │   │
│  │        "message": {                                                                                  │   │
│  │          "content": "Hello! How can I help you today?"                                               │   │
│  │        }                                                                                             │   │
│  │      }                                                                                               │   │
│  │    ],                                                                                                │   │
│  │    "usage": {                                                                                        │   │
│  │      "prompt_tokens": 10,                                                                            │   │
│  │      "completion_tokens": 8,                                                                         │   │
│  │      "total_tokens": 18                                                                              │   │
│  │    }                                                                                                 │   │
│  │  }                                                                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

ADAPTER 2: GEMINI OPENAI-COMPATIBLE (adapter: "gemini_openai")
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
Used by: Google Gemini (via their OpenAI-compatible endpoint)

Special Characteristics:
• Uses Google's OpenAI-compatible wrapper at: https://generativelanguage.googleapis.com/v1beta/openai
• Benefits from Google's massive context windows (1M-2M tokens)
• Excellent vision capabilities
• Same implementation as OpenAI adapter but with different baseUrl

ADAPTER 3: CLOUDFLARE (adapter: "cloudflare")
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
Used by: Cloudflare Workers AI

Special Requirements:
• Requires Account ID (user must provide this extra field)
• Different endpoint structure than OpenAI

Implementation Function: callCloudflare()

HOW IT WORKS:
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                             │
│  ENDPOINT STRUCTURE:                                                                                        │
│  POST {baseUrl}/{accountId}/ai/run/{modelId}                                                                │
│                                                                                                             │
│  TEXT GENERATION:                                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  Request:                                                                                            │   │
│  │  POST https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/run/@cf/meta/llama-3.3-70b         │   │
│  │  Body: { "messages": [...] }                                                                         │   │
│  │                                                                                                     │   │
│  │  Response:                                                                                           │   │
│  │  { "result": { "response": "Generated text here..." } }                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                             │
│  IMAGE GENERATION:                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  Request:                                                                                            │   │
│  │  Body: { "prompt": "A cat wearing a hat" }                                                           │   │
│  │                                                                                                     │   │
│  │  Response Options:                                                                                   │   │
│  │  Option A: Binary image data (Content-Type: image/png)                                               │   │
│  │  Option B: { "result": { "image": "base64encodedstring..." } }                                       │   │
│  │                                                                                                     │   │
│  │  Output Conversion:                                                                                  │   │
│  │  All images converted to: data:image/png;base64,{base64string}                                       │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

ADAPTER 4: REPLICATE (adapter: "replicate")
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
Used by: Replicate (ML model hosting platform)

Special Characteristics:
• Uses "Token" authentication (not "Bearer")
• Requires "Prefer: wait" header for synchronous predictions
• Different request/response format

Implementation Function: callReplicate()

HOW IT WORKS:
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                             │
│  AUTHENTICATION:                                                                                            │
│  Header: "Authorization": "Token {apiKey}"  ← Note: "Token" not "Bearer"                                    │
│                                                                                                             │
│  TEXT GENERATION:                                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  Endpoint: POST https://api.replicate.com/v1/models/{modelId}/predictions                             │   │
│  │                                                                                                     │   │
│  │  Headers: {                                                                                          │   │
│  │    "Prefer": "wait",                                                                                 │   │
│  │    "Authorization": "Token {apiKey}"                                                                 │   │
│  │  }                                                                                                   │   │
│  │                                                                                                     │   │
│  │  Body: {                                                                                             │   │
│  │    "input": {                                                                                        │   │
│  │      "prompt": "user: Hello\nassistant: Hi there!\nuser: How are you?"                              │   │
│  │    }                                                                                                 │   │
│  │  }                                                                                                   │   │
│  │                                                                                                     │   │
│  │  Response: { "output": ["Hi", " there", "!"] }                                                       │   │
│  │  Final content: output.join("") = "Hi there!"                                                        │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                             │
│  IMAGE GENERATION (FLUX model):                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  Body: {                                                                                             │   │
│  │    "input": {                                                                                        │   │
│  │      "prompt": "A beautiful sunset over mountains",                                                  │   │
│  │      "num_outputs": 1                                                                                │   │
│  │    }                                                                                                 │   │
│  │  }                                                                                                   │   │
│  │                                                                                                     │   │
│  │  Response: { "output": ["https://replicate.delivery/pbxt/abc123/image.png"] }                        │   │
│  │  Final output: Direct URL to generated image                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# SECTION 5: ERROR HANDLING AND CLASSIFICATION

## 5.1 ERROR CLASSIFICATION FLOW

```
ERROR CLASSIFICATION SYSTEM (classifyErrorInfo function):

When an API call fails, the system classifies the error and provides helpful fixes:

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        ERROR CLASSIFICATION TREE                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

INPUT: HTTP Status Code + Response Body Text + Provider Key

                    ┌─────────────────────────────────────┐
                    │         ANALYZE ERROR               │
                    └─────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
            ┌───────────────┐                      ┌───────────────┐
            │  STATUS 401   │                      │  STATUS 429   │
            │  STATUS 403   │                      │  RATE LIMIT   │
            │  INVALID KEY  │                      │  QUOTA ERROR  │
            │  UNAUTHORIZED │                      └───────────────┘
            └───────────────┘                              │
                    │                                      │
                    ▼                                      ▼
            ┌───────────────┐                      ┌───────────────┐
            │  ISSUE TYPE:  │                      │  ISSUE TYPE:  │
            │  auth or      │                      │  rate_limit   │
            │  invalid_key  │                      └───────────────┘
            └───────────────┘                              │
                    │                                      │
                    ▼                                      ▼
            ┌───────────────────────────────────────────────────────────────┐
            │                    USER MESSAGE                               │
            │  "That key was rejected (invalid or unauthorized)."           │
            │  or                                                          │
            │  "Rate limit or token quota was hit on this model."           │
            └───────────────────────────────────────────────────────────────┘
                    │                                      │
                    ▼                                      ▼
            ┌───────────────────────────────────────────────────────────────┐
            │                    SUGGESTED FIXES                            │
            │  1. Re-copy the key from provider dashboard                   │
            │  2. Confirm key hasn't been revoked                           │
            │  3. Check you're in the right mode (free vs kodekey)          │
            │     ─────────────────────────────────────────                 │
            │  1. Wait 30-60 seconds and try again                          │
            │  2. Try a smaller/faster model                                │
            │  3. Check provider dashboard for remaining quota              │
            └───────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │         STATUS 404                  │
                    │  MODEL NOT FOUND                    │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────┐
                    │  Check if error mentions "model":   │
                    │  ├─ YES: model_unavailable          │
                    │  └─ NO:  wrong_endpoint             │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────┐
                    │  If wrong_endpoint:                 │
                    │  "URL not recognized - provider     │
                    │   changed their API path"           │
                    │                                     │
                    │  If model_unavailable:              │
                    │  "Model not available on account"   │
                    └─────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │         STATUS 400                  │
                    │  STATUS 422                         │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────┐
                    │  Check response body for:           │
                    │  ├─ "account/billing/payment":      │
                    │  │   → configuration issue          │
                    │  └─ Other malformed request:        │
                    │      → configuration issue          │
                    └─────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │         STATUS 500+                 │
                    │  SERVER ERROR                       │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────┐
                    │  ISSUE TYPE: provider_issue         │
                    │  "Provider had a server error"      │
                    │  Fixes: Wait and try again          │
                    └─────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │         NO STATUS CODE              │
                    │  (Network error/timeout)            │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────┐
                    │  ISSUE TYPE: provider_issue         │
                    │  "Couldn't reach the provider"      │
                    │  Fixes:                             │
                    │  • Check network connection         │
                    │  • Provider might be blocked        │
                    │  • Try different provider           │
                    └─────────────────────────────────────┘

PROVIDER-SPECIFIC HINTS (Added to all error messages):

Each provider has documented gotchas in PROVIDER_SETUP_HINTS:

Provider     │ Specific Setup Requirements
─────────────┼────────────────────────────────────────────────────────────────────────────────────────────
groq         │ Create keys at console.groq.com/keys — free tier has per-minute rate limits
gemini       │ Create keys at aistudio.google.com/apikey — enable Gemini API in Google Cloud project
openrouter   │ Some "free" models are rate-limited per day — try different model if hitting limits
mistral      │ Free tier needs email verification, sometimes phone verification required
cohere       │ Trial keys are rate-limited — wait a few seconds on 429 errors
deepinfra    │ Requires small credit balance even for cheap models — check Billing page
cerebras     │ Free tier is invite/waitlist based — confirm account has API access granted
sambanova    │ Free-tier at cloud.sambanova.ai — limited preview, may need waitlist approval
fireworks    │ Create keys at fireworks.ai/account/api-keys — trial credits expire, check billing
replicate    │ Keys start with "r8_" — requires billing setup even for free/cheap models
cloudflare   │ Needs scoped API Token + 32-character Account ID from dashboard URL
huggingface  │ Use tokens with "Inference" permissions — some models require license acceptance
```

---

# SECTION 6: COMPLETE FILE STRUCTURE

## 6.1 PROJECT DIRECTORY TREE

```
MENTORTMG/
│
├── 📁 app/                                    # Next.js App Router
│   ├── 📁 api/                                # API Routes (Serverless Functions)
│   │   ├── 📁 chat/
│   │   │   └── route.ts                       # Main relay endpoint - receives messages, routes to providers
│   │   ├── 📁 validate-key/
│   │   │   └── route.ts                       # Tests if an API key is valid before saving
│   │   └── 📁 kodekey-advise/
│   │       └── route.ts                       # Provides KodeKey plan recommendations
│   ├── layout.tsx                             # Root layout with metadata and providers
│   ├── page.tsx                               # Main application component - orchestrates everything
│   └── globals.css                            # Global styles with Tailwind CSS
│
├── 📁 components/                             # React Components
│   ├── Sidebar.tsx                            # Session management sidebar
│   ├── PurposeBar.tsx                         # Purpose selection and model preferences
│   ├── KeySettings.tsx                        # API key input and validation
│   ├── ChatWindow.tsx                         # Main chat interface with messages
│   └── Relay.tsx                              # Real-time routing visualization
│
├── 📁 lib/                                    # Core Business Logic Libraries
│   ├── providers.ts                           # Complete catalog of all 12+ providers and 50+ models
│   ├── router.ts                              # Routing engine - builds chains, handles fallbacks
│   ├── tokens.ts                              # Token estimation algorithms
│   ├── sessionNames.ts                        # Generates memorable names like "Curious Falcon"
│   ├── store.ts                               # localStorage state management
│   ├── types.ts                               # TypeScript type definitions
│   └── fetchTimeout.ts                        # Network requests with 10-second timeout
│
├── 📄 package.json                            # Dependencies and scripts
├── 📄 tsconfig.json                           # TypeScript configuration
├── 📄 tailwind.config.ts                      # Tailwind CSS configuration
├── 📄 next.config.js                          # Next.js configuration
├── 📄 README.md                               # Project documentation
├── 📄 API_KEYS_CONFIG.md                      # API key configuration guide
└── 📄 DIAGRAMS.md                             # This file - complete system documentation
```

---

# SECTION 7: KEY CONCEPTS SUMMARY

## 7.1 CORE CONCEPTS EXPLAINED

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           KEY CONCEPTS GLOSSARY                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

CONCEPT: ChainLink
──────────────────
Definition: A single (provider, model) pair that can be attempted
Example: { providerKey: "groq", provider: {...}, model: {id: "llama-3.3-70b", ...} }
Usage: Router builds an array of ChainLinks to try in order until one succeeds

CONCEPT: buildChain()
─────────────────────
Definition: Function that creates the ordered list of providers/models to try
Input: mode, purpose, available keys, preferred model (optional)
Output: ChainLink[] - ordered array of attempts
Logic: Prioritizes models tagged for the requested purpose, sorted by rank

CONCEPT: routeChat()
────────────────────
Definition: Executes the routing chain, trying each provider until one succeeds
Input: chain (ChainLink[]), messages, API keys
Output: RouteResult with content, provider info, and complete attempt log
Behavior: Stops on first success, continues on failure, handles all adapter types

CONCEPT: Adapter Pattern
────────────────────────
Definition: Different providers require different API formats - adapters abstract this
Types: "openai", "gemini_openai", "cloudflare", "replicate"
Purpose: Allows uniform handling of diverse provider APIs in the routing logic

CONCEPT: Purpose-Based Routing
──────────────────────────────
Definition: Models are tagged with purposes they excel at; routing prioritizes these
Purposes: general, coding, reasoning, fast, long_context, vision
Benefit: Users get the best model for their specific task automatically

CONCEPT: Circular Fallback
──────────────────────────
Definition: If all models fail, the system has tried everything available
Behavior: Complete attempt log shows all failures with error details
User Action: Can click on failures to see suggested fixes and documentation

CONCEPT: Stateless API Routes
─────────────────────────────
Definition: Next.js API routes don't store any data - they're pure request forwarders
Benefit: Zero privacy concerns, instant scalability, simple deployment
Data Flow: Browser → API Route → External Provider → API Route → Browser

CONCEPT: localStorage Persistence
─────────────────────────────────
Definition: All application state (sessions, messages, keys) stored in browser
Privacy: API keys never leave the user's browser
Persistence: Data survives browser refreshes but is device-specific

CONCEPT: Real-time Relay Visualization
──────────────────────────────────────
Definition: Live display of routing attempts as they happen
Visual States: trying (amber), success (teal), failed (red), skipped (gray)
Benefit: Users understand what's happening and can debug issues

CONCEPT: Token Estimation
─────────────────────────
Definition: When providers don't return usage data, system estimates token counts
Method: Simple character-based estimation (not exact but useful for UI)
Display: Shows "~" prefix when estimated, exact numbers when provided by provider
```

---

# SECTION 8: QUICK REFERENCE

## 8.1 COMMON TASKS AND LOCATIONS

```
TASK                                    │ FILE LOCATION                    │ FUNCTION/METHOD
────────────────────────────────────────┼──────────────────────────────────┼────────────────────────────
Add a new free provider                 │ lib/providers.ts                 │ Add to FREE_PROVIDERS array
Add a model to existing provider        │ lib/providers.ts                 │ Add to provider.models array
Change routing logic                    │ lib/router.ts                    │ Modify buildChain() or routeChat()
Add new error classification            │ lib/router.ts                    │ Add to classifyErrorInfo()
Modify UI layout                        │ app/page.tsx                     │ Edit component rendering
Add new purpose type                    │ lib/types.ts + lib/providers.ts  │ Update Purpose type + usage
Change token estimation                 │ lib/tokens.ts                    │ Modify estimateTokens()
Add new adapter type                    │ lib/router.ts                    │ Create new callXxx() function
Update API route behavior               │ app/api/chat/route.ts            │ Modify the POST handler
Change session naming                   │ lib/sessionNames.ts              │ Modify generateSessionName()
Add new component                       │ components/YourComponent.tsx     │ Create new .tsx file
Style changes                           │ app/globals.css                  │ Add Tailwind or custom CSS
```

---

END OF DOCUMENTATION

This documentation provides complete visual diagrams and explanations for every aspect of the MentorTMG Relay system. All diagrams use expanded text format for maximum readability and understanding.