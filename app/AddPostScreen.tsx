import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { LocationPermission } from '../components/LocationPermission';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const screenWidth = Dimensions.get('window').width;

export default function AddPostScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { loading, pickImage, createPost } = usePosts();
  const { getUserId } = useAuth();
  const [locationName, setLocationName] = useState<string>('');

  const handleRequestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la ubicación');
        return;
      }
      setShowMap(true);
    } catch (error) {
      console.error('Error solicitando permisos:', error);
    }
  };

  const handleMapPress = async (event: { nativeEvent: { coordinate: { latitude: number, longitude: number } } }) => {
    try {
      const newLocation = event.nativeEvent.coordinate;
      
      // Verificar que las coordenadas sean válidas
      if (
        newLocation && 
        typeof newLocation.latitude === 'number' && 
        typeof newLocation.longitude === 'number' &&
        !isNaN(newLocation.latitude) && 
        !isNaN(newLocation.longitude)
      ) {
        setLocation(newLocation);
        await fetchLocationName(newLocation);
      } else {
        console.error('Coordenadas inválidas');
        Alert.alert('Error', 'No se pudieron obtener las coordenadas');
      }
    } catch (error) {
      console.error('Error al manejar la selección de ubicación:', error);
      Alert.alert('Error', 'No se pudo seleccionar la ubicación');
    }
  };

  const fetchLocationName = async (loc: { latitude: number; longitude: number }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}&accept-language=es`
      );
      const data = await response.json();
      const parts = [];
      if (data.address) {
        if (data.address.road) parts.push(data.address.road);
        if (data.address.suburb) parts.push(data.address.suburb);
        if (data.address.city) parts.push(data.address.city);
      }
      setLocationName(parts.length > 0 ? parts.join(', ') : 'Ubicación seleccionada');
    } catch (error) {
      console.error('Error obteniendo nombre de ubicación:', error);
      setLocationName('Ubicación seleccionada');
    }
  };

  const compressImage = async (uri: string) => {
    try {
      const result = await manipulateAsync(
        uri,
        [
          {
            resize: {
              width: Math.min(screenWidth, 800),
            },
          },
        ],
        {
          compress: 0.5,
          format: SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Error comprimiendo imagen:', error);
      throw error;
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await pickImage();

      if (!result) return;

      if (result.startsWith('data:image')) {
        setImage(result);
        return;
      }

      if (result.startsWith('file://')) {
        try {
          const compressedUri = await compressImage(result);
          const base64 = await FileSystem.readAsStringAsync(compressedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const base64Image = `data:image/jpeg;base64,${base64}`;

          setImage(base64Image);
        } catch (error) {
          console.error('Error al procesar la imagen:', error);
          Alert.alert('Error', 'No se pudo procesar la imagen');
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };


  const handleCreatePost = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor, escribe una descripción');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Por favor, selecciona una ubicación');
      return;
    }

    try {
      const userId = await getUserId();

      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el ID del usuario');
        return;
      }

      const imageToSend = image ? (
        image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`
      ) : '';

      await createPost({
        title,
        description,
        image: imageToSend,
        Location: location,
        userId: Number(userId),
      });

      setDescription('');
      setTitle('');
      setImage(null);
      setLocation(null);
      setLocationName('');
      Alert.alert('Éxito', 'Post creado correctamente');
    } catch (error: any) {
      console.error('Error al crear post:', error);
      if (error.message?.includes('request entity too large')) {
        Alert.alert('Error', 'La imagen es demasiado grande. Por favor, intenta con una imagen más pequeña.');
      } else {
        Alert.alert('Error', 'No se pudo crear el post');
      }
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Crear Publicación</Text>
          </View>

          <TextInput
            style={styles.inputName}
            placeholder="Nombre"
            multiline
            value={title}
            onChangeText={setTitle}
            maxLength={500}
          />

          <TextInput
            style={styles.input}
            placeholder="¿Qué está pasando?"
            multiline
            value={description}
            onChangeText={setDescription}
            maxLength={500}
          />

          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleRequestLocation}
          >
            <Ionicons name="location" size={24} color="#4c00b0" />
            <Text style={styles.locationButtonText}>
              {location ? locationName : "Seleccionar ubicación"}
            </Text>
          </TouchableOpacity>

          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{
                  uri: image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`
                }}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handlePickImage}
            >
              <Ionicons name="image-outline" size={24} color="#4c00b0" />
              <Text style={styles.mediaButtonText}>Foto</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!description.trim() || !location) && styles.submitButtonDisabled]}
            onPress={handleCreatePost}
            disabled={!description.trim() || !location || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={showMap}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <View style={styles.modalContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude || 19.4326,
              longitude: location?.longitude || -99.1332,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            {location && (
              <Marker
                coordinate={location}
                title="Ubicación seleccionada"
              />
            )}
          </MapView>
          <TouchableOpacity
            style={styles.confirmLocationButton}
            onPress={() => setShowMap(false)}
          >
            <Text style={styles.confirmLocationText}>Confirmar Ubicación</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c00b0',
  },
  input: {
    minHeight: 100,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  inputName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginBottom: 15,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
  },
  mediaButtonText: {
    marginLeft: 5,
    color: '#4c00b0',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4c00b0',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9d7bb7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4c00b0',
    marginBottom: 15,
  },
  locationButtonText: {
    marginLeft: 8,
    color: '#4c00b0',
    fontSize: 16,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  confirmLocationButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4c00b0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmLocationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
