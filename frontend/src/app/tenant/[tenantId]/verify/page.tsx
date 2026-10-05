'use client';

import React, { useState, use } from 'react';
import { getTenantBySlug } from '../../../../lib/tenant';
import { TenantCustomerLayout } from '../../../../components/layouts/TenantCustomerLayout';
import { ShieldCheck, Upload, FileText, CheckCircle2 } from 'lucide-react';

export default function VerifyPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const [tenant, setTenant] = useState<any>(null);
  const [docName, setDocName] = useState('');
  const [uploaded, setUploaded] = useState(false);

  React.useEffect(() => {
    getTenantBySlug(resolvedParams.tenantId).then((res) => setTenant(res));
  }, [resolvedParams.tenantId]);

  if (!tenant) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading document verification engine...</div>;
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploaded(true);
  };

  return (
    <TenantCustomerLayout initialTenant={tenant}>
      <div className="mx-auto max-w-xl py-12 px-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-slate-900">Document Home Pre-Clearance</h1>
          <p className="text-xs text-slate-500">Upload your ID & paperwork online before arriving at {tenant.name} to bypass counter verification checks.</p>
        </div>

        {uploaded ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center space-y-3 shadow-md">
            <div className="flex justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Paperwork Pre-Cleared Successfully</h3>
            <p className="text-xs text-slate-500">Reference: <span className="font-mono font-bold text-slate-800">DOC-{Date.now().toString().slice(-6)}</span></p>
            <p className="text-xs text-emerald-700 font-semibold">Show this reference code to the desk staff for fast-track service.</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Document Type / Reference</label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. National ID / Account Opening Form"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-slate-800"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2 bg-slate-50">
              <Upload className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">Drop PDF or Image File Here</p>
              <p className="text-[11px] text-slate-400">Supports PNG, JPG, PDF up to 10MB</p>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Submit Document Pre-Clearance</span>
            </button>
          </form>
        )}
      </div>
    </TenantCustomerLayout>
  );
}
