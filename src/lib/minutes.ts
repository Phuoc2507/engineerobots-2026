// Biên bản trận đấu: loại biên bản và các bên ký (khớp head_revise_match trong 0037)

export const REASON_TYPES: Record<string, string> = {
  CONFIRM: "Xác nhận kết quả",
  INPUT_ERROR: "Nhập sai điểm",
  APPEAL: "Khiếu nại của đội thi",
  REVIEW: "Chấm phúc khảo",
  OTHER: "Khác",
};

// HEAD_REFEREE bắt buộc ký; cần tối thiểu 2 chữ ký
export const SIGNER_ROLES: { role: string; label: string }[] = [
  { role: "HEAD_REFEREE", label: "Trọng tài chính" },
  { role: "SECRETARY_RED", label: "Thư ký phe Đỏ" },
  { role: "SECRETARY_BLUE", label: "Thư ký phe Xanh" },
  { role: "TEAM_RED", label: "Đại diện đội Đỏ" },
  { role: "TEAM_BLUE", label: "Đại diện đội Xanh" },
  { role: "BTC", label: "Đại diện Ban tổ chức" },
];
export const signerLabel = (role: string) => SIGNER_ROLES.find((s) => s.role === role)?.label ?? role;

export type MinutesEvent = { id: string; team_color: string; event_type: string; point_value: number; notes: string | null; match_timestamp_seconds?: number | null };
export type Signature = { role: string; name: string; image: string; signed_at: string };
export type Minutes = {
  id: string; match_id: string; seq: number; reason_type: string; reason: string;
  changes: { removed: MinutesEvent[]; added: MinutesEvent[] };
  red_before: number; blue_before: number; red_after: number; blue_after: number;
  winner_before: string | null; winner_after: string | null;
  signatures: Signature[]; created_by: string; created_at: string;
};

export const minutesCode = (matchCode: string | null, seq: number) => `BB-${matchCode || "TRAN"}-${String(seq).padStart(2, "0")}`;

const SPECIAL: Record<string, string> = {
  ADJUST: "Điều chỉnh tay", KNOCKOUT: "Chiến thắng tuyệt đối", COIN_TOSS: "Thắng tung đồng xu", FORFEIT: "Xử thắng (đối thủ bị loại)",
};
export const eventName = (type: string, rules: { rule_key: string; rule_name: string }[]) =>
  SPECIAL[type] ?? rules.find((r) => r.rule_key === type)?.rule_name ?? type;
