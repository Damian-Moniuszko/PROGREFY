import ClientCard from "./ClientCard";

interface Props {
  clients: any[];
  onClientClick?: (client: any) => void;
}

export default function ClientList({ clients, onClientClick }: Props) {
  return (
    <section className="client-list">
      <header className="client-list__header">
        <h2>Twoi klienci</h2>
        <span>{clients.length} osób</span>
      </header>

      {clients.length === 0 ? (
        <p>Brak przypisanych klientów.</p>
      ) : (
        <div className="client-list__grid">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => onClientClick?.(client)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
