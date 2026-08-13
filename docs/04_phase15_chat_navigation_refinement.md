# Phase 15–16 — Exact Chat Matching and Glass Navigation

**Release date:** 13 August 2026

The zero-cost sales-chat rule engine now recognizes an exact wardrobe query in either Kazakh or Russian. For example, the request `Шкаф антресольный, 180x280x55 см, бежевый` is parsed into wardrobe category, антресоль type, 1800 × 2800 × 550 mm dimensions, and beige colour. Catalog candidates are ranked against those signals before the product-selection cards are rendered. The live desktop and 375 px mobile journeys returned only `/products/30001` and `/products/90274`, then routed checkout to the Kaspi URL of the selected model.

The widget now shows a brief, accessible **«Жауап жазып жатыр…» / «Печатает…»** state with three gold animated dots. Its duration is deliberately short, requires no external AI service, and respects reduced-motion preferences. The final test run completed with **35/35** passing tests, including exact-query extraction, database-backed matching, product-specific checkout, and typing-duration tests.

The site header was rebuilt as a centered translucent glass capsule using white transparency, subtle borders, soft shadow, and backdrop blur. It retains the official logo, a compact DERO MEBEL company label, the existing navigation links, and KK/RU control. At 375 px, the first navigation item remains visible, the compact label stays visible, and the links can scroll horizontally without breaking the frame.
