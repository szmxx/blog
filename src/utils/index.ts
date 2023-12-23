import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export function formatTime(date: Date, format = "YYYY-MM-DD") {
  return dayjs(date).utc(true).format(format);
}

export function saveAs(filename = "", content: string, mime = "text/markdown") {
  const blob = new Blob([content], { type: mime });
  const blobUrl = URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement("a");
  a.download = filename;
  a.href = blobUrl;
  a.click();
  URL.revokeObjectURL(blobUrl);
}
