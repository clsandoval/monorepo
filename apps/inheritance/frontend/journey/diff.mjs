/*
 * journey/diff.mjs — the perceptual comparator.
 *
 * This module NEVER writes into `frontend/journey/references/`. It contains no
 * write call of any kind. Only `journey/approve.mjs` writes a reference, and no
 * gate invokes `approve.mjs`.
 *
 * That separation is the whole point: a gate that could write its own reference
 * could turn any failure green by rewriting its own expectation, and nobody would
 * see the change. Approval has to be a deliberate, separately-invoked act whose
 * result lands in git as a reviewable diff.
 *
 * The five markers below are spelled exactly as they appear in `REFERENCES.md` and
 * in the gate output. A marker spelled differently in one place breaks the
 * rubric-versus-diff distinction JRNY-10 asks for.
 */

import fs from 'node:fs';
import path from 'node:path';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/** The five failure markers, spelled exactly. */
export const DIFF_MARKERS = Object.freeze({
  RUBRIC_FAILURE: 'RUBRIC FAILURE',
  DIFF_FAILURE: 'DIFF FAILURE',
  REFERENCE_MISSING: 'REFERENCE MISSING',
  REFERENCE_SIZE_MISMATCH: 'REFERENCE SIZE MISMATCH',
  STEP_ERROR: 'STEP ERROR',
});

/** pixelmatch threshold, probed in 10-RESEARCH.md §3. */
const PIXELMATCH_THRESHOLD = 0.1;

/**
 * Compare a freshly captured PNG against the approved reference for a step.
 * Writes nothing, anywhere.
 *
 * @param {Buffer} actualPngBuffer
 * @param {string} stepId
 * @param {string} referencesDir
 * @returns {{stepId:string,status:'pass'|'fail',markers:string[],diffPixels:number|null,maxDiffPixels:number|null,diffPng:Buffer|null,actualSize:{width:number,height:number},referenceSize:{width:number,height:number}|null}}
 */
export function compareToReference(actualPngBuffer, stepId, referencesDir) {
  const actual = PNG.sync.read(actualPngBuffer);
  const actualSize = { width: actual.width, height: actual.height };

  const referencePngPath = path.join(referencesDir, `${stepId}.png`);
  const sidecarPath = path.join(referencesDir, `${stepId}.json`);

  // 1. Reference PNG absent, or sidecar JSON absent.
  //    An image with no declared tolerance has no pass condition, so a missing
  //    sidecar is as fatal as a missing image.
  if (!fs.existsSync(referencePngPath) || !fs.existsSync(sidecarPath)) {
    return {
      stepId,
      status: 'fail',
      markers: [DIFF_MARKERS.REFERENCE_MISSING],
      diffPixels: null,
      maxDiffPixels: null,
      diffPng: null,
      actualSize,
      referenceSize: null,
    };
  }

  const sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
  const maxDiffPixels = Number.isInteger(sidecar.maxDiffPixels) ? sidecar.maxDiffPixels : 0;

  const reference = PNG.sync.read(fs.readFileSync(referencePngPath));
  const referenceSize = { width: reference.width, height: reference.height };

  // 2. Dimensions differ — pixelmatch requires equal dimensions, so no pixel
  //    comparison is attempted and diffPixels stays null.
  if (reference.width !== actual.width || reference.height !== actual.height) {
    return {
      stepId,
      status: 'fail',
      markers: [DIFF_MARKERS.REFERENCE_SIZE_MISMATCH],
      diffPixels: null,
      maxDiffPixels,
      diffPng: null,
      actualSize,
      referenceSize,
    };
  }

  const diff = new PNG({ width: actual.width, height: actual.height });
  const diffPixels = pixelmatch(
    reference.data,
    actual.data,
    diff.data,
    actual.width,
    actual.height,
    { threshold: PIXELMATCH_THRESHOLD },
  );
  const diffPng = PNG.sync.write(diff);

  // 3. Over tolerance.
  if (diffPixels > maxDiffPixels) {
    return {
      stepId,
      status: 'fail',
      markers: [DIFF_MARKERS.DIFF_FAILURE],
      diffPixels,
      maxDiffPixels,
      diffPng,
      actualSize,
      referenceSize,
    };
  }

  // 4. Within tolerance.
  return {
    stepId,
    status: 'pass',
    markers: [],
    diffPixels,
    maxDiffPixels,
    diffPng,
    actualSize,
    referenceSize,
  };
}
