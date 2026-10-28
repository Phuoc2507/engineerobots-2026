import type { Metadata } from "next";
import { redirect } from "next/navigation";
import QRCode from "react-qr-code";
import { AlertTriangle, ArrowRight, CheckCircle2, Circle, Crown, Heart, Lock, MailCheck, QrCode, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CONTACT, SITE, STUDENT_DOMAIN } from "@/lib/site";
import PortalShell, { AccountBar } from "@/components/register/PortalShell";
import TeamManager from "@/components/team/TeamManager";
import PracticeBooking, { type PracticeSlot } from "@/components/team/PracticeBooking";
import TeamAppeals, { type AppealMatch, type MyAppeal } from "@/components/team/TeamAppeals";
import Link from "next/link";

export const metadata: Metadata = { title: "Đội của tôi · ENGINEEROBOTS 2026" };

const STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Chờ BTC duyệt", tone: "bg-mech-gold/15 text-amber-700" },
  APPROVED: { label: "Đã duyệt", tone: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Cần bổ sung", tone: "bg-red-100 text-mech-red" },
};

const ROLE_LABEL: Record<string, string> = { LEADER: "Đội trưởng", PILOT: "Pilot", MEMBER: "Thành viên" };

type MemberRow = { student_id: string; full_name: string; email: string; phone: string | null; role: string; joined_at: string | null };
type TeamRow = {
  id: string;
  team_name: string;
  robot_name: string | null;
  slogan: string | null;
  major: string;
  status: string;
  review_note: string | null;
  qr_code_token: string | null;
  leader_email: string;
  created_at: string;
  updated_at: string | null;
  team_members: MemberRow[];
};

const ROLE_ORDER: Record<string, number> = { LEADER: 0, PILOT: 1, MEMBER: 2 };

