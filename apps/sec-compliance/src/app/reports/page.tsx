import { requirePro } from "@/lib/pro/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Download } from "lucide-react";

export default async function ReportsPage() {
  const { org } = await requirePro();
  const supabase = await createClient();

  // Fetch reports joined with corporation name
  const { data: reports } = await supabase
    .from("reports")
    .select("id, corporation_id, organization_id, generated_at, report_type, storage_path, corporations(name)")
    .eq("organization_id", org.id)
    .order("generated_at", { ascending: false });

  // Generate signed URLs for each report
  const reportsWithUrls = await Promise.all(
    (reports ?? []).map(async (report) => {
      const { data: signedData } = await supabase.storage
        .from("reports")
        .createSignedUrl(report.storage_path, 3600); // 1 hour expiry
      return {
        ...report,
        downloadUrl: signedData?.signedUrl ?? null,
      };
    })
  );

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-charcoal">
          Reports
        </h1>
        <p className="font-body text-sm text-gray-secondary mt-1">
          Generated compliance reports
        </p>
      </div>

      {reportsWithUrls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="size-10 text-gray-300 mb-3" />
          <p className="font-body text-sm text-gray-secondary">
            No reports generated yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-divider bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-divider bg-gray-50">
                <th className="px-4 py-3 text-left font-body text-xs font-semibold text-gray-secondary uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-body text-xs font-semibold text-gray-secondary uppercase tracking-wide">
                  Corporation
                </th>
                <th className="px-4 py-3 text-left font-body text-xs font-semibold text-gray-secondary uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-right font-body text-xs font-semibold text-gray-secondary uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {reportsWithUrls.map((report) => {
                const corporations = report.corporations as
                  | { name: string }
                  | { name: string }[]
                  | null;
                const corpName = Array.isArray(corporations)
                  ? (corporations[0]?.name ?? "Unknown Corporation")
                  : (corporations?.name ?? "Unknown Corporation");
                const date = new Date(report.generated_at).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "short", day: "numeric" }
                );
                const reportTypeLabel =
                  report.report_type === "compliance_summary"
                    ? "Compliance Summary"
                    : report.report_type;

                return (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-body text-sm text-charcoal">
                      {date}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-charcoal">
                      {corpName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-body text-sm text-gray-secondary">
                        <FileText className="size-3.5" />
                        {reportTypeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {report.downloadUrl ? (
                        <Link
                          href={report.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-sec-blue hover:underline"
                        >
                          <Download className="size-3.5" />
                          Download
                        </Link>
                      ) : (
                        <span className="font-body text-sm text-gray-secondary">
                          Unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
