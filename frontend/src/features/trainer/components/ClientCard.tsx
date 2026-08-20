interface Client {
  id?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  goal?: string;
  lastWorkout?: string;
}

interface Props {
  client: Client;
  onClick?: () => void;
}

export default function ClientCard({ client, onClick }: Props) {
  return (
    <article className="client-card" onClick={onClick}>
      <div className="client-card__avatar">
        {client.avatarUrl ? (
          <img src={client.avatarUrl} alt="" />
        ) : (
          <span>
            {(client.firstName?.[0] ?? "") + (client.lastName?.[0] ?? "")}
          </span>
        )}
      </div>

      <div className="client-card__content">
        <h3>
          {client.firstName} {client.lastName}
        </h3>

        {client.goal && <p>Cel: {client.goal}</p>}

        {client.lastWorkout && (
          <small>Ostatni trening: {client.lastWorkout}</small>
        )}
      </div>
    </article>
  );
}
