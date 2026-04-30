export type Priority = 'low' | 'normal' | 'urgent';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
export type Category = 'hardware' | 'software' | 'network' | 'account' | 'other';

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
}

export interface TicketLog {
  id: number;
  ticket_id: number;
  user_id: number;
  action: string;
  description: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name'>;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: Category;
  sla_due_at: string | null;
  sla_breached: boolean;
  sla_status?: string;
  sla_is_breached?: boolean;
  sla_message?: string;
  user_id: number;
  assigned_to: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  assignedTo?: User;
  logs?: TicketLog[];
}

export interface TicketFormData {
  title: string;
  description: string;
  category: Category;
  priority?: Priority;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface DashboardSummary {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  sla_breached: number;
  avg_resolution_hours: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  tickets_by_status: Record<string, number>;
  tickets_by_priority: Record<string, number>;
  recent_tickets: Ticket[];
  weekly_trends: Record<string, number>;
}