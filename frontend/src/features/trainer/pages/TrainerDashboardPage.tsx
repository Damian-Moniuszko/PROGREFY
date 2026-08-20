import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getClients,
  getEarnings,
  getTrainerCalendar,
} from "../api/trainer.api";
import "./TrainerDashboardPage.css";

export default function TrainerDashboardPage() {
  const { token } = useAuth();

  const [clients, setClients] = useState<unknown[]>([]);
  const [calendar, setCalendar] = useState<unknown[]>([]);
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

        <section className="trainer-stats">
          <article>
            <strong>{clients.length}</strong>
            <span>Klienci</span>
          </article>

          <article>
            <strong>{calendar.length}</strong>
            <span>Dzisiejsze treningi</span>
          </article>

          <article>
            <strong>{earnings ? "✓" : "0"}</strong>
            <span>Przychód</span>
          </article>
        </section>

        <section>
          <h2>Ostatni klienci</h2>
          <p>Lista klientów zostanie wyświetlona po podłączeniu danych.</p>
        </section>
      </div>
    </main>
  );
}
