// __tests__/AuthScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AuthScreen from '../app/AuthScreen';
import { AuthProvider } from '../hooks/useAuth';

// Mock del hook de autenticación
jest.mock('../hooks/useAuth', () => ({
  // Mantenemos el Provider real
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  
  // Mock del hook
  useAuth: () => ({
    login: jest.fn(() => Promise.resolve()),
    register: jest.fn(() => Promise.resolve()),
    isLoggedIn: false,
    loading: false,
    error: null,
    logout: jest.fn(() => Promise.resolve()),
    clearError: jest.fn(),
    getAuthHeader: jest.fn(() => Promise.resolve({})),
    getUserId: jest.fn(() => Promise.resolve(1)),
  }),
}));

// Mock de react-native-vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('AuthScreen Component', () => {
  
  test('AUTH-001: Registro de Usuario - Muestra el formulario de registro', () => {
    // Renderizar el componente
    const { getByText, getByPlaceholderText } = render(
      <AuthProvider>
        <AuthScreen />
      </AuthProvider>
    );
    
    // Cambiar a la pestaña de registro
    fireEvent.press(getByText('Registrarse'));
    
    // Verificar que se muestran los campos de registro
    expect(getByPlaceholderText('Nombre')).toBeTruthy();
    expect(getByPlaceholderText('Apellido')).toBeTruthy();
    expect(getByPlaceholderText('Correo electrónico')).toBeTruthy();
    expect(getByPlaceholderText('Contraseña')).toBeTruthy();
  });
  
  
});