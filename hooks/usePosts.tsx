
import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from './useAuth';
import { Alert } from 'react-native';
import { jwtDecode } from 'jwt-decode';

// const API_URL = 'http://10.80.3.99:3000/posts';
const API_URL = 'http://192.168.100.13:3000/posts';

type LocationType = {
    latitude: number;
    longitude: number;
};

type PostData = {
    title: string;
    description: string;
    image: string;
    userId: number;
    Location: any;
    status?: string;
};

export const usePosts = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [location, setLocation] = useState<LocationType | null>(null);
    const [loading, setLoading] = useState(false);

    const { getAuthHeader } = useAuth();

    // Método para obtener posts menos de 24 horas
    const fetchPostsHours = useCallback(async () => {
        setLoading(true);
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_URL}/24hours`, { headers });
            const data = await response.json();

            // Asegurémonos de que data sea un array plano
            if (Array.isArray(data)) {
                return data;
            } else if (data && typeof data === 'object') {
                // Si data es un objeto y tiene una propiedad que es un array
                const possibleArray = Object.values(data).find(value => Array.isArray(value));
                if (possibleArray) {
                    return possibleArray;
                }
            }

            return [];
        } catch (error) {
            console.error('Error fetching 24 hours posts:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    const fetchPosts = useCallback(async () => {
        if (loading || !hasMore) return [];

        setLoading(true);
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_URL}?page=${page}`, { headers });
            const data = await response.json();
            const fetchedPosts = data.data || [];
            const totalPages = data.meta?.totalPages || 0;

            if (page >= totalPages || fetchedPosts.length === 0) {
                setHasMore(false);
            } else {
                setPage((prev) => prev + 1);
            }

            return fetchedPosts;
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page, getAuthHeader]);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permiso denegado',
                    'Necesitamos acceso a tu ubicación para continuar'
                );
                return false;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            const locationData = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };

            await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
            setLocation(locationData);
            return true;
        } catch (error) {
            console.error('Error requesting location:', error);
            return false;
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Lo sentimos', 'Necesitamos acceso a tus fotos para continuar');
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }

        return null;
    };

    const createPost = async (postData: PostData) => {
        try {
            setLoading(true);
            const headers = await getAuthHeader();

            if (!headers) {
                throw new Error('No se encontró token de autenticación');
            }

            const jsonData = {
                title: postData.title,
                description: postData.description,
                image: postData.image,
                userId: postData.userId,
                location: postData.Location
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el post');
            }

            const newPost = await response.json();
            setPosts(prevPosts => [newPost, ...prevPosts]);

            return newPost;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Obtener posts de un usuario
    const fetchUserPosts = useCallback(async () => {
        setLoading(true);
        try {
            const headers = await getAuthHeader();
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('No se encontró el token de usuario');
            }
            const { sub: userId } = jwtDecode(token);

            const response = await fetch(`${API_URL}/username/${userId}`, { headers });

            if (!response.ok) {
                throw new Error('Error al obtener los posts del usuario');
            }

            const data = await response.json();
            setPosts(data);
            return data;
        } catch (error) {
            console.error('Error fetching user posts:', error);
            Alert.alert('Error', 'No se pudieron cargar tus posts');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    // Editar un post
    const updatePost = useCallback(async (postId: number, updatedData: Partial<PostData>) => {
        setLoading(true);
        try {
            const headers = await getAuthHeader();

            const response = await fetch(`${API_URL}/${postId}`, {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el post');
            }

            const updatedPost = await response.json();

            // Actualizar el post en el estado local
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post.id === postId ? { ...post, ...updatedPost } : post
                )
            );

            Alert.alert('Éxito', 'Post actualizado correctamente');
            return updatedPost;
        } catch (error) {
            console.error('Error updating post:', error);
            Alert.alert('Error', 'No se pudo actualizar el post');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    // Eliminar un post
    const deletePost = useCallback(async (postId: number) => {
        setLoading(true);
        try {
            const headers = await getAuthHeader();

            const response = await fetch(`${API_URL}/${postId}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el post');
            }

            // Eliminar el post del estado local
            setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
            Alert.alert('Éxito', 'Post eliminado correctamente');

            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'No se pudo eliminar el post');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    // Limpieza de posts y reset de paginación
    const refreshPosts = useCallback(async () => {
        setPage(1);
        setPosts([]);
        setHasMore(true);
        await fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        location,
        loading,
        hasMore,
        fetchPosts,
        refreshPosts,
        createPost,
        requestLocationPermission,
        pickImage,
        fetchPostsHours,
        fetchUserPosts,
        updatePost,
        deletePost,
    };
};