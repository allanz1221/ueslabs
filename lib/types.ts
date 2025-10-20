import {
  UserRole,
  Program,
  LoanStatus,
  ReservationStatus,
  RoomType,
  $Enums,
} from "@prisma/client";

export type { UserRole, Program, LoanStatus, ReservationStatus, RoomType };
export type Lab = $Enums.Lab;

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  program: Program | null;
  studentId: string | null;
  assignedLab: Lab | null;
  createdAt: Date;
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  location: string | null;
  lab: Lab | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  studentId: string;
  program: Program | null;
  requestDate: Date;
  expectedPickupDate: Date;
  expectedReturnDate: Date;
  actualPickupDate: Date | null;
  actualReturnDate: Date | null;
  status: LoanStatus;
  notes: string | null;
  adminNotes: string | null;
  approvedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanItem {
  id: string;
  loanId: string;
  materialId: string;
  quantity: number;
  createdAt: Date;
}

export interface LoanWithDetails extends Loan {
  student: Profile;
  items: (LoanItem & { material: Material })[];
  approver?: Profile;
}

export interface Room {
  id: string;
  name: string;
  capacity: number | null;
  type: RoomType;
  location: string | null;
  program: Program | null;
  responsibleId: string | null;
  createdAt: Date;
}

export interface Reservation {
  id: string;
  roomId: string;
  requestedBy: string;
  program: Program | null;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  reason: string | null;
  cancelReason: string | null;
  approvedBy: string | null;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  program: Program;
  semester: number;
  createdAt: Date;
}

export interface PracticeReport {
  id: string;
  roomId: string;
  subjectId: string;
  program: Program;
  studentsCount: number;
  practiceName: string;
  practiceDescription: string | null;
  startTime: Date;
  endTime: Date;
  createdBy: string;
  createdAt: Date;
}
