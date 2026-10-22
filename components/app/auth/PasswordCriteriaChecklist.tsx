import React from 'react';

import { PASSWORD_RULES, type PasswordCriteria } from '@/lib/validation';

export type PasswordCriteriaKey = 'length' | 'upper' | 'lower' | 'number' | 'special';

export interface CriteriaItem {
  readonly key: PasswordCriteriaKey;
  readonly label: string;
}

export const CRITERIA_ITEMS: readonly CriteriaItem[] = [
  { key: 'length', label: `At least ${PASSWORD_RULES.minLength} characters` },
  { key: 'upper', label: 'At least one uppercase letter (A-Z)' },
  { key: 'lower', label: 'At least one lowercase letter (a-z)' },
  { key: 'number', label: 'At least one number (0-9)' },
  { key: 'special', label: 'At least one special character' },
];

export interface PasswordCriteriaChecklistProps {
  readonly criteria: PasswordCriteria;
}

export function PasswordCriteriaChecklist({ criteria }: Readonly<PasswordCriteriaChecklistProps>) {
  return (
    <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
      <p className="font-semibold text-slate-700">Password Requirements</p>
      <div className="grid grid-cols-1 gap-0.5 text-slate-600">
        {CRITERIA_ITEMS.map((item) => {
          const isMet = Boolean(criteria[item.key]);
          return (
            <div key={item.key} className={isMet ? 'font-medium text-emerald-600' : ''}>
              {isMet ? '✓' : '•'} {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
