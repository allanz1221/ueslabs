import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Redirect based on role
  if (user.role === "ADMIN" || user.role === "LAB_MANAGER") {
    redirect("/admin/dashboard")
  }
  
  if (user.role === "PROFESSOR") {
    redirect("/professor/practices")
  }
  
  redirect("/student/dashboard")
}