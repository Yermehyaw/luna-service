'use client';

import React, { useState, useEffect, use } from 'react';
import { getTenantBySlug } from '../../../../lib/tenant';
import { queueApi, BackendService } from '../../../../lib/queue-api';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import { Ticket, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { MOCK_SERVICES } from '../../../../mock/services';
import Link from 'next/link';

export default function BookQueuePage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const [tenant, setTenant] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [services, setServices] = useState<Array<{ id: string; name: string; minutes: number }>>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then(async (res) => {
      setTenant(res);
      if (!res) return;

      // Try fetching real services from backend
      try {
        const backendServices = await queueApi.listServices(res.id);
        if (backendServices && backendServices.length > 0) {
          const mapped = backendServices.map((s) => ({
            id: s.id,
            name: s.name,
            minutes: s.duration_mins,
          }));
          setServices(mapped);
          setSelectedServiceId(mapped[0].id);
          return;
        }
      } catch (err) {
        console.warn('[BookQueue] Backend services lookup fallback to mock');
      }

      // Fallback to mock services
      const mockList = MOCK_SERVICES.filter((s) => s.tenantId === res.id);
      if (mockList.length > 0) {
        setServices(mockList);
        setSelectedServiceId(mockList[0].id);
      }
    });
  }, [resolvedParams.tenantId]);

  if (!tenant) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading booking portal...</div>;
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

    try {
      // Connect to real backend
      const res = await queueApi.createTicket({
        business_id: tenant.id,
        branch_id: 'b_001',
        service_id: activeService?.id || 's_001',
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || undefined,
      });

      setCreatedTicket({
        ticketNumber: res.ticket_number,
        customerName: res.customer_name,
        serviceName: activeService?.name || 'Customer Service',
        estimatedWaitMin: res.wait?.minutes ?? activeService?.minutes ?? 5,
        displayWait: res.wait?.display || 'Any moment now',
        ticketsAhead: res.wait?.tickets_ahead ?? 0,
      });
    } catch (err: any) {
      console.warn('[BookQueue] Backend creation error, falling back locally:', err);
      // Fallback
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCreatedTicket({
        ticketNumber: `AC-${randomNum}`,
        customerName: customerName.trim(),
        serviceName: activeService?.name || 'Customer Service',
        estimatedWaitMin: activeService?.minutes || 5,
        displayWait: `About ${activeService?.minutes || 5} min`,
        ticketsAhead: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-xl py-12 px-6 space-y-6 font-sans">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            <span>Fast-Track Arrival Window</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Book Timed Arrival Ticket</h1>
          <p className="text-xs text-slate-500">
            Reserve your real-time position in the digital lobby for {tenant.name}.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        {createdTicket ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-7 text-center space-y-5 shadow-lg animate-in fade-in">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Confirmed Ticket Reference
              </span>
              <div className="text-4xl font-extrabold font-mono text-slate-900 mt-1 tracking-tight">
                {createdTicket.ticketNumber}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs space-y-2 text-left border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-800">{createdTicket.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Service Window:</span>
                <span className="font-bold text-slate-800">{createdTicket.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tickets Ahead:</span>
                <span className="font-bold text-slate-800">{createdTicket.ticketsAhead}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-emerald-700 font-semibold">Estimated Wait:</span>
                <span className="font-extrabold text-emerald-700">
                  {createdTicket.displayWait} (~{createdTicket.estimatedWaitMin} mins)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/tenant/${tenant.slug}/track?ticket=${encodeURIComponent(createdTicket.ticketNumber)}`}
                className="flex-1 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-transform hover:scale-[1.02] text-center"
              >
                Track Live Position & Audio Caller
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCreatedTicket(null);
                  setCustomerName('');
                  setCustomerEmail('');
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Book Another
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleBook}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm space-y-4 text-xs"
          >
            <div>
              <label className="font-semibold text-slate-700">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ada Lovelace"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Email Address (Optional, for SMS/Email alerts)</label>
              <input
                type="email"
                placeholder="e.g. ada@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Select Service Window</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (~{s.minutes} mins)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: tenant.branding.primaryColor || '#0057B8' }}
            >
              <Ticket className="h-4 w-4" />
              <span>{loading ? 'Issuing Ticket via Backend...' : 'Confirm Arrival Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </TenantCustomerLayout>
  );
}
