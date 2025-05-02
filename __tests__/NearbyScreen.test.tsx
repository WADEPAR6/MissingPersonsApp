// __tests__/NearbyScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NearbyScreen from '../app/NearbyScreen';
import { useNearbyPosts } from '../hooks/useNearbybyPosts';
import { FlatList } from 'react-native';

// Mock para hooks
jest.mock('../hooks/useNearbybyPosts', () => ({
  useNearbyPosts: jest.fn(),
}));

// Mock para @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Muestras de datos de posts cercanos para las pruebas
const mockNearbyPosts = [
  {
    id: 1,
    title: 'Post Cercano 1',
    description: 'Descripción del post cercano 1',
    image: 'data:image/jpeg;base64,testimage',
    createdAt: '2025-04-15T10:30:00Z',
    status: 'Perdid@',
    user: {
      id: 1,
      name: 'Juan',
      lastname: 'Pérez',
    },
    location: {
      latitude: 19.4326,
      longitude: -99.1332,
    },
    distance: 0.8, // 800 metros
    cityInfo: {
      city: 'Ciudad de México',
      state: 'CDMX',
    }
  },
  {
    id: 2,
    title: 'Post Cercano 2',
    description: 'Descripción del post cercano 2',
    image: 'imagen2',
    createdAt: '2025-04-14T09:15:00Z',
    status: 'Encontrad@',
    user: {
      id: 2,
      name: 'María',
      lastname: 'García',
    },
    location: {
      latitude: 19.4100,
      longitude: -99.1700,
    },
    distance: 1.5, // 1.5 km
    cityInfo: {
      city: 'Ciudad de México',
      state: 'CDMX',
    }
  },
];

describe('NearbyScreen Component', () => {
  // Implementación de mocks comunes para todos los tests
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock del hook useNearbyPosts
    (useNearbyPosts as jest.Mock).mockReturnValue({
      posts: mockNearbyPosts,
      loading: false,
      fetchNearbyPosts: jest.fn().mockResolvedValue(mockNearbyPosts),
      refreshPosts: jest.fn().mockResolvedValue({}),
    });
  });

  test('GEO-002: Visualización de Posts Cercanos - Renderiza la lista de posts cercanos', async () => {
    const { findByText } = render(<NearbyScreen />);
    
    // Verificar que el título de la pantalla está presente
    const headerTitle = await findByText('Posts Cercanos');
    expect(headerTitle).toBeTruthy();
    
    // Verificar que se muestran los posts cercanos
    const post1Title = await findByText('Nombre: Post Cercano 1');
    const post2Title = await findByText('Nombre: Post Cercano 2');
    
    expect(post1Title).toBeTruthy();
    expect(post2Title).toBeTruthy();
  });

  test('GEO-002: Visualización de Posts Cercanos - Muestra la distancia para cada post', async () => {
    const { findByText } = render(<NearbyScreen />);
    
    // Verificar que se muestra la distancia de cada post
    const distance1 = await findByText('A 0.80 km de distancia');
    const distance2 = await findByText('A 1.50 km de distancia');
    
    expect(distance1).toBeTruthy();
    expect(distance2).toBeTruthy();
  });

// __tests__/NearbyScreen.test.tsx

// Para solucionar el problema con "Found multiple elements with text: Ciudad de México, CDMX"
test('GEO-002: Visualización de Posts Cercanos - Muestra información de ubicación', async () => {
  const { getAllByText } = render(<NearbyScreen />);
  
  // En lugar de usar findByText cuando hay múltiples elementos,
  // usa getAllByText y verifica que al menos hay uno
  const cityInfoElements = getAllByText('Ciudad de México, CDMX');
  
  expect(cityInfoElements.length).toBeGreaterThan(0);
});

// Para solucionar el problema con refreshPosts no siendo llamado
  test('GEO-002: Visualización de Posts Cercanos - Muestra mensaje cuando no hay posts cercanos', async () => {
    // Mock sin posts cercanos
    (useNearbyPosts as jest.Mock).mockReturnValue({
      posts: [],
      loading: false,
      fetchNearbyPosts: jest.fn().mockResolvedValue([]),
      refreshPosts: jest.fn().mockResolvedValue({}),
    });

    const { findByText } = render(<NearbyScreen />);
    
    // Verificar que se muestra el mensaje de no hay posts cercanos
    const emptyMessage = await findByText('No hay posts cercanos en este momento');
    expect(emptyMessage).toBeTruthy();
  });

  test('GEO-002: Visualización de Posts Cercanos - Muestra indicador de carga mientras busca posts', async () => {
    // Mock con loading en true
    (useNearbyPosts as jest.Mock).mockReturnValue({
      posts: [],
      loading: true,
      fetchNearbyPosts: jest.fn().mockResolvedValue([]),
      refreshPosts: jest.fn().mockResolvedValue({}),
    });

    const { findByText } = render(<NearbyScreen />);
    
    // Verificar que se muestra el indicador de carga
    const loadingText = await findByText('Buscando posts cercanos...');
    expect(loadingText).toBeTruthy();
  });
});