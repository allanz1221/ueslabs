// Supabase client configuration removed - using NextAuth.js instead
// This file is kept for compatibility but Supabase is not used in this project

export function createBrowserClient() {
  throw new Error("Supabase is not configured in this project. Use NextAuth.js for authentication.")
}

export function createClient() {
  return createBrowserClient()
}
