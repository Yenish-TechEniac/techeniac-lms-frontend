import { useMemo } from 'react';

import { checkPasswordCriteria, PASSWORD_RULES, type PasswordCriteria } from '@/lib/validation';

export { PASSWORD_RULES, type PasswordCriteria };

export function usePasswordCriteria(password: string): PasswordCriteria {
  return useMemo(() => checkPasswordCriteria(password), [password]);
}
