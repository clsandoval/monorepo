/**
 * Byte-level proof of the stored-method ZIP writer.
 *
 * Source of truth for the header layout asserted here:
 * `.planning/phases/22-deed-of-extrajudicial-settlement-schedule-of-shares/22-RESEARCH.md` §3.
 *
 * Local builders only — this codebase has no shared fixture module and one must
 * not be introduced.
 */

import { describe, it, expect } from 'vitest';
import { buildStoredZip, crc32 } from '../zip';

function bytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function viewOf(a: Uint8Array): DataView {
  return new DataView(a.buffer, a.byteOffset, a.byteLength);
}

describe('crc32', () => {
  it('is 0 for the empty input', () => {
    expect(crc32(bytes(''))).toBe(0);
  });

  it("is 0xE8B7BE43 for the single byte 'a'", () => {
    expect(crc32(bytes('a'))).toBe(3904355907);
  });

  it("is the standard check value 0xCBF43926 for '123456789'", () => {
    expect(crc32(bytes('123456789'))).toBe(3421780262);
  });
});

describe('buildStoredZip structure', () => {
  const entries = [
    { name: 'a.txt', data: bytes('hello') },
    { name: 'dir/b.txt', data: bytes('second payload') },
  ];

  it('begins with the local file header signature', () => {
    const zip = buildStoredZip(entries);
    expect([zip[0], zip[1], zip[2], zip[3]]).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });

  it('ends with a 22-byte end-of-central-directory record', () => {
    const zip = buildStoredZip(entries);
    const eocd = zip.subarray(zip.length - 22);
    expect([eocd[0], eocd[1], eocd[2], eocd[3]]).toEqual([0x50, 0x4b, 0x05, 0x06]);
  });

  it('records the total entry count in the EOCD', () => {
    const zip = buildStoredZip(entries);
    const eocd = zip.subarray(zip.length - 22);
    expect(viewOf(eocd).getUint16(10, true)).toBe(2);
  });

  it('stores every entry with compression method 0', () => {
    const zip = buildStoredZip(entries);
    const view = viewOf(zip);
    let off = 0;
    for (const entry of entries) {
      expect(view.getUint32(off, true)).toBe(0x04034b50);
      expect(view.getUint16(off + 8, true)).toBe(0);
      const nameLen = view.getUint16(off + 26, true);
      off += 30 + nameLen + entry.data.length;
    }
  });

  it('writes the fixed DOS date 0x0021 in every local header', () => {
    const zip = buildStoredZip(entries);
    const view = viewOf(zip);
    let off = 0;
    for (const entry of entries) {
      expect(zip[off + 12]).toBe(0x21);
      expect(zip[off + 13]).toBe(0x00);
      const nameLen = view.getUint16(off + 26, true);
      off += 30 + nameLen + entry.data.length;
    }
  });

  it('copies each payload verbatim after its local header and name', () => {
    const zip = buildStoredZip(entries);
    const view = viewOf(zip);
    let off = 0;
    for (const entry of entries) {
      const nameLen = view.getUint16(off + 26, true);
      const name = new TextDecoder().decode(zip.subarray(off + 30, off + 30 + nameLen));
      expect(name).toBe(entry.name);
      const payload = zip.subarray(off + 30 + nameLen, off + 30 + nameLen + entry.data.length);
      expect(Array.from(payload)).toEqual(Array.from(entry.data));
      off += 30 + nameLen + entry.data.length;
    }
  });

  it("EOCD's central-directory offset lands on a central header signature", () => {
    const zip = buildStoredZip(entries);
    const eocd = zip.subarray(zip.length - 22);
    const centralOffset = viewOf(eocd).getUint32(16, true);
    expect(viewOf(zip).getUint32(centralOffset, true)).toBe(0x02014b50);
  });

  it("EOCD's central-directory size covers exactly the central section", () => {
    const zip = buildStoredZip(entries);
    const eocd = zip.subarray(zip.length - 22);
    const centralOffset = viewOf(eocd).getUint32(16, true);
    const centralSize = viewOf(eocd).getUint32(12, true);
    expect(centralOffset + centralSize).toBe(zip.length - 22);
  });

  it("each central header's relative local-header offset points at a local signature", () => {
    const zip = buildStoredZip(entries);
    const view = viewOf(zip);
    const eocd = zip.subarray(zip.length - 22);
    let off = viewOf(eocd).getUint32(16, true);
    for (let i = 0; i < entries.length; i += 1) {
      expect(view.getUint32(off, true)).toBe(0x02014b50);
      const localOffset = view.getUint32(off + 42, true);
      expect(view.getUint32(localOffset, true)).toBe(0x04034b50);
      const nameLen = view.getUint16(off + 28, true);
      off += 46 + nameLen;
    }
  });
});

describe('buildStoredZip determinism', () => {
  it('produces byte-identical output for equal inputs', () => {
    const make = () => [
      { name: 'a.txt', data: bytes('hello') },
      { name: 'dir/b.txt', data: bytes('second payload') },
    ];
    const first = buildStoredZip(make());
    const second = buildStoredZip(make());
    expect(first.length).toBe(second.length);
    for (let i = 0; i < first.length; i += 1) {
      expect(first[i]).toBe(second[i]);
    }
  });

  it('does not retain a reference to a caller payload', () => {
    const payload = bytes('hello');
    const zip = buildStoredZip([{ name: 'a.txt', data: payload }]);
    const before = Array.from(zip);
    payload[0] = 0x00;
    expect(Array.from(zip)).toEqual(before);
  });
});

describe('buildStoredZip rejections', () => {
  it('refuses an empty entry list', () => {
    expect(() => buildStoredZip([])).toThrow(/ZIP NO ENTRIES/);
  });

  it('refuses an empty name', () => {
    expect(() => buildStoredZip([{ name: '', data: bytes('x') }])).toThrow(
      /ZIP ENTRY NAME REJECTED/,
    );
  });

  it('refuses an absolute name', () => {
    expect(() => buildStoredZip([{ name: '/abs.txt', data: bytes('x') }])).toThrow(
      /ZIP ENTRY NAME REJECTED/,
    );
  });

  it('refuses a leading parent-directory segment', () => {
    expect(() => buildStoredZip([{ name: '../escape.txt', data: bytes('x') }])).toThrow(
      /ZIP ENTRY NAME REJECTED/,
    );
  });

  it('refuses an interior parent-directory segment', () => {
    expect(() => buildStoredZip([{ name: 'word/../../escape.txt', data: bytes('x') }])).toThrow(
      /ZIP ENTRY NAME REJECTED/,
    );
  });

  it('refuses a backslash in a name', () => {
    expect(() => buildStoredZip([{ name: 'word\\document.xml', data: bytes('x') }])).toThrow(
      /ZIP ENTRY NAME REJECTED/,
    );
  });

  it('refuses two entries sharing a name', () => {
    expect(() =>
      buildStoredZip([
        { name: 'a.txt', data: bytes('one') },
        { name: 'a.txt', data: bytes('two') },
      ]),
    ).toThrow(/ZIP DUPLICATE ENTRY NAME/);
  });

  it('refuses a non-ASCII name', () => {
    expect(() => buildStoredZip([{ name: 'wörd.xml', data: bytes('x') }])).toThrow(
      /ZIP ENTRY NAME NOT ASCII/,
    );
  });
});
