import { renderToStaticMarkup } from "react-dom/server";
import Receipt, { type ReceiptData } from "../components/ui/Receipt";

const RECEIPT_CSS = `
.w-\[280px\]{width:280px}
.bg-white{background:#fff}
.text-\[#1A1A1A\]{color:#1a1a1a}
.font-mono{font-family:'Courier New',monospace}
.text-\[12\.5px\]{font-size:12.5px}
.leading-snug{line-height:1.375}
.p-5{padding:20px}
.mx-auto{margin:0 auto}
.text-center{text-align:center}
.font-extrabold{font-weight:800}
.text-\[15px\]{font-size:15px}
.uppercase{text-transform:uppercase}
.tracking-wide{letter-spacing:1px}
.text-\[10\.5px\]{font-size:10.5px}
.tracking-\[2\.5px\]{letter-spacing:2.5px}
.text-gray-500{color:#6b7280}
.mt-1{margin-top:4px}
.mb-3{margin-bottom:12px}
.border-t{border-top:1px solid #9ca3af}
.border-dashed{border-style:dashed}
.border-gray-400{border-color:#9ca3af}
.my-2{margin:8px 0}
.flex{display:flex}
.justify-between{justify-content:space-between}
.py-0\.5{padding:2px 0}
.font-bold{font-weight:700}
.mb-1\.5{margin-bottom:6px}
.text-gray-600{color:#4b5563}
.text-xs{font-size:12px}
.text-base{font-size:16px}
.py-1{padding:4px 0}
.text-gray-400{color:#9ca3af}
.italic{font-style:italic}
.mt-2{margin-top:8px}
.border-2{border:2px solid #16a34a}
.border-green-600{border-color:#16a34a}
.text-green-600{color:#16a34a}
.tracking-widest{letter-spacing:2px}
.rounded{border-radius:6px}
.py-2{padding:8px 0}
.mt-3{margin-top:12px}
.-rotate-1{transform:rotate(-1deg)}
`;

export function buildReceiptHtml(data: ReceiptData): string {
  const markup = renderToStaticMarkup(<Receipt data={data} />);
  return `<style>${RECEIPT_CSS}</style>${markup}`;
}