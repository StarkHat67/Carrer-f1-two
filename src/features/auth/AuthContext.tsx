import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Profile } from '../../types/database';
import { getRepository, IDataRepository } from '../../services/repository';

interface AuthContextType {
  currentUser: Profile | null;
  loading: boolean;
  repo: IDataRepository;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (email: string, pass: string, username: string) => Promise<{ error: string | null; message?: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const repo = getRepository();

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const user = await repo.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Erro ao carregar sessão do usuário:', err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = async (email: string, pass: string) => {
    const res = await repo.signIn(email, pass);
    if (res.user) {
      setCurrentUser(res.user);
    }
    return { error: res.error };
  };

  const signUp = async (email: string, pass: string, username: string) => {
    const res = await repo.signUp(email, pass, username);
    if (res.user) {
      setCurrentUser(res.user);
    }
    return { error: res.error, message: res.message };
  };

  const signOut = async () => {
    await repo.signOut();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        repo,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return ctx;
}
