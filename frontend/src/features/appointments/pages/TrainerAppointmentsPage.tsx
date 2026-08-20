import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getAppointments,
  cancelAppointment,
} from "../api/appointment.api";
import {
  confirmAppointment,
  completeAppointment,
} from "../api/appointmentStatus.api";
import AppointmentCard from "../components/AppointmentCard";

export default function TrainerAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    async function loadAppointments() {
      try {
        const data = await getAppointments(token);
        setAppointments(Array.isArray(data) ? data : []);
      } catch {
        setAppointments([]);
      }
    }

    loadAppointments();
  }, [token]);

  function updateStatus(id: string, status: string) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status }
          : appointment,
      ),
    );
  }

  async function handleCancel(id: string) {
    if (!token) return;

    await cancelAppointment(id, token);
    updateStatus(id, "cancelled");
  }

  async function handleConfirm(id: string) {
    if (!token) return;

    await confirmAppointment(id, token);
    updateStatus(id, "confirmed");
  }

  async function handleComplete(id: string) {
    if (!token) return;

    await completeAppointment(id, token);
    updateStatus(id, "completed");
  }

  return (
    <main className="trainer-appointments-page">
      <div className="trainer-appointments-page__container">
        <header>
          <p>KALENDARZ TRENERA</p>
          <h1>Moje wizyty</h1>
        </header>

        {appointments.length === 0 ? (
          <p>Brak zaplanowanych treningów.</p>
        ) : (
          <div>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
