export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-divider mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm font-body text-gray-secondary font-semibold mb-2">
          Not affiliated with the Securities and Exchange Commission of the Philippines.
        </p>
        <p className="text-xs font-body text-gray-muted leading-relaxed mb-4">
          This tool provides estimates only. It is not legal advice and is not affiliated with the
          Securities and Exchange Commission of the Philippines. Penalty calculations are based on
          publicly available SEC memorandum circulars and are provided for informational purposes
          only. Consult a licensed attorney or SEC-accredited filing agent for official guidance.
        </p>
        <p className="text-xs font-body text-gray-muted">
          &copy; {year} SEC Compliance Navigator. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
