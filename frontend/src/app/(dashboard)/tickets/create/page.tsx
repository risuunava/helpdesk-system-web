'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTicket } from '@/hooks/use-tickets';
import { useToast } from '../../../../hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createTicket = useCreateTicket();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createTicket.mutateAsync(formData);
      toast({
        title: 'Success',
        description: 'Ticket created successfully',
      });
      router.push(`/tickets/${result.data.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create ticket',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/tickets">
          <button className="btn-icon">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <h1 className="headline text-ink">Buat Tiket Baru</h1>
      </div>

      <div className="card-pricing">
        <div className="mb-6">
          <h2 className="body-lg font-bold text-ink">Detail Tiket</h2>
          <p className="body-sm text-ink-muted mt-1">Lengkapi informasi berikut untuk melaporkan kendala IT Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="caption text-ink-muted">Subjek / Judul *</label>
            <input
              id="title"
              type="text"
              placeholder="Jelaskan kendala secara singkat"
              className="w-full input-framer placeholder:text-ink-muted/50"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="caption text-ink-muted">Kategori</label>
            <div className="relative">
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full input-framer appearance-none"
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="caption text-ink-muted">Deskripsi Kendala *</label>
            <textarea
              id="description"
              placeholder="Berikan detail mengenai kendala yang Anda alami..."
              rows={6}
              className="w-full input-framer placeholder:text-ink-muted/50 resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <button
              type="submit"
              className="btn-primary flex items-center h-11 px-6"
              disabled={createTicket.isPending}
            >
              {createTicket.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Kirim Tiket
            </button>
            <Link href="/tickets">
              <button type="button" className="btn-secondary h-11 px-6">
                Batal
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}