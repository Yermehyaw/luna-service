'use client';

import React from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { MOCK_SERVICES } from '../../../../../mock/services';
import { Briefcase, Plus, Clock } from 'lucide-react';

export default function StaffServicesPage() {
  const { tenant } = useTenant();
  const services = MOCK_SERVICES.filter((s) => s.tenantId === tenant.id);

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Services & Window Configuration</h1>
            <p className="text-xs text-slate-500">Manage priority windows, SLA target durations, and ticket offerings for {tenant.name}.</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800">
            <Plus className="h-4 w-4" /> Create Service Window
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> ~{s.minutes} mins SLA
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </TenantStaffLayout>
  );
}
