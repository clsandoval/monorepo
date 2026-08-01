/**
 * Deterministic stored-method ZIP writer.
 *
 * THIS MODULE WRITES ARCHIVES AND NEVER READS THEM. There is no unzip path, no
 * central-directory parser and no entry lister, because nothing in this product
 * consumes an archive — it only hands one to a lawyer.
 *
 * IT ADDS NO DEPENDENCY. A `.docx` is an OPC package, an OPC package is a ZIP
 * archive, and the ZIP specification permits STORED (uncompressed, method 0)
 * entries. A stored-entry writer is a fixed header layout plus a CRC-32: no
 * compressor, no compression level, no options. Word opens a stored .docx
 * exactly as it opens a compressed one. There is no compression path in this
 * file and no option that selects one.
 *
 * THE OUTPUT IS BYTE-DETERMINISTIC. Every header field that is not derived from
 * the caller's own bytes is a fixed module-level constant: the DOS modification
 * date, the DOS modification time, the version fields, the general-purpose flag,
 * the extra-field length and the archive comment length. NO CLOCK IS READ — no
 * wall-clock API of any kind appears anywhere under `frontend/src/lib/deed/`,
 * which a gate greps for. The same entries therefore produce byte-identical
 * output on every run, which is what lets a test assert exact bytes.
 *
 * NO ZIP64, no data descriptors, no extra fields, no encryption and no UTF-8
 * general-purpose flag bit: every entry name this codebase passes is pure ASCII
 * and the writer refuses anything else rather than silently needing bit 11.
 *
 * Layout reference: 22-RESEARCH.md §3.
 */

/** DOS date for 1980-01-01 — the epoch of the DOS date format. Fixed, so no clock is read. */
const DOS_DATE = 0x0021;

/** DOS time for 00:00:00. Fixed, so no clock is read. */
const DOS_TIME = 0x0000;

/** ZIP version 2.0 — the minimum that describes a stored entry with a directory path. */
const VERSION = 20;

/** Local file header signature. */
const SIG_LOCAL = 0x04034b50;

/** Central directory file header signature. */
const SIG_CENTRAL = 0x02014b50;

/** End of central directory record signature. */
const SIG_EOCD = 0x06054b50;

/** Bytes in a local file header, before the name. */
const LOCAL_HEADER_SIZE = 30;

/** Bytes in a central directory header, before the name. */
const CENTRAL_HEADER_SIZE = 46;

/** Bytes in the end of central directory record. */
const EOCD_SIZE = 22;

/** Reversed IEEE polynomial. */
const CRC_POLYNOMIAL = 0xedb88320;

/** One 256-entry CRC-32 lookup table, built once at module load. */
const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? CRC_POLYNOMIAL ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

/**
 * Standard IEEE CRC-32 over the given bytes.
 *
 * The non-null assertion on the table lookup is required because
 * `frontend/tsconfig.json` sets `noUncheckedIndexedAccess: true`; the index is
 * masked to 8 bits so it is always in range.
 */
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i]!;
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff]!;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** One archive member: an ASCII path and the exact bytes stored at it. */
export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

/**
 * Reject an entry name that is empty, absolute, backslash-bearing, or contains
 * a `..` path segment. A ZIP entry name is a path, and a naive extractor
 * handed `../` writes outside its extraction root.
 */
function assertSafeName(name: string): void {
  const rejected =
    name === '' ||
    name.startsWith('/') ||
    name.includes('\\') ||
    name.split('/').some((segment) => segment === '..');
  if (rejected) {
    throw new Error('ZIP ENTRY NAME REJECTED: ' + JSON.stringify(name));
  }
}

/**
 * Build a ZIP archive holding every entry with compression method 0 (stored).
 *
 * Payloads are copied verbatim into the output buffer; no reference to a caller
 * array is retained, so mutating an input after the call cannot change an
 * archive already produced.
 */
