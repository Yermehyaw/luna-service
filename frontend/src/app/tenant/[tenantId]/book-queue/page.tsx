'use client';

import React, { useState, use } from 'react';
import { getTenantBySlug } from '../../../../lib/tenant';
import { queueRepository } from '../../../../features/queue-management/api/queue-repository';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import { Ticket, CheckCircle2, Clock } from 'lucide-react';
import { MOCK_SERVICES } from '../../../../mock/services';

export default function BookQueuePage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const [tenant, setTenant] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then((res) => {
      setTenant(res);
      const services = MOCK_SERVICES.filter((s) => s.tenantId === res?.id);
      if (services.length > 0) {
        setSelectedService(services[0].name);
      }
    });
  }, [resolvedParams.tenantId]);

  if (!tenant) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading booking portal...</div>;
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ticket = await queueRepository.createTicket(tenant.id, customerName, selectedService);
    setCreatedTicket(ticket);
    setLoading(false);
  };

  const services = MOCK_SERVICES.filter((s) => s.tenantId === tenant.id);

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-xl py-12 px-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-slate-900">Book Timed Arrival Ticket</h1>
          <p className="text-xs text-slate-500">Reserve a 30-minute priority arrival window for {tenant.name}.</p>
        </div>

        {createdTicket ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center space-y-4 shadow-md">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Your Priority Ticket</span>
              <div className="text-4xl font-extrabold font-mono text-slate-900 mt-1">{createdTicket.ticketNumber}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-xs space-y-1">
              <p><span className="font-semibold text-slate-700">Customer:</span> {createdTicket.customerName}</p>
              <p><span className="font-semibold text-slate-700">Service:</span> {createdTicket.serviceName}</p>
              <p className="text-emerald-700 font-bold"><span className="font-semibold text-slate-700">Estimated Arrival Wait:</span> ~{createdTicket.estimatedWaitMin} mins</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBook} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Amara Okafor"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Select Service Window</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} (~{s.minutes} mins)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: tenant.branding.primaryColor }}
            >
              <Ticket className="h-4 w-4" />
              <span>{loading ? 'Issuing Ticket...' : 'Confirm Arrival Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </TenantCustomerLayout>
  );
}
