import useEventStore from "../store/eventStore";
import { formatDateTime } from "../utils/dateTime";

export default function EventCard({ event }) {
  const { updateEventStatus } = useEventStore();

  const toggleSwappable = async () => {
    const newStatus =
      event.status === "swappable" ? "busy" : "swappable";
    await updateEventStatus(event._id, newStatus);
  };

  const statusStyles = {
    swappable: "bg-green-100 text-green-700",
    busy: "bg-slate-100 text-slate-600",
    swap_pending: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-800">
            {event.title}
          </h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
              statusStyles[event.status] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {event.status.replace("_", " ")}
          </span>
        </div>

        <div className="space-y-1 text-sm text-slate-500">
          <p className="font-medium text-slate-600">
            {formatDateTime(event.date, event.startTime)} → {" "}
            {formatDateTime(event.date, event.endTime)}
          </p>
          {event.location && (
            <p className="flex items-center gap-1 text-xs">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
              {event.location}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={toggleSwappable}
        className="mt-4 rounded-lg border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-500 hover:text-white"
      >
        {event.status === "swappable" ? "Mark as Busy" : "Make Swappable"}
      </button>
    </div>
  );
}
