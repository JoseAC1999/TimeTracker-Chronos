import {
  differenceInSeconds,
  endOfDay,
  format,
  formatDistanceToNowStrict,
  intervalToDuration,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

export function formatDurationShort(totalSeconds: number) {
  const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 });
  const parts = [
    duration.hours ? `${duration.hours}h` : null,
    duration.minutes ? `${duration.minutes}m` : null,
    duration.seconds && !duration.hours ? `${duration.seconds}s` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : "0m";
}

export function formatDurationLong(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
}

export function formatDurationClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getLiveDuration(startedAt: Date | string, accumulatedPauseSec = 0) {
  const start = typeof startedAt === "string" ? parseISO(startedAt) : startedAt;
  return Math.max(differenceInSeconds(new Date(), start) - accumulatedPauseSec, 0);
}

export function formatTimeRange(startedAt: Date, endedAt?: Date | null) {
  return `${format(startedAt, "HH:mm")} - ${endedAt ? format(endedAt, "HH:mm") : "en curso"}`;
}

export function formatRelative(date: Date) {
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function getTodayBounds(date = new Date()) {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

export function groupByDayLabel(date: Date) {
  if (isSameDay(date, new Date())) {
    return "Hoy";
  }

  return format(date, "dd MMM");
}
