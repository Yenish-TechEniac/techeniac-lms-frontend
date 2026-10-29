'use client';

import React, { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Code, H3, H4, Span } from '@/components/ui/Typography';
import type { ApiAuditItem } from '@/lib/validation';

export interface AuditDetailModalProps {
  entry: ApiAuditItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailModal({ entry, isOpen, onClose }: AuditDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const actorDisplay = entry.actor
    ? `${entry.actor.name} (${entry.actor.role})`
    : entry.actorId
      ? `User ${entry.actorId.slice(0, 8)}...`
      : 'System / Anonymous';

  const formattedDate = new Date(entry.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs duration-150"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-slate-800 uppercase">
                {entry.type}
              </Span>
              <Span className="font-mono text-xs text-slate-400">ID: {entry.id}</Span>
            </div>
            <H3 id="audit-modal-title" className="text-lg font-bold text-slate-900">
              {entry.action}
            </H3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </Button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 overflow-y-auto p-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:grid-cols-4">
            <div>
              <Span className="block text-[10px] font-bold text-slate-400 uppercase">
                Timestamp (IST)
              </Span>
              <Span className="font-mono font-medium text-slate-800">{formattedDate}</Span>
            </div>
            <div>
              <Span className="block text-[10px] font-bold text-slate-400 uppercase">Actor</Span>
              <Span className="font-semibold text-slate-800">{actorDisplay}</Span>
            </div>
            <div>
              <Span className="block text-[10px] font-bold text-slate-400 uppercase">
                Target Entity
              </Span>
              <Span className="font-medium text-slate-800">{entry.entity}</Span>
              <Span className="block font-mono text-[10px] text-slate-500">
                #
                {entry.entityId
                  ? entry.entityId.length > 12
                    ? `${entry.entityId.slice(0, 8)}...`
                    : entry.entityId
                  : 'N/A'}
              </Span>
            </div>
            <div>
              <Span className="block text-[10px] font-bold text-slate-400 uppercase">
                Audit Status
              </Span>
              <Span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Span>✓</Span> Verified Immutable
              </Span>
            </div>
          </div>

          {/* Old vs New State Diff */}
          <div className="space-y-2">
            <H4 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              State Payload Comparison
            </H4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Old Value */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-slate-100">
                <div className="border-b border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-300">
                  Previous State (oldValue)
                </div>
                <Code className="block max-h-56 overflow-x-auto p-3 font-mono text-xs whitespace-pre text-red-300/90">
                  {entry.oldValue
                    ? JSON.stringify(entry.oldValue, null, 2)
                    : 'null (None / Created)'}
                </Code>
              </div>

              {/* New Value */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-slate-100">
                <div className="border-b border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-300">
                  New State (newValue)
                </div>
                <Code className="block max-h-56 overflow-x-auto p-3 font-mono text-xs whitespace-pre text-emerald-300/90">
                  {entry.newValue
                    ? JSON.stringify(entry.newValue, null, 2)
                    : 'null (None / Deleted)'}
                </Code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
          <Span className="font-mono">PRD Spec M14: Append-Only Immutable Record</Span>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
