// Văn bản BTC nhập: **in đậm** và xuống dòng; không nhận HTML
export default function Rich({ text, strongClass = "" }: { text: string; strongClass?: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line.split(/\*\*(.+?)\*\*/g).map((part, j) => (j % 2 ? <strong key={j} className={strongClass}>{part}</strong> : part))}
        </span>
      ))}
    </>
  );
}
