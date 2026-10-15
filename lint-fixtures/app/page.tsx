import React from 'react';
import { apiService } from '@/services/api';

export default function Page() {
  return <div onClick={() => apiService()}>Page</div>;
}

