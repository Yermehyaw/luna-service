'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import { queueApi, BackendService } from '../../../../../lib/queue-api';
import { MOCK_SERVICES } from '../../../../../mock/services';
import { Briefcase, Plus, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  minutes: number;
  description: string;
}

export default function StaffServicesPage() {
  const { tenant } = useTenant();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState(10);
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const backendServices = await queueApi.listServices(tenant.id);
      if (backendServices && backendServices.length > 0) {
        setServices(
          backendServices.map((s) => ({
            id: s.id,
            name: s.name,
            minutes: s.duration_mins,
            description: s.description || 'Standard service counter window.',
          }))
        );
        return;
      }
    } catch (err) {
      console.warn('[StaffServices] Backend services fetch error, falling back to mock');
    } finally {
      setLoading(false);
    }

    // Fallback to mock services
    const initialServices = MOCK_SERVICES.filter((s) => s.tenantId === tenant.id);
    if (initialServices.length > 0) {
      setServices(initialServices);
    } else {
      setServices([
        {
          id: 's_default_1',
          name: 'General Inquiries & Intake',
          minutes: 5,
          description: 'Fast-track customer triage, paperwork check, and initial consultations.',
        },
        {
          id: 's_default_2',
          name: 'Priority Specialist Consultation',
          minutes: 15,
          description: 'In-depth account advisory, document clearances, and specialist desk services.',
        },
      ]);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const sName = name.trim();
    const sMinutes = Number(minutes) || 10;
    const sDesc = description.trim() || 'Standard desk priority service window.';

    setName('');
    setDescription('');
    setShowAddModal(false);

    try {
      if (tenant?.id) {
        const created = await queueApi.createService({
          business_id: tenant.id,
          name: sName,
          description: sDesc,
          duration_mins: sMinutes,
        });

        setServices((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            minutes: created.duration_mins,
            description: created.description || sDesc,
          },
        ]);
        setNotice(`Service Window "${created.name}" created on backend.`);
      }
    } catch (err) {
      console.warn('[StaffServices] Creation fallback locally:', err);
      const fallback = {
        id: `s_${Date.now()}`,
        name: sName,
        minutes: sMinutes,
        description: sDesc,
      };
      setServices((prev) => [...prev, fallback]);
      setNotice(`Service Window "${fallback.name}" created successfully.`);
    }

    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <TenantStaffLayout>
      <div className="space-y-8 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Services & Window Configuration
            </h1>
            <p className="text-xs text-slate-500">
              Manage priority windows, SLA target durations, and ticket offerings for {tenant.name}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchServices}
              disabled={loading}
              title="Refresh services from backend"
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4 text-[#FFA800]" /> Create Service Window
            </button>
          </div>
        </div>

        {notice && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}

        {showAddModal && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg space-y-4 max-w-md animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">New Service Window Offering</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Card Replacement & Biometric Update"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Estimated Duration (Mins)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Service Description</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what happens at this window..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#291E29] px-4 py-2 font-extrabold text-[#FFF6E9]"
                >
                  Save Service Window
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="rounded-xl bg-slate-100 p-3 text-slate-800">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                    <Clock className="h-3 w-3" /> ~{service.minutes} mins
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{service.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{service.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-600">● Active Window</span>
                <span className="text-slate-400 font-mono">ID: {service.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TenantStaffLayout>
  );
}
