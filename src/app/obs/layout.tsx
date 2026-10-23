// Lớp phủ OBS: nền trong suốt (Browser Source)
export default function ObsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html,body{background:transparent!important}`}</style>
      {children}
    </>
  );
}
