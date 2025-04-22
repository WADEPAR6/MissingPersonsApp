// __tests__/LocationPermission.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LocationPermission } from '../components/LocationPermission';

// Mock para @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('LocationPermission Component', () => {
  test('GEO-001: Selección de Ubicación en Mapa - Renderiza correctamente sin ubicación', () => {
    const mockRequestLocation = jest.fn();
    
    const { getByText } = render(
      <LocationPermission 
        onRequestLocation={mockRequestLocation}
        location={null}
      />
    );
    
    // Verificar que muestra el texto correcto cuando no hay ubicación
    const locationText = getByText('Agregar ubicación');
    expect(locationText).toBeTruthy();
  });

  test('GEO-001: Selección de Ubicación en Mapa - Renderiza correctamente con ubicación', () => {
    const mockRequestLocation = jest.fn();
    const mockLocation = { latitude: 19.4326, longitude: -99.1332 };
    
    const { getByText } = render(
      <LocationPermission 
        onRequestLocation={mockRequestLocation}
        location={mockLocation}
      />
    );
    
    // Verificar que muestra el texto correcto cuando hay ubicación
    const locationText = getByText('Ubicación agregada');
    expect(locationText).toBeTruthy();
    
    // Verificar que muestra las coordenadas
    const locationCoords = getByText('19.432600, -99.133200');
    expect(locationCoords).toBeTruthy();
  });

  test('GEO-003: Permisos de Ubicación - Llama a la función de solicitud al presionar', async () => {
    const mockRequestLocation = jest.fn().mockResolvedValue(undefined);
    
    const { getByText } = render(
      <LocationPermission 
        onRequestLocation={mockRequestLocation}
        location={null}
      />
    );
    
    // Presionar el botón para solicitar ubicación
    const button = getByText('Agregar ubicación');
    fireEvent.press(button);
    
    // Verificar que se llamó a la función de solicitud
    await waitFor(() => {
      expect(mockRequestLocation).toHaveBeenCalled();
    });
  });

  test('GEO-004: Precisión de la Ubicación - Muestra correctamente coordenadas precisas', () => {
    const mockRequestLocation = jest.fn();
    const mockLocation = { latitude: 19.4326789, longitude: -99.1332456 };
    
    const { getByText } = render(
      <LocationPermission 
        onRequestLocation={mockRequestLocation}
        location={mockLocation}
      />
    );
    
    // Verificar que muestra las coordenadas con 6 decimales (precisión)
    const locationCoords = getByText('19.432679, -99.133246');
    expect(locationCoords).toBeTruthy();
  });
});