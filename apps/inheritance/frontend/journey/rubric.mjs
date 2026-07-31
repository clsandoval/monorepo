/*
 * journey/rubric.mjs — the deterministic rubric evaluator.
 *
 * JRNY-09 requires "a fixed list of yes/no assertions returning structured output,
 * never free-form judgment." That sentence is only enforceable if the evaluator
 * CANNOT improvise. So:
 *
 *   - The kind set is CLOSED. `ASSERTION_KINDS` holds exactly eight names and is
 *     frozen. A rubric naming anything else is REJECTED with a thrown
 *     `RUBRIC INVALID:` error — never skipped, never "interpreted somehow", and
 *     never passed. An evaluator that falls back to interpretation when it meets an
 *     unrecognised kind has reintroduced free-form judgment through the back door.
 *   - A result carries `id`, `kind`, `passed`, `expected` and `actual` per assertion
 *     and nothing else. There is deliberately no `comment`, `explanation`,
 *     `confidence` or `severity` field — those are where prose judgment re-enters a
 *     structured format.
 *   - Every assertion is evaluated. The loop never short-circuits, because a rubric
 *     that stops at its first failure is a single assertion wearing a list's clothes.
 *
 * This module writes nothing to disk and prints nothing. It returns a value; plan
 * 10-04 owns artifact writing and plan 10-06 owns gate output.
 *
 * Rubric-supplied strings are never handed to an in-page script-evaluation API — only
 * to Playwright locator APIs — so a rubric cannot execute arbitrary script in the page
 * context.
 */

/** The closed set of assertion kinds, in specification order. */
export const ASSERTION_KINDS = Object.freeze([
  'text_equals',
  'text_contains',
  'text_absent',
  'element_visible',
  'element_absent',
  'element_count',
  'attribute_equals',
  'no_console_error',
]);

/** Required fields per kind — the `Required fields` column of the specification. */
const REQUIRED_FIELDS = Object.freeze({
  text_equals: ['selector', 'expect'],
  text_contains: ['selector', 'expect'],
  text_absent: ['selector', 'expect'],
  element_visible: ['selector'],
  element_absent: ['selector'],
  element_count: ['selector', 'expect'],
  attribute_equals: ['selector', 'attr', 'expect'],
  no_console_error: [],
});

function invalid(message) {
  throw new Error(message);
}

/**
 * Throws when a rubric is malformed or names a kind outside ASSERTION_KINDS.
 * Returns nothing on success.
 * @param {object} rubric
 */
export function validateRubric(rubric) {
  if (!rubric || typeof rubric !== 'object' || Array.isArray(rubric)) {
    invalid('RUBRIC INVALID: a rubric must be an object');
  }
  if (typeof rubric.rubricId !== 'string' || rubric.rubricId.trim() === '') {
    invalid('RUBRIC INVALID: rubricId is missing or empty');
  }
  if (!Array.isArray(rubric.assertions) || rubric.assertions.length === 0) {
    invalid(`RUBRIC INVALID: rubric '${rubric.rubricId}' has no assertions`);
  }

  const seen = new Set();
  for (let i = 0; i < rubric.assertions.length; i += 1) {
    const a = rubric.assertions[i];
    if (!a || typeof a !== 'object' || Array.isArray(a)) {
      invalid(`RUBRIC INVALID: assertion at index ${i} is not an object`);
    }
    if (typeof a.id !== 'string' || a.id.trim() === '') {
      invalid(`RUBRIC INVALID: assertion at index ${i} is missing an id`);
    }
    if (seen.has(a.id)) {
      invalid(`RUBRIC INVALID: duplicate assertion id '${a.id}'`);
    }
    seen.add(a.id);

    if (!ASSERTION_KINDS.includes(a.kind)) {
      invalid(
        `RUBRIC INVALID: assertion '${a.id}' names kind '${a.kind}', which is outside the closed set [${ASSERTION_KINDS.join(', ')}]`,
      );
    }
    for (const field of REQUIRED_FIELDS[a.kind]) {
      if (a[field] === undefined || a[field] === null) {
        invalid(`RUBRIC INVALID: assertion '${a.id}' of kind '${a.kind}' is missing required field '${field}'`);
      }
    }
  }
}

