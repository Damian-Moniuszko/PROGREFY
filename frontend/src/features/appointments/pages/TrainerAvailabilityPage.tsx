import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import AvailabilityManager from "../components/AvailabilityManager";
import {
  getTrainerAvailability,
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  AvailabilitySlot,
} from "../api/availability.api";

interface Props {
  trainerId: string;
}

export default function TrainerAvailabilityPage({ trainerId }: Props) {
  const { token } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    if (!token) return;

    async function loadAvailability() {
      const data = await getTrainerAvailability(trainerId, token);
      setSlots(data);
    }

    loadAvailability();
  }, [token, trainerId]);

  async function handleAdd() {
    if (!token) return;

    const newSlot = await createAvailabilitySlot(
      {
        day: "Poniedziałek",
        time: "10:00",
      },
      token,
    );

    setSlots((current) => [...current, newSlot]);
  }

  async function handleRemove(id: string) {
    if (!token) return;

    await deleteAvailabilitySlot(id, token);
    setSlots((current) => current.filter((slot) => slot.id !== id));
  }

  return (
    <main className="trainer-availability-page">
      <AvailabilityManager
        slots={slots}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
    </main>
  );
}
