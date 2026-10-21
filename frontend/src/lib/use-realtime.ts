'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { apiClient } from './api-client';
import { BackendTicket } from './queue-api';

export interface RealtimeEnvelope<T = any> {
  type: 'connected' | 'ticket.snapshot' | 'ticket.created' | 'ticket.status_changed' | 'ticket.wait_updated' | 'pong';
  timestamp: string;
  data: T;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Hook for Staff Console: subscribes to a specific branch channel.
 * Receives every ticket event for the branch.
 */
export function useBranchRealtime(options: {
  businessId?: string;
  branchId?: string;
  enabled?: boolean;
  onTicketCreated?: (ticket: BackendTicket) => void;
  onTicketStatusChanged?: (ticket: BackendTicket, previousStatus?: string) => void;
  onReconnect?: () => void;
}) {
  const {
    businessId,
    branchId,
    enabled = true,
    onTicketCreated,
    onTicketStatusChanged,
    onReconnect,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<RealtimeEnvelope | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialConnectRef = useRef<boolean>(true);

  // Stable callbacks
  const callbacksRef = useRef({ onTicketCreated, onTicketStatusChanged, onReconnect });
  useEffect(() => {
    callbacksRef.current = { onTicketCreated, onTicketStatusChanged, onReconnect };
  });

  const connect = useCallback(() => {
    if (!enabled || !businessId || !branchId || typeof window === 'undefined') return;

    const baseWs = apiClient.getWsUrl();
    const wsUrl = `${baseWs}/api/queue/ws/branches/${encodeURIComponent(branchId)}?business_id=${encodeURIComponent(businessId)}`;

    setStatus('connecting');

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('connected');
        if (!isInitialConnectRef.current && callbacksRef.current.onReconnect) {
          callbacksRef.current.onReconnect();
        }
        isInitialConnectRef.current = false;

        // Keepalive ping every 25s
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send('ping');
          }
        }, 25000);
      };

      socket.onmessage = (event) => {
        try {
          const envelope: RealtimeEnvelope = JSON.parse(event.data);
          setLastEvent(envelope);

          if (envelope.type === 'ticket.created' && callbacksRef.current.onTicketCreated) {
            callbacksRef.current.onTicketCreated(envelope.data);
          } else if (
            envelope.type === 'ticket.status_changed' &&
            callbacksRef.current.onTicketStatusChanged
          ) {
            callbacksRef.current.onTicketStatusChanged(
              envelope.data,
              envelope.data.previous_status
            );
          }
        } catch (err) {
          console.debug('[BranchRealtime] Ignored non-json message:', event.data);
        }
      };

      socket.onclose = () => {
        setStatus('disconnected');
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        // Retry connection after 4 seconds
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 4000);
        }
      };

      socket.onerror = () => {
        setStatus('error');
      };
    } catch (err) {
      console.warn('[BranchRealtime] WebSocket connection failed:', err);
      setStatus('error');
    }
  }, [enabled, businessId, branchId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return {
    status,
    isConnected: status === 'connected',
    lastEvent,
    reconnect: connect,
  };
}

/**
 * Hook for Customer Queue Tracking: subscribes to a specific ticket number.
 * Receives snapshot, status updates, and wait updates.
 */
export function useTicketRealtime(options: {
  ticketNumber?: string;
  enabled?: boolean;
  onSnapshot?: (ticket: BackendTicket) => void;
  onStatusChanged?: (ticket: BackendTicket) => void;
  onWaitUpdated?: (ticket: BackendTicket) => void;
  onReconnect?: () => void;
}) {
  const {
    ticketNumber,
    enabled = true,
    onSnapshot,
    onStatusChanged,
    onWaitUpdated,
    onReconnect,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [liveTicket, setLiveTicket] = useState<BackendTicket | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialConnectRef = useRef<boolean>(true);

  const callbacksRef = useRef({ onSnapshot, onStatusChanged, onWaitUpdated, onReconnect });
  useEffect(() => {
    callbacksRef.current = { onSnapshot, onStatusChanged, onWaitUpdated, onReconnect };
  });

  const connect = useCallback(() => {
    if (!enabled || !ticketNumber || typeof window === 'undefined') return;

    const baseWs = apiClient.getWsUrl();
    const wsUrl = `${baseWs}/api/queue/ws/tickets/${encodeURIComponent(ticketNumber)}`;

    setStatus('connecting');

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('connected');
        if (!isInitialConnectRef.current && callbacksRef.current.onReconnect) {
          callbacksRef.current.onReconnect();
        }
        isInitialConnectRef.current = false;

        // Keepalive ping every 25s
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send('ping');
          }
        }, 25000);
      };

      socket.onmessage = (event) => {
        try {
          const envelope: RealtimeEnvelope = JSON.parse(event.data);

          if (envelope.type === 'ticket.snapshot') {
            setLiveTicket(envelope.data);
            if (callbacksRef.current.onSnapshot) {
              callbacksRef.current.onSnapshot(envelope.data);
            }
          } else if (envelope.type === 'ticket.status_changed') {
            setLiveTicket(envelope.data);
            if (callbacksRef.current.onStatusChanged) {
              callbacksRef.current.onStatusChanged(envelope.data);
            }
          } else if (envelope.type === 'ticket.wait_updated') {
            setLiveTicket((prev) => (prev ? { ...prev, wait: envelope.data.wait } : envelope.data));
            if (callbacksRef.current.onWaitUpdated) {
              callbacksRef.current.onWaitUpdated(envelope.data);
            }
          }
        } catch (err) {
          console.debug('[TicketRealtime] Ignored non-json message:', event.data);
        }
      };

      socket.onclose = () => {
        setStatus('disconnected');
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 4000);
        }
      };

      socket.onerror = () => {
        setStatus('error');
      };
    } catch (err) {
      console.warn('[TicketRealtime] WebSocket connection failed:', err);
      setStatus('error');
    }
  }, [enabled, ticketNumber]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return {
    status,
    isConnected: status === 'connected',
    liveTicket,
    reconnect: connect,
  };
}
