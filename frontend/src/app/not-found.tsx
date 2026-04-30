import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ticket, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <Ticket className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Ke Dashboard
            </Button>
          </Link>
          <Link href="/tickets">
            <Button variant="outline">Lihat Tiket</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
