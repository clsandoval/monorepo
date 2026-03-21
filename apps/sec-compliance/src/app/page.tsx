import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-2xl text-center">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-charcoal mb-6">
          Is your corporation in trouble with the SEC?
        </h1>
        <p className="text-gray-secondary text-lg mb-8">
          Find out exactly how much you owe and what it takes to get back in
          good standing with the Securities and Exchange Commission.
        </p>
        <Link
          href="/wizard"
          className="inline-block bg-sec-blue text-white px-8 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
        >
          Check Your Compliance
        </Link>
      </div>
    </main>
  );
}
