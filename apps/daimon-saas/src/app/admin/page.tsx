import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Daimon platform administration.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://daimon.ai/admin' },
}

export default function AdminPage() {
  redirect('/admin/tenants')
}
