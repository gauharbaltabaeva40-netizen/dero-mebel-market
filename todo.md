# Dero Mebel — Project TODO

## Phase 0 — Foundation
- [x] todo.md created
- [x] Design theme: International Typographic Style (white canvas, bold red accents, black sans typography, strict grid) — client/src/index.css + fonts
- [x] Bilingual (KK/RU) language context and UI translations for all pages
- [x] Database schema: products, faqs, leads, pricing_rules, company_settings
- [x] Seed mock data: products (kitchens + wardrobes), FAQs, pricing rules, company settings

## Phase 1 — Website pages
- [x] Homepage: hero, company intro, category cards, advantages, how-to-order, FAQ preview, contacts
- [x] Catalog page with filter sidebar (category, style, material, price range)
- [x] Product grid cards with photo, name, style tag, starting price
- [x] Product detail page: gallery, description, materials, dimensions, colors, features, estimated price, delivery/installation info, order CTA
- [x] FAQ page
- [x] Global header/footer navigation

## Phase 2 — AI backend (real LLM, not mocked)
- [x] System prompt with bilingual support and strict no-hallucination rules
- [x] Tool: search_products (real DB query)
- [x] Tool: search_faq (semantic-ish DB query)
- [x] Tool: calculate_price (backend formula only, no LLM math)
- [x] Tool: create_lead (writes to leads table, returns score)
- [x] Tool: notify_manager (escalation flag, human handoff)
- [x] /api/chat endpoint with tool-calling loop and conversation state
- [x] Lead scoring: Hot/Warm/Cold from size + budget + deadline

## Phase 3 — AI chat widget
- [x] Floating chat button on all pages
- [x] Chat UI: greeting, product interest detection
- [x] Parameter collection flow (size, style, budget) in conversation
- [x] Price estimate display from calculate_price result
- [x] Lead contact form at end of flow
- [x] Lead score badge displayed based on collected info
- [x] Human handoff message for complaints / explicit manager request
- [x] Product page context: AI knows which product user is viewing

## Phase 4 — QA and delivery
- [x] Vitest tests: pricing calculator, lead scoring, escalation triggers
- [x] Visual verification of all pages (desktop + mobile)
- [x] Test AI conversation flows end-to-end
- [x] Deliver MVP to user

## Phase 5 — Zero-API rule-based assistant (free AI replacement)
- [x] Rule-based chat engine on backend: intent detection (keywords, bilingual KK/RU), dialog state machine, FAQ retrieval
- [x] Rule engine uses same contract as LLM chat (meta: askContact/leadCreated/handoff/score) so frontend stays unchanged
- [x] Pricing via existing backend formula only; lead scoring and human handoff preserved
- [x] Swap flag (e.g. USE_LLM env/setting) to switch back to real LLM (Gemini etc.) later without frontend changes
- [x] Vitest coverage for rule engine intents and dialog flows
- [x] End-to-end verification: chat works with zero external API calls

## Phase 6 — Site polish & rebranding (user request)

- [x] Logo + "DERO MEBEL MARKET" name centered at top center of hero
- [x] Text/accents in black & yellow (darkened yellow) instead of red
- [x] Remove hero image
- [x] Improve homepage hero copy
- [x] Center major page elements (not edge-aligned)
- [x] Fix remaining cosmetic issues (catalog/product/FAQ)
- [x] Verify all pages visually, checkpoint and deliver

## Phase 7 — Language toggle & instant product translation

- [x] Audit LanguageContext + LanguageProvider: toggle works, persists, re-renders all consumers
- [x] Audit product data model: every product field (name, desc, style, materials, colors) has KK + RU values in DB/seed
- [x] Catalog page: filters, cards, titles translate instantly on toggle (no reload)
- [x] Product detail page: all fields translate instantly on toggle
- [x] Home / FAQ pages: verify instant translation on toggle
- [x] Test language switching end-to-end and fix issues
- [x] Checkpoint and deliver

## Phase 8 — Vite HMR websocket error fix
- [x] Diagnose Vite HMR websocket error on dev preview (browser connects HTTP to localhost:5173 via proxy but WS fails)
- [x] Verify dev server loads cleanly without the error, checkpoint and report

## Phase 9 — Logo integration & Instagram business info

- [x] Upload official logo image to webdev storage
- [x] Header: use logo image (centered) + gold/white styling consistent with logo
- [x] Accent palette: logo gold instead of current yellow; body stays black-on-white
- [x] Dark sections (footer, CTA bands, chat widget): black background, white/gold text
- [x] Four-sided page padding/frame on all pages (desktop + mobile)
- [x] Gather business info from https://www.instagram.com/deromebel_market/ (phone, location, hours, products, delivery terms)
- [x] Update site content: contacts, about, FAQ/pricing with real Instagram info
- [x] Verify visually, run tests (tsc 0 errors, vitest 31/31), checkpoint and deliver

## Phase 10 — Kaspi catalog import & contact links & wordmark (user request)

