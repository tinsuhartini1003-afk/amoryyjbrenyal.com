import React from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      q: "Apakah transaksi beli akun di AMORYY aman dan bergaransi?",
      a: "Sangat aman! Semua akun yang dijual di AMORYY melewati verifikasi data ketat dan kami berikan Garansi Lifetime Anti Hackback. Jika terjadi kendala pada data login akun, kami ganti baru atau refund 100%."
    },
    {
      q: "Bagaimana proses pengiriman akun setelah pembayaran?",
      a: "Setelah Anda memindai QRIS dan menekan tombol 'Saya Sudah Bayar', WhatsApp Admin akan otomatis menerima detail pesanan Anda. Admin kami akan langsung memproses pengalihan email & password login game dalam kurun waktu 5 - 10 menit."
    },
    {
      q: "Apakah saya bisa menyewa akun untuk push rank atau turnamen?",
      a: "Sangat bisa! Semua akun sewa/rental kami bebas digunakan untuk mode Ranked, Classic, Brawl, maupun Turnamen Resmi. Anda juga bebas bermain bersama teman-teman Anda."
    },
    {
      q: "Apa saja larangan saat menyewa akun?",
      a: "DILARANG keras menggunakan program ilegal, cheat, cheat radar map, script skin, atau berkata kasar/toxic di dalam game yang dapat menyebabkan akun terkena sanksi/ban. Pelanggaran akan dikenakan denda senilai harga penuh akun."
    },
    {
      q: "Bagaimana jika durasi rental saya sudah habis?",
      a: "Setelah durasi habis, admin akan mengubah kredensial sandi login. Jika Anda ingin menambah durasi main (extend), silakan kabari admin di WhatsApp minimal 30 menit sebelum durasi rental Anda berakhir."
    }
  ];

  return (
    <div className="space-y-8 py-8" id="faq-section">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block">
          Ada Pertanyaan?
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Frequently Asked Questions (FAQ)
        </h2>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Temukan jawaban cepat atas pertanyaan-pertanyaan umum dari pelanggan kami seputar layanan jual-beli dan sewa akun game.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-white/5 transition-all text-white font-bold text-sm sm:text-base cursor-pointer"
              >
                <div className="flex items-center space-x-3 pr-4">
                  <HelpCircle className="w-5 h-5 text-[#FF4D94] shrink-0" />
                  <span>{faq.q}</span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-400 font-light leading-relaxed border-t border-white/5 bg-black/20">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
