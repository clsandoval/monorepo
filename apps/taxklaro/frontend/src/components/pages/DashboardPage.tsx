// DashboardPage: dashboard shell component
// Route redirect logic lives in src/routes/dashboard.tsx (redirects to /computations)
export function DashboardPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-sm text-zinc-500">Loading dashboard…</p>
    </div>
  );
}

export default DashboardPage;
