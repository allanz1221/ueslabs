// Supabase middleware removed - using NextAuth.js instead
// This file is kept for compatibility but Supabase is not used in this project

export async function updateSession() {
  // Supabase middleware is disabled - NextAuth.js handles authentication
  console.warn("[v0] Supabase middleware disabled - NextAuth.js handles authentication")
  return null
}
