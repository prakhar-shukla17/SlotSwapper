export const buildDateTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;

  const baseDate = new Date(dateValue);
  if (Number.isNaN(baseDate.getTime())) return null;

  const [hours, minutes] = timeValue.split(":").map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const adjustedDate = new Date(baseDate);
  adjustedDate.setHours(hours, minutes, 0, 0);
  return adjustedDate;
};

export const formatDateTime = (dateValue, timeValue) => {
  const dateTime = buildDateTime(dateValue, timeValue);
  if (!dateTime) {
    return `${dateValue ?? ""} ${timeValue ?? ""}`.trim();
  }

  return dateTime.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
