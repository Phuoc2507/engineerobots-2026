import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewEmail, sendEmail } from "@/lib/email";

// BTC duyệt / yêu cầu bổ sung hồ sơ đội, rồi báo cho đội trưởng qua email (nếu đã cấu hình Resend)
export async function POST(request: Request) {
  const { teamId, status, note } = await request.json().catch(() => ({}));
  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_review_team", { p_team_id: teamId, p_status: status, p_note: note || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const team = data as { team_name: string; leader_email: string; status: string; note: string | null };
  let email: { sent: boolean; error?: string } = { sent: false };
  if (team.leader_email && (team.status === "APPROVED" || team.status === "REJECTED")) {
    const { subject, html } = reviewEmail(team.team_name, team.status, team.note, `${new URL(request.url).origin}/team/dashboard`);
    email = await sendEmail(team.leader_email, subject, html);
  }
  return NextResponse.json({ ok: true, email });
}
