import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Missing Supabase environment variables - using placeholder values")
    // Return a mock client for development
    const cookieStore = await cookies()
    return createServerClientSSR(
      "https://placeholder.supabase.co",
      "placeholder-key",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: any) {
            try {
              cookiesToSet.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options))
            } catch {
              // The "setAll" method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  }

  const cookieStore = await cookies()

  return createServerClientSSR(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: any) {
        try {
          cookiesToSet.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export async function createClient() {
  return createServerClient()
}
