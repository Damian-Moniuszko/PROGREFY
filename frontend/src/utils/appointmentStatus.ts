export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'

export function getAppointmentStatusLabel(
  status: string,
): string {
  switch (status) {
    case 'PENDING':
      return 'OCZEKUJE'

    case 'CONFIRMED':
      return 'POTWIERDZONY'

    case 'CANCELLED':
      return 'ANULOWANY'

    case 'COMPLETED':
      return 'ZAKOŃCZONY'

    default:
      return status
  }
}