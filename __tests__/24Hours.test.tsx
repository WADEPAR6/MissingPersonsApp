// __tests__/24Hours.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TwentyFourHoursScreen from '../app/24Hours';
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

// Muestras de datos de posts para las pruebas
const mockRecentPosts = [
  {
    id: 1,
    title: 'Post Reciente 1',
    description: 'Descripción del post reciente 1',
    image: 'data:image/jpeg;base64,testimage',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
    status: 'Perdid@',
    user: {
      id: 1,
      name: 'Juan',
      lastname: 'Pérez',
    },
    location: {
      latitude: 19.4326,
      longitude: -99.1332,
    }
  },
  {
    id: 2,
    title: 'Post Reciente 2',
    description: 'Descripción del post reciente 2',
    image: 'imagen2',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 horas atrás
    status: 'Encontrad@',
    user: {
      id: 2,
      name: 'María',
      lastname: 'García',
    },
    location: {
      latitude: 19.4100,
      longitude: -99.1700,
    }
  },
];

describe('TwentyFourHoursScreen Component', () => {
  // Implementación de mocks comunes para todos los tests
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ address: { road: 'Av. Principal', suburb: 'Colonia', city: 'Ciudad' } })
    });
    
    // Mock del hook usePosts
    (usePosts as jest.Mock).mockReturnValue({
      fetchPostsHours: jest.fn().mockResolvedValue(mockRecentPosts),
      loading: false,
    });
  });

  test('POST-003: Visualización de Posts Recientes - Renderiza el título y mensaje informativo', async () => {
    const { findByText } = render(<TwentyFourHoursScreen />);
    
    // Verificar que el mensaje informativo está presente
    const warningTitle = await findByText('¡Las primeras 24 horas son vitales!');
    expect(warningTitle).toBeTruthy();
    
    const warningSubtitle = await findByText(/Cuando alguien desaparece, las primeras 24 horas son cruciales/);
    expect(warningSubtitle).toBeTruthy();
  });

  test('POST-003: Visualización de Posts Recientes - Muestra posts de las últimas 24 horas', async () => {
    const mockFetchPostsHours = jest.fn().mockResolvedValue(mockRecentPosts);
    (usePosts as jest.Mock).mockReturnValue({
      fetchPostsHours: mockFetchPostsHours,
      loading: false,
    });

    const { findByText } = render(<TwentyFourHoursScreen />);
    
    // Verificar que se llama a la función para obtener posts recientes
    await waitFor(() => {
      expect(mockFetchPostsHours).toHaveBeenCalled();
    });
    
    // Verificar que se muestran los posts recientes
    const post1Title = await findByText('Nombre: Post Reciente 1');
    const post2Title = await findByText('Nombre: Post Reciente 2');
    
    expect(post1Title).toBeTruthy();
    expect(post2Title).toBeTruthy();
  });

  test('POST-003: Visualización de Posts Recientes - Muestra mensaje cuando no hay posts recientes', async () => {
    // Mock sin posts
    (usePosts as jest.Mock).mockReturnValue({
      fetchPostsHours: jest.fn().mockResolvedValue([]),
      loading: false,
    });

    const { findByText } = render(<TwentyFourHoursScreen />);
    
    // Verificar que se muestra el mensaje de no hay posts
    const emptyMessage = await findByText('No hay casos reportados en las últimas 24 horas');
    expect(emptyMessage).toBeTruthy();
  });

  test('POST-003: Visualización de Posts Recientes - Muestra correctamente los estados de los posts', async () => {
    const { findByText } = render(<TwentyFourHoursScreen />);
    
    // Verificar que se muestran los estados de los posts
    const statusLost = await findByText('Perdid@');
    const statusFound = await findByText('Encontrad@');
    
    expect(statusLost).toBeTruthy();
    expect(statusFound).toBeTruthy();
  });
  
  test('POST-007: Rendimiento - Muestra indicador de carga mientras obtiene los posts', async () => {
    // Mock con loading en true
    (usePosts as jest.Mock).mockReturnValue({
      fetchPostsHours: jest.fn().mockResolvedValue([]),
      loading: true,
    });

    const { findByText } = render(<TwentyFourHoursScreen />);
    
    // Verificar que se muestra el indicador de carga
    const loadingText = await findByText('Cargando casos recientes...');
    expect(loadingText).toBeTruthy();
  });
});