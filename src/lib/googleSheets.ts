import { createSign } from "crypto";

// Ghi dữ liệu vào Google Sheet bằng service account (JSON key nằm trong env GOOGLE_SERVICE_ACCOUNT_JSON trên Vercel).
// Không dùng thư viện googleapis: tự ký JWT RS256 rồi đổi lấy access token.
type ServiceAccount = { client_email: string; private_key: string };

export function serviceAccount(): ServiceAccount | null {
  try {
    const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "") as ServiceAccount;
    return sa.client_email && sa.private_key ? sa : null;
  } catch {
    return null;
  }
}

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

async function accessToken(sa: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email, scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  }));
  const sig = createSign("RSA-SHA256").update(`${head}.${claim}`).sign(sa.private_key.replace(/\n/g, "\n"));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claim}.${b64url(sig)}` }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Google từ chối service account: ${json.error_description ?? json.error ?? res.status}`);
  return json.access_token as string;
}

// Ghi đè từng trang tính (tạo nếu chưa có). RAW giữ nguyên chuỗi như SĐT "09…", số vẫn là số.
export async function writeSheets(sheetId: string, tabs: { title: string; rows: unknown[][] }[]) {
  const sa = serviceAccount();
  if (!sa) throw new Error("Chưa cấu hình GOOGLE_SERVICE_ACCOUNT_JSON trên Vercel.");
  const token = await accessToken(sa);
  const api = async (path: string, init?: RequestInit) => {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}${path}`, {
      ...init, cache: "no-store", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = json.error?.message ?? res.status;
      throw new Error(res.status === 403 || res.status === 404
        ? `Không mở được Sheet (${msg}). Kiểm tra đã chia sẻ Sheet cho ${sa.client_email} quyền Người chỉnh sửa.`
        : `Google Sheets lỗi: ${msg}`);
    }
    return json;
  };

  const meta = await api("?fields=sheets.properties.title");
  const have = new Set<string>((meta.sheets ?? []).map((s: { properties: { title: string } }) => s.properties.title));
  const missing = tabs.filter((t) => !have.has(t.title));
  if (missing.length) {
    await api(":batchUpdate", { method: "POST", body: JSON.stringify({ requests: missing.map((t) => ({ addSheet: { properties: { title: t.title, gridProperties: { frozenRowCount: 1 } } } })) }) });
  }
  const range = (t: string) => `'${t.replace(/'/g, "''")}'`;
  await api("/values:batchClear", { method: "POST", body: JSON.stringify({ ranges: tabs.map((t) => range(t.title)) }) });
  await api("/values:batchUpdate", {
    method: "POST",
    body: JSON.stringify({ valueInputOption: "RAW", data: tabs.map((t) => ({ range: `${range(t.title)}!A1`, values: t.rows })) }),
  });
}
