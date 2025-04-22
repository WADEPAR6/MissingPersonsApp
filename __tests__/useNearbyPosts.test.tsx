// __tests__/useNearbyPosts.test.tsx
import { renderHook, act } from '@testing-library/react-native';
import { useNearbyPosts } from '../hooks/useNearbybyPosts';
import { useAuth } from '../hooks/useAuth';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

// Mock de los hooks
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock de Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock de fetch
global.fetch = jest.fn() as jest.Mock;

// Mock de Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
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
    distance: 0.8,
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
    distance: 1.5,
    cityInfo: {
      city: 'Ciudad de México',
      state: 'CDMX',
    }
  },
];

describe('useNearbyPosts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuración del mock de useAuth
    (useAuth as jest.Mock).mockReturnValue({
      getAuthHeader: jest.fn().mockResolvedValue({ 'Authorization': 'Bearer fake-token' }),
    });
  });

  test('GEO-002: Visualización de Posts Cercanos - Obtiene posts cercanos correctamente', async () => {
    // Mock de respuesta de fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockNearbyPosts,
    });
    
    // Mock de respuesta de Location
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 19.4326, longitude: -99.1332 },
    });
    
    const { result } = renderHook(() => useNearbyPosts());
    
    // Obtener posts cercanos
    await act(async () => {
      await result.current.fetchNearbyPosts();
    });
    
    // Verificar que se obtuvieron los posts cercanos
    expect(result.current.posts).toEqual(mockNearbyPosts);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts/nearby?lat=19.4326&lon=-99.1332'),
      expect.any(Object)
    );
    expect(useAuth().getAuthHeader).toHaveBeenCalled();
  });

  test('GEO-003: Permisos de Ubicación - Solicita permisos correctamente', async () => {
    // Mock de respuesta de Location
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    const { result } = renderHook(() => useNearbyPosts());
    
    // Solicitar permisos de ubicación
    let hasPermission;
    await act(async () => {
      hasPermission = await result.current.requestLocationPermission();
    });
    
    // Verificar que se solicitaron los permisos correctamente
    expect(hasPermission).toBe(true);
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  test('GEO-003: Permisos de Ubicación - Maneja denegación de permisos', async () => {
    // Mock de respuesta de Location con permisos denegados
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });
    
    const { result } = renderHook(() => useNearbyPosts());
    
    // Solicitar permisos de ubicación
    let hasPermission;
    await act(async () => {
      hasPermission = await result.current.requestLocationPermission();
    });
    
    // Verificar que se detectó la denegación de permisos
    expect(hasPermission).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Permiso denegado',
      expect.stringContaining('ubicación')
    );
  });

  test('GEO-004: Precisión de la Ubicación - Obtiene la ubicación actual correctamente', async () => {
    // Mock de respuesta de Location
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    const mockPosition = {
      coords: { 
        latitude: 19.4326789, 
        longitude: -99.1332456,
        accuracy: 5.0, // Precisión en metros
        altitude: 2250,
        altitudeAccuracy: 10.0,
        heading: 90,
        speed: 0
      },
      timestamp: Date.now()
    };
    
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockPosition);
    
    const { result } = renderHook(() => useNearbyPosts());
    
    // Obtener ubicación actual
    let location;
    await act(async () => {
      location = await result.current.getCurrentLocation();
    });
    
    // Verificar que se obtuvo la ubicación con precisión
    expect(location).toEqual(mockPosition);
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
  });

  test('GEO-002: Visualización de Posts Cercanos - Refresca los posts cercanos', async () => {
    // Mock de respuesta de fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockNearbyPosts,
    });
    
    const { result } = renderHook(() => useNearbyPosts());
    
    // Refrescar posts cercanos
    await act(async () => {
      await result.current.refreshPosts();
    });
    
    // Verificar que se limpiaron los posts y se volvieron a cargar
    expect(result.current.posts).toEqual(mockNearbyPosts);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts/nearby'),
      expect.any(Object)
    );
  });

  test('GEO-002: Visualización de Posts Cercanos - Maneja errores al obtener posts cercanos', async () => {
    // Mock de respuesta de fetch con error
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    // Mock de respuesta de Location
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 19.4326, longitude: -99.1332 },
    });
    
    const { result } = renderHook(() => useNearbyPosts());
    
    // Intentar obtener posts cercanos
    await act(async () => {
      try {
        await result.current.fetchNearbyPosts();
      } catch (error) {
        // Esperamos que lance error
      }
    });
    
    // Verificar que se manejó el error correctamente
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      expect.stringContaining('No se pudieron cargar los posts cercanos')
    );
  });
});