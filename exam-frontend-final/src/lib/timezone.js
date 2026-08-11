// Small timezone helper used by the exam scheduling form.
//
// The bug this fixes: `datetime-local` inputs give a naive wall-clock string
// ("2026-08-15T09:00") with no timezone attached. The old code did
// `new Date(startTime).toISOString()`, which silently assumes the *browser's*
// current timezone. That's wrong whenever the admin means a specific zone
// (e.g. "9 AM in Mumbai") that isn't necessarily their own — and it drifts
// silently if the admin's device timezone ever changes. The functions below
// let the admin pick the zone explicitly and convert correctly (DST-aware,
// no extra dependency needed) using the built-in Intl API.

export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Mumbai / India (IST, UTC+5:30)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York (ET)' },
  { value: 'America/Chicago', label: 'Chicago (CT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

/** The browser's own timezone, added to the list (deduped) so it's always selectable as the default. */
export function withBrowserTimeZone(list) {
  let browserTz = 'UTC';
  try {
    browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    // Intl not available — fall back to UTC.
  }
  if (list.some((tz) => tz.value === browserTz)) return { list, defaultTz: browserTz };
  return { list: [{ value: browserTz, label: `${browserTz} (detected)` }, ...list], defaultTz: browserTz };
}

function getZonedParts(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map = {};
  for (const part of dtf.formatToParts(date)) map[part.type] = part.value;
  let hour = Number(map.hour);
  if (hour === 24) hour = 0; // some locales render midnight as "24"
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/**
 * Converts a `datetime-local` input value ("YYYY-MM-DDTHH:mm"), interpreted as
 * wall-clock time in `timeZone`, into the correct UTC instant. DST-safe.
 */
export function localInputToUtcISOString(inputValue, timeZone) {
  if (!inputValue) return '';
  const [datePart, timePart] = inputValue.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi] = timePart.split(':').map(Number);

  const wanted = Date.UTC(y, mo - 1, d, h, mi, 0);
  let guess = wanted;

  // Converges in at most 2 passes except right at a DST transition instant.
  for (let i = 0; i < 2; i++) {
    const zoned = getZonedParts(new Date(guess), timeZone);
    const zonedAsUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
    guess += wanted - zonedAsUtc;
  }

  return new Date(guess).toISOString();
}

/** Formats a UTC ISO instant as wall-clock time in a given IANA zone, for display. */
export function formatInZone(isoString, timeZone) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString('en-US', {
      timeZone,
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return new Date(isoString).toLocaleString();
  }
}
