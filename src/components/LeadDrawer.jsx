import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MapPin, 
  Cpu, 
  Calendar, 
  Check, 
  Copy, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDateTime, formatRelativeTime } from '../utils/dateUtils';

/**
 * Slide-over / Modal Lead Dossier Drawer
 */
export default function LeadDrawer({ lead, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const handleCopyPhone = () => {
    if (lead.phone) {
      navigator.clipboard.writeText(lead.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-base">
              {lead.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {lead.fullName}
              </h2>
              <p className="text-xs text-slate-400">ID: {lead.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={lead.status} size="md" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Action Contact Bar */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Phone className="h-4 w-4" />
              <span>Call Lead</span>
            </a>
            <button
              onClick={handleCopyPhone}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Phone</span>
                </>
              )}
            </button>
          </div>

          {/* Lead Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Phone */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                Phone Number
              </span>
              <p className="text-sm font-semibold text-slate-100 font-mono">{lead.phone || 'N/A'}</p>
            </div>

            {/* Drip Sequence */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                Drip Campaign Stage
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                {lead.dripDay || 'Day 1'}
              </span>
            </div>

            {/* City & State */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                Location
              </span>
              <p className="text-sm font-semibold text-slate-100">
                {lead.City && lead.City !== 'N/A' ? lead.City : ''}{lead.City && lead.State ? ', ' : ''}{lead.State || 'N/A'}
              </p>
            </div>

            {/* Timestamp */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Logged Timestamp
              </span>
              <p className="text-sm font-semibold text-slate-100">{formatDateTime(lead.timestamp)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{formatRelativeTime(lead.timestamp)}</p>
            </div>

          </div>

          {/* Full Address */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              Street Address
            </span>
            <p className="text-sm font-medium text-slate-200">{lead.address || 'N/A'}</p>
          </div>

          {/* Usage / Interest */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <Cpu className="h-3.5 w-3.5 text-slate-500" />
              Usage & Hardware Requirement
            </span>
            <p className="text-sm font-semibold text-emerald-400">{lead.usage || 'N/A'}</p>
          </div>

          {/* Integration Schema Notice */}
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Ingested from Sheet 1 feed (Columns A-I mapped; Columns J & K excluded per security rules).</span>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-850">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
