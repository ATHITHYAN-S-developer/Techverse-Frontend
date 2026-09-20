const EXT_MAP = [
  { re: /\.(mp4|webm|mov|mkv)(\?|$)/, label: "VIDEO", bg: "#F5F3FF", color: "#7C3AED" },
  { re: /\.(exe|msi|apk|dmg)(\?|$)/, label: "APP", bg: "#ECFDF5", color: "#059669" },
  { re: /\.(zip|rar|7z|tar|gz)(\?|$)/, label: "ZIP", bg: "#FFF7ED", color: "#D97706" },
  { re: /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/, label: "IMG", bg: "#FEF2F2", color: "#DC2626" },
  { re: /\.(doc|docx)(\?|$)/, label: "DOC", bg: "#EFF6FF", color: "#2563EB" },
  { re: /\.(ppt|pptx)(\?|$)/, label: "PPT", bg: "#FFF7ED", color: "#EA580C" },
  { re: /\.(xls|xlsx|csv)(\?|$)/, label: "XLS", bg: "#ECFDF5", color: "#059669" },
  { re: /\.(txt|md)(\?|$)/, label: "TXT", bg: "#F8FAFC", color: "#64748B" },
  { re: /\.(html?|json|js|ts)(\?|$)/, label: "CODE", bg: "#0B4A8F", color: "#EFF6FF" },
];

export function fileBadge(resource) {
  const url = String(resource?.fileUrl || resource?.externalUrl || resource?.url || "").toLowerCase();
  for (const m of EXT_MAP) {
    if (m.re.test(url)) return m;
  }
  const type = resource?.type;
  if (type === "video") return { label: "VIDEO", bg: "#F5F3FF", color: "#7C3AED" };
  if (type === "software" || type === "website") return { label: "APP", bg: "#ECFDF5", color: "#059669" };
  if (type === "lab_manual") return { label: "LAB", bg: "#EFF6FF", color: "#2563EB" };
  if (type === "question_bank") return { label: "QB", bg: "#F5F3FF", color: "#7C3AED" };
  if (type === "previous_paper") return { label: "PYQ", bg: "#FFF7ED", color: "#D97706" };
  if (type === "syllabus") return { label: "SYL", bg: "#ECFDF5", color: "#059669" };
  if (type === "project") return { label: "PRJ", bg: "#EFF6FF", color: "#2563EB" };
  return { label: "PDF", bg: "#FEF2F2", color: "#DC2626" };
}

export function formatBytes(bytes) {
  const n = Number(bytes);
  if (!n || n <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const v = n / Math.pow(1024, i);
  return `${v >= 10 || i === 0 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`;
}

export function formatRelativeTime(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diff = Math.max(0, Date.now() - date.getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}