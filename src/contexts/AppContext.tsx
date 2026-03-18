/* eslint-disable react-refresh/only-export-components */
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  isVerified: boolean;
  isAadhaarVerified: boolean;
  isPhoneVerified: boolean;
  walletBalance: number;
  photo?: string;
}

interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isSafetyMenuOpen: boolean;
  setSafetyMenuOpen: (open: boolean) => void;
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isSafetyMenuOpen, setSafetyMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: '',
    to: '',
    date: '',
    passengers: 1,
  });

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthModalOpen,
        setAuthModalOpen,
        isSafetyMenuOpen,
        setSafetyMenuOpen,
        searchParams,
        setSearchParams,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
