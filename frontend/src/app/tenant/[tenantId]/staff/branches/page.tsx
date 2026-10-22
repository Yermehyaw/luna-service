'use client';

import React, { useState } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { MOCK_BRANCHES } from '../../../../../mock/branches';
import { MapPin, Plus, Clock, CheckCircle2 } from 'lucide-react';

export default function StaffBranchesPage() {
  const { tenant } = useTenant();
  const initialBranches = MOCK_BRANCHES.filter((b) => b.tenantId === tenant.id);
  const [branches, setBranches] = useState(
    initialBranches.length > 0
      ? initialBranches
      : [
          {
            id: 'b_default',
            tenantId: tenant.id,
            name: `${tenant.name} Flagship Branch`,
            address: '14 Broad Street, Central Business District',
            liveLoad: 'moderate',
            openUntil: '5:00 PM',
            waitMin: 6,
          },
        ]
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openUntil, setOpenUntil] = useState('5:00 PM');
  const [notice, setNotice] = useState<string | null>(null);

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBranch = {
      id: `b_${Date.now()}`,
      tenantId: tenant.id,
      name: name.trim(),
      address: address.trim() || 'Central District',
      liveLoad: 'low',
      openUntil,
      waitMin: 3,
    };

    setBranches((prev) => [newBranch, ...prev]);
    setName('');
    setAddress('');
    setShowAddModal(false);
    setNotice(`Branch "${newBranch.name}" created successfully.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {tenant.businessScale === 'sme' ? 'Shop & Studio Locations' : 'Branch Network Management'}
            </h1>
            <p className="text-xs text-slate-500">
              {tenant.businessScale === 'sme'
                ? `Manage your primary studio address, operating hours, and capacity for ${tenant.name}.`
                : `Configure active locations, hours, and queue load capacity for ${tenant.name}.`}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-transform hover:scale-105 min-h-[44px]"
          >
            <Plus className="h-4 w-4 text-[#FFA800]" /> {tenant.businessScale === 'sme' ? 'Add Location' : 'Add Branch'}
          </button>
        </div>

        {tenant.businessScale === 'sme' && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900 flex items-center justify-between">
            <span className="font-medium">
              💡 <strong>Single or Multi-Studio:</strong> Small businesses run smoothly with just 1 active location. Add more branches anytime your brand expands!
            </span>
          </div>
        )}

        {notice && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-slate-900">Add New Branch Location</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddBranch} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Branch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victoria Island Express Hub"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Physical Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Plot 12, Adeola Odeku Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Operating Hours</label>
                  <input
                    type="text"
                    value={openUntil}
                    onChange={(e) => setOpenUntil(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl px-4 py-2.5 text-slate-600 hover:bg-slate-100 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#FFA800] px-5 py-2.5 font-extrabold text-[#291E29] min-h-[44px]"
                  >
                    Create Branch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
