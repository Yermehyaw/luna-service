import { queueApi, BackendTicket } from '../../../lib/queue-api';

export interface QueueTicketItem {
  id: string;
  ticketNumber: string;
  tenantId: string;
  customerName: string;
  serviceName: string;
  position: number;
  estimatedWaitMin: number;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface QueueRepository {
  getTickets(tenantId: string): Promise<QueueTicketItem[]>;
  createTicket(
    tenantId: string,
    customerName: string,
    serviceName: string,
    serviceId?: string,
    branchId?: string,
    email?: string
  ): Promise<QueueTicketItem>;
  callNextTicket(tenantId: string): Promise<QueueTicketItem | null>;
  completeTicket(ticketNumber: string, tenantId: string): Promise<boolean>;
}

function mapBackendStatus(status: BackendTicket['status']): QueueTicketItem['status'] {
  switch (status) {
    case 'booked':
      return 'waiting';
    case 'called':
      return 'serving';
    case 'done':
      return 'completed';
    case 'cancelled':
    case 'no_show':
      return 'cancelled';
    default:
      return 'waiting';
  }
}

function mapBackendTicket(ticket: BackendTicket): QueueTicketItem {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    tenantId: ticket.business_id,
    customerName: ticket.customer_name,
    serviceName: ticket.service_id,
    position: (ticket.wait?.tickets_ahead ?? 0) + 1,
    estimatedWaitMin: ticket.wait?.minutes ?? 5,
    status: mapBackendStatus(ticket.status),
    createdAt: ticket.created_at,
  };
}

export class HybridQueueRepository implements QueueRepository {
  private mockTickets: QueueTicketItem[] = [
    {
      id: 't_1',
      ticketNumber: 'AC-101',
      tenantId: 'tenant_001',
      customerName: 'Amara Okafor',
      serviceName: 'Teller & Cash Deposit',
      position: 1,
      estimatedWaitMin: 4,
      status: 'waiting',
      createdAt: '2026-10-05T10:00:00Z',
    },
    {
      id: 't_2',
      ticketNumber: 'AC-102',
      tenantId: 'tenant_001',
      customerName: 'Babajide Cole',
      serviceName: 'Account & Card Advisory',
      position: 2,
      estimatedWaitMin: 9,
      status: 'waiting',
      createdAt: '2026-10-05T10:05:00Z',
    },
  ];

  async getTickets(tenantId: string): Promise<QueueTicketItem[]> {
    try {
      const res = await queueApi.listTickets({
        businessId: tenantId,
        limit: 100,
      });
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        return res.items.map(mapBackendTicket);
      }
    } catch (err) {
      console.warn('[QueueRepository] Using fallback tickets for tenant', tenantId);
    }
    return this.mockTickets.filter((t) => t.tenantId === tenantId);
  }

  async createTicket(
    tenantId: string,
    customerName: string,
    serviceName: string,
    serviceId: string = 's_001',
    branchId: string = 'b_001',
    email?: string
  ): Promise<QueueTicketItem> {
    try {
      const created = await queueApi.createTicket({
        business_id: tenantId,
        branch_id: branchId,
        service_id: serviceId,
        customer_name: customerName,
        customer_email: email || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      });
      return mapBackendTicket(created);
    } catch (err) {
      console.warn('[QueueRepository] Fallback ticket creation active:', err);
      const nextNum = this.mockTickets.length + 101;
      const fallbackTicket: QueueTicketItem = {
        id: `t_${Date.now()}`,
        ticketNumber: `AC-${nextNum}`,
        tenantId,
        customerName,
        serviceName,
        position: this.mockTickets.filter((t) => t.status === 'waiting').length + 1,
        estimatedWaitMin: 5 * (this.mockTickets.length + 1),
        status: 'waiting',
        createdAt: new Date().toISOString(),
      };
      this.mockTickets.push(fallbackTicket);
      return fallbackTicket;
    }
  }

  async callNextTicket(tenantId: string): Promise<QueueTicketItem | null> {
    const tickets = await this.getTickets(tenantId);
    const waiting = tickets.find((t) => t.status === 'waiting');
    if (!waiting) return null;

    try {
      const updated = await queueApi.updateTicketStatus(waiting.ticketNumber, 'called', tenantId);
      return mapBackendTicket(updated);
    } catch (err) {
      waiting.status = 'serving';
      return waiting;
    }
  }

  async completeTicket(ticketNumber: string, tenantId: string): Promise<boolean> {
    try {
      await queueApi.updateTicketStatus(ticketNumber, 'done', tenantId);
      return true;
    } catch (err) {
      const t = this.mockTickets.find((item) => item.ticketNumber === ticketNumber);
      if (t) {
        t.status = 'completed';
        return true;
      }
      return false;
    }
  }
}

export const queueRepository: QueueRepository = new HybridQueueRepository();
