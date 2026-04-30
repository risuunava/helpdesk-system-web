'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTicket } from '@/hooks/use-tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Ticket</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the issue..."
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={createTicket.isPending}
              >
                {createTicket.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Ticket
              </Button>
              <Link href="/tickets">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}