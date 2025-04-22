// __tests__/HomeScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/HomeScreen';
import { usePosts } from '../hooks/usePosts';
import { FlatList } from 'react-native';

// Mock para hooks
jest.mock('../hooks/usePosts', () => ({
  usePosts: jest.fn(),
}));

// Mock para @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock para react-native Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn().mockResolvedValue(true),
}));

// Muestras de datos de posts para las pruebas
const mockPosts = [
  {
    id: 1,
    title: 'Post 1',
    description: 'Descripción del post 1',
    image: 'data:image/jpeg;base64,testimage',
    createdAt: '2025-04-15T10:30:00Z',
    status: 'Perdid@',
    user: {
      id: 1,
      name: 'Juan',
      lastname: 'Pérez',
      username: 'juanperez',
      phone: '1234567890',
    },
    location: {
      latitude: 19.4326,
      longitude: -99.1332,
    }
  },
  {
    id: 2,
    title: 'Post 2',
    description: 'Descripción del post 2',
    image: 'imagen2',
    createdAt: '2025-04-14T09:15:00Z',
    status: 'Encontrad@',
    user: {
      id: 2,
      name: 'María',
      lastname: 'García',
      username: 'mariagarcia',
      phone: '0987654321',
    },
    location: {
      latitude: 19.4100,
      longitude: -99.1700,
    }
  },
];

describe('HomeScreen Component', () => {
  // Implementación de mocks comunes para todos los tests
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ address: { road: 'Av. Principal', suburb: 'Colonia', city: 'Ciudad' } })
    });
    
    // Mock del hook usePosts
    (usePosts as jest.Mock).mockReturnValue({
      fetchPosts: jest.fn().mockResolvedValue(mockPosts),
      refreshPosts: jest.fn().mockResolvedValue({}),
      loading: false,
      hasMore: true,
    });
  });

  test('POST-002: Visualización de Posts - Renderiza la lista de posts', async () => {
    const { findByText } = render(<HomeScreen />);
    
    // Verificar que el título de la pantalla está presente
    const headerTitle = await findByText('Inicio');
    expect(headerTitle).toBeTruthy();
    
    // Verificar que se muestran los posts mockados
    const post1Title = await findByText('Nombre: Post 1');
    const post2Title = await findByText('Nombre: Post 2');
    
    expect(post1Title).toBeTruthy();
    expect(post2Title).toBeTruthy();
  });

  test('POST-002: Visualización de Posts - Muestra correctamente la información del usuario', async () => {
    const { findByText } = render(<HomeScreen />);
    
    // Verificar que se muestra el nombre del usuario
    const userName1 = await findByText('Juan Pérez');
    const userName2 = await findByText('María García');
    
    expect(userName1).toBeTruthy();
    expect(userName2).toBeTruthy();
  });

  test('POST-002: Visualización de Posts - Muestra correctamente el estado del post', async () => {
    const { findByText } = render(<HomeScreen />);
    
    // Verificar que se muestra el estado de los posts
    const statusLost = await findByText('Perdid@');
    const statusFound = await findByText('Encontrad@');
    
    expect(statusLost).toBeTruthy();
    expect(statusFound).toBeTruthy();
  });

  test('POST-007: Rendimiento en Carga de Posts - Carga más posts al hacer scroll', async () => {
    const mockFetchPosts = jest.fn().mockResolvedValue(mockPosts);
    (usePosts as jest.Mock).mockReturnValue({
      fetchPosts: mockFetchPosts,
      refreshPosts: jest.fn().mockResolvedValue({}),
      loading: false,
      hasMore: true,
    });

    const { UNSAFE_getByType } = render(<HomeScreen />);
    
    // Obtener el FlatList
    const flatList = UNSAFE_getByType(FlatList);
    
    // Simular evento de llegar al final de la lista
    fireEvent(flatList, 'onEndReached');
    
    // Verificar que se llamó a fetchPosts para cargar más posts
    await waitFor(() => {
      expect(mockFetchPosts).toHaveBeenCalled();
    });
  });

});