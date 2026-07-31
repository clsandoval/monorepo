/**
 * wasm-errors — the structured failure contract at the WASM boundary (OBS-07).
 *
 * Before this, `compute_json` rejected with an ad-hoc sentence and `computeWasm`
 * had no try/catch, so a serde rejection reached the calling route component as a
 * bare string with no way to tell an unparseable input from a corrupt output.
 *
 * Source of truth:
 *   - .planning/phases/05-engine-observability-restored/05-06-PLAN.md
 *   - engine/src/wasm.rs (the {"error":{"kind","message","detail"}} payload)
 */

import { describe, it, expect } from "vitest";
import { computeWasm, EngineError, parseEngineError } from "../bridge";
import type { EngineInput } from "../../types";

// ---------------------------------------------------------------------------
// Helpers — each test file defines its own builders in this repo.
// ---------------------------------------------------------------------------

function makeInput(): EngineInput {
  return {
    net_distributable_estate: { centavos: 500_000_000 },
    decedent: {
      id: "decedent",
      name: "Juan Dela Cruz",
      date_of_death: "2026-01-15",
      is_married: false,
      date_of_marriage: null,
      marriage_solemnized_in_articulo_mortis: false,
      was_ill_at_marriage: false,
      illness_caused_death: false,
      years_of_cohabitation: 0,
      has_legal_separation: false,
      is_illegitimate: false,
    },
    family_tree: [
      {
        id: "lc1",
        name: "Maria",
        is_alive_at_succession: true,
        relationship_to_decedent: "LegitimateChild",
        degree: 1,
        line: null,
        children: [],
        filiation_proved: true,
        filiation_proof_type: null,
        is_guilty_party_in_legal_separation: false,
        adoption: null,
        is_unworthy: false,
        unworthiness_condoned: false,
        has_renounced: false,
        blood_type: null,
      },
    ],
    will: null,
    donations: [],
    config: {
      retroactive_ra_11642: false,
      max_pipeline_restarts: 10,
    },
  } as EngineInput;
}

describe("WASM boundary structured errors", () => {
  it("rejects an empty object with an EngineError of kind invalid_input", async () => {
    await expect(computeWasm({} as never)).rejects.toBeInstanceOf(EngineError);

    let caught: unknown;
    try {
      await computeWasm({} as never);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(EngineError);
    expect((caught as EngineError).kind).toBe("invalid_input");
  });

  it("carries the engine's own diagnostic through as a non-empty detail", async () => {
    let caught: unknown;
    try {
      await computeWasm({} as never);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(EngineError);
    const detail = (caught as EngineError).detail;
    expect(typeof detail).toBe("string");
    expect(detail.length).toBeGreaterThan(0);
  });

  it("rejects a non-numeric centavos value with kind invalid_input", async () => {
    const input = makeInput();
    (input.net_distributable_estate as { centavos: unknown }).centavos =
      "not-a-number";

    let caught: unknown;
    try {
      await computeWasm(input);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(EngineError);
    expect((caught as EngineError).kind).toBe("invalid_input");
  });

  it("maps an unrecognised rejection to kind unknown, never an untyped value", () => {
    const err = parseEngineError("plain text that is not json");
    expect(err).toBeInstanceOf(EngineError);
    expect(err.kind).toBe("unknown");
    expect(err.detail).toBe("plain text that is not json");
  });

  it("parses a well-formed output_check payload into its three fields", () => {
    const err = parseEngineError(
      JSON.stringify({
        error: { kind: "output_check", message: "m", detail: "d" },
      }),
    );
    expect(err).toBeInstanceOf(EngineError);
    expect(err.kind).toBe("output_check");
    expect(err.message).toBe("m");
    expect(err.detail).toBe("d");
  });

  it("leaves the success path unchanged — a well-formed input still resolves", async () => {
    const output = await computeWasm(makeInput());
    expect(Array.isArray(output.per_heir_shares)).toBe(true);
    expect(output.per_heir_shares.length).toBeGreaterThan(0);
  });
});
