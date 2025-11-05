import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import useSwapStore from "../../store/swapStore";
import useEventStore from "../../store/eventStore";
import { formatDateTime } from "../../utils/dateTime";

export default function Marketplace() {
  const { swappableSlots, fetchSwappableSlots, createSwapRequest, isLoading, error } = useSwapStore();
  const { events, fetchEvents } = useEventStore();
  const [selectedMySlot, setSelectedMySlot] = useState(null);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSwappableSlots();
    fetchEvents();
  }, []);

  const handleSwap = async () => {
    if (!selectedMySlot || !selectedTheirSlot) {
      setMessage("Please select both slots before requesting a swap.");
      return;
    }

    setMessage("");

    const result = await createSwapRequest(selectedMySlot, selectedTheirSlot);

    if (result.success) {
      await fetchEvents();
      setSelectedMySlot(null);
      setSelectedTheirSlot(null);
      setMessage("Swap request sent!");
    } else {
      setMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-800">Marketplace</h1>
          <p className="text-sm text-slate-500">
            Browse swappable slots from other users and offer your own availability.
          </p>
        </section>

        {(message || error) && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message || error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-700">Available Swappable Slots</h2>
              <span className="text-sm text-slate-500">{swappableSlots.length} options</span>
            </div>

            {isLoading ? (
              <p className="mt-6 text-sm text-slate-500">Loading slots...</p>
            ) : swappableSlots.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No swappable slots yet. Check back soon!
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {swappableSlots.map((slot) => {
                  const isSelected = selectedTheirSlot === slot._id;
                  return (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedTheirSlot(slot._id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isSelected
                          ? "border-blue-400 bg-blue-50 shadow"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-medium text-slate-800">{slot.title}</p>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            {slot.user?.name || "Unknown user"}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                          Swappable
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        {formatDateTime(slot.date, slot.startTime)} → {formatDateTime(slot.date, slot.endTime)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-700">My Swappable Slots</h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose one of your available slots to propose in the swap.
              </p>

              {events.filter((e) => e.status === "swappable").length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                  Mark an event as swappable from the My Events page to list it here.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {events
                    .filter((e) => e.status === "swappable")
                    .map((slot) => {
                      const isSelected = selectedMySlot === slot._id;
                      return (
                        <button
                          key={slot._id}
                          onClick={() => setSelectedMySlot(slot._id)}
                          className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                            isSelected
                              ? "border-green-400 bg-green-50 shadow"
                              : "border-slate-200 bg-white hover:border-green-200 hover:shadow-sm"
                          }`}
                        >
                          <p className="font-medium text-slate-700">{slot.title}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {formatDateTime(slot.date, slot.startTime)} → {formatDateTime(slot.date, slot.endTime)}
                          </p>
                        </button>
                      );
                    })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-700">Swap summary</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>• Select one of your swappable slots.</li>
                <li>• Pick an available slot from the marketplace.</li>
                <li>• Submit a swap request to notify the other user.</li>
              </ul>

              <button
                onClick={handleSwap}
                className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Request Swap
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