export function buildStoredZip(entries: ZipEntry[]): Uint8Array<ArrayBuffer> {
  if (entries.length === 0) {
    throw new Error('ZIP NO ENTRIES');
  }

  const encoder = new TextEncoder();
  const seen = new Set<string>();
  const prepared: Array<{ nameBytes: Uint8Array; data: Uint8Array; crc: number }> = [];

  for (const entry of entries) {
    assertSafeName(entry.name);
    if (seen.has(entry.name)) {
      throw new Error('ZIP DUPLICATE ENTRY NAME: ' + JSON.stringify(entry.name));
    }
    seen.add(entry.name);

    const nameBytes = encoder.encode(entry.name);
    for (let i = 0; i < nameBytes.length; i += 1) {
      if (nameBytes[i]! >= 0x80) {
        throw new Error('ZIP ENTRY NAME NOT ASCII: ' + JSON.stringify(entry.name));
      }
    }

    prepared.push({ nameBytes, data: entry.data, crc: crc32(entry.data) });
  }

  let localSectionSize = 0;
  let centralSectionSize = 0;
  for (const item of prepared) {
    localSectionSize += LOCAL_HEADER_SIZE + item.nameBytes.length + item.data.length;
    centralSectionSize += CENTRAL_HEADER_SIZE + item.nameBytes.length;
  }

  const total = localSectionSize + centralSectionSize + EOCD_SIZE;
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);

  const localOffsets: number[] = [];
  let off = 0;

  for (const item of prepared) {
    localOffsets.push(off);
    view.setUint32(off + 0, SIG_LOCAL, true);
    view.setUint16(off + 4, VERSION, true);
    view.setUint16(off + 6, 0, true);
    view.setUint16(off + 8, 0, true);
    view.setUint16(off + 10, DOS_TIME, true);
    view.setUint16(off + 12, DOS_DATE, true);
    view.setUint32(off + 14, item.crc, true);
    view.setUint32(off + 18, item.data.length, true);
    view.setUint32(off + 22, item.data.length, true);
    view.setUint16(off + 26, item.nameBytes.length, true);
    view.setUint16(off + 28, 0, true);
    out.set(item.nameBytes, off + LOCAL_HEADER_SIZE);
    out.set(item.data, off + LOCAL_HEADER_SIZE + item.nameBytes.length);
    off += LOCAL_HEADER_SIZE + item.nameBytes.length + item.data.length;
  }

  const centralStart = off;

  for (let i = 0; i < prepared.length; i += 1) {
    const item = prepared[i]!;
    view.setUint32(off + 0, SIG_CENTRAL, true);
    view.setUint16(off + 4, VERSION, true);
    view.setUint16(off + 6, VERSION, true);
    view.setUint16(off + 8, 0, true);
    view.setUint16(off + 10, 0, true);
    view.setUint16(off + 12, DOS_TIME, true);
    view.setUint16(off + 14, DOS_DATE, true);
    view.setUint32(off + 16, item.crc, true);
    view.setUint32(off + 20, item.data.length, true);
    view.setUint32(off + 24, item.data.length, true);
    view.setUint16(off + 28, item.nameBytes.length, true);
    view.setUint16(off + 30, 0, true);
    view.setUint16(off + 32, 0, true);
    view.setUint16(off + 34, 0, true);
    view.setUint16(off + 36, 0, true);
    view.setUint32(off + 38, 0, true);
    view.setUint32(off + 42, localOffsets[i]!, true);
    out.set(item.nameBytes, off + CENTRAL_HEADER_SIZE);
    off += CENTRAL_HEADER_SIZE + item.nameBytes.length;
  }

  view.setUint32(off + 0, SIG_EOCD, true);
  view.setUint16(off + 4, 0, true);
  view.setUint16(off + 6, 0, true);
  view.setUint16(off + 8, prepared.length, true);
  view.setUint16(off + 10, prepared.length, true);
  view.setUint32(off + 12, centralSectionSize, true);
  view.setUint32(off + 16, centralStart, true);
  view.setUint16(off + 20, 0, true);

  return out;
}
