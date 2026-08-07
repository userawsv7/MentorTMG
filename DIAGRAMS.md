# MentorTMG Relay System - Complete Architecture Documentation

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-system-architecture-diagram)
3. [Component Breakdown](#3-component-breakdown)
4. [Data Flow Diagram](#4-data-flow-diagram)
5. [Provider Architecture](#5-provider-architecture)
6. [Routing Engine Diagram](#6-routing-engine-diagram)
7. [API Endpoints Map](#7-api-endpoints-map)
8. [State Management Diagram](#8-state-management-diagram)
9. [User Journey Flow](#9-user-journey-flow)
10. [Error Handling Flow](#10-error-handling-flow)
11. [Complete Component Documentation](#11-complete-component-documentation)

---

## 1. System Overview

### What is MentorTMG Relay?
MentorTMG is a **multi-provider AI chat relay system** that intelligently routes user messages through various free-tier API providers (Groq, Gemini, OpenRouter, Cerebras, etc.) or through a single KodeKey gateway, automatically handling fallbacks when providers fail or rate-limit.

### Core Purpose
- **Smart Routing**: Routes requests to the best available model based on user-selected purpose
- **Automatic Fallback**: Falls back to next provider/model when errors occur
- **Zero Backend Storage**: All data lives in browser localStorage (privacy-first)
- **Multi-Provider Support**: 12+ free providers + KodeKey gateway

### Key Features
| Feature | Description |
|---------|-------------|
| Purpose-based Routing | Routes to models optimized for general, coding, reasoning, fast, long-context, or vision tasks |
| Circular Fallback | If preferred model fails, wraps around to try all available models |
| Real-time Visualization | Shows live relay chain with status indicators (trying → success/failure) |
| Key Validation | Instant testing of API keys before use |
| Token Estimation | Estimates token usage when providers don't return usage data |
| Image Generation | Supports vision models and image generation capabilities |

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    MENTORTMG RELAY SYSTEM ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           USER INTERFACE LAYER                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Sidebar    │  │  PurposeBar  │  │  KeySettings │  │  ChatWindow  │  │    Relay     │          │
│  │              │  │              │  │              │  │              │  │              │          │
│  │• Sessions    │  │• Purpose     │  │• API Key     │  │• Messages    │  │• Chain Vis   │  │
│  │• New Chat    │  │  Chips       │  │  Inputs      │  │• Composer    │  │• Status      │          │
│  │• History     │  │• Model Pref  │  │• Test Btns   │  │• Attachments │  │• Live Updates│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                 │                 │                  │
│         └─────────────────┴─────────────────┴─────────────────┴─────────────────┘                  │
│                                           │                                                          │
│                                    ┌──────┴──────┐                                                   │
│                                    │  page.tsx   │  ← Main App Shell (orchestrates all components)  │
│                                    │  (Root UI)  │                                                   │
│                                    └──────┬──────┘                                                   │
└───────────────────────────────────────────┼──────────────────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────┼──────────────────────────────────────────────────────────┐
│                                    APPLICATION LOGIC LAYER                                          │
│                                           │                                                          │
│  ┌───────────────────────────────────────┴─────────────────────────────────────────────────────┐  │
│  │                                     STATE MANAGEMENT                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │  │
│  │  │                              lib/store.ts (localStorage)                              │    │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │  │
│  │  │  │  Sessions   │  │  Messages   │  │  API Keys   │  │  Settings   │  │  Preferences│ │    │  │
│  │  │  │             │  │             │  │             │  │             │  │             │ │    │  │
│  │  │  │• ID         │  │• SessionID  │  │• Provider   │  │• Theme      │  │• Purpose    │ │    │  │
│  │  │  │• Name       │  │• Role       │  │• Key Value  │  │• Layout     │  │• Collapsed  │ │    │  │
│  │  │  │• Created    │  │• Content    │  │• Timestamp  │  │• State      │  │• State      │ │    │  │
│  │  │  │• Updated    │  │• Attachments│  │• Validated  │  │             │  │• Model Pref │ │    │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │  │
│  │  └─────────────────────────────────────────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                           │                                                          │
│  ┌───────────────────────────────────────┴─────────────────────────────────────────────────────┐  │
│  │                                      CORE LIBRARIES                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │  │
│  │  │ providers.ts│  │  router.ts  │  │  tokens.ts  │  │sessionNames │  │fetchTimeout │         │  │
│  │  │             │  │             │  │             │  │             │  │             │         │  │
│  │  │• FREE_PROV  │  │• buildChain │  │• estimate   │  │• generate   │  │• fetch w/   │         │  │
│  │  │• KODEKEY    │  │• routeChat  │  │• count      │  │• "Curious   │  │  timeout    │         │  │
│  │  │• All Models │  │• classify   │  │• tokens     │  │  Falcon"    │  │• 10s limit  │         │  │
│  │  │• Adapters   │  │• Error Info │  │• usage      │  │• Names      │  │• Abortable  │         │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                           │                                                          │
└───────────────────────────────────────────┼──────────────────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────┼──────────────────────────────────────────────────────────┐
│                                    API ROUTES LAYER (Next.js)                                       │
│                                           │                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                    app/api/                                                 │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐                │  │
│  │  │  /chat/route.ts     │  │ /validate-key/      │  │ /kodekey-advise/    │                │  │
│  │  │                     │  │   route.ts          │  │   route.ts          │                │  │
│  │  │• Main relay endpoint│  │• Key validation     │  │• KodeKey advice     │                │  │
│  │  │• Receives messages  │  │• Tests API keys     │  │• Plan recommendations│                │  │
│  │  │• Calls routeChat()  │  │• Instant feedback   │  │• Model suggestions  │                │  │
│  │  │• Returns response   │  │• Status codes       │  │• Usage guidance     │                │  │
│  │  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘                │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                           │                                                          │
└───────────────────────────────────────────┼──────────────────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────┼──────────────────────────────────────────────────────────┐
│                              EXTERNAL PROVIDER LAYER (12+ Providers)                                 │
│                                           │                                                          │
│  FREE PROVIDERS (via FREE_PROVIDERS array):                                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │  Groq   │ │ Gemini  │ │OpenRouter││ Mistral │ │ Cohere  │ │DeepInfra│ │Cerebras │            │
│  │         │ │         │ │         │ │         │ │         │ │         │ │         │            │
│  │• Fast   │ │• Vision │ │• Free   │ │• Quality│ │• RAG    │ │• Open   │ │• Speed  │            │
│  │• Llama  │ │• 1M ctx │ │• Models │ │• Models │ │• Models │ │• Source │ │• 120B   │            │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘            │
│       │           │           │           │           │           │           │                  │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐            │
│  │SambaNova│ │Fireworks│ │HuggingF.│ │Replicate│ │Cloudflare││         │ │         │            │
│  │         │ │         │ │         │ │         │ │         │ │         │ │         │            │
│  │• Llama  │ │• Mixtral│ │• Router │ │• Images │ │• Workers│ │         │ │         │            │
│  │• 70B    │ │• 8x7B   │ │• Models │ │• FLUX   │ │• AI     │ │         │ │         │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                                                                                                    │
│  KODEKEY GATEWAY (Single Provider, 40+ Models):                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                                    KODEKEY_PROVIDER                                          ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      ││
│  │  │ Claude Opus  │ │   GPT-5.6    │ │  Gemini 3.1  │ │  DeepSeek V4 │ │   Grok 4.3   │      ││
│  │  │    5/4.8     │ │    Sol/5.2   │ │    Pro       │ │     Pro      │ │              │      ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      ││
│  │  │Claude Sonnet │ │   GPT-5.4    │ │  Qwen3 Coder │ │   Kimi K3    │ │  Moonshot    │      ││
│  │  │    5/4.6     │ │    /5.5      │ │    Plus      │ │   /K2.5      │ │    Models    │      ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      ││
│  │                              ... (40+ models total) ...                                    ││
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Explanations

#### Layer 1: User Interface Layer
**Purpose**: Provides the visual interface for user interaction
**Components**:
- **Sidebar**: Manages chat sessions (create, view, switch between conversations)
- **PurposeBar**: Lets users select the task type (coding, reasoning, etc.) and preferred model
- **KeySettings**: Secure input and validation of API keys for each provider
- **ChatWindow**: Main conversation area with message history and input composer
- **Relay**: Live visualization of the routing chain showing which providers are being tried

**How it connects**: All UI components are orchestrated by `page.tsx`, which maintains the application state and passes data between components.

#### Layer 2: Application Logic Layer
**Purpose**: Contains all business logic, state management, and core algorithms
**Sub-layers**:
1. **State Management (store.ts)**: Persists all application data in browser's localStorage
   - Sessions: Chat history organized by conversation
   - Messages: Individual messages with role, content, and attachments
   - API Keys: User-provided keys for each provider (never sent to server)
   - Settings: UI preferences and configuration

2. **Core Libraries**: Reusable modules that handle specific functionality
   - providers.ts: Complete catalog of all supported providers and their models
   - router.ts: The intelligent routing engine that builds chains and handles fallbacks
   - tokens.ts: Token estimation algorithms for cost/usage tracking
   - sessionNames.ts: Generates memorable names like "Curious Falcon"
   - fetchTimeout.ts: Network request handling with 10-second timeout

#### Layer 3: API Routes Layer
**Purpose**: Serverless API endpoints that act as intermediaries between the frontend and external providers
**Endpoints**:
- `/api/chat`: Main relay endpoint - receives messages, calls routeChat(), returns responses
- `/api/validate-key`: Tests if an API key is valid before saving it
- `/api/kodekey-advise`: Provides recommendations for KodeKey plan selection

**Why this architecture?**: The API routes never store any data - they are stateless and simply forward requests to the appropriate external provider.

#### Layer 4: External Provider Layer
**Purpose**: Connection points to 12+ AI providers offering free tiers or paid access through KodeKey

**Free Providers** (each with multiple models):
- **Groq**: Ultra-fast inference for Llama models
- **Gemini**: Google's multimodal AI with 1M+ context and vision
- **OpenRouter**: Aggregator providing access to free models
- **Mistral**: High-quality European AI models
- **Cohere**: Specialized in RAG and enterprise use cases
- **DeepInfra**: Open-source model hosting
- **Cerebras**: Ultra-fast inference with large models (120B parameters)
- **SambaNova**: High-performance Llama deployments
- **Fireworks**: Optimized inference for various models
- **HuggingFace**: Access to thousands of open models
- **Replicate**: ML model hosting with image generation
- **Cloudflare**: Edge AI deployment platform

**KodeKey Gateway**: Single provider with 40+ premium models accessible through one API key

---

## 3. Component Breakdown

### Detailed Component Analysis

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    COMPONENT HIERARCHY & RESPONSIBILITIES                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  page.tsx (ROOT COMPONENT)                                                                           │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │ RESPONSIBILITIES:                                                                              │ │
│  │ • Orchestrates all child components                                                            │ │
│  │ • Manages global application state                                                             │ │
│  │ • Handles mode switching (free vs kodekey)                                                     │ │
│  │ • Coordinates chat sessions and message flow                                                   │ │
│  │ • Integrates with store.ts for persistence                                                     │ │
│  │                                                                                                │ │
│  │ STATE MANAGED:                                                                                 │ │
│  │ • sessions: Array<Session> - All chat conversations                                            │ │
│  │ • currentSessionId: string - Active conversation                                               │ │
│  │ • messages: Array<Message> - Messages in current session                                       │ │
│  │ • keys: Record<string, string> - API keys by provider                                          │ │
│  │ • purpose: Purpose - Selected task type                                                        │ │
│  │ • mode: "free" | "kodekey" - Operating mode                                                    │ │
│  │ • extra: Record<string, any> - Provider-specific config (e.g., Cloudflare accountId)           │ │
│  └────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ↓ Child Components

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   Sidebar.tsx        │  │   PurposeBar.tsx     │  │  KeySettings.tsx     │  │   ChatWindow.tsx     │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ PURPOSE:             │  │ PURPOSE:             │  │ PURPOSE:             │  │ PURPOSE:             │
│ Session navigation   │  │ Purpose & model      │  │ API key management   │  │ Message display &    │
│ and management       │  │ selection interface  │  │ and validation       │  │ input handling       │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ FEATURES:            │  │ FEATURES:            │  │ FEATURES:            │  │ FEATURES:            │
│ • Session list       │  │ • 6 purpose chips    │  │ • Key input fields   │  │ • Message bubbles    │
│ • Create new chat    │  │ • Model preference   │  │ • Test buttons       │  │ • Markdown support   │
│ • Delete sessions    │  │   dropdowns          │  │ • Validation status  │  │ • Image attachments  │
│ • Human-readable     │  │ • Visual purpose     │  │ • Error messages     │  │ • File upload        │
│   names              │  │   indicators         │  │ • Provider docs      │  │ • Token estimates    │
│ • Collapsible        │  │ • Rank indicators    │  │   links              │  │ • Send button        │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ PROPS:               │  │ PROPS:               │  │ PROPS:               │  │ PROPS:               │
│ • sessions           │  │ • purpose            │  │ • keys               │  │ • messages           │
│ • currentSessionId   │  │ • preferredModel     │  │ • onKeyChange        │  │ • onSend             │
│ • onSelect           │  │ • onPurposeChange    │  │ • onTest             │  │ • isLoading          │
│ • onDelete           │  │ • onModelPreference  │  │ • mode               │  │ • usage              │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘

                                    ↓ Visualization Component

┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Relay.tsx                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PURPOSE: Provides real-time visualization of the routing/fallback process                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│  VISUAL REPRESENTATION:                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                    RELAY CHAIN VISUALIZATION                                   │   │
│  │                                                                                               │   │
│  │  [Provider] → [Model] → [Status]                                                              │   │
│  │  ─────────────────────────────────────                                                        │   │
│  │  Groq       llama-3.3-70b    ● trying  (amber/yellow)                                        │   │
│  │  Gemini     gemini-2.0-flash ● ok      (teal/green)                                          │   │
│  │  Cerebras   gpt-oss-120b     ● failed  (red)                                                 │   │
│  │  OpenRouter openrouter/free  ● skipped (gray)                                                │   │
│  │                                                                                               │   │
│  │  Status Colors:                                                                               │   │
│  │  ● Gray   = Not yet attempted / No key provided                                               │   │
│  │  ● Amber  = Currently being tried                                                             │   │
│  │  ● Teal   = Successfully returned response                                                    │   │
│  │  ● Red    = Failed with error (will show error details on click)                              │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                     │
│  DATA RECEIVED:                                                                                     │
│  • attempts: Array<AttemptLog> - Each routing attempt with status                                   │
│  • Each attempt contains: provider, model, status, error (if any), fixes                            │
│                                                                                                     │
│  INTERACTION:                                                                                       │
│  • Click on failed attempt to see error details and suggested fixes                                 │
│  • Hover shows provider documentation links                                                         │
│  • Auto-scrolls to show latest attempt                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    COMPLETE DATA FLOW DIAGRAM                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

USER ACTION FLOW:
═════════════════

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│  Selects    │────▶│   Types     │────▶│   Clicks    │────▶│   Views     │
│  Opens App  │     │  Purpose    │     │  Message    │     │    Send     │     │  Response   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Load from  │     │ Update      │     │ Store in    │     │ Trigger     │     │ Display     │
│localStorage │     │ purpose     │     │ draft       │     │ routeChat() │     │ result      │
│             │     │ state       │     │ message     │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘

DETAILED MESSAGE FLOW:
══════════════════════

Step 1: USER INPUT
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  User composes message in ChatWindow.tsx                                                    │
│  ├─ Can include text content                                                                 │
│  ├─ Can attach images (base64 encoded)                                                       │
│  └─ Token count estimated in real-time                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
Step 2: MESSAGE PERSISTENCE
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Message added to current session's message array                                            │
│  ├─ Saved to localStorage via store.ts                                                       │
│  ├─ UI immediately updates to show user message                                              │
│  └─ Loading state activated                                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
Step 3: ROUTING CHAIN BUILDING (router.ts:buildChain)
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Input Parameters:                                                                           │
│  • mode: "free" or "kodekey"                                                                 │
│  • purpose: Selected purpose (general/coding/reasoning/fast/long_context/vision)             │
│  • availableProviderKeys: Which providers have API keys entered                              │
│  • preferredModelId: Optional specific model preference                                      │
│                                                                                               │
│  Process:                                                                                    │
│  1. Select provider pool (FREE_PROVIDERS or [KODEKEY_PROVIDER])                              │
│  2. Filter by available keys (free mode) or include all (kodekey mode)                       │
│  3. Create ChainLink[] with all (provider, model) combinations                               │
│  4. Filter out image-only models for text chat (and vice versa)                              │
│  5. Separate into on-purpose and off-purpose lists                                           │
│  6. Sort each list by model rank (lower rank = better)                                       │
│  7. Combine: on-purpose models first, then off-purpose                                       │
│  8. If preferred model selected, rotate chain so it comes first                              │
│                                                                                               │
│  Output: ChainLink[] - Ordered list of (provider, model) pairs to try                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
Step 4: ROUTE EXECUTION (router.ts:routeChat)
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  For each ChainLink in order:                                                                │
│                                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐     │
│  │  Check if API key exists for this provider                                            │     │
│  │  ├─ If no key: Log "skipped" attempt, continue to next                                │     │
│  │  └─ If key exists: Proceed to API call                                                │     │
│  └─────────────────────────────────────────────────────────────────────────────────────┘     │
│                                        │                                                     │
│                                        ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐     │
│  │  Log attempt with status "trying"                                                     │     │
│  │  └─ UI updates to show amber "trying" indicator                                       │     │
│  └─────────────────────────────────────────────────────────────────────────────────────┘     │
│                                        │                                                     │
│                                        ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐     │
│  │  Select adapter based on provider.adapter:                                            │     │
│  │  ├─ "openai" → callOpenAICompatible()                                                │     │
│  │  ├─ "gemini_openai" → callOpenAICompatible() (uses OpenAI-compatible endpoint)        │     │
│  │  ├─ "cloudflare" → callCloudflare()                                                  │     │
│  │  ├─ "replicate" → callReplicate()                                                    │     │
│  │  └─ Default → callOpenAICompatible()                                                 │     │
│  └─────────────────────────────────────────────────────────────────────────────────────┘     │
│                                        │                                                     │
│                                        ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐     │
│  │  Make API call with:                                                                  │     │
│  │  • Provider's baseUrl + appropriate endpoint                                          │     │
│  │  • Bearer token authentication                                                        │     │
│  │  • Model ID                                                                           │     │
│  │  • Messages array (with vision support if model supports it)                          │     │
│  │  • 10-second timeout via fetchWithTimeout()                                           │     │
│  └─────────────────────────────────────────────────────────────────────────────────────┘     │
│                                        │                                                     │
│                                        ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐     │
│  │  Handle Response:                                                                     │     │
│  │  ├─ Success (ok: true):                                                               │     │
│  │  │  • Log attempt as "ok" (teal indicator)                                           │     │
│  │  │  • Extract content and usage data                                                 │     │
│  │  │  • Return immediately with result                                                 │     │
│  │  │  • Stop trying other providers                                                    │     │
│  │  └─ Failure (ok: false):                                                              │     │
│  │     • Log attempt as "error" (red indicator)                                          │     │
│  │     • Classify error using classifyErrorInfo()                                        │     │
│  │     • Store error message, suggested fixes, docs URL                                  │     │
│  │     • Continue to next provider in chain                                              │     │
│  └─────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                               │
│  If all providers fail:                                                                       │
│  └─ Return with empty content and complete attempt log                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
Step 5: RESPONSE HANDLING
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  API route returns response to ChatWindow                                                    │
│  ├─ Success: Add assistant message to conversation                                           │
│  │  • Include model name and provider that succeeded                                         │
│  │  • Show token usage if available                                                          │
│  │  • Display generated images if any                                                        │
│  ├─ Failure: Show error message                                                              │
│  │  • Display which providers were tried                                                     │
│  │  • Show error details for each failure                                                    │
│  │  • Provide suggested fixes                                                                │
│  └─ Always: Save complete attempt log for Relay visualization                                │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
Step 6: PERSISTENCE
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  All data saved to localStorage:                                                             │
│  • Updated message history                                                                   │
│  • Session metadata (last updated timestamp)                                                 │
│  • Complete routing attempt logs                                                             │
│  └─ Data persists across browser refreshes and sessions                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Provider Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    PROVIDER ARCHITECTURE DETAIL                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

PROVIDER SPECIFICATION STRUCTURE:
═════════════════════════════════

interface ProviderSpec {
  key: string;              // Unique identifier (e.g., "groq", "cerebras")
  label: string;            // Display name (e.g., "Groq", "Cerebras")
  envVarHint: string;       // Environment variable name hint
  baseUrl: string;          // API base URL
  adapter: string;          // Which adapter function to use
  docsUrl: string;          // Documentation link
  needsExtra?: Array<{      // Optional extra configuration fields
    field: string;
    label: string;
    placeholder: string;
  }>;
  models: ModelSpec[];      // Array of available models
}

interface ModelSpec {
  id: string;               // Model identifier for API calls
  label: string;            // Human-readable model name
  purposes: Purpose[];      // Which purposes this model excels at
  rank: number;             // Priority within purpose (lower = better)
  contextTokens?: number;   // Maximum context window size
  vision?: boolean;         // Supports image input
  imageGen?: boolean;       // Generates images as output
}

PURPOSE DEFINITIONS:
════════════════════
Purpose      │ Description                    │ Best For
─────────────┼────────────────────────────────┼────────────────────────────────────
general      │ General chat and conversation  │ Casual queries, explanations
coding       │ Code generation and analysis   │ Programming, debugging, refactoring
reasoning    │ Deep thinking and analysis     │ Complex problems, math, logic
fast         │ Quick responses                │ Simple queries, real-time chat
long_context │ Large context windows          │ Document analysis, long conversations
vision       │ Image understanding/generation │ Image analysis, visual tasks

ADAPTER TYPES EXPLAINED:
════════════════════════

1. OPENAI ADAPTER (adapter: "openai")
   ┌─────────────────────────────────────────────────────────────────────────────────────────┐
   │  Used by: Groq, OpenRouter, Mistral, Cohere, DeepInfra, Cerebras, SambaNova,            │
   │           Fireworks, HuggingFace                                                          │
   │                                                                                           │
   │  Implementation: callOpenAICompatible()                                                   │
   │  • Endpoint: POST {baseUrl}/chat/completions                                              │
   │  • Auth: Authorization: Bearer {apiKey}                                                   │
   │  • Body: { model, messages, max_tokens }                                                  │
   │  • Response: OpenAI-compatible JSON with choices[0].message.content                       │
   │                                                                                           │
   │  Vision Support: Automatically converts message attachments to image_url parts           │
   │  • Text-only: { role: "user", content: "Hello" }                                          │
   │  • With vision: { role: "user", content: [{ type: "text", text: "..." },                  │
   │                                       { type: "image_url", image_url: { url: "..." } }]}  │
   └─────────────────────────────────────────────────────────────────────────────────────────┘

2. GEMINI OPENAI ADAPTER (adapter: "gemini_openai")
   ┌─────────────────────────────────────────────────────────────────────────────────────────┐
   │  Used by: Gemini (via OpenAI-compatible endpoint)                                         │
   │                                                                                           │
   │  Implementation: callOpenAICompatible() (same as OpenAI adapter)                          │
   │  • Endpoint: POST https://generativelanguage.googleapis.com/v1beta/openai/chat/completions│
   │  • Special: Uses Google's OpenAI-compatible wrapper                                       │
   │  • Benefits: 1M-2M context windows, excellent vision support                              │
   │  • Models: gemini-2.0-flash, gemini-1.5-pro, etc.                                         │
   └─────────────────────────────────────────────────────────────────────────────────────────┘

3. CLOUDFLARE ADAPTER (adapter: "cloudflare")
   ┌─────────────────────────────────────────────────────────────────────────────────────────┐
   │  Used by: Cloudflare Workers AI                                                           │
   │                                                                                           │
   │  Implementation: callCloudflare()                                                         │
   │  • Requires: Account ID (extra configuration field)                                       │
   │  • Endpoint: POST {baseUrl}/{accountId}/ai/run/{modelId}                                  │
   │                                                                                           │
   │  Text Generation:                                                                          │
   │  • Body: { messages: [...] }                                                              │
   │  • Response: { result: { response: "..." } }                                              │
   │                                                                                           │
   │  Image Generation:                                                                         │
   │  • Body: { prompt: "..." }                                                                │
   │  • Response: Binary image data or { result: { image: "base64..." } }                      │
   │  • Output: Converted to data:image/png;base64 format                                      │
   └─────────────────────────────────────────────────────────────────────────────────────────┘

4. REPLICATE ADAPTER (adapter: "replicate")
   ┌─────────────────────────────────────────────────────────────────────────────────────────┐
   │  Used by: Replicate                                                                       │
   │                                                                                           │
   │  Implementation: callReplicate()                                                          │
   │  • Endpoint: POST {baseUrl}/models/{modelId}/predictions                                  │
   │  • Header: Prefer: wait (synchronous predictions)                                         │
   │  • Auth: Authorization: Token {apiKey} (note: "Token" not "Bearer")                       │
   │                                                                                           │
   │  Text Generation:                                                                          │
   │  • Body: { input: { prompt: "user: hi\nassistant: hello..." } }                           │
   │  • Response: { output: ["generated", "text", "array"] }                                   │
   │                                                                                           │
   │  Image Generation (FLUX model):                                                            │
   │  • Body: { input: { prompt: "...", num_outputs: 1 } }                                     │
   │  • Response: { output: ["https://replicate.delivery/..."] }                               │
   │  • Output: Direct URL to generated image                                                  │
   └─────────────────────────────────────────────────────────────────────────────────────────┘

PROVIDER-SPECIFIC SETUP HINTS:
══════════════════════════════
Each provider has specific gotchas documented in PROVIDER_SETUP_HINTS:

Provider     │ Setup Requirements & Common Issues
─────────────┼────────────────────────────────────────────────────────────────────────────────
sambanova    │ Free-tier at cloud.sambanova.ai; limited preview, may need waitlist
fireworks    │ Create keys at fireworks.ai/account/api-keys; trial credits expire
replicate    │ Keys start with "r8_"; requires billing setup even for free models
cloudflare   │ Needs scoped API Token + 32-char Account ID from dashboard URL
huggingface  │ Use tokens with "Inference" permissions; some models need license acceptance
groq         │ Keys at console.groq.com/keys; rate limits per minute on free tier
gemini       │ Keys at aistudio.google.com/apikey; enable Gemini API in Google Cloud
openrouter   │ Free models rate-limited per day; try different model if hitting limits
mistral      │ Free tier needs email verification, sometimes phone verification
cohere       │ Trial keys rate-limited; wait on 429 errors
deepinfra    │ Needs small credit balance even for cheap models
cerebras     │ Free tier is invite/waitlist based at cloud.cerebras.ai
```