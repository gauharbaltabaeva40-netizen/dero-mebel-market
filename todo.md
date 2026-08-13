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

## Phase 14 — Dev-preview HMR WebSocket repair (user-reported)

- [x] Inspect Vite HMR configuration and the current preview WebSocket error evidence
- [x] Configure HMR for the managed HTTPS preview proxy without hardcoded localhost WebSocket targets
- [x] Restart the dev preview and verify browser-console connection health without storefront regressions (public HTTPS preview loaded cleanly; a live HMR update was received at 05:52)
- [x] Save and publish the resolved preview configuration (b9dd4e6e)

## Phase 15 — Exact chat matching and typing feedback (user-reported)

- [x] Reproduce and audit the failed bilingual exact-product request for the beige 180×280×55 антресоль шкаф (the rule engine was ranking a generic 12-item category subset and did not score dimensions, colour, or product terms)
- [x] Make exact product-name, dimensions, colour, and category matching return the requested Kaspi-linked product first
- [x] Add a zero-cost site-styled “жазып жатыр…” / “печатает…” typing indicator while the chatbot prepares a reply
- [x] Add regression tests for exact KK/RU matching and typing-state behavior
- [x] Verify the corrected conversation and responsive typing state on desktop and 375 px mobile (exact selection and matching Kaspi purchase action confirmed on both viewports; typing indicator displayed)
- [x] Prepare the chatbot interaction improvement for the combined release (exact model matching, typing feedback, and tests complete)

## Phase 16 — Glass navigation refinement (user request)

- [x] Audit the current desktop and mobile header structure before the navigation restyle
- [x] Replace the plain header navigation with a centered translucent blur/glass capsule while preserving accessible links
- [x] Add a compact company-name label beside the official logo without competing with the existing brand wordmark
- [x] Verify the new header with the chatbot improvements on desktop and 375 px mobile
- [x] Save and publish the combined chatbot and navigation refinement (114573db)
- [x] Keep the compact company label visible and start mobile navigation scrolling at the first link

## Phase 17 — Product preview carousel, budget replies, and circular logo (user request)

- [x] Audit catalog image availability and current chat recommendation payloads (all 384 published products have a verified primary photo; the catalog does not yet provide additional per-product gallery images)
- [x] Show a compact product carousel with several real product photos and short KK/RU descriptions before the Kaspi purchase action (real primary photos rotate across matching products; no fabricated gallery media)
- [x] Add bilingual budget-range quick replies and map them to catalog filtering
- [x] Make the official navigation logo circular while preserving its visibility on desktop and mobile
- [x] Add regression tests for preview-card and budget-range actions
- [x] Verify carousel interactions, budget selection, and circular logo styling on desktop and 375 px mobile
- [x] Add client-side helper-level regression coverage for carousel preview actions and budget quick-reply configuration (selection cards remain local; confirmed purchases use the exact Kaspi URL and `_blank`)
- [x] Recognize all Russian budget quick-reply labels in the client-side quick-reply configuration and extend its test coverage
- [x] Exercise budget quick replies and product-preview carousel actions in the 375 px mobile chat widget (three real preview photos and model-selection action confirmed)
- [x] Save and publish the enhanced chatbot and navigation release (c0c3e565)

## Phase 18 — Motion, wider frame, and Kaspi-link repair (user request)

- [x] Audit current page-frame spacing, reveal animations, and all Kaspi purchase actions (purchase actions already use direct external Kaspi anchors; model-selection actions deliberately open the local product page first)
- [x] Add restrained fade-up reveal motion that respects reduced-motion preferences
- [x] Increase the website’s four-sided frame spacing without reducing mobile usability
- [x] Ensure every Kaspi purchase control opens its exact Kaspi product URL in a new tab
- [x] Add regression coverage and verify desktop/mobile layout plus direct Kaspi-link behavior (TypeScript clean; Vitest 39/39; live chat checks confirmed exact Kaspi new-tab action)
- [x] Add focused UI-action regression coverage for direct Kaspi new-tab links used by chat product cards
- [x] Save and publish the refined storefront release (c0c3e565)

## Phase 17 — Initial duplicate checklist (superseded by the scoped checklist above)

- [x] Superseded duplicate audit item; consolidated into Phase 17 above
- [x] Superseded duplicate carousel item; consolidated into Phase 17 above
- [x] Superseded duplicate budget-range item; consolidated into Phase 17 above
- [x] Superseded duplicate test item; consolidated into Phase 17 above
- [x] Superseded duplicate verification item; consolidated into Phase 17 above
- [x] Superseded duplicate release item; consolidated into the combined Phase 17–18 release

## Phase 19 — Color and material chat filters (user request)

- [x] Audit published catalog materials (primarily ЛДСП, with real МДФ and metal variants)
- [x] Audit and document actual published color keywords in product names and features with query-backed examples (бежевая/беж, белый/ақ, чёрный/қара, коричневый/қоңыр, серый/сұр)
- [x] Document current chatbot recommendation-filtering behavior for color/material inputs before extending it (color is scored from product text; material has no extracted state or filter yet)
- [x] Add KK/RU color quick replies that refine chatbot product recommendations
- [x] Add KK/RU material quick replies that refine chatbot product recommendations
- [x] Preserve selected color, material, and budget context across the chat discovery journey
- [x] Add regression coverage for bilingual color/material matching and combined filter behavior (TypeScript clean; Vitest 44/44 passing)
- [x] Verify filtered product previews and quick replies on desktop and 375 px mobile (color → material → budget journeys returned real preview images and selectable products on both viewports)
- [x] Save checkpoint and deliver the enhanced chatbot filters

