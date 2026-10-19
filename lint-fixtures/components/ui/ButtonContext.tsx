import React from 'react';
import { ThemeContext } from '@/context/ThemeContext';

export function ButtonContext() {
  return <button onClick={() => ThemeContext}>Context</button>;
}

