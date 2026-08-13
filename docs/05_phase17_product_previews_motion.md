# Phase 17–18 — Product Previews, Budget Replies, Motion, and Kaspi Actions

**Release date:** 13 August 2026

The autonomous chat now converts its recommended models into a horizontally scrollable preview carousel. Each preview contains a real product photo from the published catalog, a short language-aware description, dimensions, price, and a local **«Үлгіні таңдау»** action. This selection step remains intentionally separate from payment; it lets a customer see the full product page before they choose the matching **Kaspi-ден сатып алу** action. Since the catalog currently has one verified primary image per product, the carousel rotates through distinct matching products rather than fabricating several images for one model.

Budget discovery now starts with bilingual quick replies: up to 200,000 ₸, 200,000–500,000 ₸, 500,000–1,000,000 ₸, and above 1,000,000 ₸. The selected range is parsed by the zero-cost rule engine and filters the recommended published catalog products.

The storefront adds restrained fade-up reveals for key page sections, keeps them disabled for `prefers-reduced-motion`, widens the four-sided page frame, and retains the circular official logo inside the glass navigation capsule. Direct Kaspi purchase actions were checked as external new-tab links. The client action helper explicitly recognizes the full KK and RU budget quick-reply sets. The final quality run has a clean TypeScript check and **39/39** passing Vitest tests; the browser-driven chat journey confirmed budget quick replies, three real preview photos, local model selection, and exact Kaspi checkout.
