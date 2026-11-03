"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer className="h-4 w-4" /> In / lưu PDF
    </button>
  );
}
