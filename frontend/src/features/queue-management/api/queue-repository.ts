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
  createTicket(tenantId: string, customerName: string, serviceName: string): Promise<QueueTicketItem>;
  callNextTicket(tenantId: string): Promise<QueueTicketItem | null>;
  completeTicket(ticketId: string): Promise<boolean>;
}

export class MockQueueRepository implements QueueRepository {
  private mockTickets: QueueTicketItem[] = [
    { id: 't_1', ticketNumber: 'A-101', tenantId: 'tenant_001', customerName: 'Amara Okafor', serviceName: 'Teller & Cash Deposit', position: 1, estimatedWaitMin: 4, status: 'waiting', createdAt: '2026-10-05T10:00:00Z' },
    { id: 't_2', ticketNumber: 'A-102', tenantId: 'tenant_001', customerName: 'Babajide Cole', serviceName: 'Account Advisory', position: 2, estimatedWaitMin: 9, status: 'waiting', createdAt: '2026-10-05T10:05:00Z' },
  ];

  async getTickets(tenantId: string): Promise<QueueTicketItem[]> {
    return Promise.resolve(this.mockTickets.filter((t) => t.tenantId === tenantId));
  }

  async createTicket(tenantId: string, customerName: string, serviceName: string): Promise<QueueTicketItem> {
    const nextNum = this.mockTickets.length + 101;
    const newTicket: QueueTicketItem = {
      id: `t_${Date.now()}`,
      ticketNumber: `A-${nextNum}`,
      tenantId,
      customerName,
      serviceName,
      position: this.mockTickets.filter((t) => t.status === 'waiting').length + 1,
      estimatedWaitMin: 5 * (this.mockTickets.length + 1),
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    this.mockTickets.push(newTicket);
    return Promise.resolve(newTicket);
  }

  async callNextTicket(tenantId: string): Promise<QueueTicketItem | null> {
    const waiting = this.mockTickets.find((t) => t.tenantId === tenantId && t.status === 'waiting');
    if (waiting) {
      waiting.status = 'serving';
      return Promise.resolve(waiting);
    }
    return Promise.resolve(null);
  }

  async completeTicket(ticketId: string): Promise<boolean> {
    const t = this.mockTickets.find((item) => item.id === ticketId);
    if (t) {
      t.status = 'completed';
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}

export const queueRepository: QueueRepository = new MockQueueRepository();