- [x] Restore consistent logo-aligned site styling (audit and fix any visual regressions)
- [x] Header wordmark: "DERO MEBEL" (black) + "MARKET" (gold) text next to logo
- [x] Gather real product data from Kaspi link (productCode=166632370, merchantSku=657723785): names, prices, specs, images, description
- [x] Import Kaspi products (bilingual KK/RU) with real images into catalog DB (12 products, total 19)
- [x] Gather additional info from Instagram @deromebel_market (delivery, warranty, materials, production)
- [x] Footer/contact links fully wired: Instagram, WhatsApp, phone (tel:), Kaspi, working URLs
- [x] Verify visually, run tests (tsc 0 errors, vitest 31/31), checkpoint and deliver

## Phase 11 — Direct Kaspi sales storefront (user request)

- [x] Kaspi-дан сатып алу button on every catalog card and product page (direct link to Kaspi product page)
- [x] Map each product to its Kaspi URL (12 products; per-product links saved in DB kaspiUrl + kaspiReviews)
- [x] Direct-sales mode: no lead-form-first flow; CTA = buy on Kaspi; keep chat for questions
- [x] Kaspi reviews/ratings info block on product cards + detail pages (real review counts from Kaspi)
- [x] "Біздің жұмыстар" gallery section with 12 real Kaspi project photos, each tile links to Kaspi product page
- [x] Overall style polish: consistent logo-aligned gold/black/white look, footer links unified gold
- [x] Verify visually, run tests (tsc 0 errors, vitest 31/31), checkpoint and deliver

## Phase 12 — Kaspi reviews, mobile polish, Excel catalog import (user request)

- [x] Fix nested <a> error on /products/30012 (and audit catalog/product link hierarchy)
- [x] Parse DERO_мебель_база_данных_Kaspi.xlsx: all products, specs, prices
- [x] Import all Excel products (bilingual KK/RU) into catalog DB with Kaspi image URLs (377 Kaspi items; 384 total catalog items)
- [x] Kaspi review blocks on product cards + detail pages: verified rating where supplied, verified review count, and a direct link to the live Kaspi reviews
- [x] Owner decision: do not publish verbatim Kaspi customer-review text; retain only verified aggregate data and live Kaspi review links
- [x] Remove the unapproved review-text UI, raw review samples, and supporting code/test artifacts
- [x] Remove the temporary review-sample database column and source note after verifying the migration scope
- [x] Re-verify aggregate-only Kaspi panels and automated checks (desktop and 375 px phone capture reviewed; TypeScript clean; Vitest 34/34 passing; removed DB column confirmed absent)
- [x] Save and publish the aggregate-only Kaspi cleanup release (89405f0e)
- [x] Mobile audit: animations and styles tuned for phone viewport (catalog, product, gallery, chat)
- [x] Reduce header logo and adjacent DERO MEBEL / MARKET wordmark scale while preserving readability
- [x] Verify visually (desktop + mobile) and run final tests (TypeScript clean; Vitest 33/33 passing)
- [x] Save and publish Phase 12 release checkpoint (fb0b0e71)
- [x] Verify all Kaspi-linked catalog entries have populated KK/RU content and a product image URL (377/377 for titles, descriptions, and images; representative CDN checks returned HTTP 200)
- [x] Verify phone layouts for the product page, works gallery, and sales-chat entry point (375 px captures reviewed: no horizontal overflow; gallery grid and gold chat trigger remain reachable)
- [x] Ensure the catalog’s default price filter does not hide products above 500,000 ₸ (default view now shows all 384 published items)

## Phase 13 — Autonomous Kaspi sales chatbot (user request)

- [x] Audit manager-handoff, lead-form, and contact-capture paths in the KK/RU chatbot; all are isolated in the rule engine and widget for removal
- [x] Add guided kitchen and wardrobe discovery flows with product-preference capture
- [x] Add actionable product recommendations and direct Kaspi purchase paths in chat responses
- [x] Make payment guidance route only to the matching product’s Kaspi checkout page
- [x] Upgrade the chat widget with contextual quick replies, restart control, and accessible mobile interaction
- [x] Wire the active product page into chat context so payment always targets that exact Kaspi item
- [x] Require a single confirmed Kaspi product before presenting a payment action outside a product page
- [x] Add regression coverage for product-context payment routing to the exact Kaspi URL
- [x] Add regression tests for autonomous sales journeys and verify desktop/mobile chat flows (TypeScript clean; Vitest 28/28; desktop and 375 px storefront captures reviewed)
- [x] Add an integration test for the real rule-chat payment path with a product context and exact Kaspi URL
- [x] Add widget regression coverage for product-selection versus direct-Kaspi purchase actions
- [x] Open and exercise discovery, selection, and checkout chat flows on desktop and phone layouts
- [x] Exercise discovery, product selection, and exact-Kaspi checkout as one desktop chat journey (selected /products/30003; chat offered only that model’s Kaspi URL)
- [x] Exercise discovery, product selection, and exact-Kaspi checkout as one 375 px phone chat journey (selected /products/30003; chat offered only that model’s Kaspi URL)
- [x] Save and publish the autonomous Kaspi-sales chatbot release (40c2b3d8)
