# Design QA

Direction: premium motion portfolio in the spirit of lusion.co (reference site was not reachable from the build sandbox; design follows its known patterns).

Local app checked: http://localhost:5173/

Evidence:

- Hero captured at 1920 x 1080, 1400 x 900, 1280 x 720, 820 x 1180 and 390 x 844 after the preloader: portrait prominent on the right, simple badge arc on its left, comment cards clear of the face; tablet/mobile stack with 3/3 badges.
- Full-page passes at 1440 x 900, 820 x 1180 and 390 x 844: no horizontal page scroll, no console errors.
- Interactions verified in Chromium: every header link lands exactly on its section, menu opens/closes (Esc), reel and "Watch showreel" open the video lightbox, services hover preview follows the cursor, contact form falls back to a pre-filled email while no Web3Forms key is set.
- Production build passed.
- Sites worker test passed.

Notes:

- Contact form: paste a Web3Forms access key into `WEB3FORMS_KEY` in `src/Contact.jsx` to send submissions directly; until then it opens the visitor's email app addressed to `CONTACT_EMAIL`.
- Stats (see the note in `src/StatsBand.jsx`) and the brand-name marquee were carried over unchanged; replace them if they aren't final.

final result: passed
