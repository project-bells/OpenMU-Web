import { useEffect, useState, type FormEvent } from "react";
import { Download, ExternalLink, Save, ShieldCheck } from "lucide-react";
import {
  fetchDownloadClientConfig,
  updateDownloadClientConfig,
  type DownloadClientConfig,
} from "../../services/dbApi";

const emptyConfig: DownloadClientConfig = {
  version: "",
  fileSize: "",
  updatedAt: "",
  megaUrl: "",
  mediafireUrl: "",
  virusTotalLabel: "",
};

export default function AdminDownloadsPage() {
  const [form, setForm] = useState(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetchDownloadClientConfig()
      .then(setForm)
      .catch((error) => setMessage({ ok: false, text: error?.message || "โหลดข้อมูลไม่สำเร็จ" }))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof DownloadClientConfig, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updateDownloadClientConfig(form);
    setSaving(false);
    if (result.success && result.config) {
      setForm(result.config);
      setMessage({ ok: true, text: "บันทึกข้อมูล Download Client เรียบร้อยแล้ว" });
    } else {
      setMessage({ ok: false, text: result.error || "บันทึกไม่สำเร็จ" });
    }
  };

  const fields: Array<{ key: keyof DownloadClientConfig; label: string; placeholder: string; type?: string }> = [
    { key: "version", label: "เวอร์ชัน Client", placeholder: "1.04D • S6E3" },
    { key: "fileSize", label: "ขนาดไฟล์", placeholder: "2.1 GB" },
    { key: "updatedAt", label: "วันที่อัปเดต", placeholder: "November 2026" },
    { key: "virusTotalLabel", label: "ข้อความ VirusTotal", placeholder: "VirusTotal Clean (0/72)" },
    { key: "megaUrl", label: "ลิงก์ดาวน์โหลด MEGA", placeholder: "https://mega.nz/...", type: "url" },
    { key: "mediafireUrl", label: "ลิงก์ดาวน์โหลด MediaFire", placeholder: "https://mediafire.com/...", type: "url" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Download className="h-6 w-6 text-amber-400" />
          <h1 className="font-display text-2xl font-black text-white">จัดการ Download Client</h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">แก้ไขข้อมูลและลิงก์ที่แสดงบนหน้าเว็บไซต์หลักโดยไม่ต้องแก้โค้ด</p>
      </div>

      {message && (
        <div className={`rounded-2xl border p-4 text-xs font-bold ${message.ok ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-rose-400/40 bg-rose-500/10 text-rose-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-6 shadow-2xl">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className={field.key.endsWith("Url") ? "sm:col-span-2" : ""}>
              <span className="mb-1.5 block text-xs font-bold text-slate-300">{field.label}</span>
              <input
                type={field.type || "text"}
                required
                value={form[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
                placeholder={field.placeholder}
                disabled={loading || saving}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <a href="/#download" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-sky-300 hover:text-sky-200">
            <ExternalLink className="h-4 w-4" /> เปิดหน้าดาวน์โหลดเพื่อตรวจสอบ
          </a>
          <button type="submit" disabled={loading || saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-extrabold text-slate-950 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </button>
        </div>
      </form>

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-xs text-slate-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        ระบบอนุญาตเฉพาะลิงก์ HTTP/HTTPS และบันทึกประวัติการแก้ไขไว้ใน GM Audit Log
      </div>
    </div>
  );
}
