'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './index';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}