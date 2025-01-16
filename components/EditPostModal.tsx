import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Modal,
    StatusBar,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { usePosts } from '@/hooks/usePosts';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const { height, width } = Dimensions.get('window');
const screenWidth = Dimensions.get('window').width;

type PostStatus = 'LOST' | 'FOUND' | 'DECEASED';

interface Post {
    id: number;
    title: string;
    description: string;
    image?: string;
    status: PostStatus;
    location?: {
        latitude: number;
        longitude: number;
    };
}

type EditPostModalProps = {
    visible: boolean;
    onClose: () => void;
    post: any;
    onUpdateSuccess?: () => void;
};

const STATUS_LABELS = {
    LOST: 'Perdid@',
    FOUND: 'Encontrad@',
    DECEASED: 'Muert@'
};

const EditPostModal = ({ visible, onClose, post, onUpdateSuccess }: EditPostModalProps) => {
    const { updatePost, pickImage, loading } = usePosts();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [status, setStatus] = useState<PostStatus>('LOST');
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [locationName, setLocationName] = useState<string>('');

    // Reiniciar estados cuando el modal se abre
    useEffect(() => {
        if (visible && post) {
            setTitle(post.title);
            setDescription(post.description);
            setImage(post.image || '');
            setStatus(post.status || 'LOST');
            setLocation(post.location || null);
            if (post.location) {
                fetchLocationName(post.location);
            }
        }
    }, [visible, post]);

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



    // Limpiar estados cuando se cierra el modal
    const handleClose = () => {
        setTitle('');
        setDescription('');
        setImage('');
        setLocation(null);
        setStatus('LOST');
        setLocationName('');
        setShowMap(false);
        onClose();
    };

    const handlePickImage = async () => {
        try {
            const result = await pickImage();

            if (!result) return;

            // Verificar si la imagen ya es base64
            if (result.startsWith('data:image')) {
                setImage(result);
                return;
            }

            // Si es una ruta de archivo, comprimir y convertir a base64
            if (result.startsWith('file://')) {
                try {
                    // Primero comprimir la imagen
                    const compressedUri = await compressImage(result);

                    // Luego convertir a base64
                    const base64 = await FileSystem.readAsStringAsync(compressedUri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    // Asegurarse de que el base64 tenga el prefijo correcto
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
                if (data.address.city || data.address.town || data.address.village) {
                    parts.push(data.address.city || data.address.town || data.address.village);
                }
            }
            setLocationName(parts.length > 0 ? parts.join(', ') : 'Ubicación seleccionada');
        } catch (error) {
            console.error('Error obteniendo nombre de ubicación:', error);
            setLocationName('Ubicación seleccionada');
        }
    };

    const handleLocationSelect = async () => {
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

    const handleUpdate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'El título es obligatorio');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'La descripción es obligatoria');
            return;
        }

        try {
            const imageToSend = image ? (
                image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`
            ) : '';

            await updatePost(post.id, {
                title: title.trim(),
                description: description.trim(),
                image: imageToSend,
                status,
                Location: location,
            });
            onUpdateSuccess?.();
            handleClose();
        } catch (error: any) {
            console.error('Error updating post:', error);
            if (error.message?.includes('request entity too large')) {
                Alert.alert('Error', 'La imagen es demasiado grande. Por favor, intenta con una imagen más pequeña.');
            } else {
                Alert.alert('Error', 'No se pudo actualizar la publicación');
            }
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <StatusBar barStyle="light-content" />

                {showMap ? (
                    <View style={styles.mapContainer}>
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
                ) : (
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Editar Publicación</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                            >
                                <Ionicons name="close" size={24} color="#050505" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Ingrese el nombre"
                            />

                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Ingrese la descripción"
                                multiline
                                numberOfLines={4}
                            />

                            <Text style={styles.label}>Ubicación</Text>
                            <TouchableOpacity
                                style={styles.locationButton}
                                onPress={handleLocationSelect}
                            >
                                <Ionicons name="location" size={24} color="#4c00b0" />
                                <Text style={styles.locationButtonText}>
                                    {location ? locationName : "Seleccionar ubicación"}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Estado</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(itemValue: PostStatus) => setStatus(itemValue)}
                                    style={styles.picker}
                                >
                                    {(Object.keys(STATUS_LABELS) as PostStatus[]).map((key) => (
                                        <Picker.Item
                                            key={key}
                                            label={STATUS_LABELS[key]}
                                            value={key}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <Text style={styles.label}>Imagen</Text>
                            <TouchableOpacity
                                style={styles.imageButton}
                                onPress={handlePickImage}
                            >
                                <Ionicons name="camera" size={24} color="#4c00b0" />
                                <Text style={styles.imageButtonText}>Cambiar imagen</Text>
                            </TouchableOpacity>

                            {image && (
                                <View style={styles.imagePreviewContainer}>
                                    <Image
                                        source={{
                                            uri: image.startsWith('data:')
                                                ? image
                                                : `data:image/jpeg;base64,${image}`,
                                        }}
                                        style={styles.previewImage}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => setImage('')}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={handleUpdate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="save" size={20} color="#fff" />
                                        <Text style={styles.updateButtonText}>
                                            Guardar Cambios
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#f0f2f5',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.9,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#050505',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        flex: 1,
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#050505',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e4e6eb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4c00b0',
        marginBottom: 16,
    },
    locationButtonText: {
        marginLeft: 8,
        color: '#4c00b0',
        fontSize: 16,
        flex: 1,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4c00b0',
        marginBottom: 16,
    },
    imageButtonText: {
        marginLeft: 8,
        color: '#4c00b0',
        fontSize: 16,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#f0f2f5',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
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
    footer: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e4e6eb',
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4c00b0',
        padding: 16,
        borderRadius: 8,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e4e6eb',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    imagePreviewContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 4,
    },
});

export default EditPostModal;