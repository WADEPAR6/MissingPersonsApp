// __tests__/useAuth.test.tsx
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useAuth, AuthProvider } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock de fetch
global.fetch = jest.fn() as jest.Mock;

// Mock de jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn().mockImplementation(() => ({ sub: 1 })),
}));

// Interfaces para tipado de respuestas
interface AuthResponse {
  message: string;
  token: string;
}

interface ErrorResponse {
  message: string;
}

// Configuración de mocks para respuestas de la API
const mockLoginSuccess: AuthResponse = {
  message: 'Login successful',
  token: 'fake-jwt-token',
};

const mockLoginFailure: ErrorResponse = {
  message: 'Invalid credentials',
};

const mockRegisterSuccess: {message: string} = {
  message: 'User registered successfully',
};

const mockRegisterFailure: ErrorResponse = {
  message: 'Email already in use',
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Mock de AsyncStorage.getItem para simular que no hay token almacenado
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => 
    <AuthProvider>{children}</AuthProvider>;

  test('AUTH-003: Inicio de Sesión - Login exitoso', async () => {
    // Configurar mock para respuesta exitosa
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLoginSuccess,
    });

    // Renderizar el hook
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Verificar estado inicial (debería ser false ya que AsyncStorage.getItem está mock para devolver null)
    expect(result.current.isLoggedIn).toBe(false);
    
    // Iniciar sesión
    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' });
    });

    // Verificar que se guardó el token
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userToken', 'fake-jwt-token');
    
    // Verificar estado de autenticación
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  test('AUTH-004: Intento de Inicio de Sesión con Credenciales Inválidas', async () => {
    // Configurar mock para respuesta fallida
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockLoginFailure,
    });

    // Renderizar el hook
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Intentar iniciar sesión con credenciales inválidas
    await act(async () => {
      try {
        await result.current.login({ email: 'wrong@example.com', password: 'wrongpass' });
      } catch (error) {
        // Esperamos que lance un error
      }
    });

    // Verificar que NO se guardó ningún token
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    
    // Verificar estado de autenticación
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.error).not.toBeNull();
  });

  test('AUTH-001: Registro de Usuario - Registro exitoso', async () => {
    // Configurar mock para respuesta exitosa
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRegisterSuccess,
    });

    // Renderizar el hook
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Registrar nuevo usuario
    let registerResult;
    await act(async () => {
      registerResult = await result.current.register({
        name: 'Test',
        lastname: 'User',
        address: 'Test Address',
        phone: '1234567890',
        birthdate: '2000-01-01',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    // Verificar que se realizó la llamada a la API correctamente
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
      body: expect.any(String),
    }));
    
    // Verificar resultado del registro
    expect(registerResult).toEqual(mockRegisterSuccess);
  });

  test('AUTH-005: Cierre de Sesión - Logout exitoso', async () => {
    // Simular que hay un token almacenado inicialmente
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('fake-jwt-token');

    // Renderizar el hook con estado inicial como autenticado
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Forzar el estado de inicio de sesión para evitar esperar la verificación automática
    await act(async () => {
      // Simular que el token se verificó y el estado de isLoggedIn cambió
      (result.current as any).isLoggedIn = true;
    });
    
    // Cerrar sesión
    await act(async () => {
      await result.current.logout();
    });

    // Verificar que se eliminó el token
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
    
    // El estado debería actualizarse tras el logout
    expect(result.current.isLoggedIn).toBe(false);
  });
});