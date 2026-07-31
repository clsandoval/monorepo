/*
 * journey/pdf.mjs — the single PDF-reading seam.
 *
 * This is the ONLY file in this repository that spawns a PDF tool. Every later
 * consumer (pdf-structure.mjs, pdf-visual.mjs, print-layout.mjs) imports from
 * here. A second `spawnSync('pdftotext')` anywhere else would be a second place
 * for the invocation — its flags, its temp-file discipline, its failure
 * classification — to drift out of agreement with this one.
 *
 * Toolchain: poppler `pdftotext`, `pdfinfo` and `pdftoppm`, measured at 22.02.0
 * in `.planning/phases/13-pdf-verification/13-RESEARCH.md` section 4.1. No npm
 * PDF package is added: the alternative, `pdfjs-dist`, needs a native canvas
 * binding to rasterise, and this project's gates install no compiled dependency.
 *
 * A missing binary is a CANNOT-RUN condition, never an empty result. This is the
 * whole reason the three prefixes below are distinct. An `extractPdfText` that
 * returned `''` when `pdftotext` was absent would let a structural gate certify a
 * blank document as conforming — silent wrongness, which this project ranks as
 * categorically worse than loud failure.
 *
 * The three thrown prefixes, spelled exactly:
 *
 *   PDF TOOLCHAIN MISSING:  the binary is not on PATH (spawnSync ENOENT)
 *   PDF TOOL FAILED:        the binary ran and exited non-zero, or its output was truncated
 *   PDF UNREADABLE:         the binary exited zero but produced nothing usable
 *
 * No reader ever returns a default value on failure. A caller that catches
 * nothing gets a thrown Error.
 *
 * This module writes only into a directory it creates with `fs.mkdtempSync`, and
 * removes that directory in a `finally`. It never writes into `frontend/journey/`.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** The three literal prefixes, frozen so a consumer can match on them. */
export const PDF_MARKERS = Object.freeze({
  TOOLCHAIN_MISSING: 'PDF TOOLCHAIN MISSING: ',
  TOOL_FAILED: 'PDF TOOL FAILED: ',
  UNREADABLE: 'PDF UNREADABLE: ',
});

/** 64 MiB — a multi-page raster must never be silently truncated. */
const MAX_BUFFER = 64 * 1024 * 1024;

function withTempPdf(pdfBuffer, fn) {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error(`${PDF_MARKERS.UNREADABLE}input is not a Buffer (got ${typeof pdfBuffer})`);
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'journey-pdf-'));
  try {
    const pdfPath = path.join(dir, 'in.pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);
    return fn(dir, pdfPath);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Run a poppler binary and classify every failure mode by name.
 *
 * @param {string} tool
 * @param {string[]} args
 * @returns {{stdout: Buffer, stderr: string}}
 */
function runPdfTool(tool, args) {
  const result = spawnSync(tool, args, { maxBuffer: MAX_BUFFER });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      throw new Error(
        `${PDF_MARKERS.TOOLCHAIN_MISSING}${tool} is not installed or not on PATH. ` +
          `Install poppler-utils (Debian/Ubuntu: apt-get install poppler-utils).`,
      );
    }
    if (result.error.code === 'ENOBUFS') {
      throw new Error(
        `${PDF_MARKERS.TOOL_FAILED}${tool} output exceeded the ${MAX_BUFFER}-byte buffer`,
      );
    }
    throw new Error(`${PDF_MARKERS.TOOL_FAILED}${tool}: ${result.error.message}`);
  }

  // spawnSync reports a null status when the process was killed by a signal.
  if (result.status === null) {
    throw new Error(
      `${PDF_MARKERS.TOOL_FAILED}${tool} was terminated by signal ${result.signal}`,
    );
  }

  const stderr = result.stderr ? result.stderr.toString('utf8') : '';

  // A shell-less spawn reports a missing binary via ENOENT above; some
  // environments instead surface it as exit 127. Both mean "not found".
  if (result.status === 127) {
    throw new Error(
      `${PDF_MARKERS.TOOLCHAIN_MISSING}${tool} exited 127 (command not found). ` +
        `Install poppler-utils.`,
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `${PDF_MARKERS.TOOL_FAILED}${tool} exited ${result.status}: ${stderr.trim() || '(no stderr)'}`,
    );
  }

  return { stdout: result.stdout ?? Buffer.alloc(0), stderr };
}

