export function todayISO() {
  const d = new Date()
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
}

// 1 = lundi ... 7 = dimanche
export function isoWeekday(iso) {
  const d = new Date(iso + "T00:00:00")
  const wd = d.getDay()
  return wd === 0 ? 7 : wd
}

export function fmtDateLong(iso) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
}

function toMinutes(hhmm) {
  const [h, m] = (hhmm || "0:0").split(":").map(Number)
  return h * 60 + m
}

/**
 * Statut de la fenêtre de rappel du jour, par rapport à l'heure actuelle.
 * Retourne : "before" | "in" | "after"
 */
export function reminderWindowStatus(reminderStart, reminderEnd) {
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const start = toMinutes(reminderStart || "21:00")
  const end = toMinutes(reminderEnd || "23:59")
  if (nowMin < start) return "before"
  if (nowMin >= start && nowMin <= end) return "in"
  return "after"
}
