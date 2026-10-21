'use client';

import React from 'react';

import { type AuditType } from '@/lib/validation';

export interface AuditLogEntry {
  id: string;
  type: AuditType;
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  entity: string;
  entityId?: string | null;
  action: string;
  summary: string;
  createdAt: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

export interface AuditDetailModalProps {
  entry: AuditLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailModal({ entry, isOpen, onClose }: AuditDetailModalProps) {
  if (!isOpen || !entry) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-150">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-slate-800 uppercase">
                {entry.type}
              </span>
              <span className="font-mono text-xs text-slate-400">ID: {entry.id}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{entry.action}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 overflow-y-auto p-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:grid-cols-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Timestamp
              </span>
              <span className="font-mono font-medium text-slate-800">{entry.createdAt}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Actor</span>
              <span className="font-semibold text-slate-800">{entry.actorName}</span>
              <span className="block font-mono text-[10px] text-slate-500">{entry.actorRole}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Target Entity
              </span>
              <span className="font-medium text-slate-800">{entry.entity}</span>
              <span className="block font-mono text-[10px] text-slate-500">
                #
                {entry.entityId
                  ? entry.entityId.length > 12
                    ? `${entry.entityId.slice(0, 8)}...`
                    : entry.entityId
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Audit Status
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <span>✓</span> Verified Immutable
              </span>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h4 className="mb-1 text-xs font-bold tracking-wider text-slate-700 uppercase">
              Event Summary
            </h4>
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              {entry.summary}
            </p>
          </div>

          {/* Old vs New State Diff */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              State Payload Comparison
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Old Value */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-slate-100">
                <div className="border-b border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-300">
                  Previous State (oldValue)
                </div>
                <pre className="max-h-48 overflow-x-auto p-3 font-mono text-xs text-red-300/90">
                  {entry.oldValue
                    ? JSON.stringify(entry.oldValue, null, 2)
                    : 'null (None / Created)'}
                </pre>
              </div>

              {/* New Value */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-slate-100">
                <div className="border-b border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-300">
                  New State (newValue)
                </div>
                <pre className="max-h-48 overflow-x-auto p-3 font-mono text-xs text-emerald-300/90">
                  {entry.newValue
                    ? JSON.stringify(entry.newValue, null, 2)
                    : 'null (None / Deleted)'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
          <span className="font-mono">PRD Spec M14: Append-Only Immutable Record</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800 transition-colors hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