/**
 * Extract the full text of a PDF.
 *
 * @param {Buffer} pdfBuffer
 * @returns {string} stdout of `pdftotext <pdf> -`, decoded as UTF-8
 */
export function extractPdfText(pdfBuffer) {
  return withTempPdf(pdfBuffer, (_dir, pdfPath) => {
    const { stdout } = runPdfTool('pdftotext', [pdfPath, '-']);
    const text = stdout.toString('utf8');
    if (text.trim().length === 0) {
      throw new Error(
        `${PDF_MARKERS.UNREADABLE}pdftotext exited 0 but produced no text — the document ` +
          `may be image-only or empty`,
      );
    }
    return text;
  });
}

/**
 * Read the page count and the page dimensions in PostScript points.
 *
 * `pdfinfo` prints, for an A4 document:
 *   Pages:           2
 *   Page size:       595.28 x 841.89 pts (A4)
 *
 * @param {Buffer} pdfBuffer
 * @returns {{pages: number, widthPt: number, heightPt: number}}
 */
export function pdfPageInfo(pdfBuffer) {
  return withTempPdf(pdfBuffer, (_dir, pdfPath) => {
    const { stdout } = runPdfTool('pdfinfo', [pdfPath]);
    const info = stdout.toString('utf8');

    const pagesMatch = info.match(/^Pages:\s+(\d+)\s*$/m);
    if (!pagesMatch) {
      throw new Error(
        `${PDF_MARKERS.UNREADABLE}pdfinfo output has no "Pages:" line. Output was:\n${info}`,
      );
    }

    const sizeMatch = info.match(/^Page size:\s+([0-9]+(?:\.[0-9]+)?) x ([0-9]+(?:\.[0-9]+)?) pts/m);
    if (!sizeMatch) {
      throw new Error(
        `${PDF_MARKERS.UNREADABLE}pdfinfo output has no parseable "Page size:" line. ` +
          `Output was:\n${info}`,
      );
    }

    return {
      pages: Number.parseInt(pagesMatch[1], 10),
      widthPt: Number.parseFloat(sizeMatch[1]),
      heightPt: Number.parseFloat(sizeMatch[2]),
    };
  });
}

/**
 * Rasterise every page to PNG at the given resolution.
 *
 * `pdftoppm` zero-pads the numeric suffix once a document reaches ten pages
 * (`page-01.png` … `page-10.png`), so ordering is by the PARSED INTEGER, never by
 * string sort — a string sort would put page 10 before page 2.
 *
 * @param {Buffer} pdfBuffer
 * @param {number} dpi
 * @returns {Buffer[]} one PNG per page, in page order
 */
export function rasterizePdfPages(pdfBuffer, dpi) {
  if (!Number.isInteger(dpi) || dpi <= 0) {
    throw new Error(`${PDF_MARKERS.UNREADABLE}dpi must be a positive integer, got ${dpi}`);
  }
  return withTempPdf(pdfBuffer, (dir, pdfPath) => {
    const prefix = path.join(dir, 'page');
    runPdfTool('pdftoppm', ['-png', '-r', String(dpi), pdfPath, prefix]);

    const produced = fs
      .readdirSync(dir)
      .filter((name) => /^page-?(\d+)\.png$/.test(name))
      .map((name) => ({ name, index: Number.parseInt(name.match(/(\d+)\.png$/)[1], 10) }))
      .sort((a, b) => a.index - b.index);

    if (produced.length === 0) {
      throw new Error(
        `${PDF_MARKERS.UNREADABLE}pdftoppm exited 0 but wrote no PNG file. ` +
          `Directory contained: ${fs.readdirSync(dir).join(', ') || '(nothing)'}`,
      );
    }

    return produced.map((p) => fs.readFileSync(path.join(dir, p.name)));
  });
}
