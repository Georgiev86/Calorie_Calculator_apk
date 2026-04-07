import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Profile, ProgressEntry } from "../types";
import { activityLabels, calculatePlan, formatCalories, formatDateLabel, getEntriesForPeriod, goalLabels } from "../utils/calorie";

function buildReportHtml({
  period,
  profile,
  entries,
}: {
  period: "day" | "week";
  profile: Profile;
  entries: ProgressEntry[];
}) {
  const plan = calculatePlan(profile);
  const title = period === "day" ? "Дневен отчет" : "Седмичен отчет";
  const rows = entries.length
    ? entries
        .map(
          (entry) => `
            <tr>
              <td>${formatDateLabel(entry.createdAt ?? entry.date)}</td>
              <td>${entry.weight} кг</td>
              <td>${entry.note || "-"}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="3">Няма записани данни за избрания период.</td></tr>`;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1f271f; }
          .hero { background: #18382c; color: #fff7eb; padding: 18px 20px; border-radius: 16px; }
          .section { margin-top: 20px; }
          .grid { display: flex; gap: 12px; flex-wrap: wrap; }
          .metric { background: #f4ebdd; padding: 12px; border-radius: 12px; min-width: 140px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border-bottom: 1px solid #e7d8c3; text-align: left; padding: 10px 8px; font-size: 14px; }
          th { background: #fbf4ea; }
        </style>
      </head>
      <body>
        <div class="hero">
          <h1>${title}</h1>
          <p>Calorie Coach BG</p>
        </div>

        <div class="section">
          <h2>Профил</h2>
          <p>${profile.age} г., ${profile.height} см, ${profile.weight} кг</p>
          <p>${activityLabels[profile.activity]} • ${goalLabels[profile.goal]} • ${profile.meals} хранения</p>
        </div>

        <div class="section">
          <h2>Калориен план</h2>
          <div class="grid">
            <div class="metric"><strong>Цел</strong><br />${formatCalories(plan.targetCalories)}</div>
            <div class="metric"><strong>Протеин</strong><br />${Math.round(plan.protein)} g</div>
            <div class="metric"><strong>Мазнини</strong><br />${Math.round(plan.fats)} g</div>
            <div class="metric"><strong>Въглехидрати</strong><br />${Math.round(plan.carbs)} g</div>
          </div>
        </div>

        <div class="section">
          <h2>Записани данни</h2>
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тегло</th>
                <th>Бележка</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </body>
    </html>
  `;
}

export async function exportProgressPdf({
  period,
  profile,
  entries,
}: {
  period: "day" | "week";
  profile: Profile;
  entries: ProgressEntry[];
}) {
  const filteredEntries = getEntriesForPeriod(entries, period);
  const html = buildReportHtml({
    period,
    profile,
    entries: filteredEntries,
  });

  const { uri } = await Print.printToFileAsync({
    html,
  });

  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: period === "day" ? "Дневен PDF отчет" : "Седмичен PDF отчет",
      UTI: "com.adobe.pdf",
    });
  }

  return {
    uri,
    filteredEntries,
  };
}
