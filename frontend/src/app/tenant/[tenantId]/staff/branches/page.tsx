'use client';

import React from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { MOCK_BRANCHES } from '../../../../../mock/branches';
import { MapPin, Plus, Clock } from 'lucide-react';

export default function StaffBranchesPage() {
  const { tenant } = useTenant();
  const branches = MOCK_BRANCHES.filter((b) => b.tenantId === tenant.id);

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Branch Network Management</h1>
            <p className="text-xs text-slate-500">Configure active locations, hours, and queue load capacity for {tenant.name}.</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800">
            <Plus className="h-4 w-4" /> Add Branch
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((b) => (
            <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {b.address}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 capitalize">
                  {b.liveLoad} Load
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Open until {b.openUntil}
                </span>
                <span className="font-extrabold text-[var(--tenant-primary,#0057B8)]">~{b.waitMin} min avg wait</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TenantStaffLayout>
  );
}
