import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SupportTicketsService } from '../../../services/generated';
import { NotificationService } from '../../../shared/services/notification.service';
import {lastValueFrom} from "rxjs";

interface SupportTicketDto {
  id: number;
  reply_to: string;
  message: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

@Component({
  selector: 'app-admin-support-tickets',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './admin-support-tickets.component.html',
  styleUrls: ['./admin-support-tickets.component.css']
})
export class AdminSupportTicketsComponent {
  // UI state
  loading = signal(false);
  updatingId = signal<number | null>(null);

  // Filter: 'all' | 'open' | 'resolved'
  filter = signal<'all' | 'open' | 'resolved'>('all');

  // Pagination
  page = signal(1);
  perPage = signal(10);

  // Data
  tickets = signal<SupportTicketDto[]>([]);

  // Derived
  filtered = computed(() => {
    const f = this.filter();
    const items = this.tickets();
    if (f === 'open') return items.filter(t => !t.resolved);
    if (f === 'resolved') return items.filter(t => t.resolved);
    return items;
  });

  totalPages = computed(() => {
    const total = this.filtered().length;
    return Math.max(1, Math.ceil(total / this.perPage()))
  });

  paged = computed(() => {
    const p = this.page();
    const per = this.perPage();
    const start = (p - 1) * per;
    return this.filtered().slice(start, start + per);
  });

  constructor(
    private supportTicketsService: SupportTicketsService,
    private notify: NotificationService
  ) {
    // Reload when filter changes back to 'all' or on init
    effect(() => {
      // reading filter() makes it reactive; when filter changes to anything we reload from server
      this.filter();
      this.loadTickets();
      // reset to first page on filter change
      this.page.set(1);
    });
  }

  onFilterChange(value: string): void {
    // Cast to our union type
    if (value === 'all' || value === 'open' || value === 'resolved') {
      this.filter.set(value);
    }
  }

  async loadTickets(): Promise<void> {
    this.loading.set(true);
    try {
      // If filter is all, don't pass resolved to fetch all
      const f = this.filter();
      const resolvedParam = f === 'all' ? undefined : (f === 'resolved');
      const data = await lastValueFrom(this.supportTicketsService.apiSupportTicketsGet(resolvedParam));
      this.tickets.set((data as any[]) as SupportTicketDto[]);
    } catch (e) {
      console.error('Failed to load tickets', e);
      this.notify.showNotification('Failed to load tickets', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleResolved(ticket: SupportTicketDto): Promise<void> {
    this.updatingId.set(ticket.id);
    try {
      const updated = await lastValueFrom(this.supportTicketsService.apiSupportTicketsIdPatch(ticket.id, {
        resolved: !ticket.resolved
      } as any));
      // Merge updated ticket into list
      const items = this.tickets().map(t => t.id === ticket.id ? (updated as SupportTicketDto) : t);
      this.tickets.set(items);
      this.notify.showNotification(!ticket.resolved ? 'Marked as resolved' : 'Reopened ticket', 'success');
    } catch (e) {
      console.error('Failed to update ticket', e);
      this.notify.showNotification('Failed to update ticket', 'error');
    } finally {
      this.updatingId.set(null);
    }
  }

  firstN(text: string, n = 80): string {
    if (!text) return '';
    return text.length <= n ? text : text.slice(0, n) + '…';
  }

  prevPage(): void {
    if (this.page() > 1) this.page.update(p => p - 1);
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update(p => p + 1);
  }
}
