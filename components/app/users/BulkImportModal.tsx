'use client';

import React, { useState } from 'react';

import { Modal } from '@/components/patterns/Modal';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { type CsvUserRow, csvUserRowSchema } from '@/lib/validation';

export type CsvUserRowWithLine = CsvUserRow & { rowNumber?: number };

export interface BulkImportFailure {
  row: CsvUserRowWithLine;
  error: string;
}

export interface BulkImportResult {
  successCount: number;
  failures: BulkImportFailure[];
}

export interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    validRows: CsvUserRowWithLine[],
    onProgress?: (progress: { current: number; total: number }) => void,
  ) => Promise<BulkImportResult>;
}

interface ParsedRowResult {
  rowNumber: number;
  data: { name?: string; email?: string; role?: string };
  isValid: boolean;
  errors: string[];
}

/**
 * Tokenize a CSV line according to RFC 4180.
 * Handles commas inside quotes and escaped double quotes ("").
 */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

export function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  const handleClose = () => {
    if (isImporting) return;
    setFile(null);
    setParsedRows([]);
    setIsProcessing(false);
    setIsImporting(false);
    setImportProgress(null);
    setImportResult(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csvContent =
      'name,email,role\n"Devon Vance",devon@company.internal,SUPER_ADMIN\n"Chen, Alex",alex.chen@enterprise.internal,MENTOR\n"Priya Patel",priya@enterprise.internal,MENTEE';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'techeniac_users_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setImportResult(null);
    setImportProgress(null);
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
        const parts = parseCsvLine(line);
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

  const handleImport = async () => {
    const validData: CsvUserRowWithLine[] = parsedRows
      .filter((r) => r.isValid)
      .map((r) => ({ ...(r.data as CsvUserRow), rowNumber: r.rowNumber }));

    if (validData.length === 0) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: validData.length });
    setImportResult(null);

    try {
      const result = await onImport(validData, ({ current, total }) => {
        setImportProgress({ current, total });
      });
      setImportResult(result);
      if (result.failures.length === 0) {
        setTimeout(() => {
          handleClose();
        }, 1200);
      }
    } catch {
      setImportResult({
        successCount: 0,
        failures: validData.map((r) => ({ row: r, error: 'Unexpected error during import' })),
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Bulk Import Users (CSV)"
      description={
        <>
          Import cohorts of users with columns:{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">name,email,role</code>
        </>
      }
      size="xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isImporting}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                void handleImport();
              }}
              isLoading={isImporting}
              disabled={validCount === 0 || isProcessing || isImporting}
            >
              {isImporting
                ? `Importing (${importProgress?.current ?? 0}/${importProgress?.total ?? validCount})...`
                : `Import ${validCount} Users`}
            </Button>
          ) : null}
        </>
      }
    >
      {/* Progress State */}
      {isImporting && importProgress ? (
        <div
          role="status"
          aria-live="polite"
          className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-5"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span>Importing Users into LMS...</span>
            <span>
              {importProgress.current} / {importProgress.total} (
              {Math.round((importProgress.current / (importProgress.total || 1)) * 100)}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200/60">
            <div
              className="h-full bg-blue-600 transition-all duration-150"
              style={{
                width: `${Math.round((importProgress.current / (importProgress.total || 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-blue-700">
            Please keep this window open while accounts and invitation emails are dispatched.
          </p>
        </div>
      ) : null}

      {/* Results State (Failures or Success) */}
      {importResult ? (
        <div role="status" aria-live="polite" className="space-y-4">
          {importResult.failures.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
              <span className="text-base">✅</span>
              <span>
                Successfully imported all {importResult.successCount} users! Closing window...
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                <p className="font-semibold text-amber-900">
                  Import completed with partial errors:
                </p>
                <p className="mt-0.5 text-slate-700">
                  {importResult.successCount} users created successfully.{' '}
                  <span className="font-semibold text-red-600">
                    {importResult.failures.length} user(s) failed.
                  </span>
                </p>
              </div>

              <div className="max-h-52 overflow-hidden overflow-y-auto rounded-xl border border-red-200">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-red-100/70 text-red-900">
                    <tr>
                      <th className="p-2.5">Line</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 bg-white">
                    {importResult.failures.map((f, idx) => (
                      <tr key={`${f.row.email}-${idx}`} className="bg-red-50/30">
                        <td className="p-2.5 font-mono text-slate-500">
                          {f.row.rowNumber ? `Line ${f.row.rowNumber}` : `—`}
                        </td>
                        <td className="p-2.5 font-medium text-slate-900">{f.row.name}</td>
                        <td className="p-2.5 font-mono text-slate-600">{f.row.email}</td>
                        <td className="p-2.5 font-mono text-slate-700">{f.row.role}</td>
                        <td className="p-2.5 font-medium text-red-600">{f.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Upload and Sample Actions (visible when not importing) */}
      {!isImporting && !importResult ? (
        <>
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row">
            <div>
              <Typography as="p" className="text-sm font-semibold text-slate-800">
                Upload CSV File
              </Typography>
              <Typography as="p" variant="muted" className="text-xs text-slate-500">
                Supported format: UTF-8 CSV with header row
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={handleDownloadSample}>
                Download Sample CSV
              </Button>
              <label className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>

          {file ? (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">📄</span>
                <div>
                  <Typography as="p" className="font-semibold text-slate-900">
                    {file.name}
                  </Typography>
                  <Typography as="p" variant="muted" className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} data rows found
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {validCount} valid
                </span>
                {invalidCount > 0 ? (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                    {invalidCount} invalid
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>CSV Verification Preview (first 10 rows)</span>
                <span>
                  {validCount} of {parsedRows.length} ready to import
                </span>
              </div>
              <div className="max-h-56 overflow-hidden overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700">
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
        </>
      ) : null}
    </Modal>
  );
}
