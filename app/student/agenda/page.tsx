import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export default async function StudentAgendaPage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" }
  })

  const approvedReservations = await prisma.reservation.findMany({
    where: { status: "APPROVED" },
    include: {
      room: true
    },
    orderBy: { startTime: "asc" }
  })

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Agenda</h1>
      <p className="mb-4 text-sm text-muted-foreground">Vista de disponibilidad por sala.</p>
      
      <div className="grid gap-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Salas Disponibles</h2>
          <div className="grid gap-2">
            {rooms.map((room) => (
              <div key={room.id} className="rounded border p-3">
                <h3 className="font-medium">{room.name}</h3>
                <p className="text-sm text-gray-600">
                  Tipo: {room.type} | Capacidad: {room.capacity || "N/A"} | 
                  Ubicación: {room.location || "N/A"}
                </p>
                {room.program && (
                  <p className="text-sm text-blue-600">Programa: {room.program}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">Horarios Ocupados</h2>
          <div className="grid gap-2">
            {approvedReservations.map((reservation) => (
              <div key={reservation.id} className="rounded border p-3 bg-red-50">
                <h3 className="font-medium">{reservation.room.name}</h3>
                <p className="text-sm text-gray-600">
                  {reservation.startTime.toLocaleDateString()} - {reservation.endTime.toLocaleDateString()}
                </p>
                <p className="text-sm text-red-600">OCUPADO</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}