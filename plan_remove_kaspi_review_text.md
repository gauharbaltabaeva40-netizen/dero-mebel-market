# Plan: Keep Kaspi Review Data Aggregate-Only

## Goal

Honor the owner's instruction **not to add verbatim Kaspi customer-review text** to the DERO MEBEL MARKET website. The site will retain only verified aggregate marketplace data—rating when supplied, review count, and a direct link to the corresponding live Kaspi review page.

## Current State and Decision

The currently published checkpoint is `fb0b0e71`; it contains verified rating/count blocks and does **not** publish the later unapproved review-text enhancement. During a follow-up check, an uncheckpointed development change added four verbatim review entries for product `30012` and an additive database field. That change must not be released.

| Item | Decision |
|---|---|
| Verbatim customer comments | Do not publish, import, or retain in the site data model. |
| Kaspi aggregate rating | Keep only values sourced from the supplied Excel export. |
| Kaspi review count | Keep and show the verified count. |
| Link to customer reviews | Keep the external Kaspi review link as the live source of truth. |
| Product cards | Continue displaying only aggregate rating/count, never review excerpts. |

## Implementation Steps

### 1. Remove the unapproved review-text feature

Remove the product-page section that renders individual review author names, dates, helpfulness counts, and comment text. Remove the review-shape utility and its front-end test because review records will no longer be presented or stored by the storefront.

### 2. Remove the raw review data and align the database model

Delete the four stored review samples for product `30012`. Remove the `kaspiReviewSamples` field from the Drizzle product schema and generate a migration that drops the corresponding database column after confirming that it contains only this unapproved data. Review the generated SQL before application and apply it only if it is limited to that column.

### 3. Preserve aggregate Kaspi functionality

Keep `kaspiUrl`, `kaspiReviews`, and `kaspiRating` intact. Retain the redesigned product-page review block, which truthfully shows a rating only when one is available, uses the verified review count, and links out to the live Kaspi page. Do not alter the direct Kaspi purchase buttons.

### 4. Update records and regression coverage

Update the implementation notes and checklist to state that review text is intentionally excluded by owner decision. Add or adapt a focused regression test for the aggregate-only rendering/data rule, without embedding customer-comment content in the codebase.

### 5. Validate and publish

Run `pnpm exec tsc --noEmit` and `pnpm test`. Visually inspect `/products/30012` at desktop and 375 px mobile to ensure the aggregate Kaspi panel remains correctly spaced and no comment text is visible. Save a new checkpoint only after validation passes, then provide the new checkpoint link and a concise Kazakh/Russian completion note.

## Assumptions and Risks

This plan assumes the owner’s instruction applies to every individual Kaspi review, including those publicly visible on marketplace pages. Removing the additional JSON column is a data-deletion operation, so the migration will be checked carefully before it is applied. The existing ratings and counts remain as previously verified marketplace-export data; the direct Kaspi link will remain the authoritative location for live, detailed feedback.
