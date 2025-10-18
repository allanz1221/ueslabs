// Supabase server configuration removed - using NextAuth.js instead
// This file is kept for compatibility but Supabase is not used in this project

export async function createServerClient() {
  throw new Error("Supabase is not configured in this project. Use NextAuth.js for authentication.")
}

export async function createClient() {
  return createServerClient()
}
