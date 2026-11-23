// Địa chỉ công khai của web (https://robot.geo3d.io.vn, https://….vercel.app…).
// Trên Vercel, request.url đã đúng. Khi tự chạy `next start` sau Caddy/Nginx, request.url lại là
// http://localhost:3001, nên lấy host/proto mà proxy chuyển tiếp (X-Forwarded-Host/-Proto) trước.
export function publicOrigin(request: Request): string {
  const h = request.headers;
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim();
  const proto = (h.get("x-forwarded-proto") ?? "").split(",")[0].trim() || "https";
  if (host && /^[a-z0-9.-]+(:\d+)?$/i.test(host)) return `${proto}://${host}`;
  return new URL(request.url).origin;
}
