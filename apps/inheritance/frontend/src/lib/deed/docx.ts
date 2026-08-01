/**
 * The schedule-of-shares clause as a DOCX.
 *
 * A `.docx` IS AN OPC PACKAGE — a ZIP archive of XML parts — and OPC permits
 * stored (uncompressed) entries, so this exporter needs no dependency at all.
 * It is built on `./zip`, which is ~200 lines of fixed header layout.
 *
 * THE BODY IS THE CLAUSE TEXT, not a second rendering of the schedule. This
 * module calls `buildDeedClauseText` and emits one `<w:p>` per line of the
 * string it returns. That is what makes ROADMAP criterion 2's word *same*
 * literally checkable: there is no second composition that could carry a
 * different peso figure, and the round trip is asserted both by this module's
 * tests and by the parity gate.
 *
 * THREE PARTS AND NO STYLE SHEET, deliberately. There is no styles part, no
 * theme, no fontTable, no settings and no docProps. A deed clause is pasted
 * into the firm's own template, so shipping a style sheet would be shipping
 * design taste this product has no basis for.
 *
 * NO CLOCK. The archive is byte-deterministic — the same schedule produces
 * identical bytes on every run.
 *
 * Layout reference: 22-RESEARCH.md §3.
 */

import { buildStoredZip } from './zip';
import { buildDeedClauseText } from './clause-text';
import type { DeedSchedule } from './schedule-lines';

/** The OPC media type Word registers for a wordprocessing document. */
export const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** The three parts, in the order they are written into the archive. */
export const DOCX_PART_NAMES = [
  '[Content_Types].xml',
  '_rels/.rels',
  'word/document.xml',
] as const;

/**
 * Escape a string for an XML text node.
 *
 * `&` IS REPLACED FIRST so an emitted `&amp;` is not re-escaped into
 * `&amp;amp;`. Quotes are DELIBERATELY UNTOUCHED: a text node does not require
 * them escaped, and altering a name a lawyer typed is itself a defect on a
 * legal instrument.
 */
export function escapeXmlText(value: string): string {
  return value.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');
}

/** The XML prolog every part opens with. */
const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

const CONTENT_TYPES_XML =
  XML_DECL +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';

const RELS_XML =
  XML_DECL +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';

/**
 * One clause line becomes one paragraph.
 *
 * `xml:space="preserve"` is on every `<w:t>` so the three-space indentation on
 * continuation lines survives the round trip.
 */
function toParagraph(line: string): string {
  if (line === '') {
    return '<w:p/>';
  }
  return `<w:p><w:r><w:t xml:space="preserve">${escapeXmlText(line)}</w:t></w:r></w:p>`;
}

/** Build the whole package. Returns bytes; writes no file and touches no DOM. */
export function buildDeedClauseDocx(schedule: DeedSchedule): Uint8Array<ArrayBuffer> {
  const text = buildDeedClauseText(schedule);
  const paragraphs = text.split('\n').map(toParagraph).join('');
  const documentXml =
    XML_DECL +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    paragraphs +
    '<w:sectPr/></w:body></w:document>';

  const encoder = new TextEncoder();
  return buildStoredZip([
    { name: DOCX_PART_NAMES[0], data: encoder.encode(CONTENT_TYPES_XML) },
    { name: DOCX_PART_NAMES[1], data: encoder.encode(RELS_XML) },
    { name: DOCX_PART_NAMES[2], data: encoder.encode(documentXml) },
  ]);
}

/**
 * The inverse of the paragraph writer, used by the tests and by the parity gate.
 *
 * Unescaping runs in the REVERSE order of `escapeXmlText` — `&lt;`, then `&gt;`,
 * then `&amp;` — so a literal `&amp;lt;` in the source text comes back as
 * `&lt;` rather than as `<`.
 *
 * It lives beside the writer on purpose: a change to one makes the other's test
 * fail immediately.
 */
export function extractDocxParagraphs(documentXml: string): string[] {
  const out: string[] = [];
  const paragraphPattern = /<w:p\/>|<w:p>([\s\S]*?)<\/w:p>/g;
  let match = paragraphPattern.exec(documentXml);
  while (match !== null) {
    const inner = match[1];
    if (inner === undefined) {
      out.push('');
    } else {
      const textMatch = /<w:t[^>]*>([\s\S]*?)<\/w:t>/.exec(inner);
      if (textMatch === null) {
        out.push('');
      } else {
        out.push(
          textMatch[1]!.split('&lt;').join('<').split('&gt;').join('>').split('&amp;').join('&'),
        );
      }
    }
    match = paragraphPattern.exec(documentXml);
  }
  return out;
}
