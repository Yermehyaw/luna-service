'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import {
  StaffAccount,
  StaffPrivilege,
} from '../../types/user';
import {
  getTenantStaff,
  saveTenantStaff,
  updateStaffPrivileges,
  addStaffAccount,
  toggleStaffStatus,
  deleteStaffAccount,
  ALL_PRIVILEGES,
} from '../../mock/staff';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Check,
  Plus,
  X,
  Trash2,
  UserX,
  ArrowRightLeft,
  Search,
  Filter,
  KeyRound,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

interface StaffPrivilegesManagerProps {
  tenantId: string;
  tenantName: string;
}

export function StaffPrivilegesManager({ tenantId, tenantName }: StaffPrivilegesManagerProps) {
  const { user, loginAsStaffMember } = useAuth();
  const [staffMembers, setStaffMembers] = useState<StaffAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'tenant_admin' | 'staff'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newRole, setNewRole] = useState<'tenant_admin' | 'staff'>('staff');
  const [newPrivileges, setNewPrivileges] = useState<StaffPrivilege[]>([
    'ops_console',
    'customer_directory',
  ]);

  // Load staff on mount
  useEffect(() => {
    setStaffMembers(getTenantStaff(tenantId));
  }, [tenantId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toggle privilege for a staff member
  const handleTogglePrivilege = (staff: StaffAccount, privId: StaffPrivilege) => {
    if (staff.role === 'tenant_admin') {
      showToast('Business Owners automatically retain all system privileges.');
      return;
    }

    const currentPrivs = staff.privileges || [];
    const hasPriv = currentPrivs.includes(privId);
    const updatedPrivs = hasPriv
      ? currentPrivs.filter((p) => p !== privId)
      : [...currentPrivs, privId];

    const updatedList = updateStaffPrivileges(tenantId, staff.id, updatedPrivs);
    setStaffMembers(updatedList);
    showToast(
      hasPriv
        ? `Revoked "${ALL_PRIVILEGES.find((p) => p.id === privId)?.shortLabel}" from ${staff.name}`
        : `Granted "${ALL_PRIVILEGES.find((p) => p.id === privId)?.shortLabel}" to ${staff.name}`
    );
  };

  // Toggle status (Active / Suspended)
  const handleToggleStatus = (staffId: string) => {
    const updated = toggleStaffStatus(tenantId, staffId);
    setStaffMembers(updated);
    showToast('Staff status updated.');
  };

  // Remove staff
  const handleDeleteStaff = (staffId: string, staffName: string) => {
    if (confirm(`Are you sure you want to delete the login for ${staffName}?`)) {
      const updated = deleteStaffAccount(tenantId, staffId);
      setStaffMembers(updated);
      showToast(`Removed login for ${staffName}.`);
    }
  };

  // Add new staff submit
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const colors = ['#831843', '#059669', '#2563EB', '#D97706', '#7C3AED', '#BE185D'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created = addStaffAccount(tenantId, {
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || undefined,
      designation: newDesignation.trim() || (newRole === 'tenant_admin' ? 'Co-Owner' : 'Staff Member'),
      role: newRole,
      tenantId,
      avatarColor: randomColor,
      status: 'active',
      privileges: newRole === 'tenant_admin'
        ? ['ops_console', 'customer_directory', 'approve_documents', 'manage_services', 'manage_branches', 'view_analytics', 'social_studio']
        : newPrivileges,
    });

    setStaffMembers(getTenantStaff(tenantId));
    setShowAddModal(false);
    // Reset form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewDesignation('');
    setNewRole('staff');
    setNewPrivileges(['ops_console', 'customer_directory']);
    showToast(`Staff login created successfully for ${created.name}!`);
  };

  // Toggle privilege in creation modal
  const toggleNewPrivilege = (priv: StaffPrivilege) => {
    setNewPrivileges((prev) =>
      prev.includes(priv) ? prev.filter((p) => p !== priv) : [...prev, priv]
    );
  };

  // Filtered staff list
  const filteredStaff = staffMembers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalMembers = staffMembers.length;
  const activeMembers = staffMembers.filter((s) => s.status === 'active').length;
  const staffCount = staffMembers.filter((s) => s.role === 'staff').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 rounded-2xl bg-[#291E29] text-white px-4 py-3 shadow-2xl border border-[#FFA800]/50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top">
          <CheckCircle2 className="h-4 w-4 text-[#FFA800] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Overview Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Total Logins
            </p>
            <p className="text-2xl font-extrabold text-[#291E29] mt-0.5">{totalMembers}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Active Staff
            </p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">{activeMembers}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Staff with Task Privileges
            </p>
            <p className="text-2xl font-extrabold text-[#831843] mt-0.5">{staffCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-[#831843]">
            <KeyRound className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Action Header & Filter Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-black/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#291E29]">
              Team Logins &amp; Task Privileges
            </h2>
            <p className="text-xs text-slate-500">
              Assign and manage staff logins. <strong>Click any privilege pill</strong> below to instantly grant or revoke task permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFF6E9] px-4 py-2.5 text-xs font-extrabold shadow-md hover:scale-102 active:scale-98 transition min-h-[44px]"
          >
            <UserPlus className="h-4 w-4 text-[#FFA800]" />
            <span>Add Staff Login</span>
          </button>
        </div>

        {/* Search & Role Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/15 text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] bg-[#FCFBF4]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'tenant_admin', 'staff'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[38px] ${
                  roleFilter === r
                    ? 'bg-[#291E29] text-white shadow-xs'
                    : 'bg-black/[0.04] text-slate-600 hover:bg-black/10'
                }`}
              >
                {r === 'all' ? 'All Accounts' : r === 'tenant_admin' ? 'Business Owners' : 'Staff Members'}
              </button>
            ))}
          </div>
        </div>

        {/* Privilege Legend / Guide */}
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              <strong>Tip:</strong> Click on any privilege badge below (e.g. <em>Ops Console</em>, <em>Doc Review</em>, <em>Services</em>) to toggle permissions in real-time.
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full shrink-0">
            Branding &amp; Settings is strictly reserved for Business Admin
          </span>
        </div>
      </div>

      {/* Staff Member Cards List */}
      <div className="space-y-3">
        {filteredStaff.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white border border-black/10">
            <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No staff accounts match your search.</p>
          </div>
        ) : (
          filteredStaff.map((staff) => {
            const isAccountOwner = staff.role === 'tenant_admin';
            const isCurrentUser = user?.id === staff.id || user?.email === staff.email;

            return (
              <div
                key={staff.id}
                className={`p-4 sm:p-5 rounded-3xl bg-white border transition-all ${
                  staff.status === 'suspended'
                    ? 'border-red-200 bg-red-50/20 opacity-70'
                    : 'border-black/10 hover:border-black/20 shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Staff Info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-base font-extrabold shrink-0 shadow-xs"
                      style={{ backgroundColor: staff.avatarColor || (isAccountOwner ? '#831843' : '#D97706') }}
                    >
                      {isAccountOwner ? '👑' : '👔'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-[#291E29] truncate">
                          {staff.name}
                        </h3>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            isAccountOwner
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                        >
                          {isAccountOwner ? 'Business Owner (Full Admin)' : 'Staff Member'}
                        </span>
                        {staff.status === 'suspended' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                            Suspended
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Currently Logged In
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-slate-400" />
                          {staff.designation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {staff.email}
                        </span>
                        {staff.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {staff.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Test Login & Status Toggle */}
                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => loginAsStaffMember(staff)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/15 bg-black/[0.03] hover:bg-[#FFA800] hover:text-[#291E29] hover:border-[#FFA800] text-xs font-extrabold text-[#291E29] transition min-h-[38px]"
                      title="Log in as this staff member to test their permissions"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      <span>{isCurrentUser ? 'Active Profile' : 'Test Log In'}</span>
                    </button>

                    {!isAccountOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(staff.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition min-h-[38px] ${
                            staff.status === 'active'
                              ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {staff.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(staff.id, staff.name)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Delete staff account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 🎯 CLICKABLE TASK PRIVILEGES ROW */}
                <div className="mt-4 pt-3 border-t border-black/10">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Operational Task Privileges ({staff.privileges?.length || 0} granted)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isAccountOwner ? 'All privileges automatically enabled' : 'Click to toggle privilege'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {ALL_PRIVILEGES.map((priv) => {
                      const isGranted = isAccountOwner || staff.privileges?.includes(priv.id);

                      return (
                        <button
                          key={priv.id}
                          type="button"
                          disabled={isAccountOwner}
                          onClick={() => handleTogglePrivilege(staff, priv.id)}
                          title={`${priv.label}: ${priv.description}`}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                            isGranted
                              ? isAccountOwner
                                ? 'bg-amber-100/70 text-amber-950 border border-amber-300 shadow-2xs'
                                : 'bg-[#291E29] text-white border border-[#291E29] hover:bg-[#341539] active:scale-95 shadow-xs'
                              : 'bg-black/[0.04] text-slate-500 border border-dashed border-black/15 hover:bg-black/[0.08] hover:text-[#291E29] active:scale-95'
                          }`}
                        >
                          {isGranted ? (
                            <Check className={`h-3.5 w-3.5 ${isAccountOwner ? 'text-amber-700' : 'text-[#FFA800]'}`} />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          <span>{priv.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#FCFBF4] text-[#291E29] shadow-2xl border border-black/10 p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#291E29]">
                    Create New Staff Login
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Add team member credentials and assign task privileges
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-[#291E29]">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chioma Obi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-black/15 bg-white text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-[#291E29]">Designation / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Stylist (Chair 3)"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-black/15 bg-white text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-[#291E29]">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="chioma@business.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-black/15 bg-white text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-[#291E29]">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+234 803 000 0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-black/15 bg-white text-xs text-[#291E29] focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-[#291E29]">Account Role</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewRole('staff')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition min-h-[44px] ${
                      newRole === 'staff'
                        ? 'border-[#291E29] bg-[#291E29] text-white shadow-xs'
                        : 'border-black/15 bg-white text-slate-700 hover:bg-black/5'
                    }`}
                  >
                    👔 Staff Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('tenant_admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition min-h-[44px] ${
                      newRole === 'tenant_admin'
                        ? 'border-[#291E29] bg-[#291E29] text-white shadow-xs'
                        : 'border-black/15 bg-white text-slate-700 hover:bg-black/5'
                    }`}
                  >
                    👑 Co-Owner / Admin
                  </button>
                </div>
              </div>

              {/* Privilege Checkboxes */}
              {newRole === 'staff' ? (
                <div className="space-y-1.5 pt-2 border-t border-black/10">
                  <label className="font-extrabold text-[#291E29] flex items-center justify-between">
                    <span>Assign Initial Task Privileges</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Click to toggle
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALL_PRIVILEGES.map((priv) => {
                      const checked = newPrivileges.includes(priv.id);
                      return (
                        <button
                          key={priv.id}
                          type="button"
                          onClick={() => toggleNewPrivilege(priv.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition min-h-[44px] ${
                            checked
                              ? 'border-[#291E29] bg-amber-50/70 text-[#291E29] font-bold'
                              : 'border-black/10 bg-white text-slate-600 hover:bg-black/5'
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-md flex items-center justify-center shrink-0 border ${
                              checked
                                ? 'bg-[#291E29] border-[#291E29] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {checked && <Check className="h-3 w-3 text-[#FFA800]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs truncate">{priv.label}</p>
                            <p className="text-[9px] text-slate-500 truncate">{priv.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Admin Access:</strong> Co-Owners and Admins will automatically have full permissions over all tasks, branding, settings, and staff management.
                </div>
              )}

              <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-black/5 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFF6E9] text-xs font-extrabold shadow-md min-h-[44px]"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
