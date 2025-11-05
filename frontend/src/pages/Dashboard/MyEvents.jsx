import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import EventForm from "../../components/EventForm";
import EventCard from "../../components/EventCard";
import useEventStore from "../../store/eventStore";

export default function MyEvents() {
  const { events, fetchEvents, isLoading } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-800">My Events</h1>
          <p className="text-sm text-slate-500">
            Manage your personal calendar and mark slots available for swaps.
          </p>
        </header>

        <EventForm />

        <section className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">Scheduled Slots</h2>
            <span className="text-sm text-slate-500">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-500">Loading your events...</p>
          ) : events.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-600">No events yet</p>
              <p className="text-xs text-slate-500">
                Create your first event above to start sharing availability.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
