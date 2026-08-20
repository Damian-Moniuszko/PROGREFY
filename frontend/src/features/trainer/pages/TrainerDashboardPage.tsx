import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getClients,
  getEarnings,
  getTrainerCalendar,
} from "../api/trainer.api";
import TrainerStats from "../components/TrainerStats";
import ClientList from "../components/ClientList";
import CalendarPreview from "../components/CalendarPreview";
import EarningsCard from "../components/EarningsCard";
import "./TrainerDashboardPage.css";

export default function TrainerDashboardPage() {
  const { token } = useAuth();

  const [clients, setClients] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<unknown>(null);

  useEffect(() => {
    if (!token) return;

    async function loadDashboard() {
      try {
        const [clientsData, calendarData, earningsData] = await Promise.all([
          getClients(token),
          getTrainerCalendar(token),
          getEarnings(token),
        ]);

        setClients(Array.isArray(clientsData) ? clientsData : []);
        setCalendar(Array.isArray(calendarData) ? calendarData : []);
        setEarnings(earningsData);
      } catch {
        setClients([]);
        setCalendar([]);
        setEarnings(null);
      }
    }

    loadDashboard();
  }, [token]);

  return (
    <main className="trainer-dashboard-page">
      <div className="trainer-dashboard-page__container">
        <header>
          <p>DASHBOARD TRENERA</p>
          <h1>Panel trenera</h1>
          <span>Zarządzaj klientami, treningami i swoim grafikiem.</span>
        </header>

        <TrainerStats
          clientsCount={clients.length}
          workoutsCount={calendar.length}
          earnings={earnings}
        />

        <ClientList clients={clients} />

        <CalendarPreview events={calendar} />

        <EarningsCard earnings={earnings as any} />
      </div>
    </main>
  );
}
