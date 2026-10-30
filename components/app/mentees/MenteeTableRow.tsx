import React from 'react';

import { TableCell, TableRow } from '@/components/ui/Table';
import { P, Span } from '@/components/ui/Typography';
import type { ApiMentorMappedMentee } from '@/services/batches.service';

export interface MenteeTableRowProps {
  mentee:
    | ApiMentorMappedMentee
    | {
        id: string;
        name?: string;
        email?: string;
        batchName?: string;
        batchCode?: string;
        startDate?: string;
      };
  actions?: React.ReactNode;
}

export function MenteeTableRow({ mentee, actions }: Readonly<MenteeTableRowProps>) {
  return (
    <TableRow key={mentee.id}>
      <TableCell>
        <P className="text-base font-bold text-[#111827]">{mentee.name ?? 'Assigned Mentee'}</P>
        <P className="font-mono text-xs text-[#667085]">{mentee.email ?? '—'}</P>
      </TableCell>
      <TableCell className="text-sm font-semibold text-[#111827]">
        {mentee.batchName ?? 'Cohort'}
      </TableCell>
      <TableCell>
        <Span className="inline-block rounded-md border border-[#E1E6EC] bg-[#F6F8FC] px-2.5 py-1 font-mono text-xs font-bold text-[#111827]">
          {mentee.batchCode ?? '—'}
        </Span>
      </TableCell>
      <TableCell
        className={
          actions
            ? 'font-mono text-sm text-[#667085]'
            : 'text-right font-mono text-sm text-[#667085]'
        }
      >
        {mentee.startDate ? mentee.startDate.slice(0, 10) : '—'}
      </TableCell>
      {actions ? <TableCell className="text-right">{actions}</TableCell> : null}
    </TableRow>
  );
}
