import Link from 'next/link';
import { Home, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden">
      {/* Background Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center space-y-10 relative z-10 px-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-surface-1 border border-hairline flex items-center justify-center shadow-2xl">
            <Zap className="h-12 w-12 text-accent-blue fill-accent-blue/10" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-[120px] font-display font-bold leading-none tracking-tighter text-ink opacity-10">404</h1>
          <div className="absolute top-[160px] left-1/2 -translate-x-1/2 w-full">
             <h2 className="display-md text-ink">Halaman Tidak Ditemukan</h2>
             <p className="body-lg text-ink-muted mt-3 max-w-md mx-auto">
               Maaf, halaman yang Anda cari tidak tersedia atau mungkin telah berpindah lokasi.
             </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-20">
          <Link href="/dashboard">
            <button className="btn-primary px-8 h-12 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Kembali ke Dashboard
            </button>
          </Link>
          <Link href="/tickets">
            <button className="btn-secondary px-8 h-12">
              Lihat Tiket Saya
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
