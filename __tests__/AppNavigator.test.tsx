// __tests__/AppNavigator.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import AppNavigator from '../app/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { Text } from 'react-native';

// Mock del hook de autenticación
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock de los componentes de navegación - ahora manejados en jest.setup.js
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    NavigationContainer: ({ children }) => React.createElement(View, null, children),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) => React.createElement(View, null, children),
      Screen: ({ name, component, children }) => {
        const Component = component;
        return Component 
          ? React.createElement(Component, null)
          : React.createElement(View, null, children);
      }
    })
  };
});

// Mock de las pantallas
jest.mock('../app/AuthScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, { testID: "auth-screen" }, "AuthScreen");
});

jest.mock('../app/MainLayout', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, { testID: "main-layout" }, "MainLayout");
});

describe('AppNavigator Component', () => {
  test('AUTH-003: Navegación a pantalla principal cuando el usuario está autenticado', () => {
    // Simular usuario autenticado
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
      loading: false
    });
    
    const { getByTestId } = render(<AppNavigator />);
    
    // Verificar que se muestra la pantalla principal
    expect(getByTestId('main-layout')).toBeTruthy();
  });
  
  test('AUTH-003: Navegación a pantalla de autenticación cuando el usuario no está autenticado', () => {
    // Simular usuario no autenticado
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: false,
      loading: false
    });
    
    const { getByTestId } = render(<AppNavigator />);
    
    // Verificar que se muestra la pantalla de autenticación
    expect(getByTestId('auth-screen')).toBeTruthy();
  });
  
  test('Muestra indicador de carga mientras verifica autenticación', () => {
    // Simular carga de autenticación
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: false,
      loading: true
    });
    
    const { getByTestId } = render(<AppNavigator />);
    
    // Verificar que se muestra el indicador de carga
    // Nota: Se necesitaría modificar AppNavigator.tsx para añadir testID al activity indicator
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});