function norm(text) {
  return String(text).trim();
}

/**
 * Evaluate a single assertion against the page. Returns { passed, expected, actual }.
 * Throws only for programming errors — a locator failure is caught by the caller.
 */
async function evaluateAssertion(page, a) {
  switch (a.kind) {
    case 'no_console_error': {
      const errors = Array.isArray(page.__journeyConsoleErrors) ? page.__journeyConsoleErrors : [];
      return { passed: errors.length === 0, expected: 0, actual: errors.length };
    }
    case 'element_absent': {
      const count = await page.locator(a.selector).count();
      return { passed: count === 0, expected: 0, actual: count };
    }
    case 'element_count': {
      const count = await page.locator(a.selector).count();
      return { passed: count === Number(a.expect), expected: Number(a.expect), actual: count };
    }
    case 'text_absent': {
      // Multi-match kind: passes when NO matching element contains the text.
      const locator = page.locator(a.selector);
      const count = await locator.count();
      const hits = [];
      for (let i = 0; i < count; i += 1) {
        const text = await locator.nth(i).innerText();
        if (String(text).includes(a.expect)) hits.push(norm(text));
      }
      return { passed: hits.length === 0, expected: a.expect, actual: hits.length === 0 ? null : hits.join(' ⏎ ') };
    }
    case 'element_visible': {
      const locator = page.locator(a.selector);
      const count = await locator.count();
      if (count !== 1) {
        return { passed: false, expected: 'exactly one visible element', actual: `${count} elements matched` };
      }
      const visible = await locator.first().isVisible();
      return { passed: visible === true, expected: 'visible', actual: visible ? 'visible' : 'hidden' };
    }
    case 'text_equals':
    case 'text_contains':
    case 'attribute_equals': {
      const locator = page.locator(a.selector);
      const count = await locator.count();
      if (count !== 1) {
        return {
          passed: false,
          expected: a.expect,
          actual: `${count} elements matched selector '${a.selector}' (this kind is singular by intent)`,
        };
      }
      if (a.kind === 'attribute_equals') {
        const attr = await locator.first().getAttribute(a.attr);
        return { passed: attr === a.expect, expected: a.expect, actual: attr };
      }
      const text = norm(await locator.first().innerText());
      if (a.kind === 'text_equals') {
        return { passed: text === a.expect, expected: a.expect, actual: text };
      }
      return { passed: text.includes(a.expect), expected: a.expect, actual: text };
    }
    default:
      // Unreachable: validateRubric already rejected anything outside the closed set.
      return invalid(`RUBRIC INVALID: unhandled kind '${a.kind}'`);
  }
}

/**
 * Evaluate every assertion in a rubric against a live page.
 * @param {import('playwright').Page} page
 * @param {object} rubric
 * @returns {Promise<{rubricId:string,passed:boolean,total:number,failedCount:number,assertions:Array}>}
 */
export async function evaluateRubric(page, rubric) {
  validateRubric(rubric);

  const assertions = [];
  for (const a of rubric.assertions) {
    let outcome;
    try {
      outcome = await evaluateAssertion(page, a);
    } catch (err) {
      // A throwing locator fails THIS assertion only; the loop continues.
      outcome = {
        passed: false,
        expected: a.expect === undefined ? null : a.expect,
        actual: `ERROR: ${err && err.message ? err.message : String(err)}`,
      };
    }
    assertions.push({
      id: a.id,
      kind: a.kind,
      passed: outcome.passed === true,
      expected: outcome.expected === undefined ? null : outcome.expected,
      actual: outcome.actual === undefined ? null : outcome.actual,
    });
  }

  const failedCount = assertions.filter((r) => !r.passed).length;
  return {
    rubricId: rubric.rubricId,
    passed: failedCount === 0,
    total: assertions.length,
    failedCount,
    assertions,
  };
}
