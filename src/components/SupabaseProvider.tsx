import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

// Create context
type SupabaseContextType = {
  supabase: SupabaseClient | null;
  isLoading: boolean;
  error: string | null;
};

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isLoading: true,
  error: null
});

// Hook to use the Supabase context
export const useSupabase = () => useContext(SupabaseContext);

// Provider component
export const SupabaseProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
      }
      
      const client = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(client);
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      setError('Failed to initialize Supabase. Please check your configuration.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading, error }}>
      {children}
    </SupabaseContext.Provider>
  );
};