import { describe, it, expect } from "vitest";
import { parseAndValidateCSV, type CSVRow, type CSVValidationResult } from "@/lib/pro/csv";

describe("parseAndValidateCSV", () => {
  it("parses valid CSV with all fields", () => {
    const csv = `corporation_name,corp_type,incorporation_date,re_bracket,sec_registration_number
ABC Corp,stock,2018-01-15,100k_500k,CS201800001`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows[0].corporation_name).toBe("ABC Corp");
    expect(result.validRows[0].corp_type).toBe("stock");
  });

  it("parses year-only incorporation date", () => {
    const csv = `corporation_name,corp_type,incorporation_date
Test Corp,non_stock,2020`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].incorporation_date).toBe("2020-01-01");
  });

  it("rejects missing required fields", () => {
    const csv = `corporation_name,corp_type,incorporation_date
,stock,2018`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("corporation_name");
  });

  it("rejects invalid corp_type", () => {
    const csv = `corporation_name,corp_type,incorporation_date
Test,partnership,2018`;
    const result = parseAndValidateCSV(csv);
    expect(result.errors[0].message).toContain("corp_type");
  });

  it("defaults re_bracket to 0_100k when not provided", () => {
    const csv = `corporation_name,corp_type,incorporation_date
Test,stock,2018`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows[0].re_bracket).toBe("0_100k");
  });

  it("handles multiple rows with mixed validity", () => {
    const csv = `corporation_name,corp_type,incorporation_date
Good Corp,stock,2018
,opc,2020
Bad Type,llc,2019`;
    const result = parseAndValidateCSV(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
  });
});
