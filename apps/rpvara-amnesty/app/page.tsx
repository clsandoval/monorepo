import { Header } from "@/components/header";
import { DeadlineBanner } from "@/components/deadline-banner";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Header />
      <DeadlineBanner />
      <p className="mt-8 text-text-secondary">Calculator form coming next.</p>
    </main>
  );
}
