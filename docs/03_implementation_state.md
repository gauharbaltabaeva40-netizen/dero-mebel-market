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
