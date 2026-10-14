import React from 'react';
import { apiService } from '@/services/api';

export function Button() {
  return <button onClick={() => apiService()}>Click</button>;
}
