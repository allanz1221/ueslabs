import { getProfile } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { LoanRequestForm } from "@/components/student/loan-request-form";
import { prisma } from "@/lib/prisma";

export default async function NewLoanPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role !== "student") {
    redirect("/dashboard");
  }

  const materials = await prisma.material.findMany({
    where: {
      available_quantity: {
        gt: 0,
      },
    },
  });

  return <LoanRequestForm profile={profile} materials={materials} />;
}