## Phase 20 — Purchase reliability and guided filtering (user request)

- [x] Audit broken Kaspi product URLs and identify affected published catalog entries (12 of 377 active URLs resolve; 365 redirect to Kaspi error page)
- [x] Repair validated Kaspi purchase URLs and show a clear in-site fallback when a destination cannot be verified (only 12 audit-verified product pages retain external checkout; 365 stale links stay in the storefront with availability guidance)
- [x] Increase the desktop and mobile chat-widget viewport while preserving accessible controls
- [x] Add catalog size filters for width, height, and depth with KK/RU labels
- [x] Keep catalog filters in a separate sticky/scrollable panel while product results scroll independently
- [x] Make the assistant collect category, size, color, material, and budget preferences before showing recommendations
- [x] Add regression coverage for URL routing, size filters, independent scrolling, and guided chat stages (TypeScript clean; Vitest 49/49 passing)
- [x] Verify purchase, catalog, and guided chat journeys on desktop and 375 px mobile (verified direct checkout, stale-link fallback, independent desktop panel scrolling, and guided chat stages)
- [x] Save checkpoint and deliver the purchase and filtering improvements

## Phase 21 — DERO AI and catalog availability refresh (user request)

- [x] Audit available inventory data, current guided-chat quick replies, hero copy, purchase wording, and demo product records (7 known mock records: IDs 8–14; no verified physical stock-count field, so availability will be shown as an explicit order status rather than an invented quantity)
- [x] Rename the assistant to DERO AI and provide a full-screen responsive consultation view
- [x] Replace the navigation contact target with a DERO AI full-page chat trigger and label the floating chat trigger as DERO AI
- [x] Add category, color, and material quick replies at each applicable DERO AI step
- [x] Add an explicit inventory status to product cards and product detail pages (honest “available to order” status; no invented stock counts)
- [x] Add a KK/RU “available only” catalog filter without fabricating inventory data
- [x] Add a one-tap cm/mm unit toggle while retaining slider-based width, height, and depth filtering
- [x] Remove direct Kaspi purchase controls and revise related storefront and chat wording
- [x] Replace kitchen-only hero messaging with copy that represents the full custom-furniture range
- [x] Remove identified demo products from public catalog and chat recommendations (7 known mock records unpublished)
- [x] Add regression coverage and verify desktop/375 px interactions (TypeScript clean; Vitest 51/51; guided quick-reply, full-screen, and catalog interactions verified)
- [x] Save checkpoint and deliver the DERO AI and catalog availability update

## Phase 22 — Image discovery, catalog refinement, and brand navigation (user request)

- [x] Audit catalog room/style data, validated Kaspi URLs, existing logo assets, and the customer-image upload path (published catalog currently has kitchen/wardrobe room categories and modern/minimalist/loft styles; 12 product URLs were previously audit-verified for Kaspi; the page head lacks favicon and crawler logo metadata)
- [x] Confirm a vision-analysis approach for customer reference images that respects the existing zero-cost DERO AI requirement (user chose B: customer-selected style traits, no vision-model calls)
- [x] Add DERO AI image upload, local preview, and transparent zero-cost matching guidance through room, style, and color selections
- [x] Add catalog filters for room type and furniture style in KK/RU (room-type labels map to the actual kitchen and wardrobe catalog data; style options are derived from published catalog styles)
- [x] Restore a direct Kaspi order button only where a product has an audited working product URL
- [x] Remove the FAQ navigation item and keep the complete DERO MEBEL MARKET wordmark on one line
- [x] Set the official logo as favicon and add crawler-visible search metadata
- [x] Add regression coverage and verify desktop/375 px image discovery, filters, ordering, navigation, and metadata (TypeScript clean; Vitest 51/51; local-image preview, zero-cost style prompt, KK/RU room and style filters, audited Kaspi order button, navigation, favicon, and schema metadata verified)
- [x] Save checkpoint and deliver the image discovery and catalog update

## Phase 23 — GitHub source export (user request)

- [x] Inspect the current Git repository and remote configuration (main branch; connected GitHub account: gauharbaltabaeva40-netizen)
- [x] Create or select a private GitHub repository and push the current source code (private repository: gauharbaltabaeva40-netizen/dero-mebel-market)
- [x] Verify the GitHub repository contents and deliver its link (private main branch contains package.json, client application, rule-chat engine, and database schema)

## Phase 24 — Local setup documentation and GitHub CI (user request)

- [x] Audit package scripts, required environment variables, and existing GitHub workflow files (pnpm scripts provide dev, build, start, check, test, and db:push; DATABASE_URL, JWT_SECRET, VITE_APP_ID, and OAUTH_SERVER_URL are required by the server environment; no GitHub workflow exists yet)
- [x] Add a README.md with local installation, database, environment, test, and development-server instructions
- [x] Add a concise contribution section to prepare repository collaboration
- [x] Add GitHub Actions CI for dependency installation, TypeScript checks, and Vitest
- [ ] Validate the new README and workflow locally, then push them to the private GitHub repository
- [ ] Verify the GitHub Actions run and deliver the repository improvements
