// __tests__/MyPostsScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyPostsScreen from '../app/MyPostsScreen';
import { usePosts } from '../hooks/usePosts';
import { Alert } from 'react-native';

// Mock para hooks
jest.mock('../hooks/usePosts', () => ({
  usePosts: jest.fn(),
}));

// Mock para @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock para react-native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock para el componente EditPostModal
jest.mock('../components/EditPostModal', () => {
  return function MockEditPostModal({ visible, onClose, post, onUpdateSuccess }: any) {
    return visible ? (
      <div data-testid="edit-modal">
        <button data-testid="modal-close" onClick={onClose}>Close</button>
        <button data-testid="update-success" onClick={onUpdateSuccess}>Update Success</button>
      </div>
    ) : null;
  };
});

// Muestras de datos de posts para las pruebas
const mockUserPosts = [
  {
    id: 1,
    title: 'Mi Mascota',
    description: 'Descripción de mi mascota perdida',
    image: 'data:image/jpeg;base64,testimage',
    status: 'Perdid@',
    createdAt: '2025-04-15T10:30:00Z',
    location: {
      latitude: 19.4326,
      longitude: -99.1332,
    }
  },
  {
    id: 2,
    title: 'Otro Post',
    description: 'Descripción de otro post',
    image: 'imagen2',
    status: 'Encontrad@',
    createdAt: '2025-04-14T09:15:00Z',
    location: {
      latitude: 19.4100,
      longitude: -99.1700,
    }
  },
];

describe('MyPostsScreen Component', () => {
  // Implementación de mocks comunes para todos los tests
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ address: { road: 'Av. Principal', suburb: 'Colonia', city: 'Ciudad' } })
    });
    
    // Mock del hook usePosts
    (usePosts as jest.Mock).mockReturnValue({
      fetchUserPosts: jest.fn().mockResolvedValue(mockUserPosts),
      deletePost: jest.fn().mockResolvedValue({}),
      loading: false,
    });
  });

  test('POST-002: Visualización de Posts - Renderiza la lista de posts del usuario', async () => {
    const { findByText } = render(<MyPostsScreen />);
    
    // Verificar que el título de la pantalla está presente
    const headerTitle = await findByText('Mis Publicaciones');
    expect(headerTitle).toBeTruthy();
    
    // Verificar que se muestran los posts del usuario
    const post1Title = await findByText('Mi Mascota');
    const post2Title = await findByText('Otro Post');
    
    expect(post1Title).toBeTruthy();
    expect(post2Title).toBeTruthy();
  });


  test('POST-005: Eliminación de Post Propio - Muestra confirmación antes de eliminar', async () => {
    const { findByText, findAllByText } = render(<MyPostsScreen />);
    
    // Esperar a que los posts se carguen
    await findByText('Mi Mascota');
    
    // Buscar y pulsar el botón de eliminar en el primer post
    const deleteButtons = await findAllByText('Eliminar');
    fireEvent.press(deleteButtons[0]);
    
    // Verificar que se muestra el diálogo de confirmación
    expect(Alert.alert).toHaveBeenCalledWith(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar esta publicación?",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancelar" }),
        expect.objectContaining({ text: "Eliminar" })
      ])
    );
  });

  test('POST-005: Eliminación de Post Propio - Elimina el post cuando se confirma', async () => {
    const mockDeletePost = jest.fn().mockResolvedValue({});
    (usePosts as jest.Mock).mockReturnValue({
      fetchUserPosts: jest.fn().mockResolvedValue(mockUserPosts),
      deletePost: mockDeletePost,
      loading: false,
    });
    
    // Simular la implementación de Alert.alert para poder acceder al callback de eliminación
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      // Encontrar el botón de eliminar y llamar a su onPress
      const deleteButton = buttons.find((button : any) => button.text === 'Eliminar');
      if (deleteButton && deleteButton.onPress) {
        deleteButton.onPress();
      }
    });

    const { findByText, findAllByText } = render(<MyPostsScreen />);
    
    // Esperar a que los posts se carguen
    await findByText('Mi Mascota');
    
    // Buscar y pulsar el botón de eliminar en el primer post
    const deleteButtons = await findAllByText('Eliminar');
    fireEvent.press(deleteButtons[0]);
    
    // Verificar que se llamó a la función para eliminar el post
    await waitFor(() => {
      expect(mockDeletePost).toHaveBeenCalledWith(1); // ID del primer post
    });
  });


  test('POST-006: Cambio de Estado de Post - Muestra correctamente los estados de los posts', async () => {
    const { findByText } = render(<MyPostsScreen />);
    
    // Verificar que se muestran los estados de los posts
    const statusLost = await findByText('Perdid@');
    const statusFound = await findByText('Encontrad@');
    
    expect(statusLost).toBeTruthy();
    expect(statusFound).toBeTruthy();
  });
});