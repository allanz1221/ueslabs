import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Missing Supabase environment variables - using placeholder values")
    // Return a mock client for development
    return createBrowserClientSSR(
      "https://placeholder.supabase.co",
      "placeholder-key"
    )
  }

  return createBrowserClientSSR(supabaseUrl, supabaseAnonKey)
}

export function createClient() {
  return createBrowserClient()
}
