import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getClientDetails } from "../api/trainer.api";
import TrainingPlanEditor from "../components/TrainingPlanEditor";
import ClientProgress from "../components/ClientProgress";
import ProgressHistory from "../components/ProgressHistory";
import ProgressChart from "../components/ProgressChart";
import "./ClientDetailsPage.css";

export default function ClientDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;

    async function loadClient() {
      try {
        const data = await getClientDetails(token, id);
        setClient(data);
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [token, id]);

  if (loading) {
    return <main className="client-details-page">Ładowanie klienta...</main>;
  }

  return (
    <main className="client-details-page">
      <div className="client-details-page__container">
        <Link to="/trainer/dashboard">← Dashboard</Link>

        {!client ? (
          <p>Nie znaleziono klienta.</p>
        ) : (
          <>
            <header className="client-details-header">
              <h1>
                {client.firstName} {client.lastName}
              </h1>
              <p>{client.email}</p>
            </header>

            <section>
              <h2>Cel treningowy</h2>
              <p>{client.goal ?? "Brak celu"}</p>
            </section>

            <section>
              <h2>Parametry</h2>
              <p>Waga: {client.weight ?? "-"}</p>
              <p>Wzrost: {client.height ?? "-"}</p>
            </section>

            <section>
              <h2>Postępy klienta</h2>
              <ClientProgress progress={client.progress ?? null} />
            </section>

            <section>
              <h2>Historia zmian</h2>
              <ProgressHistory history={client.progressHistory ?? []} />
            </section>

            <section>
              <h2>Wykres zmian</h2>
              <ProgressChart history={client.progressHistory ?? []} />
            </section>

            <section>
              <h2>Plan treningowy</h2>
              <TrainingPlanEditor
                token={token!}
                clientId={id!}
                initialPlan={client.trainingPlan ?? []}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
