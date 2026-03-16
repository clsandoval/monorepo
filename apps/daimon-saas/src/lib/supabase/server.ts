import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Mock Supabase client for CI/testing when credentials are placeholders
function createMockClient() {
  const mockUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'ci-test@daimon.ai',
    app_metadata: {},
    user_metadata: { full_name: 'CI Test User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  }

  const mockTenant = {
    id: '00000000-0000-0000-0000-000000000010',
    name: "CI Test Workspace",
    plan: 'free',
    status: 'active',
    created_at: new Date().toISOString(),
  }

  const emptyResult = { data: null, error: null, count: 0 }
  const emptyArrayResult = { data: [], error: null, count: 0 }

  type MockResult = { data: unknown; error: null; count?: number }
  type MockEntry = { single: MockResult; array: MockResult }

  // Table-specific mock data
  const tableMocks: Record<string, MockEntry> = {
    tenants: { single: { data: mockTenant, error: null }, array: { data: [mockTenant], error: null, count: 1 } },
    tenant_members: { single: { data: { role: 'owner', user_id: mockUser.id, tenant_id: mockTenant.id }, error: null }, array: { data: [{ role: 'owner', user_id: mockUser.id, tenant_id: mockTenant.id }], error: null, count: 1 } },
    user_profiles: { single: { data: { is_admin: true, display_name: 'CI Test User', user_id: mockUser.id }, error: null }, array: { data: [{ is_admin: true }], error: null, count: 1 } },
  }

  type MockChain = Record<string | symbol, unknown> & {
    single: () => Promise<MockResult>
    maybeSingle: () => Promise<MockResult>
    then: (resolve: (value: MockResult) => unknown) => unknown
    catch: (...args: unknown[]) => MockChain
    finally: (...args: unknown[]) => MockChain
  }

  // Chain builder that returns mock data per table
  const createChain = (table: string): MockChain => {
    const mock = tableMocks[table]
    const chain = {} as MockChain
    const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'order', 'limit', 'range', 'filter', 'match', 'not', 'or', 'textSearch']
    for (const m of methods) {
      chain[m] = (...args: unknown[]) => { void args; return chain }
    }
    chain.single = () => Promise.resolve(mock?.single ?? emptyResult)
    chain.maybeSingle = () => Promise.resolve(mock?.single ?? emptyResult)
    chain.then = (resolve: (value: MockResult) => unknown) => resolve(mock?.array ?? emptyArrayResult)
    chain[Symbol.toStringTag] = 'Promise'
    chain.catch = (...args: unknown[]) => { void args; return chain }
    chain.finally = (...args: unknown[]) => { void args; return chain }
    return chain
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      getSession: async () => ({ data: { session: { user: mockUser } }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => createChain(table),
    rpc: (...args: unknown[]) => { void args; return Promise.resolve(emptyResult) },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock client must satisfy SupabaseClient shape
  } as any
}

export async function createClient() {
  // Return mock client when Supabase credentials are placeholders (CI/testing)
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder') {
    return createMockClient()
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — cookies can't be set
          }
        },
      },
    }
  )
}
