import { useMemo } from 'react';

import { checkPasswordCriteria, type PasswordCriteria } from '@/lib/validation';

export function usePasswordCriteria(password: string): PasswordCriteria {
  return useMemo(() => checkPasswordCriteria(password), [password]);
}
