# Plan — Logo integration, style alignment, page padding, and Instagram business info

## Goal
Apply the official DERO MEBEL MARKET logo (silver/white lettering with gold accents on black) across the site, align the typography style to the logo's white-and-gold color scheme while keeping an overall white page background, add consistent padding around all four sides of the web page, and pull real business information from the official Instagram page (@deromebel_market) to enrich the site's catalog, contacts, and about-us content.

## Context and assumptions
- Current site: deromebel project, white Swiss-style background, black/yellow branding. The user wants the uploaded logo as-is (dark square logo) plus text styling matching the logo: white text on black elements and gold (darkened yellow) accents; the overall page background stays white.
- The logo is a 1254x1254 image with a black background, so it can be used directly as a dark square badge, or placed inside a header block. Simplest and cleanest: use the full image in the header (centered top) as an image element; the white/gold style will be applied to text (e.g., header title "DERO MEBEL MARKET" in white inside a black band, gold accents).
- Instagram is read-only research here: Instagram blocks unauthenticated access, so the plan includes fallback to the bio/website info if the profile page is not fully readable. We only need public business facts: contacts (phone, WhatsApp), location, working hours, product range, delivery terms.
- This plan covers: (1) logo + style update, (2) page padding, (3) Instagram business info gathering, (4) updating site content with real info.

## Steps

### Step 1 — Prepare the logo asset
1. Upload the logo image to webdev storage (manus-upload-file --webdev) so it gets a stable URL.
2. Optionally create two variants: the original dark square (for the centered header badge), and nothing more — keep the dark background version as the official logo mark.

### Step 2 — Rebrand header and text style
1. Header: replace the current CSS text logo with the logo image (centered, ~64-80px) plus the wordmark "DERO MEBEL MARKET" styled in logo colors — since page background is white, use the logo image itself for the name (it already contains the full wordmark), keeping the nav menu black on white.
2. Accent palette: update the swiss accent color to the logo's gold (sampled from the image, approx #C9A227 / darker gold), keeping black text on white background for body content.
3. Dark sections (footer, hero call-to-action band, chat widget): switch to black background with white/gold text to echo the logo.
4. Buttons: gold fill with black bold text; secondary outline buttons black outline with black text.

### Step 3 — Page padding
1. Add a global page frame: the `.container` gets horizontal padding on both sides (e.g., max-w reduced, or explicit px-8/padding) plus vertical spacing at top and bottom of the content flow, so all four sides of the web page keep breathing room.
2. Verify header, hero, catalog grid, product page, FAQ, footer all respect the frame on desktop and mobile.

### Step 4 — Gather Instagram business info (read-only research)
1. Try to open https://www.instagram.com/deromebel_market/ (web viewer, no login) and extract: phone/WhatsApp, city, working hours, categories sold, delivery/installation terms, any stated prices or promotions, story highlights describing products.
2. If the profile is not readable, use Instagram's public profile viewer (e.g., Picuki-style mirror via search) and a web search for "Dero Mebel Market" business facts.
3. Record all findings in a business-info note file inside docs/.

### Step 5 — Enrich site content with real info
1. Update company_settings / LanguageContext copy: real phone number (click-to-call and WhatsApp), real address/city, real working hours, delivery/installation terms if provided by Instagram.
2. If the Instagram posts show real products (e.g., specific kitchen/wardrobe projects), add them to the product catalog (or note which to add) with photos and RU/KK names.
3. Cross-check mock pricing rules against any real pricing info from the profile and adjust or flag to the user.

### Step 6 — Test and deliver
1. Visual check on desktop + mobile: logo, colors, padding, and updated contacts look correct on all pages.
2. TypeScript check + test suite pass.
3. Save checkpoint and deliver; provide a short summary of the Instagram findings and what content was updated (and what remains unknown and needs user input, e.g., exact phone number if not public).

## Open risks
- Instagram may block access; in that case we fall back to the bio text via a mirror or search, and ask the user to confirm the key facts (phone, address).
- The dark logo square works best on white because it's a self-contained image; no inversion needed.
- Real product photos from Instagram posts may have watermarks or low resolution — I will crop/select the best ones and flag the rest for replacement with original photos.
