import { CONTACT, SITE } from "@/lib/site";

// Gửi email qua Resend (https://resend.com). Chưa đặt RESEND_API_KEY thì bỏ qua, không báo lỗi.
// Cần thêm trên Vercel: RESEND_API_KEY, EMAIL_FROM (vd: "FME JOURNEY <noreply@ten-mien-da-xac-minh>")
export async function sendEmail(to: string, subject: string, html: string): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || `${SITE.name} <onboarding@resend.dev>`, to: [to], subject, html }),
    });
    if (!res.ok) return { sent: false, error: `Resend ${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String(e) };
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function reviewEmail(teamName: string, status: string, note: string | null, dashboardUrl: string) {
  const approved = status === "APPROVED";
  const subject = approved
    ? `[${SITE.name}] Đội ${teamName} đã được duyệt`
    : `[${SITE.name}] Hồ sơ đội ${teamName} cần bổ sung`;
  const body = approved
    ? `<p>Chúc mừng! Hồ sơ đội <b>${esc(teamName)}</b> đã được Ban tổ chức duyệt.</p>
       <p>Vào trang đội để lấy <b>mã QR check-in</b> và đặt lịch thử sa bàn.</p>`
    : `<p>Hồ sơ đội <b>${esc(teamName)}</b> cần bổ sung trước khi được duyệt.</p>
       <p><b>Ghi chú của BTC:</b> ${esc(note ?? "")}</p>
       <p>Đội trưởng cập nhật hồ sơ rồi liên hệ BTC để được duyệt lại.</p>`;
  const contact = [CONTACT.email && `Email: ${esc(CONTACT.email)}`, CONTACT.phone && `Hotline: ${esc(CONTACT.phone)}`].filter(Boolean).join(" · ");
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#0f172a">
    <h2 style="color:#06305E">${SITE.name}</h2>${body}
    <p><a href="${dashboardUrl}" style="display:inline-block;background:#D7262F;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Mở trang Đội của tôi</a></p>
    <p style="color:#64748b;font-size:12px">Khoa Cơ khí – HCMUTE${contact ? `<br/>${contact}` : ""}</p></div>`;
  return { subject, html };
}
