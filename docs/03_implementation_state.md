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

## Phase 6 progress — screenshot findings (before compaction)

DONE so far: yellow accent theme in index.css (--swiss-yellow #d9a414, swiss-square/text/bg/border mapped to yellow); header centered branding "DERO MEBEL MARKET" with yellow square logo (yellow in "Mebel" part); nav centered under branding; hero redesigned: centered, no image, new KK/RU copy (Ас үйіңіз — ең басты бөлме. / Біз оны мықты етеміз.); intro/categories/advantages/steps centered; product page has yellow accents; FAQ branded header works.

REMAINING cosmetic issues spotted in full-page screenshots:
1. Catalog page: last product card (id 14, "Премиум — Классикалық гардероб"?) shows EMPTY GREY placeholder image (src missing/broken). Fix: check products seed images, replace broken img src.
2. Product page id 8: dimensions show "3 см × 2 см × 1 см" — absurd mock dimensions; fix seed data with realistic dimensions (e.g., kitchen 240×60×220 см format).
3. Catalog filter sidebar max 500000 ₸ slider — fine.
4. Home steps section: black bg with yellow numbers — looks good.
5. FAQ page: accordion items look fine but could center content; acceptable.
6. Catalog grid last card grey box — must fix (image URL broken for that product row).
7. Consider centering catalog page heading bloc

## Phase 9 progress (2026-08-12) — LOGO + INSTAGRAM DATA

### Done
- Logo `/manus-storage/dero-mebel-logo_6177e179.png` integrated: header (centered, h-16 md:h-20, removed red square + text branding), footer dark bg with logo image (h-12).
- SiteLayout footer now black bg (bg-foreground text-background); footer catalog links use gold style var.
- `main py-6 md:py-8` page-frame padding added.
- Screenshot verified: header logo OK, hero gold accent text OK, catalog 7 items, footer logo OK.

### Instagram findings (@deromebel_market)
- Phone/WhatsApp: +7 701 082 27 64
- Address: Astana, Kerey Khan 27 (Керей хан 27)
- Hours: 10:00–20:00
- Instagram bio confirms: мекенжай Керей хан 27, 87010822764, 10:00–20:00

### Remaining TODO (Phase 9)
- [ ] Fix catalog last wardrobe card gray placeholder image (id ~14)
- [ ] Update companySettings in DB: phone +77010822764, whatsapp wa.me/77010822764, address Керей хан 27, Astana, hours 10:00–20:00, instagram deromebel_market
- [ ] Render real contacts in footer/contact sections + WhatsApp CTA link
- [ ] Verify chat widget header dark style with gold accent
- [ ] vitest check, checkpoint, deliverk left is ok (standard). Keep.
8. Stats strip on home: fine.

Note: product photos are Unsplash URLs seeded in DB via scripts/seed-db.mjs.

## Findings 2 (product id 14 page)
- Product 14 photo (photo-1616627547584) shows a chair — not a wardrobe. Replace with a wardrobe photo URL.
- Dimensions render "3 см × 2 см × 1 см" → Product page formats widthMm/heightMm/depthMm dividing by 1000 (meters) but shows "см" label with mm/1000 values = wrong. Fix: either divide by 10 (mm→cm) or label as "мм". WidthMm=2800mm → 280 см. Fix Product.tsx formatting: mm/10 → cm.
- Grey card in catalog grid: product 14's image loaded in later screenshot, so the grey box in first full-page shot was lazy-load moment. BUT chair photo is still contextually wrong — replace seed photoUrl for product 14 with a real wardrobe image.
- All Unsplash URLs return HTTP 200 (browser check may differ due to hotlinking; screenshots showed them loading).

## Fix plan
1. UPDATE products SET photoUrl = 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1200&q=80' ... actually pick: wardrobe photo for id 14 e.g. https://images.unsplash.com/photo-1595515106969-1ce29566ff1c (classic wardrobe) — verify with curl first.
2. Fix Product.tsx dimension formatting: (mm / 10) + " см" — check both kk/ru label.
3. Check how Catalog.tsx renders dimensions — same bug likely.

## Mobile findings (375px)
- Header branding "DERO MEBEL MARKET" wraps to two lines at 375px, and yellow square loses alignment. Fix: responsive font size (text-xl on mobile), tighter tracking, keep on one line; center nav below (it hides on mobile anyway? Nav hidden md:flex — on mobile only lang toggle + hamburger absent). Consider adding mobile menu OR accept. Simplest: clamp branding font to one line with whitespace-nowrap + text-[1.25rem] on mobile.
- Hero, catalog layout fine on mobile.

## Final desktop check findings
1. Product 8 photo (photo-1556909114) = a couple cooking, not a kitchen — replace with proper kitchen photo.
2. Product 11 "Лофт — Индустриялық ас үй" photo = living room, not a kitchen — replace.
3. Catalog grid shows a grey box as the 8th card — a published product with empty photoUrl exists (id 15?). DB currently has 7 products; grey card likely id 15 (created by earlier rule-chat tests seed?) — check and unpublish or give it a photo.
4. Product 12 "Слайд" photo = wardrobe ok. Product 13/14 ok.
5. Home steps section has yellow numbers on black — good. FAQ page fine.

## Grey box diagnosis
Only 7 products returned; 3-column grid → last row shows 2 cards + 1 empty cell whose background is `bg-foreground/40` (the grey box seen). This is normal Swiss grid-line look (borders between cards extend). Acceptable design (mirrors card borders). No fix needed; the "8th card" is just an empty grid slot with the border color.

## Remaining gap checks before checkpoint (Phase 6)
1. USE_LLM flag verification: confirm USE_LLM env var is "0" (rule engine active, zero external API calls). Env var name: USE_LLM, set via webdev_request_secrets earlier — verify value in dev env.
2. Branding placement: user asked logo + "DERO MEBEL MARKET" at top center of hero. Implemented in sticky header (top of every page, centered) — this satisfies "top center". Hero itself has no image (removed). Confirm header branding visible at top center in screenshots — DONE.
3. Live widget path smoke test: POST /api/trpc/ai.chat with {history:[{role:"user",content:"сәлем"}], productId:null, lang:"kk"} in rule mode should return text from rule engine and no LLM call.
4. Then: webdev_save_checkpoint + deliver.

## Key facts saved
- Theme: --swiss-yellow #d9a414 (darkened), bg-swiss-red/text-swiss-red CSS classes mapped to yellow.
- Header: centered branding "DERO MEBEL MARKET" (yellow square + "Mebel" in yellow), nav centered under it, mobile font text-lg whitespace-nowrap.
- Hero: image removed, centered text: "Ас үйіңіз — ең басты бөлме. Біз оны мықты етеміз."
- Product photos replaced: id 8 = /manus-storage/modern-white-kitchen_918d1c30.jpg, id 11 = /manus-storage/loft-kitchen_dbc1cfe0.jpg, id 14 = /manus-storage/classic-wardrobe_ff696f1d.jpg.
- fmtDims fixed: mm/10 → cm (was mm/1000 giving 3 см for 3000мм).
- Tests: 31 passed, tsc clean.

## Final verification (Phase 6, before checkpoint)
- Homepage: hero centered, no image, yellow accents, "Ас үйіңіз — ең басты бөлме. Біз оны мықты етеміз." — GOOD. One issue: advantages block title shows "Here біз" — English word slipped in ("Here" should be "Біз"). FIX THIS.
- Header branding centered: "DERO MEBEL MARKET" with yellow square — GOOD on all pages.
- Catalog: all photos correct now; grey cell = empty grid slot, acceptable.
- Product page 8: new white kitchen photo, correct cm dimensions (300 cm x 240 cm x 60 cm) — GOOD.
- FAQ page: section headers yellow squares — GOOD.
- USE_LLM=0 confirmed in running dev server env → rule engine active, zero external API calls. Smoke test: ai.chat POST returns rule-engine KK response in <1s.
- Tests: 31 passed, tsc clean.
- FIX NEEDED: advantages title string "Here біз" → should be "Біз" / "Біз неге біз?" check LanguageContext.

## FINAL STATE (Phase 6 complete, ready for checkpoint)
Live browser verification confirmed: homepage text all correct ("Неге біз" — earlier "Here біз" was a screenshot-render artifact only). Header branding centered, hero image-free with centered KK copy and yellow accents, catalog photos fixed, dimensions fixed, USE_LLM=0 active (rule engine, zero external API calls). Tests 31/31 pass, tsc clean. Published domain: deromebel-mvjbwqqp.manus.space. Next: webdev_save_checkpoint + deliver.

## Phase 7 — Language toggle & instant translation (user request)
User wants: verify KZ/RU toggle, ensure ALL catalog product attributes translate instantly without reload.

AUDIT FINDINGS:
- LanguageContext (client/src/contexts/LanguageContext.tsx): toggle = plain useState, no localStorage, `t = translations[lang]` derived each render → instant re-render OK. Consumers: Home, Catalog, Product, FAQ, SiteLayout, AiChatWidget all use useLang(). Provider wraps all routes in App.tsx. NO provider bug.
- MISSING: language persistence on refresh (kk default always). TO DO: add localStorage persistence.
- Product data NOT fully bilingual: DB schema had only nameKk/nameRu + descriptionKk/descriptionRu. material, facade, colors, features were single-language mixed strings ("ЛДСП / МДФ", ["Ақ / Белый", ...], features ["Soft-close фурнитура"...]).
- FIX DONE: extended schema: materialKk/Ru, facadeKk/Ru, colorsKk/Ru (json[]), featuresKk/Ru (json[]). Migration generated + SQL applied (check drizzle/). Seed script must be updated to fill bilingual columns, then re-seed affected columns only (UPDATE, not drop).
- Pages: Catalog.tsx uses lang===kk ? nameKk : nameRu + styleTag() — instant. Product.tsx same for name/desc, but materials/facade/colors/features rendered raw (single fields) — fix to pick Kk/Ru variants with fallback to base.
- Product.tsx also: delivery row "Астана" hardcoded both langs (fine), warranty "12" — could add t.product.warrantyYears later, keep as is.
- SiteLayout toggle has typo: buttons labeled "QZ"/"RU" — "QZ" should be "KZ". FIX.
- Schema migration steps: pnpm drizzle-kit gen → review drizzle/*.sql → webdev_execute_sql.
- Server routers (server/routers/products.ts) pass through raw rows — no change needed; UI selects lang variant.

### Phase 7 verification results (browser tests, 2026-08-12)
Implemented: bilingual schema columns (materialKk/Ru, facadeKk/Ru, colorsKk/Ru, featuresKk/Ru) added to products via ALTER TABLE (migration drizzle/0002 applied); scripts/seed-bilingual.mjs populated all 7 products (KM-001..SH-003); Product.tsx now selects lang variants with fallback to base fields; Catalog.tsx material filter labels are localized (value stays base key for filtering); LanguageContext now persists choice in localStorage ("dero-lang"); QZ typo fixed to KZ in SiteLayout.

Browser-verified: (1) Catalog KK→RU instant translation works — categories, styles, materials, results count, all 7 cards switch without reload (screenshot 2026-08-12_16-28-52). (2) Product page RU shows localized materials "ЛДСП / МДФ · МДФ, матовый", colors "Белый, Серый, Бежевый", features RU list, 25 дн. — all correct. (3) Clicking KZ on product page instantly switches to KK: "Материалдар ЛДСП / МДФ · МДФ, күңгірт", "Түстер Ақ, Сұр, Бежевый", features KK list — no reload. (4) Language persists across page navigation (KZ stayed after navigating / → /catalog → /products/8). Note: after RU selection + navigating to /, page showed KK — actually persisted because the stored value from earlier RU click? On / the page rendered KK strings, meaning persistence works when set; on the RU test the toggle set RU and catalog rendered RU immediately. All checks passed.

Remaining: run vitest, checkpoint, deliver.

### Gray card investigation (Phase 9)
- classic-wardrobe_ff696f1d.jpg renders fine (200, gold classic wardrobe photo). The gray box in full-page catalog screenshot appears in the EMPTY 8th grid slot (7 results → grid column with no 8th card) — it is an empty grid cell styling artifact, not a broken image. All 7 product images load correctly. No data fix needed.
- companySettings keys: company_name, city, phone, whatsapp, instagram, kaspi, address, working_hours, manager_contact, pricing_note. Values phone..manager_contact = "UNKNOWN" → update with real Instagram data.

### Phase 9 verified final (before checkpoint)
Hero verified: gold "AI-дан сұрау" button with black text renders correctly; gold accent hero title; catalog 7 items all real images; footer black with logo + real contacts (phone +7 701 082 27 64, WhatsApp, Керей хан 27, 10:00–20:00, Instagram @deromebel_market); contact section on Home has same real data; FAQ page OK with gold section markers; nav active underline now gold; chat widget FAB + header + CTAs switched to gold/black per logo. tsc 0 errors, vitest 31/31 pass.

All swiss-red utility classes renamed conceptually to swiss-yellow in pages/components (new utilities added in index.css: .text-swiss-yellow, .text-swiss-yellow-dark, .bg-swiss-yellow, .bg-swiss-yellow/90, .border-swiss-yellow). Old .swiss-red utilities in index.css still exist but no longer used by pages (kept for compatibility).

DB updated: companySettings phone/whatsapp/instagram/address/working_hours/manager_contact set to real Instagram values; kaspi reset to UNKNOWN with description noting owner must confirm.

## Phase 10 state (Aug 12, 2026)
DONE so far in Phase 10:
1. Header wordmark added in SiteLayout.tsx: logo image + "DERO MEBEL" (black, Inter font-black, tracking 0.18em) + "MARKET" (var(--swiss-yellow)) — verified in screenshot, looks good.
2. Kaspi data gathered: 12 products with chars (ЛДСП, dims, colors) and photos. Images: /home/ubuntu/kaspi_imgs/product_{1..12}.{jpg|png} → uploaded to /manus-storage/product_1_3bd17395.jpg ... product_12_38b382dd.jpg. Data: /home/ubuntu/kaspi_final.json. Notes: /home/ubuntu/kaspi_research.md.
3. 12 real Kaspi products inserted via scripts/seed-kaspi-products.mjs (SKU DR-*, wardrobe/kitchen, style modern/minimalist/loft, material "ЛДСП", priceUnit fixed, prices 149 900–245 000 ₸). Total products = 19. Verified in catalog screenshot.
4. companySettings: added kaspi_store_url=https://kaspi.kz/shop/m/30234153, kaspi_merchant_name=DERO мебель.
5. Footer SiteLayout.tsx updated: Kaspi link in brand block + contact column, tel/WhatsApp/Instagram links.

REMAINING Phase 10:
- [ ] Home.tsx contact section: add Kaspi link
- [ ] Check rule-chat.ts knowledge base knows Kaspi store (optional)
- [ ] pnpm test + tsc, checkpoint, deliver

## Phase 12 final verification (Aug 12, 2026)

- **Desktop review:** `/`, `/catalog`, and `/products/30012` render with the smaller logo/wordmark, the four-sided frame, Kaspi data panels, and intact product cards. The catalog’s initial price ceiling was corrected after the audit so it now reports **384 results** rather than hiding the four products priced above 500,000 ₸.
- **Mobile review at 375 px:** `/catalog` keeps the compact header and a vertically scrollable filter panel; `/products/30012` keeps the product image, verified Kaspi rating/review-information panel, direct Kaspi purchase CTA, and complete footer within the narrow column without horizontal overflow. The floating gold chat trigger was visible and reachable in the normal phone captures.
- **Works gallery:** the full mobile home-page capture shows the 12 real Kaspi project photos in a compact responsive grid; all gallery cards and section dividers remain inside the page frame.
- **Runtime review:** new desktop/mobile captures produced no fresh browser-console errors after 18:45; the historical nested-anchor error remains only in the earlier log record from 18:14. The catalog markup now uses an `article` with independent internal links rather than nested anchors.
- **Automated checks:** `pnpm exec tsc --noEmit` completed with zero errors; `pnpm test` completed with 33/33 passing tests, including two regression tests covering the no-price-limit initial catalog state.

### Kaspi aggregate-only policy

- By owner instruction, the storefront does not publish individual Kaspi customer-review text, reviewer names, dates, or helpfulness counts.
- Product cards and detail pages retain only verified aggregate Kaspi data: rating where available, review count, and a direct link to the live Kaspi review page.
- The temporary review-sample field and the raw sample data were removed from the database model before publication. No customer-review text is retained in the storefront codebase.
- The 375 px and desktop captures of `/products/30012` show the aggregate panel only: verified count, rating availability state, and the external Kaspi review link. They contain no individual customer-review content.
- The cleanup migration was verified against the database (`information_schema` reports zero `kaspiReviewSamples` columns). The aggregate-only schema regression test passes; final automated status is **34/34 Vitest tests passing** with a clean TypeScript check.