export default async function TeamDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase() ?? "";
  if (!user || !email.endsWith(`@${STUDENT_DOMAIN}`)) redirect("/register");

  // Gắn tài khoản cho thành viên đăng nhập lần đầu, rồi đọc đội qua RLS
  // (lọc theo đội của chính mình — staff có thể đọc mọi đội qua RLS)
  await supabase.rpc("claim_membership");
  const { data: ids } = await supabase.rpc("my_team_ids");
  const { data } = await supabase
    .from("teams")
    .select("id, team_name, robot_name, slogan, major, status, review_note, qr_code_token, leader_email, created_at, updated_at, team_members(student_id, full_name, email, phone, role, joined_at)")
    .in("id", ((ids ?? []) as string[]).length ? (ids as string[]) : ["00000000-0000-0000-0000-000000000000"])
    .limit(1)
    .maybeSingle();
  const team = data as TeamRow | null;
  if (!team) redirect("/register");

  const approved = team.status === "APPROVED";
  const { data: slotData } = approved ? await supabase.rpc("list_practice_slots") : { data: null };
  const slots = (slotData ?? []) as PracticeSlot[];

  // Trận đã kết thúc của đội + khiếu nại đã gửi
  type FinishedRow = { id: string; match_code: string | null; stage: string; finished_at: string | null; red_team_id: string; red_score: number; blue_score: number };
  const [{ data: fin }, { data: apData }, { data: win }, { data: sched }] = approved
    ? await Promise.all([
        supabase.from("matches").select("id, match_code, stage, finished_at, red_team_id, red_score, blue_score")
          .eq("status", "FINISHED").or(`red_team_id.eq.${team.id},blue_team_id.eq.${team.id}`).order("finished_at", { ascending: false }).limit(10),
        supabase.from("match_appeals").select("match_id, reason, status, resolution_notes, created_at").eq("team_id", team.id),
        supabase.from("app_settings").select("value").eq("key", "appeal_window_minutes").maybeSingle(),
        supabase.rpc("get_schedule"),
      ])
    : [{ data: null }, { data: null }, { data: null }, { data: null }];
  const names = new Map(((sched ?? []) as { id: string; red_team: string | null; blue_team: string | null }[]).map((r) => [r.id, r]));
  const appealMatches: AppealMatch[] = ((fin ?? []) as FinishedRow[]).map((m) => {
    const red = m.red_team_id === team.id;
    const n = names.get(m.id);
    return { id: m.id, match_code: m.match_code, stage: m.stage, finished_at: m.finished_at, my_color: red ? "RED" : "BLUE",
      my_score: red ? m.red_score : m.blue_score, opp_score: red ? m.blue_score : m.red_score, opponent: (red ? n?.blue_team : n?.red_team) ?? null };
  });
  const windowMinutes = Number((win as { value: unknown } | null)?.value ?? 5) || 5;

  const members = [...team.team_members].sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9));
  const me = members.find((m) => m.email.toLowerCase() === email);
  const isLeader = team.leader_email.toLowerCase() === email;
  const leader = members.find((m) => m.role === "LEADER");
  const open = Date.now() <= new Date(SITE.registrationDeadline).getTime();
  const editable = team.status !== "APPROVED" && open;
  const status = STATUS[team.status] ?? { label: team.status, tone: "bg-slate-100 text-slate-600" };


  const lockedReason = team.status === "APPROVED"
    ? "Đội đã được duyệt — mọi thay đổi vui lòng liên hệ BTC."
    : !open ? "Đã quá hạn đăng ký — hồ sơ được khóa." : undefined;

  const steps = [
    { label: "Gửi hồ sơ", done: true },
    { label: "BTC duyệt", done: team.status === "APPROVED" },
    { label: "Nhận QR check-in", done: team.status === "APPROVED" },
  ];

  return (
    <PortalShell title="Đội của tôi" subtitle={isLeader ? "Quản lý hồ sơ, thành viên và theo dõi trạng thái duyệt của đội." : "Bạn đã được đội trưởng thêm vào đội. Theo dõi hồ sơ và lịch thi đấu tại đây."}>
      <AccountBar email={email} />
      <TeamManager
        email={email}
        isLeader={isLeader}
        canEdit={isLeader && editable}
        canLeave={isLeader ? team.status !== "APPROVED" : editable && members.length > 3}
        lockedReason={lockedReason ?? (!isLeader && members.length <= 3 ? "Đội đang có 3 người (tối thiểu) — muốn rời đội, nhờ đội trưởng thay người khác vào trước." : undefined)}
        initial={{
          team: { team_name: team.team_name, robot_name: team.robot_name ?? "", slogan: team.slogan ?? "", major: team.major },
          leader: { student_id: leader?.student_id ?? "", full_name: leader?.full_name ?? "", phone: leader?.phone ?? "" },
          members: members.filter((m) => m.role !== "LEADER").map((m) => ({
            student_id: m.student_id, full_name: m.full_name, email: m.email, phone: m.phone ?? "", role: m.role === "PILOT" ? "PILOT" : "MEMBER",
          })),
        }}
      >
        {team.status === "REJECTED" && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-mech-red/30 bg-red-50 p-5 text-sm text-mech-red">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">BTC yêu cầu bổ sung hồ sơ</p>
              <p className="mt-1">{team.review_note || "Vui lòng kiểm tra lại thông tin thành viên."}</p>
              {isLeader && <p className="mt-1 text-red-700/80">Sửa hồ sơ xong, đội sẽ tự quay về trạng thái Chờ duyệt.</p>}
            </div>
          </div>
        )}

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="section-kicker">{isLeader ? <><Crown className="h-4 w-4" /> Bạn là đội trưởng</> : <><MailCheck className="h-4 w-4" /> Bạn là {ROLE_LABEL[me?.role ?? "MEMBER"].toLowerCase()}</>}</p>
              <h2 className="mt-2 break-words font-display text-3xl uppercase tracking-wide text-navy">{team.team_name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {team.robot_name ? `Robot ${team.robot_name} · ` : ""}{team.major}
              </p>
              {team.slogan && <p className="mt-2 text-sm italic text-slate-600">“{team.slogan}”</p>}
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${status.tone}`}>{status.label}</span>
          </div>

          <ol className="mt-6 grid gap-2 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${s.done ? "bg-emerald-50 text-emerald-700" : "bg-ice text-slate-500"}`}>
                {s.done ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Circle className="h-4 w-4 shrink-0" />}
                <span><span className="sr-only">Bước {i + 1}: </span>{s.label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-400">
            Gửi lúc {new Date(team.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
            {team.updated_at && ` · cập nhật ${new Date(team.updated_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`}
          </p>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
          <header className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl uppercase tracking-wide text-navy">Thành viên</h2>
            <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{members.length}/5 người</span>
          </header>
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
            {members.map((m) => {
              const isMe = m.email.toLowerCase() === email;
              return (
                <li key={m.student_id} className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 ${isMe ? "bg-navy-600/5" : ""}`}>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-semibold text-navy">
                      {m.full_name}
                      {isMe && <span className="rounded bg-navy-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Bạn</span>}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{m.student_id} · {m.email}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${m.role === "LEADER" ? "bg-mech-red text-white" : "bg-ice text-navy-600"}`}>
                      {ROLE_LABEL[m.role] ?? m.role}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-3 text-xs text-slate-500">
            Khai nhầm thông tin thành viên (tên, MSSV, email, SĐT)? Báo Ban tổ chức{CONTACT.email ? <> qua <a href={`mailto:${CONTACT.email}`} className="font-semibold text-navy-600 hover:underline">{CONTACT.email}</a></> : null} để được sửa.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="flex items-center gap-2 font-display text-xl uppercase tracking-wide text-navy"><QrCode className="h-5 w-5 text-mech-red" /> Thẻ đội</h2>
            {team.status === "APPROVED" && team.qr_code_token ? (
              <div className="mt-4 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <QRCode value={team.qr_code_token} size={176} fgColor="#06305E" />
              </div>
            ) : (
              <div className="mt-4 grid h-[200px] w-[200px] place-items-center rounded-lg bg-ice text-center text-xs text-slate-500">
                <span><Lock className="mx-auto mb-2 h-6 w-6" />QR check-in hiện<br />khi BTC duyệt đội</span>
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <Link href="/lich-thi" className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-navy-600">
              <Swords className="h-6 w-6 shrink-0 text-mech-red" />
              <span className="flex-1">
                <span className="block font-semibold text-navy">Lịch thi đấu</span>
                <span className="block text-xs text-slate-500">Các mốc của giải và lịch trận sau khi bốc thăm</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/vote" className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-navy-600">
              <Heart className="h-6 w-6 shrink-0 text-mech-gold" />
              <span className="flex-1">
                <span className="block font-semibold text-navy">Bình chọn khán giả</span>
                <span className="block text-xs text-slate-500">Rủ bạn bè bình chọn cho đội khi BTC mở cổng</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </section>

        <PracticeBooking slots={slots} approved={approved} />
        {approved && <TeamAppeals matches={appealMatches} appeals={(apData ?? []) as MyAppeal[]} windowMinutes={windowMinutes} />}
      </TeamManager>
    </PortalShell>
  );
}
