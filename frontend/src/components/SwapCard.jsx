import { formatDateTime } from "../utils/dateTime";

const statusStyles = {
  pending: {
    badge: "bg-amber-100 text-amber-700",
    accent: "border-amber-200",
  },
  accepted: {
    badge: "bg-emerald-100 text-emerald-700",
    accent: "border-emerald-200",
  },
  rejected: {
    badge: "bg-rose-100 text-rose-700",
    accent: "border-rose-200",
  },
  cancelled: {
    badge: "bg-slate-100 text-slate-600",
    accent: "border-slate-200",
  },
  expired: {
    badge: "bg-slate-100 text-slate-600",
    accent: "border-slate-200",
  },
};

const formatStatus = (status) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function SwapCard({ swap, onAccept, onReject, onCancel }) {
  const offeredEvent = swap.requesterEvent || swap.mySlot;
  const requestedEvent = swap.requestedEvent || swap.theirSlot;
  const statusStyle = statusStyles[swap.status] || statusStyles.cancelled;
  const isPending = swap.status === "pending";

  return (
    <div
      className={`rounded-2xl border ${
        statusStyle.accent || "border-slate-200"
      } bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Requester</p>
          <p className="text-base font-semibold text-slate-800">
            {swap.requester?.name || "Unknown"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            statusStyle.badge || "bg-slate-100 text-slate-600"
          }`}
        >
          {formatStatus(swap.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {offeredEvent && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Your Offer
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {offeredEvent.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDateTime(offeredEvent.date, offeredEvent.startTime)} →{" "}
              {formatDateTime(offeredEvent.date, offeredEvent.endTime)}
            </p>
          </div>
        )}

        {requestedEvent && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Requested Slot
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {requestedEvent.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDateTime(requestedEvent.date, requestedEvent.startTime)} →{" "}
              {formatDateTime(requestedEvent.date, requestedEvent.endTime)}
            </p>
          </div>
        )}
      </div>

      {swap.message && (
        <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          “{swap.message}”
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {isPending && onAccept && (
          <button
            onClick={onAccept}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
          >
            Accept
          </button>
        )}
        {isPending && onReject && (
          <button
            onClick={onReject}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-600"
          >
            Reject
          </button>
        )}
        {onCancel && !onAccept && isPending && (
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
}
