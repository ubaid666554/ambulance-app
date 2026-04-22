export type StarValue = 1 | 2 | 3 | 4 | 5

export interface Rating {
  id: string
  driverId: string
  driverName: string
  patientId: string
  patientName: string
  bookingId?: string
  stars: StarValue
  comment?: string
  createdAt: number
}
