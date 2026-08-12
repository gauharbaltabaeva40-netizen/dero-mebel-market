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
