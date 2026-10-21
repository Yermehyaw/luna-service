'use client';

import React, { useState } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { Users, Search, Mail, Phone, Ticket, ShieldCheck, Check } from 'lucide-react';

export default function StaffCustomersPage() {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');

  const mockCustomers = [
    { id: 'c_1', name: 'Amara Okafor', email: 'amara@example.com', phone: '+234 802 123 4567', visits: 12, lastVisit: 'Today', verified: true },
    { id: 'c_2', name: 'Babajide Cole', email: 'babajide@example.com', phone: '+234 803 987 6543', visits: 5, lastVisit: '3 days ago', verified: true },
    { id: 'c_3', name: 'Chidinma Vance', email: 'chidinma@example.com', phone: '+254 712 345 678', visits: 8, lastVisit: '1 week ago', verified: false },
    { id: 'c_4', name: 'David Mensah', email: 'david.m@example.com', phone: '+233 24 555 1234', visits: 3, lastVisit: '2 weeks ago', verified: true },
    { id: 'c_5', name: 'Fatima Bello', email: 'fatima.bello@example.com', phone: '+234 810 999 8888', visits: 1, lastVisit: 'Yesterday', verified: false },
  ];

  const filtered = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Customer Directory & History</h1>
            <p className="text-xs text-slate-500">Registered visitors, ticket histories, and verified documents for {tenant.name}.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 w-64 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Pre-Clearance Status</th>
                <th className="p-4">Lifetime Visits</th>
                <th className="p-4">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No customers match your search "{search}".
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{c.name}</td>
                    <td className="p-4 space-y-0.5">
                      <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /> {c.email}</p>
                      <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" /> {c.phone}</p>
                    </td>
                    <td className="p-4">
                      {c.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          Pending Docs
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{c.visits} tickets</td>
                    <td className="p-4">{c.lastVisit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TenantStaffLayout>
  );
}
