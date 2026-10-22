'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TenantStaffLayout } from '../../../../../components/layouts/TenantStaffLayout';
import { useTenant } from '../../../../../lib/tenant-context';
import {
  ServiceItem,
  getTenantServices,
  saveTenantServices,
  addCustomService,
  deleteTenantService,
  updateTenantService,
  SERVICE_IMAGE_PRESETS,
} from '../../../../../mock/services';
import {
  Briefcase,
  Plus,
  Clock,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Calendar,
  Sun,
  Sunrise,
  Sunset,
  Camera,
  Tag,
  DollarSign,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  Check,
  X,
  AlertCircle,
  Upload,
} from 'lucide-react';
import Link from 'next/link';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StaffServicesPage() {
  const { tenant } = useTenant();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for adding/editing a custom service
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [price, setPrice] = useState('');
  const [station, setStation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [timeOfDay, setTimeOfDay] = useState<('Morning' | 'Afternoon' | 'Evening')[]>(['Morning', 'Afternoon']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [requiresImageUpload, setRequiresImageUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load services for this tenant
  const loadServices = useCallback(() => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const list = getTenantServices(tenant.id);
      setServices(list);
    } catch (err) {
      console.warn('[StaffServices] Error loading services:', err);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Industry-specific image presets
  const imagePresets = useMemo(() => {
    return (
      SERVICE_IMAGE_PRESETS[tenant.industry] ||
      SERVICE_IMAGE_PRESETS['default'] ||
      []
    );
  }, [tenant.industry]);

  // Pre-fill defaults based on industry when opening modal
  const handleOpenAddModal = () => {
    setName('');
    setDescription('');
    setMinutes(tenant.businessScale === 'sme' ? 45 : 15);
    setPrice(tenant.businessScale === 'sme' ? '₦15,000' : 'Standard Rate');
    setStation(
      tenant.businessScale === 'sme'
        ? tenant.industry === 'salon_beauty'
          ? 'Chair 3 · Custom Station'
          : tenant.industry === 'auto_repair'
          ? 'Bay 3 · Specialist Lift'
          : 'Chef Station A'
        : 'Counter 3 · Priority Window'
    );
    setCategory(
      tenant.industry === 'salon_beauty'
        ? 'Hair Styling'
        : tenant.industry === 'auto_repair'
        ? 'Mechanical Service'
        : 'Specialty Offer'
    );
    setImageUrl(imagePresets[0]?.url || '');
    setAvailableDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    setTimeOfDay(['Morning', 'Afternoon']);
    setStartTime('09:00');
    setEndTime('18:00');
    setRequiresImageUpload(tenant.businessScale === 'sme');
    setShowAddModal(true);
  };

  // Handle local image file upload (convert to Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle day selection
  const handleToggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Toggle time of day selection
  const handleToggleTimeOfDay = (slot: 'Morning' | 'Afternoon' | 'Evening') => {
    setTimeOfDay((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Create custom service
  const handleCreateCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tenant?.id) return;
    setIsSubmitting(true);

    try {
      const newService = addCustomService(tenant.id, {
        name: name.trim(),
        category: category.trim() || 'General Service',
        minutes: Number(minutes) || 30,
        price: price.trim() || 'Fixed Rate',
        station: station.trim() || `${tenant.branding?.serviceUnitName || 'Window'} 1`,
        description: description.trim() || 'Full customized service window with prioritized scheduling.',
        imageUrl: imageUrl.trim() || imagePresets[0]?.url,
        availableDays: availableDays.length > 0 ? availableDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        timeOfDay: timeOfDay.length > 0 ? timeOfDay : ['Morning', 'Afternoon'],
        startTime,
        endTime,
        requiresImageUpload,
        isActive: true,
      });

      setServices((prev) => [newService, ...prev]);
      setShowAddModal(false);
      setNotice(`Custom service "${newService.name}" created and published to customer booking!`);
    } catch (err) {
      console.error('[StaffServices] Failed to create custom service:', err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotice(null), 4500);
    }
  };

  // Delete service
  const handleDeleteService = (serviceId: string, serviceName: string) => {
    if (!tenant?.id) return;
    if (confirm(`Are you sure you want to remove "${serviceName}" from your services menu?`)) {
      deleteTenantService(tenant.id, serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      setNotice(`Service "${serviceName}" was removed.`);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  // Toggle active status
  const handleToggleActive = (serviceId: string) => {
    if (!tenant?.id) return;
    const target = services.find((s) => s.id === serviceId);
    if (!target) return;

    const nextActive = target.isActive === false ? true : false;
    updateTenantService(tenant.id, serviceId, { isActive: nextActive });
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: nextActive } : s))
    );
    setNotice(`Service "${target.name}" status updated to ${nextActive ? 'Active' : 'Paused'}.`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory =
        selectedCategory === 'all' || s.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.station && s.station.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Metrics
  const totalCount = services.length;
  const imageCount = services.filter((s) => Boolean(s.imageUrl)).length;
  const photoRequiredCount = services.filter((s) => s.requiresImageUpload).length;
  const avgMinutes = totalCount
    ? Math.round(services.reduce((acc, s) => acc + s.minutes, 0) / totalCount)
    : 0;

  return (
    <TenantStaffLayout>
      <div className="space-y-6 sm:space-y-8 font-sans selection:bg-[#FFA800] selection:text-[#291E29]">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#291E29]/10 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-extrabold text-[#291E29]">
                {tenant.businessScale === 'sme'
                  ? 'Services, Menu & Custom Booking'
                  : 'Service Windows & SLA Operations'}
              </h1>
              <span className="rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 border border-amber-300">
                {totalCount} Services
              </span>
            </div>
            <p className="text-xs text-[#291E29]/70 mt-1 max-w-2xl leading-relaxed">
              Configure custom services with lookbook photo uploads, weekly calendar availability, and morning/afternoon time-of-day slots for{' '}
              <strong>{tenant.name}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/tenant/${tenant.slug}/book-queue`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 min-h-[44px]"
            >
              <span>View Booking Portal</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#FFA800]" />
            </Link>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-xl bg-[#291E29] px-4 py-2.5 text-xs font-extrabold text-[#FFF6E9] shadow-md hover:bg-[#341539] transition-transform hover:scale-105 min-h-[44px]"
            >
              <Plus className="h-4 w-4 text-[#FFA800]" />
              <span>Add Custom Service</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {notice && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* KPI Strip: "Push More for Service" */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Total Offerings</span>
              <Briefcase className="h-4 w-4 text-[#FFA800]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalCount} Services</div>
            <p className="text-[11px] text-emerald-600 font-semibold">● Active in client intake</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Visual Lookbook Photos</span>
              <ImageIcon className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{imageCount} Illustrated</div>
            <p className="text-[11px] text-slate-500">Increases booking conversion by 48%</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Avg Appointment Time</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{avgMinutes} Mins</div>
            <p className="text-[11px] text-slate-500">Paced for zero-waiting turnaround</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Client Photo Intake</span>
              <Camera className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{photoRequiredCount} Enabled</div>
            <p className="text-[11px] text-purple-600 font-semibold">Pre-clear lookbook on phone</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Services ({totalCount})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search service name, chair, or bay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[38px] w-full sm:w-64"
          />
        </div>

        {/* Services Showcase Cards */}
        {filteredServices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
            <Briefcase className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800">No Services Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No service matched your current search or category filter. Try clearing filters or create a new custom service.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#291E29] px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              <Plus className="h-4 w-4 text-[#FFA800]" /> Add Custom Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between ${
                  service.isActive === false
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200 hover:border-[#FFA800]'
                }`}
              >
                <div>
                  {/* Service Image Banner with Badges */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-amber-900">
                        <ImageIcon className="h-8 w-8 text-amber-500 mb-1" />
                        <span className="text-xs font-bold">No Custom Image</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Price Tag Overlay */}
                    <span className="absolute top-3 right-3 rounded-xl bg-[#291E29]/90 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-extrabold text-[#FFA800] shadow-md">
                      {service.price || 'Fixed Rate'}
                    </span>

                    {/* Category Pill */}
                    {service.category && (
                      <span className="absolute top-3 left-3 rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        {service.category}
                      </span>
                    )}

                    {/* Station & Duration at Bottom of Image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold text-[11px] truncate text-white/90">
                        📍 {service.station || 'General Window'}
                      </span>
                      <span className="rounded-md bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#FFA800]" /> ~{service.minutes} mins
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                    </div>

                    {/* Operational Badges: Calendar & Time of Day */}
                    <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px]">
                      {/* Active Days */}
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="font-medium text-slate-500">Days:</span>
                        <div className="flex flex-wrap gap-1">
                          {(service.availableDays || ALL_DAYS.slice(0, 5)).map((d) => (
                            <span
                              key={d}
                              className="px-1.5 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Time of Day Slots */}
                      <div className="flex items-center gap-2 text-slate-600">
                        <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium text-slate-500">Slots:</span>
                        <div className="flex flex-wrap gap-1">
                          {(service.timeOfDay || ['Morning', 'Afternoon']).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/60 font-bold text-[10px] text-amber-900 flex items-center gap-1"
                            >
                              {t === 'Morning' && <Sunrise className="h-2.5 w-2.5 text-amber-600" />}
                              {t === 'Afternoon' && <Sun className="h-2.5 w-2.5 text-orange-500" />}
                              {t === 'Evening' && <Sunset className="h-2.5 w-2.5 text-purple-600" />}
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Photo Intake Requirement */}
                      {service.requiresImageUpload && (
                        <div className="flex items-center gap-1.5 text-purple-700 font-bold bg-purple-50 border border-purple-200/60 p-2 rounded-xl">
                          <Camera className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          <span>📸 Client style lookbook / fault photo enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(service.id)}
                    className={`flex items-center gap-1.5 font-bold px-2.5 py-1.5 rounded-xl transition ${
                      service.isActive === false
                        ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        service.isActive === false ? 'bg-slate-400' : 'bg-emerald-500'
                      }`}
                    />
                    <span>{service.isActive === false ? 'Paused' : 'Active'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tenant/${tenant.slug}/book-queue?service=${service.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold"
                    >
                      Preview Booking
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.id, service.name)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL: ADD CUSTOM SERVICE WITH IMAGE UPLOAD, CALENDAR, TIME OF DAY */}
        {/* =================================================================== */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#FFA800]" />
                    Create Custom Service Offering
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure service visuals, pricing, assigned station, weekly calendar availability, and time slots.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCustomService} className="space-y-4 text-xs">
                {/* 1. Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700">Service Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VIP Silk Press & Scalp Steam"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Category / Group Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Hair Treatments, Express Bays, Tasting"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                    />
                  </div>
                </div>

                {/* 2. Price, Duration & Station */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700">Price Tag *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₦18,000 or $45"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Estimated Mins *</label>
                    <input
                      type="number"
                      min="1"
                      max="360"
                      required
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Assigned Station / Chair</label>
                    <input
                      type="text"
                      placeholder="e.g. Chair 1, Bay 2, Desk 4"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800] min-h-[44px]"
                    />
                  </div>
                </div>

                {/* 3. Description */}
                <div>
                  <label className="font-bold text-slate-700">Service Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what customers receive and prepare for this service..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                </div>

                {/* 4. IMAGE UPLOADS & LOOKBOOK PRESETS */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#FFA800]" /> Service Image / Lookbook Photo
                    </label>
                    <span className="text-[11px] text-slate-500">Upload custom file or pick preset</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Image Preview Box */}
                    <div className="relative h-24 w-36 rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shrink-0 shadow-inner">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 min-h-[40px] shadow-xs">
                          <Upload className="h-3.5 w-3.5 text-[#FFA800]" />
                          <span>Upload From Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        {imageUrl && (
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* 1-Click Preset Gallery */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          Or pick a curated {tenant.industry.replace('_', ' ')} photo:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {imagePresets.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setImageUrl(preset.url)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition ${
                                imageUrl === preset.url
                                  ? 'bg-[#291E29] text-white border-[#291E29]'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. CALENDAR AVAILABILITY */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-blue-600" /> Weekly Calendar Availability
                    </label>
                    <div className="flex gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setAvailableDays(ALL_DAYS)}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        All Week
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setAvailableDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        Weekdays Only
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ALL_DAYS.map((day) => {
                      const isSelected = availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`flex-1 min-w-[50px] py-2 rounded-xl text-xs font-bold border transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. TIME OF DAY SLOTS */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-amber-500" /> Time of Day Operational Slots
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'Morning', label: 'Morning', icon: Sunrise, range: '08:00 - 12:00' },
                        { id: 'Afternoon', label: 'Afternoon', icon: Sun, range: '12:00 - 16:00' },
                        { id: 'Evening', label: 'Evening', icon: Sunset, range: '16:00 - 20:00' },
                      ] as const
                    ).map((slot) => {
                      const Icon = slot.icon;
                      const isSelected = timeOfDay.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleToggleTimeOfDay(slot.id)}
                          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className="h-4 w-4 text-amber-600" />
                            {isSelected && <Check className="h-3.5 w-3.5 text-amber-800" />}
                          </div>
                          <div className="mt-2">
                            <span className="block text-xs font-bold">{slot.label}</span>
                            <span className="text-[10px] text-slate-500">{slot.range}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Operational Operating Window Inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">
                        Earliest Window
                      </span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">
                        Latest Window
                      </span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. Client Photo Intake Requirement Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50 border border-purple-200/80">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-purple-600" /> Require Customer Style / Reference Photo
                    </span>
                    <p className="text-[11px] text-purple-700">
                      Prompts clients to upload their hair style lookbook, car fault photo, or reference file when booking.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requiresImageUpload}
                    onChange={(e) => setRequiresImageUpload(e.target.checked)}
                    className="h-5 w-5 rounded-lg text-[#FFA800] focus:ring-[#FFA800] border-slate-300"
                  />
                </div>

                {/* Submit / Cancel Footer */}
                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-[#291E29] px-6 py-2.5 text-xs font-extrabold text-[#FFF6E9] shadow-md hover:bg-[#341539] transition-transform hover:scale-105 min-h-[44px]"
                  >
                    Publish Custom Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TenantStaffLayout>
  );
}
