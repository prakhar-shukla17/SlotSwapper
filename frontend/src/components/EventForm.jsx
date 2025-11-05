import { useEffect, useMemo, useState } from "react";
import useEventStore from "../store/eventStore";

const buildTimeSlots = () =>
  Array.from({ length: 48 }, (_, index) => {
    const hours = String(Math.floor(index / 2)).padStart(2, "0");
    const minutes = index % 2 === 0 ? "00" : "30";
    return `${hours}:${minutes}`;
  });

export default function EventForm() {
  const { createEvent } = useEventStore();
  const timeSlots = useMemo(buildTimeSlots, []);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  const endTimeOptions = useMemo(() => {
    if (!formData.startTime) {
      return timeSlots.slice(1);
    }
    return timeSlots.filter((slot) => slot > formData.startTime);
  }, [formData.startTime, timeSlots]);

  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent(formData);
      setFeedback({ type: "success", text: "Event created successfully!" });
      setFormData({ title: "", date: "", startTime: "", endTime: "", location: "" });
    } catch {
      setFeedback({ type: "error", text: "Failed to create event." });
    }
  };

  useEffect(() => {
    if (!formData.startTime) {
      setFormData((prev) => ({ ...prev, endTime: prev.endTime }));
      return;
    }

    if (endTimeOptions.length === 0) {
      setFormData((prev) => ({ ...prev, endTime: "" }));
      return;
    }

    if (!endTimeOptions.includes(formData.endTime)) {
      setFormData((prev) => ({ ...prev, endTime: endTimeOptions[0] }));
    }
  }, [formData.startTime, formData.endTime, endTimeOptions]);

  const feedbackClasses =
    feedback?.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-500">Create Event</p>
          <h2 className="text-xl font-semibold text-slate-800">Add a new calendar slot</h2>
        </div>
        <p className="text-xs text-slate-400">
          All times use a 24-hour clock for clarity.
        </p>
      </div>

      {feedback && (
        <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${feedbackClasses}`}>
          {feedback.text}
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Team sync, client call, ..."
            required
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Location (optional)
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Meeting room, video link, etc."
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Date
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Start time
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-blue-500"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="" disabled>
                  Select start
                </option>
                {timeSlots.map((slot) => (
                  <option key={`start-${slot}`} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-400">
              Pick when this slot begins.
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            End time
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-blue-500"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                disabled={!formData.startTime || endTimeOptions.length === 0}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <option value="" disabled>
                  Select end
                </option>
                {endTimeOptions.map((slot) => (
                  <option key={`end-${slot}`} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-400">
              {formData.startTime
                ? endTimeOptions.length > 0
                  ? "Only times after the start are shown."
                  : "No later times available—adjust the start."
                : "Choose a start time first."}
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Save event
        </button>
      </div>
    </form>
  );
}
