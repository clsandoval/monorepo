import { NextResponse } from "next/server";
import { z } from "zod";
import { computeCompliance, type ComplianceInput } from "@/engine/compute";
import type { ReportType } from "@/engine/types";

const filingSchema = z.object({
  reportType: z.string(),
  year: z.number(),
  status: z.enum(["not_filed", "filed_late", "filed_on_time", "filed"]),
});

const inputSchema = z.object({
  corpType: z.enum(["stock", "non_stock", "opc"]),
  incorporationYear: z.number().int().min(1900).max(2100),
  reBracket: z.string(),
  mc28Compliant: z.boolean(),
  filedReports: z.array(filingSchema),
  suspensionDate: z.string().nullable(),
  revocationDate: z.string().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = inputSchema.parse(body);

    const input: ComplianceInput = {
      domicile: "domestic",
      corpType: parsed.corpType,
      reBracket: parsed.reBracket as ComplianceInput["reBracket"],
      mc28Compliant: parsed.mc28Compliant,
      incorporationYear: parsed.incorporationYear,
      currentDate: new Date(),
      suspensionDate: parsed.suspensionDate
        ? new Date(parsed.suspensionDate)
        : null,
      revocationDate: parsed.revocationDate
        ? new Date(parsed.revocationDate)
        : null,
      filedReports: parsed.filedReports.map((r) => ({
        reportType: r.reportType as ReportType,
        year: r.year,
        status: r.status === "filed" ? "filed_on_time" : r.status,
      })),
    };

    const result = computeCompliance(input);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
