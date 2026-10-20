# PDF QA

Checked on 2026-10-20 with Playwright Chromium, A4, print CSS from `src/components/templates/template-css.ts`.

## What was rendered

| Fixture | Result |
| --- | --- |
| Short sample (`Amina Rahman`) | 1 page. Selectable text includes the name and Northwind Studio. |
| Long technical fixture (`José Álvarez`, long company name, long URLs, 8 roles) | 3 pages. More pages than the short CV. The accented given name is present in the PDF text. |
| Sparse CV | Empty sections are omitted from the HTML. Placeholder lines such as "No experience yet" are not printed. |
| Rejected payload | A document with an unexpected field is refused with HTTP 400. The exporter does not look up a CV by id, so it cannot return someone else's stored document. |

## Checks

- Text is selectable. The PDF bytes contain the CV's own words.
- The long CV paginates instead of staying on one overflowing page.
- Template class changes do not change career facts.
- Links are real anchors in the HTML, with long URLs allowed to wrap.
- Headings use `break-after: avoid` so a heading stays with the section that follows.

## Not claimed

A person has not flipped through every page of the long PDF looking for a clipped line. The automated check covers page count, text presence, and rejection of invalid documents. There is still no account system, so export authorization is "render only the document in this request."
