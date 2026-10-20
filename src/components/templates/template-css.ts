export const templateCss = `
@page { size: A4; margin: 14mm 16mm; }
* { box-sizing: border-box; }
html, body { margin: 0; background: white; }
.cv { color: #1c1712; background: white; }
.cv a { color: inherit; text-decoration: none; }
.cv-url, .cv a { overflow-wrap: anywhere; }
.cv-name { margin: 0; }
.cv-meta { margin: 6px 0 0; }
.cv-section { margin-top: 16px; }
.cv-section h2 { margin: 0 0 8px; break-after: avoid; page-break-after: avoid; }
.cv-entry { margin: 0 0 10px; }
.cv-entry h3 { margin: 0; font-size: 1em; }
.cv-muted { margin: 0; }
.cv ul { margin: 4px 0 0; padding-left: 1.1em; }
.cv li { margin: 0 0 2px; }

.cv-classic { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.45; }
.cv-classic .cv-name { font-size: 22pt; line-height: 1.1; }
.cv-classic .cv-meta { font-size: 10pt; }
.cv-classic .cv-section h2 { font-size: 10pt; letter-spacing: 0.14em; text-transform: uppercase; border-bottom: 1px solid #1c1712; padding-bottom: 2px; }

.cv-modern { font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 10.5pt; line-height: 1.4; }
.cv-modern .cv-name { font-size: 26pt; letter-spacing: -0.03em; color: #0d5c58; line-height: 1.05; }
.cv-modern .cv-meta { color: #5f574e; font-size: 10pt; }
.cv-modern .cv-section h2 { color: #0d5c58; font-size: 11pt; letter-spacing: 0.04em; }
.cv-modern .cv-entry { border-left: 3px solid #d5ebe8; padding-left: 10px; }

.cv-editorial { font-family: Georgia, "Iowan Old Style", "Times New Roman", serif; font-size: 12pt; line-height: 1.55; }
.cv-editorial .cv-name { font-size: 34pt; font-weight: 500; letter-spacing: -0.03em; line-height: 0.95; }
.cv-editorial .cv-meta { font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 9pt; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 12px; }
.cv-editorial .cv-section { margin-top: 28px; }
.cv-editorial .cv-section h2 { font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 9pt; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 650; }
`;
