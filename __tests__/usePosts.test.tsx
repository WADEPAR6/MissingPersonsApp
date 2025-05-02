// __tests__/usePosts.test.tsx
import { renderHook, act } from '@testing-library/react-native';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Mock de los hooks
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
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

// Mock de ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'images' },
}));

// Mock de jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn().mockImplementation(() => ({ sub: 1 })),
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
    },
    location: {
      latitude: 19.4100,
      longitude: -99.1700,
    }
  },
];

describe('usePosts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuración del mock de useAuth
    (useAuth as jest.Mock).mockReturnValue({
      getAuthHeader: jest.fn().mockResolvedValue({ 'Authorization': 'Bearer fake-token' }),
      getUserId: jest.fn().mockResolvedValue(1),
    });
  });

  test('POST-001: Creación de Post - Crea un post correctamente', async () => {
    // Mock de respuesta de fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, title: 'Nuevo Post', description: 'Descripción' }),
    });
    
    const { result } = renderHook(() => usePosts());
    
    const newPostData = {
      title: 'Nuevo Post',
      description: 'Descripción',
      image: 'data:image/jpeg;base64,imagen',
      userId: 1,
      Location: { latitude: 19.4326, longitude: -99.1332 },
    };
    
    // Crear un post
    await act(async () => {
      await result.current.createPost(newPostData);
    });
    
    // Verificar que se realizó la llamada a la API correctamente
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/posts'), expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'Authorization': 'Bearer fake-token' }),
      body: expect.any(String),
    }));
  });

  test('POST-002: Visualización de Posts - Obtiene la lista de posts', async () => {
    // Mock de respuesta de fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        data: mockPosts,
        meta: { total: 10, page: 1, limit: 10, totalPages: 1 }
      }),
    });
    
    const { result } = renderHook(() => usePosts());
    
    // Obtener posts
    let posts;
    await act(async () => {
      posts = await result.current.fetchPosts();
    });
    
    // Verificar que se devolvieron los posts correctamente
    expect(posts).toEqual(mockPosts);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/posts'), expect.any(Object));
    expect(useAuth().getAuthHeader).toHaveBeenCalled();
  });

  test('POST-003: Visualización de Posts Recientes - Obtiene posts de las últimas 24 horas', async () => {
    // Mock de respuesta de fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPosts,
    });
    
    const { result } = renderHook(() => usePosts());
    
    // Obtener posts recientes
    let recentPosts;
    await act(async () => {
      recentPosts = await result.current.fetchPostsHours();
    });
    
    // Verificar que se devolvieron los posts recientes correctamente
    expect(recentPosts).toEqual(mockPosts);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/posts/24hours'), expect.any(Object));
    expect(useAuth().getAuthHeader).toHaveBeenCalled();
  });

  test('GEO-001: Solicitud de permisos de ubicación', async () => {
    // Mock de respuesta de Location
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 19.4326, longitude: -99.1332 },
    });
    
    const { result } = renderHook(() => usePosts());
    
    // Solicitar permisos de ubicación
    let permissionGranted;
    await act(async () => {
      permissionGranted = await result.current.requestLocationPermission();
    });
    
    // Verificar que se concedieron los permisos
    expect(permissionGranted).toBe(true);
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userLocation', expect.any(String));
  });

  test('GEO-001: Denegación de permisos de ubicación', async () => {
    // Mock de respuesta de Location con permisos denegados
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });
    
    const { result } = renderHook(() => usePosts());
    
    // Solicitar permisos de ubicación
    let permissionGranted;
    await act(async () => {
      permissionGranted = await result.current.requestLocationPermission();
    });
    
    // Verificar que no se concedieron los permisos
    expect(permissionGranted).toBe(false);
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });

  test('POST-001: Selección de imagen para un post', async () => {
    // Mock de respuesta de ImagePicker
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://image.jpg' }],
    });
    
    const { result } = renderHook(() => usePosts());
    
    // Seleccionar una imagen
    let imageUri;
    await act(async () => {
      imageUri = await result.current.pickImage();
    });
    
    // Verificar que se devolvió la URI de la imagen
    expect(imageUri).toBe('file://image.jpg');
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });

  test('POST-001: Cancelación de selección de imagen', async () => {
    // Mock de respuesta de ImagePicker cuando se cancela
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });
    
    const { result } = renderHook(() => usePosts());
    
    // Seleccionar una imagen pero cancelar
    let imageUri;
    await act(async () => {
      imageUri = await result.current.pickImage();
    });
    
    // Verificar que no se devolvió ninguna URI
    expect(imageUri).toBeNull();
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });

  test('POST-004: Edición de Post Propio - Actualiza un post existente', async () => {
    // Mock de respuesta de fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, title: 'Post Actualizado', description: 'Descripción actualizada' }),
    });
    
    const { result } = renderHook(() => usePosts());
    
    const updatedPostData = {
      title: 'Post Actualizado',
      description: 'Descripción actualizada',
      status: 'Encontrad@',
    };
    
    // Actualizar un post
    await act(async () => {
      await result.current.updatePost(1, updatedPostData);
    });
    
    // Verificar que se realizó la llamada a la API correctamente
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/posts/1'), expect.objectContaining({
      method: 'PATCH',
      headers: expect.objectContaining({ 'Authorization': 'Bearer fake-token' }),
      body: expect.any(String),
    }));
    expect(useAuth().getAuthHeader).toHaveBeenCalled();
  });

  test('POST-005: Eliminación de Post Propio - Elimina un post existente', async () => {
    // Mock de respuesta de fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Post eliminado correctamente' }),
    });
    
    const { result } = renderHook(() => usePosts());
    
    // Eliminar un post
    await act(async () => {
      await result.current.deletePost(1);
    });
    
    // Verificar que se realizó la llamada a la API correctamente
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/posts/1'), expect.objectContaining({
      method: 'DELETE',
      headers: expect.objectContaining({ 'Authorization': 'Bearer fake-token' }),
    }));
    expect(useAuth().getAuthHeader).toHaveBeenCalled();
  });

  test('POST-007: Rendimiento en Carga de Posts - Gestiona la paginación correctamente', async () => {
    // Mock inicial con una página de posts
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        data: mockPosts.slice(0, 1),
        meta: { total: 2, page: 1, limit: 1, totalPages: 2 }
      }),
    });
    
    // Mock para la segunda página
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        data: mockPosts.slice(1, 2),
        meta: { total: 2, page: 2, limit: 1, totalPages: 2 }
      }),
    });
    
    const { result } = renderHook(() => usePosts());
    
    // Obtener primera página
    let firstPagePosts;
    await act(async () => {
      firstPagePosts = await result.current.fetchPosts();
    });
    
    // Verificar la primera página
    expect(firstPagePosts).toEqual(mockPosts.slice(0, 1));
    expect(result.current.hasMore).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/posts?page=1'), expect.any(Object));
    expect(useAuth().getAuthHeader).toHaveBeenCalled();
    
    // Obtener segunda página
    let secondPagePosts;
    await act(async () => {
      secondPagePosts = await result.current.fetchPosts();
    });
    
    // Verificar la segunda página
    expect(secondPagePosts).toEqual(mockPosts.slice(1, 2));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/posts?page=2'), expect.any(Object));
    expect(useAuth().getAuthHeader).toHaveBeenCalledTimes(2);
  });


});