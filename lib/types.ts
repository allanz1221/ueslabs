export type UserRole = "student" | "admin" | "lab_manager" | "professor"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  student_id: string | null
  program?: Program | null
  created_at: string
}

export interface Material {
  id: string
  name: string
  description: string | null
  category: string
  total_quantity: number
  available_quantity: number
  location: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export type LoanStatus = "pending" | "approved" | "rejected" | "picked_up" | "returned" | "overdue"

export interface Loan {
  id: string
  student_id: string
  request_date: string
  expected_pickup_date: string
  expected_return_date: string
  actual_pickup_date: string | null
  actual_return_date: string | null
  status: LoanStatus
  notes: string | null
  admin_notes: string | null
  approved_by: string | null
  program?: Program | null
  created_at: string
  updated_at: string
}

export interface LoanItem {
  id: string
  loan_id: string
  material_id: string
  quantity: number
  created_at: string
}

export interface LoanWithDetails extends Loan {
  student: Profile
  items: (LoanItem & { material: Material })[]
  approver?: Profile
}

// Nuevos tipos para Agenda y Reporte de Prácticas

export type Program = "mecatronica" | "manufactura"

export type RoomType = "laboratorio" | "aula" | "taller"

export interface Room {
  id: string
  name: string
  capacity: number | null
  type: RoomType
  location: string | null
  program: Program | null
  responsible_id: string | null
  created_at: string
}

export type ReservationStatus = "pending" | "approved" | "cancelled"

export interface Reservation {
  id: string
  room_id: string
  requested_by: string
  program: Program | null
  start_time: string
  end_time: string
  status: ReservationStatus
  reason: string | null
  cancel_reason: string | null
  approved_by: string | null
  created_at: string
}

export interface Subject {
  id: string
  name: string
  program: Program
  semester: number
  created_at: string
}

export interface PracticeReport {
  id: string
  room_id: string
  subject_id: string
  program: Program
  students_count: number
  practice_name: string
  practice_description: string | null
  start_time: string
  end_time: string
  created_by: string
  created_at: string
}
