export function todayISO() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function isoWeekday(iso) {
  const d = new Date(iso + "T00:00:00");
  const wd = d.getDay();
  return wd === 0 ? 7 : wd;
}

export function fmtDateLong(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export function escapeHtml(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Mini-formateur markdown : ## titres, - listes, reste en paragraphes. */
export function mdLite(text) {
  const lines = (text || "").split("\n");
  let html = "";
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3 style="font-size:14.5px;margin:14px 0 6px">${escapeHtml(line.slice(3))}</h3>`;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) { html += "<ul style='margin:4px 0;padding-left:20px'>"; inList = true; }
      html += `<li>${escapeHtml(line.slice(2))}</li>`;
    } else if (line === "") {
      if (inList) { html += "</ul>"; inList = false; }
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p style="margin:4px 0">${escapeHtml(line)}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

/** Génère un .ics récurrent pour une fenêtre horaire (ex. 21:00 -> 00:00) sur les jours actifs. */
export function buildReminderIcs({ startTime, endTime, activeDays }) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const days = activeDays && activeDays.length ? activeDays : [1, 2, 3, 4, 5, 6, 7];
  const byday = days.map((d) => ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][d - 1]).join(",");

  const base = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = base.getFullYear() + pad(base.getMonth() + 1) + pad(base.getDate());

  // Si l'heure de fin est <= l'heure de début, elle tombe le lendemain (ex. 21:00 -> 00:00).
  const crossesMidnight = eh < sh || (eh === sh && em <= sm);
  const endDate = new Date(base);
  if (crossesMidnight) endDate.setDate(endDate.getDate() + 1);
  const endDateStr = endDate.getFullYear() + pad(endDate.getMonth() + 1) + pad(endDate.getDate());

  const dtStart = dateStr + "T" + pad(sh) + pad(sm) + "00";
  const dtEnd = endDateStr + "T" + pad(eh) + pad(em) + "00";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Carnet Java//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:carnet-java-session-" + stamp + "@local",
    "DTSTAMP:" + stamp,
    "DTSTART:" + dtStart,
    "DTEND:" + dtEnd,
    "RRULE:FREQ=WEEKLY;BYDAY=" + byday,
    "SUMMARY:Session mentorat Java",
    "DESCRIPTION:Fenêtre de session Java du jour.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(icsContent, filename = "session-java.ics") {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** true si l'heure actuelle est dans la fenêtre [start, end), en gérant le passage de minuit. */
export function isWithinWindow(startTime, endTime, now = new Date()) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em === 0 ? 24 * 60 : eh * 60 + em;
  if (startMin <= endMin) return nowMin >= startMin && nowMin < endMin;
  // fenêtre traversant minuit (ex. 21:00 -> 00:00)
  return nowMin >= startMin || nowMin < endMin;
}

/** true si l'heure actuelle est après la fin de la fenêtre du jour (donc "en retard" si pas fait). */
export function isPastWindow(startTime, endTime, now = new Date()) {
  const [eh, em] = endTime.split(":").map(Number);
  const endMin = eh === 0 && em === 0 ? 24 * 60 : eh * 60 + em;
  const [sh, sm] = startTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (startMin <= endMin) return nowMin >= endMin;
  // fenêtre traversant minuit : "passé" seulement entre la fin (ex 00:00) et le prochain départ le même jour
  return nowMin >= endMin && nowMin < startMin;
}
