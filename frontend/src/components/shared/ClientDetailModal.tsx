'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { SentimentBadge } from './SentimentBadge';
import { CommentSentiment, classifySentiment } from '../../types/feedback';
import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Ticket,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  Award,
  MessageSquare,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  XCircle,
  FileCheck,
  FileWarning,
  Eye,
  Filter,
  Lock,
} from 'lucide-react';

export interface ClientTicketHistory {
  id: string;
  date: string;
  service: string;
  specialist: string;
  status: 'Completed' | 'In Progress' | 'Skipped' | 'Priority Window';
  durationMins: number;
  waitTimeMins: number;
}

export interface ClientNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  fileSize: string;
  uploadedAt: string;
  status: 'Pending' | 'Approved' | 'Declined';
  previewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarColor?: string;
  tier: 'VIP Diamond' | 'Gold Regular' | 'Frequent Client' | 'New Client';
  visits: number;
  totalSpend?: string;
  avgServiceDuration?: string;
  onTimeScore: number;
  lastVisit: string;
  memberSince: string;
  preferences: string[];
  notes: ClientNote[];
  history: ClientTicketHistory[];
  documents?: ClientDocument[];
  review?: {
    rating: number;
    comment: string;
    date: string;
    sentiment?: CommentSentiment;
    waitMin?: number;
    serviceName?: string;
  };
}

interface ClientDetailModalProps {
  client: ClientData | null;
  onClose: () => void;
  onIssueTicket?: (client: ClientData) => void;
  businessScale?: 'sme' | 'enterprise';
  serviceUnitName?: string;
}

