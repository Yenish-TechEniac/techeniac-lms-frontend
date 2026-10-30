'use client';

import React from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { Code, H3, H4, Span } from '@/components/ui/Typography';
import { resolveAuditTargetEntity } from '@/lib/audit';
import { formatDateTimeISTWithSeconds } from '@/lib/date';
import type { ApiAuditItem } from '@/lib/validation';

export interface AuditDetailModalProps {
  entry: ApiAuditItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailModal({ entry, isOpen, onClose }: AuditDetailModalProps) {
  if (!isOpen || !entry) return null;

  const actorDisplay = entry.actor
    ? `${entry.actor.name} (${entry.actor.role})`
    : entry.actorId
      ? `User ${entry.actorId.slice(0, 8)}...`
      : 'System / Anonymous';

  const formattedDate = formatDateTimeISTWithSeconds(entry.createdAt);
  const target = resolveAuditTargetEntity(entry);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-slate-800 uppercase">
              {entry.type}
            </Span>
            <Span className="font-mono text-xs text-slate-400">ID: {entry.id}</Span>
          </div>
          <H3 className="text-lg font-bold text-slate-900">{entry.action}</H3>
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between text-xs text-slate-500">
          <Span className="font-mono">PRD Spec M14: Append-Only Immutable Record</Span>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
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
            <Span className="font-semibold text-slate-800">{target.name || entry.entity}</Span>
            {target.type ? (
              <Span className="block text-[10px] text-slate-500">{target.type}</Span>
            ) : null}
          </div>
          <div>
            <Span className="block text-[10px] font-bold text-slate-400 uppercase">
              Audit Status
            </Span>
            <Span className="font-semibold text-slate-700">Append-only record</Span>
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
                {entry.oldValue ? JSON.stringify(entry.oldValue, null, 2) : 'null (None / Created)'}
              </Code>
            </div>

            {/* New Value */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-slate-100">
              <div className="border-b border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-300">
                New State (newValue)
              </div>
              <Code className="block max-h-56 overflow-x-auto p-3 font-mono text-xs whitespace-pre text-emerald-300/90">
                {entry.newValue ? JSON.stringify(entry.newValue, null, 2) : 'null (None / Deleted)'}
              </Code>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
