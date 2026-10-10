import { apiClient } from './api-client';

export interface BackendWaitEstimate {
  minutes: number | null;
  tickets_ahead: number;
  service_duration_mins: number;
  display: string;
}

export interface BackendTicket {
  id: string;
  ticket_number: string;
  business_id: string;
  branch_id: string;
  service_id: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string | null;
  status: 'booked' | 'called' | 'done' | 'cancelled' | 'no_show';
  is_priority: boolean;
  booked_for?: string | null;
  called_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
  wait?: BackendWaitEstimate | null;
}

export interface BackendTicketListResponse {
  items: BackendTicket[];
  total: number;
  limit: number;
  offset: number;
}

export interface BackendService {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  duration_mins: number;
  is_active: boolean;
  requires_documents: boolean;
  requires_payment: boolean;
  price_kobo?: number | null;
}

export interface BackendServiceListResponse {
  items: BackendService[];
  total: number;
}

export interface BackendHealth {
  status: 'healthy' | 'degraded';
  checks: {
    database: string;
  };
  realtime: {
    redis: string;
    connections: number;
  };
}

export interface CreateTicketPayload {
  business_id: string;
  branch_id: string;
  service_id: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string | null;
  booked_for?: string | null;
  notes?: string | null;
  is_priority?: boolean;
}

export interface CreateServicePayload {
  business_id: string;
  name: string;
  description?: string;
  duration_mins?: number;
  requires_documents?: boolean;
  requires_payment?: boolean;
  price_kobo?: number;
}

export const queueApi = {
  async getHealth(): Promise<BackendHealth> {
    return apiClient.get<BackendHealth>('/health');
  },

  async listServices(businessId: string, activeOnly: boolean = true): Promise<BackendService[]> {
    const res = await apiClient.get<BackendServiceListResponse>('/api/queue/services', {
      params: {
        business_id: businessId,
        active_only: String(activeOnly),
      },
    });
    return res.items;
  },

  async createService(payload: CreateServicePayload): Promise<BackendService> {
    return apiClient.post<BackendService>('/api/queue/services', payload);
  },

  async createTicket(payload: CreateTicketPayload): Promise<BackendTicket> {
    const body = {
      ...payload,
      customer_id: payload.customer_id || `cust_${Date.now().toString(36)}`,
      is_priority: payload.is_priority ?? false,
    };
    return apiClient.post<BackendTicket>('/api/queue/tickets', body);
  },

  async listTickets(params: {
    businessId: string;
    branchId?: string;
    serviceId?: string;
    status?: string;
    activeOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<BackendTicketListResponse> {
    const queryParams: Record<string, string> = {
      business_id: params.businessId,
    };
    if (params.branchId) queryParams.branch_id = params.branchId;
    if (params.serviceId) queryParams.service_id = params.serviceId;
    if (params.status) queryParams.status = params.status;
    if (params.activeOnly !== undefined) queryParams.active_only = String(params.activeOnly);
    if (params.limit) queryParams.limit = String(params.limit);
    if (params.offset) queryParams.offset = String(params.offset);

    return apiClient.get<BackendTicketListResponse>('/api/queue/tickets', {
      params: queryParams,
    });
  },

  async getTicket(ticketNumber: string, businessId: string): Promise<BackendTicket> {
    return apiClient.get<BackendTicket>(`/api/queue/tickets/${encodeURIComponent(ticketNumber)}`, {
      params: { business_id: businessId },
    });
  },

  async updateTicketStatus(
    ticketNumber: string,
    status: 'called' | 'done' | 'cancelled' | 'no_show',
    businessId: string
  ): Promise<BackendTicket> {
    return apiClient.patch<BackendTicket>(
      `/api/queue/tickets/${encodeURIComponent(ticketNumber)}/status`,
      { status },
      { params: { business_id: businessId } }
    );
  },

  async getWaitEstimate(ticketNumber: string, businessId: string): Promise<BackendWaitEstimate> {
    return apiClient.get<BackendWaitEstimate>(
      `/api/queue/tickets/${encodeURIComponent(ticketNumber)}/wait`,
      { params: { business_id: businessId } }
    );
  },
};
