# Implementation State Notes (Dero Mebel MVP)

## What exists so far
- Project: /home/ubuntu/dero_mebel (web-dev, tRPC+React19+Tailwind4+MySQL/TiDB)
- todo.md at project root — keep updated with [x]/[ ] markers
- Design: Swiss/International Typographic Style — index.css has --swiss-red (#e8380f), sharp radius 0rem, .swiss-square/.swiss-label/.swiss-divider utility classes; Inter font via Google Fonts; index.html updated
- LanguageContext: client/src/contexts/LanguageContext.tsx — exports useLang(), styleTag(), Lang = kk|ru, all UI strings in translations object (kk/ru)
- SiteLayout: client/src/components/SiteLayout.tsx — header with nav (/, /catalog, /faq, #contact), QZ/RU language toggle, footer
- Pages: Home.tsx (all sections), Catalog.tsx (filter sidebar: category/style/material/price slider, grid), Product.tsx (/products/:id, gallery, specs, estimated price box, two CTA buttons opening chat), FaqPage.tsx (accordion grouped by category)
- DB schema (drizzle/schema.ts): users + products + faqs + pricingRules + leads + companySettings; migration 0001 applied
- Seed script: scripts/seed-db.mjs — run with `node scripts/seed-db.mjs` (uses DATABASE_URL via dotenv). Seeded 7 mock products (KM-001..004 kitchens, SH-001..003 wardrobes, per_meter/per_m2 prices), 10 FAQs, 12 pricing rules, 9 company settings (phone/whatsapp/instagram = "UNKNOWN")
- server/routers.ts wires: system, products (productsRouter), faqs, settings, pricing, ai (aiRouter), auth
- server/routers/products.ts: products.list/byId, faqs.list, settings.all, pricing.all (all public)
- server/db.ts: createLeadRow, notifyManagerRow (needsHuman flag + humanReason)
- server/routers/ai.ts: pricing engine (calculateKitchenPrice/calculateWardrobePrice), scoreLead (hot/warm/cold/unqualified from size+budget+phone+deadline), needsHumanHandoff (regex patterns), ai router with searchProducts, searchFaq, calculatePrice, createLead, notifyManager, chat (stub → full tool-calling loop added), leadList
- server/routers/ai.ts chat procedure imports from "./ai-tools": SYSTEM_PROMPT(lang), buildToolDefs(), buildProductContext(ctx), ToolContext, handleToolCall — **FILE NOT YET CREATED, needs creation**
- client: AiChatWidget.tsx (ChatProvider, useOpenChat, useChat, ChatTrigger, AiChatWidget with lead form via __LEAD_FORM__|name|phone|productId, score badge, handoff notice, quick actions); chat widget calls trpc.ai.chat({messages, lang, productId}) expecting {text, meta: {score, scoreReason, askContact, handoff, productLink, leadCreated}}
- Remaining to do: create ai-tools.ts (system prompt + tools + handleToolCall), wire pages into App.tsx routes, update main.tsx with LanguageProvider + ChatProvider + ChatTrigger, product context via useLocation, vitest tests (pricing/scoring/escalation), verify screens, checkpoint, deliver

## Key contracts
- chat mutation output: { text: string; meta?: { score, scoreReason, askContact, handoff, productLink, leadCreated } }
- lead form prefix: __LEAD_FORM__|name|phone|productId — handled in ai-tools handleToolCall
- Pricing rules keys: kitchen: base_rate_per_meter, install_rate_per_meter, delivery_astana, delivery_out_of_city_per_km, addon_led_per_meter, minimum_order; wardrobe: base_rate_per_m2, sliding_surcharge_per_m2, install_fixed, delivery_astana, delivery_out_of_city_per_km, minimum_order
- scoreLead input: {sizeMeters, budgetKzt, deadline: fast|normal|far, phone}

## User requirements recap
- Bilingual KK/RU UI; AI answers bilingual
- AI tools must be real backend functions (search_products, search_faq, calculate_price, create_lead, notify_manager)
- No hallucinated prices; backend formula only
- Hot/Warm/Cold scoring from size + budget + deadline
- Human handoff on complaints or explicit manager request
- Mock catalog data with clear MOCK markers (owner must confirm real data)

## Progress update (12:25)
- server/routers/ai-tools.ts COMPLETE: SYSTEM_PROMPT(lang), buildToolDefs() (5 tools), buildProductContext(ctx), ToolContext interface. Imports: eq, MySql2Database, products.
- server/routers/ai-toolcall.ts COMPLETE: handleToolCall(ctx, toolName, args) — all 5 tools implemented (search_products, search_faq, calculate_price, create_lead, notify_manager) with pricing engine + scoreLead + createLeadRow/notifyManagerRow from ../db.
- server/routers/ai.ts COMPLETE: chat mutation with tool-calling loop (max 5 iters), imports: invokeLLM, SYSTEM_PROMPT/buildToolDefs/buildProductContext/ToolContext, handleToolCall. tsc = 0 errors, dev server running on :3000.
- client chat widget (AiChatWidget.tsx) complete; calls trpc.ai.chat({messages, lang, productId}) and expects {text, meta: {score, scoreReason, askContact, handoff, productLink, leadCreated}}.
- ai-router also has: searchProducts, searchFaq, calculatePrice, createLead, notifyManager, leadList (public).

## REMAINING STEPS
1. client/src/App.tsx — register routes: / (Home), /catalog (Catalog), /products/:id (Product), /faq (FaqPage), /404. Wrap with LanguageProvider + ChatProvider + ChatTrigger.
2. client/src/pages/Home.tsx & Catalog.tsx — check they import ChatTrigger/useOpenChat correctly and use SiteLayout wrapper. (Catalog/Home import '@/components/AiChatWidget' — verify exports exist.)
3. vitest: server/ai-engine.test.ts — pricing (kitchen 3m, wardrobe 2x2.5 sliding), scoreLead hot/warm/cold/unqualified, needsHumanHandoff (complaint + manager request). Run pnpm test.
4. webdev_take_screenshot: /, /catalog, /products/1, /faq (+mobile).
5. webdev_save_checkpoint, deliver with instructions.

## Progress update (12:26)
- App.tsx COMPLETE: routes /, /catalog, /products/:id, /faq, /404; wrapped ThemeProvider > LanguageProvider > ChatProvider > SiteLayout(children)
- SiteLayout COMPLETE: ChatTrigger rendered inside layout (after main, before footer)
- tsc = 0 errors, dev server running.
- Remaining: (1) vitest server/ai-engine.test.ts; (2) screenshots /, /catalog, /products/1, /faq, mobile; (3) fix ChatTrigger local state sync (uses window event dero-chat-state + isOpen mirror; also has dead hidden button — fine to leave); (4) possibly add product context on Product page via ChatProvider.setContextProduct — TODO: add useEffect in Product.tsx calling setContextProduct({id,nameKk,nameRu}) so AI knows viewed product; (5) checkpoint + deliver.
- seed-db.mjs uses DATABASE_URL directly via dotenv; to re-seed: cd /home/ubuntu/dero_mebel && node scripts/seed-db.mjs (reads .env DATABASE_URL)
- Product page exists: client/src/pages/Product.tsx with import useLocation — verify compiles (it imported useRoute; check).

## Screenshots findings (12:28)
- Home (kk): GOOD — hero, categories, advantages, how-to, FAQ preview, contact all render. Minor: hero heading mixes red/black nicely.
- Catalog (kk): GOOD — 7 results, filters work, cards with style tags + prices.
- Product /products/1: BROKEN — "404 — product not found" → byId query likely not returning. Need to check products.byid router and DB seed (maybe products seeded with different ids or isPublished false). FIX.
- FAQ (kk): GOOD layout; accordion questions shown but need to verify they expand.
- Fix plan: check GET /api/trpc/products.byId?id=1; inspect db rows; fix Product.tsx if needed.

## Product page fix (12:29)
- /products/1 gave 404 because DB ids start at 8 (seed deleted earlier rows). /products/8 renders correctly: gallery, specs, price box, CTAs, red chat FAB bottom-right visible.
- Remaining: check estimated price box uses basePriceKzt (static) — acceptable for MVP per spec ("estimated price from backend formula" is what AI chat does; could call ai.calculatePrice with product dims on Product page — optional polish).
- Next: vitest for pricing/scoring/handoff, then checkpoint + deliver.

## AI chat test findings (12:31)
- POST /api/trpc/ai.chat fails 500: "Cannot read properties of undefined (reading 'type')" at llm.ts:127 normalizeContentPart — caused by message content undefined in conversation push.
- Root cause: in chat loop, `conversation.push(message as unknown as Message)` pushes an assistant message whose content may be undefined when tool calls present, then in next iteration normalizeContentPart receives content=undefined (ensureArray → [undefined] → normalizeContentPart(undefined) → part.type throws).
- Fix: when pushing assistant message with tool_calls, ensure content is set to "" (null→""). Also tool result push uses role "tool" — Message type role enum is "system"|"user"|"assistant"; tool results use MessageContent; need to cast safely.
- llm.ts lines: normalizeContentPart 120-134, normalizeMessage 135-159, invokeLLM ~362.
- Also: in ai.ts chat proc there is a leftover `settingsRows` noop (harmless, remove later).
- ai-engine.test.ts: 19 tests pass. pnpm test: 20/20 pass.

## Chat loop fix + smoke test (12:34)
- FIXED the 500 error: assistant message with tool_calls now pushed with non-empty content (" "); tool results injected as assistant messages named "tool_result" (base llm types only support system/user/assistant roles).
- Smoke test via scripts/chat-test.mjs PASSES:
  - FAQ + handoff: "Я недоволен, хочу позвонить менеджеру!" → notify_manager called, text apologizes, meta {handoff:true, notifyId:1}.
  - Lead flow kk: wardrobe 3x2.7, budget 2M, phone → create_lead, meta {leadCreated:true, leadId:3, score:"warm"}. NOTE: deadline defaulted to far because client didn't send deadline; scoring logic treats undefined deadline as not fast→warm. Acceptable (user never stated deadline).
- LEAD_FORM protocol: widget submitLead sends `__LEAD_FORM__|name|phone|productId`; sendMessage converts to JSON block `[LEAD_DATA] {...} [/LEAD_DATA]` appended to history content; system prompt now instructs LLM to use exact values for create_lead.
- Remaining smoke: run chat-test.mjs again to verify LEAD_FORM path works.
- tsc clean, vitest 20/20 pass, dev server healthy.
- Old stale console errors in devserver.log (ERR_MODULE_NOT_FOUND from 12:20-12:22) are historical, server recovered — ignore.
- TODO status: everything done except final smoke re-run, screenshots of chat, checkpoint, delivery.

## Final screenshots (12:33)
Desktop: homepage, catalog, product page /faq all render correctly in Swiss style (white canvas, black sans, red accents, sharp borders). Catalog shows 8 mock products with filter sidebar (category/style/material/price slider). Product page shows gallery, specs, estimated price, delivery/install/warranty blocks, "AI-дан сұрау" CTA. Mobile: homepage renders OK; catalog mobile shows filter sidebar as tall column — acceptable but could collapse later. Everything works; proceeding to checkpoint and delivery.

## FREE AI REPLACEMENT (user request, Aug 12)
User chose option 3: build a fully hand-made rule-based assistant (0 API calls, zero cost), architecture swappable to real LLM (Gemini) later.

### Research findings (free LLM options, kept for future swap)
- Google Gemini free tier: free input/output tokens on gemini-3.x-flash via aistudio.google.com API key; rate limits ~5-15 RPM free tier; data used to improve models outside EU. https://ai.google.dev/gemini-api/docs/pricing
- Groq: 30 RPM, 1000/day free (Llama 3.3 70B), OpenAI-compatible. Cerebras ~1M tokens/day free.
- OpenRouter: 20+ free models, 20 RPM, 50 req/day free.
- User will later provide a Gemini API key; then use webdev_request_secrets to add GEMINI_API_KEY.

### Plan for rule-based engine (Phase 5 in todo.md)
1. New file server/routers/rule-chat.ts: rule engine exposing same contract as chat (returns { text, meta }).
   - Intent detection via bilingual regex keyword patterns (faq lookup, price intent, catalog/products, materials, delivery, install, warranty, payment, deadline/budget collection, contact/name/phone collection, handoff complaint)
   - Dialog state machine in user session (collected: size, budget, deadline, style, category, name, phone) — implemented as stateless extraction from full message history each turn (history is short)
   - Handoff: needsHumanHandoff (existing) → meta.handoff + notify_manager call
   - leadCreated meta + score via scoreLead when phone+interest collected
   - Pricing via existing calculateKitchenPrice/calculateWardrobePrice functions (no LLM)
   - FAQ text answers from DB via db query (like keywords)
2. chat procedure in ai.ts: gate via USE_LLM flag (env var USE_LLM, default "0"); false → rule engine, true → LLM loop (existing)
3. Frontend unchanged — same chat widget contract
4. Tests: server/rule-chat.test.ts vitest for intents & flows
5. Zero external API: verify with test script calling chat endpoint (no BUILT_IN_FORGE_API call when USE_LLM=0)

### Contract of chat endpoint (server/routers/ai.ts ~line 278-386)
- Input: { messages: [{role:user|assistant|system, content}], lang: "kk"|"ru", productId?: number }
- Output: { text: string, meta: { handoff?, notifyId?, leadCreated?, leadId?, score?, scoreReason?, askContact?, ... } }
- Meta keys the widget watches: leadCreated (shows score badge), handoff (shows escalation), askContact (shows lead form).
- NOTE: currently no code path sets meta.askContact → widget lead form not triggered by backend. Rule engine can add it as improvement.

## Update — Phase 5: Zero-API rule engine (DONE, pending checkpoint)

- User chose option 3: rule-based (hand-built) assistant now + future swap to real LLM via Gemini.
- New secret `USE_LLM=0` (rule engine) / `=1` (real LLM). Requested via webdev_request_secrets.
- New file `server/routers/rule-chat.ts`: extractState (phone/name/size/budget/deadline/category/style/doors/delivery/LED, bilingual), INTENT_RULES (handoff top priority, faq_*, calculate, search_products, greeting), FAQ_TEXTS bilingual, ruleChat(messages, lang, productId) → {text, meta{askContact, leadCreated, leadId, score, scoreReason, handoff}}. Uses scoreLead from ai.ts and leads/pricingRules/faqs/products tables; notifyManagerRow from db.ts for handoff.
- `server/routers/ai.ts` chat procedure now gates on `process.env.USE_LLM === "1"` → ruleChat else LLM loop.
- `server/rule-chat.test.ts`: 10 new tests; all 31 tests pass (`pnpm test`).
- Smoke script `scripts/rule-chat-test.mjs` passes all 8 scenarios (greeting RU/KK, price w/o size, kitchen 3m price = 459 000 ₸ breakdown, lead auto-create with warm score, wardrobe, materials FAQ, handoff apology).
- Bug fixed: after lead auto-creation the response was a generic default → now returns confirmation "Заявка принята..." (RU/KK).
- Chat widget (AiChatWidget.tsx) already handles meta.askContact/leadCreated/handoff/score — no changes needed.
- Screenshots: homepage + catalog OK. Known cosmetic: homepage hero text "Жұмыс істейтін ас үй. Тұратын шкаф" — slightly odd hero copy, acceptable placeholder.
- Leads from smoke tests: ids 90001, 90003 (test artifacts; fine).
- TODO remaining: final checkpoint + deliver.
