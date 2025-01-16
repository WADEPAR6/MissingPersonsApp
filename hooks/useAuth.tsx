// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://10.80.0.89:3000';

//const API_URL = 'http://192.168.100.13:3000';

type AuthResponse = {
  message: string;
  token: string;
};

type DecodedToken = {
  sub: number; 
  email: string;
  iat: number;
  exp: number;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  lastname: string;
  address: string;
  phone: string;
  birthdate: string;
  username: string;
  email: string;
  password: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getAuthHeader: () => Promise<HeadersInit | undefined>;
  getUserId: () => Promise<number | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
    } catch (e) {
      console.error('Error checking auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const getUserId = async (): Promise<number | null> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.sub;
      }
      return null;
    } catch (error) {
      console.error('Error getting userId:', error);
      return null;
    }
  };

  const getAuthHeader = async (): Promise<HeadersInit | undefined> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
      }
    } catch (e) {
      console.error('Error getting auth header:', e);
    }
    return undefined;
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar el token
      await AsyncStorage.setItem('userToken', data.token);
      setIsLoggedIn(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido al iniciar sesión');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido en el registro');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    isLoggedIn,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    getAuthHeader,
    getUserId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};