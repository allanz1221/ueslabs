import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export default async function ProfessorPracticesPage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== "PROFESSOR") {
    redirect("/dashboard")
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" }
  })

  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" }
  })

  const reports = await prisma.practiceReport.findMany({
    where: { createdBy: user.id },
    include: {
      room: true,
      subject: true
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Mis Reportes de Prácticas</h1>
      
      <div className="grid gap-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Materias Disponibles</h2>
          <div className="grid gap-2">
            {subjects.map((subject) => (
              <div key={subject.id} className="rounded border p-3">
                <h3 className="font-medium">{subject.name}</h3>
                <p className="text-sm text-gray-600">
                  Programa: {subject.program} | Semestre: {subject.semester}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">Salas Disponibles</h2>
          <div className="grid gap-2">
            {rooms.map((room) => (
              <div key={room.id} className="rounded border p-3">
                <h3 className="font-medium">{room.name}</h3>
                <p className="text-sm text-gray-600">
                  Tipo: {room.type} | Capacidad: {room.capacity || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">Mis Reportes</h2>
          <div className="grid gap-2">
            {reports.map((report) => (
              <div key={report.id} className="rounded border p-3">
                <h3 className="font-medium">{report.practiceName}</h3>
                <p className="text-sm text-gray-600">
                  Sala: {report.room.name} | Materia: {report.subject.name}
                </p>
                <p className="text-sm text-gray-600">
                  Estudiantes: {report.studentsCount} | 
                  Fecha: {report.startTime.toLocaleDateString()}
                </p>
                {report.practiceDescription && (
                  <p className="text-sm text-gray-500 mt-1">{report.practiceDescription}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}