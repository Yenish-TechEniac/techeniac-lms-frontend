'use client';

import React, { useState } from 'react';

import { type CsvUserRow, csvUserRowSchema } from '@/lib/validation';

export interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (validRows: CsvUserRow[]) => void;
}

interface ParsedRowResult {
  rowNumber: number;
  data: { name?: string; email?: string; role?: string };
  isValid: boolean;
  errors: string[];
}

export function BulkImportModal({ isOpen, onClose, onImportComplete }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csvContent =
      'name,email,role\n"Devon Vance",devon@company.internal,SUPER_ADMIN\n"Alex Chen",alex.chen@enterprise.internal,MENTOR\n"Priya Patel",priya@enterprise.internal,MENTEE';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'techeniac_users_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    parseCsv(selected);
  };

  const parseCsv = (csvFile: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length <= 1) {
        setParsedRows([]);
        setIsProcessing(false);
        return;
      }

      const results: ParsedRowResult[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        const rawRow = {
          name: parts[0] ?? '',
          email: parts[1] ?? '',
          role: parts[2] ?? '',
        };

        const validateResult = csvUserRowSchema.safeParse(rawRow);
        if (validateResult.success) {
          results.push({
            rowNumber: i + 1,
            data: validateResult.data,
            isValid: true,
            errors: [],
          });
        } else {
          results.push({
            rowNumber: i + 1,
            data: rawRow,
            isValid: false,
            errors: validateResult.error.issues.map(
              (err) => `${err.path.join('.')}: ${err.message}`,
            ),
          });
        }
      }

      setParsedRows(results);
      setIsProcessing(false);
    };
    reader.readAsText(csvFile);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  const handleImport = () => {
    const validData: CsvUserRow[] = parsedRows
      .filter((r) => r.isValid)
      .map((r) => r.data as CsvUserRow);
    onImportComplete(validData);
    onClose();
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-150">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Bulk Import Users (CSV)</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Import cohorts of users with columns:{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">name,email,role</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 overflow-y-auto p-6">
          {/* Upload and Sample Actions */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row">
            <div>
              <p className="text-sm font-semibold text-slate-800">Upload CSV File</p>
              <p className="text-xs text-slate-500">Supported format: UTF-8 CSV with header row</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Download Sample CSV
              </button>
              <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
                Choose File
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          {file ? (
            <p className="text-xs text-slate-500">
              Selected: <span className="font-semibold text-slate-800">{file.name}</span> (
              {parsedRows.length} rows detected)
            </p>
          ) : null}

          {/* Validation Report Table */}
          {parsedRows.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {validCount} Valid rows
                </span>
                {invalidCount > 0 ? (
                  <span className="flex items-center gap-1.5 text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    {invalidCount} Invalid rows (will be skipped)
                  </span>
                ) : null}
              </div>

              <div className="max-h-60 overflow-hidden overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? 'bg-white' : 'bg-red-50/50'}>
                        <td className="p-2.5 font-mono text-slate-500">{row.rowNumber}</td>
                        <td className="p-2.5 font-medium text-slate-900">{row.data.name || '—'}</td>
                        <td className="p-2.5 font-mono text-slate-600">{row.data.email || '—'}</td>
                        <td className="p-2.5">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-800">
                            {row.data.role || '—'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="font-semibold text-emerald-600">Ready</span>
                          ) : (
                            <span
                              className="text-[11px] text-red-500"
                              title={row.errors.join(', ')}
                            >
                              {row.errors[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : isProcessing ? (
            <p className="py-4 text-center text-xs text-slate-500">Parsing CSV contents...</p>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={validCount === 0 || isProcessing}
            className="rounded-[10px] bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import {validCount} Users
          </button>
        </div>
      </div>
    </div>
  );
}
