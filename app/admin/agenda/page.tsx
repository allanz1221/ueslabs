import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export default async function AdminAgendaPage() {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== "ADMIN" && user.role !== "LAB_MANAGER")) {
    redirect("/dashboard")
  }

  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" }
  })

  const reservations = await prisma.reservation.findMany({
    include: {
      room: true,
      requester: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { startTime: "asc" }
  })

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Agenda (Administración)</h1>
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
          <h2 className="mb-2 text-lg font-semibold">Reservas</h2>
          <div className="grid gap-2">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="rounded border p-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{reservation.room.name}</h3>
                    <p className="text-sm text-gray-600">
                      {reservation.startTime.toLocaleDateString()} - {reservation.endTime.toLocaleDateString()}
                    </p>
                    <p className="text-sm">Solicitado por: {reservation.requester.name}</p>
                    {reservation.reason && (
                      <p className="text-sm text-gray-500">Motivo: {reservation.reason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      reservation.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      reservation.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}