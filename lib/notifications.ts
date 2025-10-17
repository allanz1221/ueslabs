export type NotificationType = "loan_approved" | "loan_rejected" | "loan_ready" | "loan_overdue" | "loan_reminder"

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  loan_id?: string
  read: boolean
  created_at: string
}

export function getNotificationConfig(type: NotificationType) {
  const configs = {
    loan_approved: {
      title: "Préstamo Aprobado",
      variant: "default" as const,
    },
    loan_rejected: {
      title: "Préstamo Rechazado",
      variant: "destructive" as const,
    },
    loan_ready: {
      title: "Listo para Recoger",
      variant: "default" as const,
    },
    loan_overdue: {
      title: "Préstamo Vencido",
      variant: "destructive" as const,
    },
    loan_reminder: {
      title: "Recordatorio",
      variant: "secondary" as const,
    },
  }

  return configs[type] || configs.loan_reminder
}