export function ClientDetailModal({
  client,
  onClose,
  onIssueTicket,
  businessScale = 'sme',
  serviceUnitName = 'Window / Chair',
}: ClientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'history' | 'notes'>('profile');
  const [docFilter, setDocFilter] = useState<'all' | 'Pending' | 'Approved' | 'Declined'>('all');
  const [newNoteText, setNewNoteText] = useState('');
  const [clientNotes, setClientNotes] = useState<ClientNote[]>(client?.notes || []);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { user, hasPrivilege } = useAuth();
  const canApproveDocs = hasPrivilege('approve_documents');

  // Initialize documents state with rich data tailored to business scale
  const defaultDocsForClient = (c: ClientData): ClientDocument[] => {
    if (c.documents && c.documents.length > 0) return c.documents;
    const isSme = businessScale === 'sme';
    return [
      {
        id: `doc_${c.id}_1`,
        name: isSme ? 'Government ID / Mobile Verification' : 'Government Photo Passport / KYC',
        type: 'Identity Proof',
        fileSize: '2.4 MB PDF',
        uploadedAt: 'Today at 09:15 AM',
        status: 'Pending',
        previewNote: 'Verified national identity credentials matching client phone number.',
      },
      {
        id: `doc_${c.id}_2`,
        name: isSme ? 'Service Lookbook & Style Reference Photo' : 'Utility Bill & Proof of Address',
        type: isSme ? 'Service Request' : 'Proof of Residence',
        fileSize: '4.8 MB JPG',
        uploadedAt: 'Yesterday at 4:20 PM',
        status: 'Approved',
        previewNote: isSme ? 'Selected custom braided style from salon portfolio.' : 'Recent utility invoice matching residential address.',
        reviewedBy: 'Staff Officer',
        reviewedAt: 'Yesterday',
      },
      {
        id: `doc_${c.id}_3`,
        name: isSme ? 'Allergy & Hair Sensitivity Intake Form' : 'Corporate Account Mandate / Referral',
        type: isSme ? 'Client Health Form' : 'Corporate Mandate',
        fileSize: '1.2 MB PDF',
        uploadedAt: '3 days ago',
        status: 'Declined',
        previewNote: 'Signature was missing on Section B. Customer asked to re-sign upon arrival.',
        reviewedBy: 'Manager',
        reviewedAt: '2 days ago',
      },
    ];
  };

  const [documents, setDocuments] = useState<ClientDocument[]>([]);

  useEffect(() => {
    if (client) {
      setDocuments(defaultDocsForClient(client));
      setClientNotes(client.notes || []);
      setDocFilter('all');
    }
  }, [client, businessScale]);

  if (!client) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApproveDocument = (docId: string) => {
    if (!canApproveDocs) {
      showToast('🔒 Action Restricted: Staff account requires "Approve KYC Docs" privilege.');
      return;
    }
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, status: 'Approved', reviewedBy: user?.name || 'Staff Officer', reviewedAt: 'Just now' }
          : d
      )
    );
    const doc = documents.find((d) => d.id === docId);
    showToast(`✓ Document "${doc?.name || 'File'}" Approved.`);
  };

  const handleDeclineDocument = (docId: string) => {
    if (!canApproveDocs) {
      showToast('🔒 Action Restricted: Staff account requires "Approve KYC Docs" privilege.');
      return;
    }
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, status: 'Declined', reviewedBy: user?.name || 'Staff Officer', reviewedAt: 'Just now' }
          : d
      )
    );
    const doc = documents.find((d) => d.id === docId);
    showToast(`✕ Document "${doc?.name || 'File'}" Declined.`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: ClientNote = {
      id: `note_${Date.now()}`,
      author: 'Business Owner',
      text: newNoteText.trim(),
      timestamp: 'Just now',
    };

    setClientNotes([newNote, ...clientNotes]);
    setNewNoteText('');
    showToast('Private client note saved.');
  };

  const getTierBadge = (tier: ClientData['tier']) => {
    switch (tier) {
      case 'VIP Diamond':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Gold Regular':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Frequent Client':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const pendingDocsCount = documents.filter((d) => d.status === 'Pending').length;
  const approvedDocsCount = documents.filter((d) => d.status === 'Approved').length;
  const declinedDocsCount = documents.filter((d) => d.status === 'Declined').length;

  const filteredDocs =
    docFilter === 'all'
      ? documents
      : documents.filter((d) => d.status === docFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 rounded-2xl bg-[#291E29] text-white px-4 py-3 shadow-2xl border border-[#FFA800]/40 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top">
          <CheckCircle2 className="h-4 w-4 text-[#FFA800] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl bg-[#FCFBF4] text-[#291E29] shadow-2xl border border-black/10 flex flex-col overflow-hidden font-sans">
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-6 border-b border-black/10 bg-white/90 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0"
              style={{ backgroundColor: client.avatarColor || '#291E29' }}
            >
              {client.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-[#291E29] truncate">
                  {client.name}
                </h2>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getTierBadge(
                    client.tier
                  )}`}
                >
                  {client.tier}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                Client #{client.id} · Member since {client.memberSince} · {businessScale === 'sme' ? 'Small Business Storefront' : 'Enterprise Customer'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-black/5 transition"
            aria-label="Close client file"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 🌟 1. BIG TIMED PORTAL REVIEW (PLACED PROMINENTLY AT THE TOP) WITH SENTIMENT CATEGORIZATION */}
        {(() => {
          const reviewSentiment: CommentSentiment =
            client.review?.sentiment ||
            (client.review?.rating ? classifySentiment(client.review.rating) : 'positive');

          const sentimentBg =
            reviewSentiment === 'positive'
              ? 'bg-gradient-to-r from-emerald-50/80 via-amber-50/40 to-emerald-50/70 border-2 border-emerald-300'
              : reviewSentiment === 'neutral'
              ? 'bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/80 border-2 border-amber-300'
              : 'bg-gradient-to-r from-rose-50/90 via-orange-50/40 to-rose-50/80 border-2 border-rose-300';

          return (
            <div className={`mx-4 sm:mx-6 mt-4 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3 ${sentimentBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 rounded-xl bg-amber-400/30 text-amber-900 items-center justify-center shrink-0 shadow-xs">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-600" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
                        Customer Timed Portal Review &amp; SLA Rating
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i <= Math.round(client.review?.rating || 5)
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-base font-extrabold text-[#291E29]">
                        {(client.review?.rating || 5.0).toFixed(1)} / 5.0
                      </span>
                      {/* 🏷️ CATEGORIZED COMMENT SENTIMENT BADGE */}
                      <SentimentBadge sentiment={reviewSentiment} size="md" showEmoji />
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        Verified Timed Arrival Pass
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs self-start sm:self-auto pt-1 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Door-to-Service Window</span>
                    <span className="font-extrabold text-emerald-700">
                      ~{client.history[0]?.waitTimeMins || 1.8} mins (On-Time SLA: {client.onTimeScore}%)
                    </span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <span className="text-[11px] text-slate-500 font-semibold">{client.review?.date || client.lastVisit}</span>
                </div>
              </div>

              <div>
                <p className="text-sm sm:text-base font-medium text-slate-800 italic leading-relaxed">
                  &ldquo;{client.review?.comment || 'Exceptional fast-track arrival. Queue calling was instant and saved my entire schedule today!'}&rdquo;
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#291E29]">— {client.name}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Zero lobby wait confirmed ({client.history[0]?.service || 'Service Window'})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Category: <strong className="text-[#291E29] capitalize">{reviewSentiment} Feedback</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab Controls */}
        <div className="flex items-center border-b border-black/10 px-4 sm:px-6 bg-slate-50 text-xs font-bold mt-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[44px] ${
              activeTab === 'profile'
                ? 'border-[#FFA800] text-[#291E29] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-[#291E29]'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Profile &amp; Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[44px] ${
              activeTab === 'documents'
                ? 'border-[#FFA800] text-[#291E29] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-[#291E29]'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Documents ({documents.length})</span>
            {pendingDocsCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2">
                {pendingDocsCount} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[44px] ${
              activeTab === 'history'
                ? 'border-[#FFA800] text-[#291E29] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-[#291E29]'
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>Ticket History ({client.history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[44px] ${
              activeTab === 'notes'
                ? 'border-[#FFA800] text-[#291E29] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-[#291E29]'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Staff Notes ({clientNotes.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* TAB 1: PROFILE & PREFERENCES */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Quick Contact & Action Bar */}
              <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-white border border-black/10">
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#FFA800]/20 hover:text-[#291E29] text-slate-700 font-bold transition min-h-[40px]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#FFA800]" />
                  <span>{client.phone}</span>
                </a>

                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#FFA800]/20 hover:text-[#291E29] text-slate-700 font-bold transition min-h-[40px]"
                >
                  <Mail className="h-3.5 w-3.5 text-[#FFA800]" />
                  <span className="truncate max-w-[160px] sm:max-w-none">{client.email}</span>
                </a>

                <button
                  type="button"
                  onClick={() => showToast(`Sent SMS window reminder to ${client.phone}`)}
                  className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFF6E9] font-bold transition min-h-[40px]"
                >
                  <Send className="h-3 w-3 text-[#FFA800]" />
                  <span>Send SMS Reminder</span>
                </button>
              </div>

              {/* Quick Document Status Action Callout on Profile */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#FFA800]" />
                    <h3 className="font-extrabold text-sm text-[#291E29]">
                      Customer Documents &amp; Verification Status
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className="text-xs font-bold text-[#FFA800] hover:underline"
                  >
                    View All ({documents.length}) &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {documents.slice(0, 2).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-black/10 bg-slate-50/70"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                          <span className="font-bold text-slate-900 truncate">{doc.name}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              doc.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : doc.status === 'Declined'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{doc.previewNote}</p>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApproveDocument(doc.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition min-h-[36px] ${
                            doc.status === 'Approved'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineDocument(doc.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition min-h-[36px] ${
                            doc.status === 'Declined'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifetime Metrics Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-white border border-black/10">
                  <span className="text-slate-400 font-semibold block text-[11px]">Total Visits</span>
                  <span className="text-lg font-extrabold text-[#291E29]">{client.visits} Tickets</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/10">
                  <span className="text-slate-400 font-semibold block text-[11px]">Lifetime Value</span>
                  <span className="text-lg font-extrabold text-[#702D7B]">
                    {client.totalSpend || (businessScale === 'sme' ? '₦125,000' : '$24,000')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/10">
                  <span className="text-slate-400 font-semibold block text-[11px]">Avg Service Time</span>
                  <span className="text-lg font-extrabold text-emerald-700">
                    {client.avgServiceDuration || '20 mins'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/10">
                  <span className="text-slate-400 font-semibold block text-[11px]">Arrival Punctuality</span>
                  <span className="text-lg font-extrabold text-blue-700">{client.onTimeScore}%</span>
                </div>
              </div>

              {/* Client Custom Preferences Box */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FFA800]" />
                  <h3 className="font-extrabold text-sm text-[#291E29]">
                    Client Preferences &amp; Special Requests
                  </h3>
                </div>

                <div className="space-y-1.5">
                  {client.preferences.map((pref, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50 text-slate-800"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#FFA800] shrink-0 mt-0.5" />
                      <span>{pref}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 📄 TAB 2: DOCUMENTS & VERIFICATION (APPROVE / DECLINE) */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-[#291E29]">
                    Customer Documents &amp; Pre-Clearance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review and verify documents submitted by {client.name}. Approve or decline each document to clear their arrival pass.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDocFilter('all')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      docFilter === 'all'
                        ? 'bg-[#291E29] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({documents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocFilter('Pending')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      docFilter === 'Pending'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Pending ({pendingDocsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocFilter('Approved')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      docFilter === 'Approved'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Approved ({approvedDocsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocFilter('Declined')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      docFilter === 'Declined'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Declined ({declinedDocsCount})
                  </button>
                </div>
              </div>

              {/* Documents List with Approve / Decline Buttons */}
              <div className="space-y-3">
                {filteredDocs.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-black/10 text-slate-400">
                    No documents found matching &ldquo;{docFilter}&rdquo;.
                  </div>
                ) : (
                  filteredDocs.map((doc) => {
                    const isPending = doc.status === 'Pending';
                    const isApproved = doc.status === 'Approved';
                    const isDeclined = doc.status === 'Declined';

                    return (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border bg-white transition-all shadow-xs ${
                          isPending
                            ? 'border-amber-300 ring-2 ring-amber-200/50'
                            : isApproved
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-rose-200 bg-rose-50/20'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-[#291E29]">{doc.name}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                {doc.type}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : isDeclined
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                {isPending ? '⏳ Pending Review' : isApproved ? '✓ Approved' : '✕ Declined'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              {doc.previewNote || 'Customer submitted digital document for arrival verification.'}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                              <span>Uploaded: <strong className="text-slate-600">{doc.uploadedAt}</strong></span>
                              <span>·</span>
                              <span>Size: <strong className="text-slate-600">{doc.fileSize}</strong></span>
                              {doc.reviewedBy && (
                                <>
                                  <span>·</span>
                                  <span>Decision by <strong className="text-slate-600">{doc.reviewedBy}</strong> ({doc.reviewedAt})</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Interactive Approve / Decline Controls */}
                          <div className="flex items-center gap-2 pt-2 sm:pt-0 self-stretch sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleApproveDocument(doc.id)}
                              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs min-h-[44px] ${
                                isApproved
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white'
                              }`}
                            >
                              <Check className="h-4 w-4" />
                              <span>{isApproved ? 'Approved ✓' : 'Approve'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeclineDocument(doc.id)}
                              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs min-h-[44px] ${
                                isDeclined
                                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                                  : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-600 hover:text-white'
                              }`}
                            >
                              <X className="h-4 w-4" />
                              <span>{isDeclined ? 'Declined ✕' : 'Decline'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TICKET & SERVICE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#291E29]">
                  Past Service Visits &amp; Arrival Records
                </h3>
                <span className="text-slate-400 text-[11px]">Chronological</span>
              </div>

              <div className="space-y-2">
                {client.history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl border border-black/10 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#FFA800]/40 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-md bg-[#291E29] text-[#FFA800]">
                          {h.id}
                        </span>
                        <h4 className="font-bold text-[#291E29] truncate">{h.service}</h4>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Served at: <span className="font-semibold text-slate-700">{h.specialist}</span> ·{' '}
                        {h.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-right self-start sm:self-auto shrink-0">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Wait: {h.waitTimeMins}m</span>
                        <span className="text-[10px] text-slate-400 block">Duration: {h.durationMins}m</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {h.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRIVATE STAFF NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="font-bold text-xs text-[#291E29] block">
                  Add Private Staff / Owner Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="e.g. VIP client, preferred service specialist, or special requests..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#291E29] hover:bg-[#341539] text-[#FFA800] font-bold text-xs flex items-center gap-1.5 transition shrink-0 min-h-[44px]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Note Feed */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                  Existing Notes
                </h4>
                {clientNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl border border-black/10 bg-white space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#702D7B]">{note.author}</span>
                      <span className="text-slate-400">{note.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer with Direct Actions */}
        <div className="p-4 sm:p-5 border-t border-black/10 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-slate-500 text-[11px] text-center sm:text-left">
            Last arrival: <strong className="text-slate-800">{client.lastVisit}</strong> · Documents: <strong className="text-emerald-700">{approvedDocsCount} Approved</strong>, <strong className="text-amber-600">{pendingDocsCount} Pending</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-black/15 text-slate-700 hover:bg-slate-100 font-bold transition text-center min-h-[44px]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                if (onIssueTicket) {
                  onIssueTicket(client);
                }
                showToast(`Issued priority queue ticket for ${client.name}!`);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FFA800] hover:bg-[#FFB11A] text-[#291E29] font-extrabold shadow-sm transition min-h-[44px]"
            >
              <Ticket className="h-4 w-4" />
              <span>Issue Walk-in Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
