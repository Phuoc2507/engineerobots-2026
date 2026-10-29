import type { Metadata } from "next";
import { SITE, STUDENT_DOMAIN } from "@/lib/site";
import PortalShell from "@/components/register/PortalShell";

export const metadata: Metadata = { title: "Chính sách quyền riêng tư · ENGINEERING PATH 2026" };

// Trang bắt buộc cho màn hình xin quyền Google OAuth
const SECTIONS = [
  {
    title: "Dữ liệu chúng tôi thu thập",
    items: [
      `Từ tài khoản Google @${STUDENT_DOMAIN}: địa chỉ email, họ tên và ảnh đại diện — chỉ để xác thực bạn là sinh viên HCMUTE.`,
      "Thông tin đội do đội trưởng khai báo: tên đội, ngành; họ tên, MSSV, email trường và số điện thoại (không bắt buộc) của các thành viên.",
      "Kết quả thi đấu, lịch thử sa bàn và khiếu nại phát sinh trong giải.",
    ],
  },
  {
    title: "Mục đích sử dụng",
    items: [
      "Xác thực người dùng, xét duyệt hồ sơ, cấp mã QR check-in và liên hệ các đội về lịch thi.",
      "Hiển thị công khai tên đội, ngành và kết quả thi đấu trên website, màn hình sân khấu và livestream.",
      "Chúng tôi không bán, không chia sẻ dữ liệu cá nhân cho bên thứ ba và không dùng cho mục đích quảng cáo.",
    ],
  },
  {
    title: "Lưu trữ & bảo mật",
    items: [
      "Dữ liệu lưu trên Supabase (PostgreSQL) với chính sách phân quyền theo từng dòng: bạn chỉ xem được đội của mình; chỉ BTC xem toàn bộ hồ sơ.",
      "Dữ liệu được giữ đến hết mùa giải và xóa hoặc ẩn danh hóa trong vòng 6 tháng sau khi giải kết thúc.",
    ],
  },
  {
    title: "Quyền của bạn",
    items: [
      "Đội trưởng có thể sửa hoặc rút hồ sơ khi đội chưa được duyệt; thành viên có thể rời đội ngay trên trang Đội của tôi.",
      "Bạn có thể yêu cầu BTC xóa dữ liệu của mình bất kỳ lúc nào qua kênh liên hệ của Khoa Cơ khí.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PortalShell title="Chính sách quyền riêng tư" subtitle={`Áp dụng cho website ${SITE.name} do ${SITE.organizer} vận hành.`}>
      <article className="space-y-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl uppercase tracking-wide text-navy">{s.title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              {s.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </section>
        ))}
        <p className="border-t border-slate-100 pt-6 text-sm text-slate-500">
          Cập nhật lần cuối: 24/10/2026 · {SITE.faculty}
        </p>
      </article>
    </PortalShell>
  );
}
