import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { ChangePasswordForm } from "./change-password-form"

export default async function ChangePasswordPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <ChangePasswordForm user={user} />
}


