// hooks/useNearbyPosts.tsx
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAuth } from './useAuth';
import { Alert } from 'react-native';

const API_URL = 'http://10.80.0.89:3000/posts';
// const API_URL = 'http://192.168.100.13:3000/posts';

export interface NearbyPost {
  id: number;
  title: string;
  description: string;
  image: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: {
    id: number;
    name: string;
    lastname: string;
    username: string;
  };
  distance: number;
  cityInfo?: {
    city: string;
    state: string;
    country: string;
  };
}

export const useNearbyPosts = () => {
  const [posts, setPosts] = useState<NearbyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const { getAuthHeader } = useAuth();

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tu ubicación para encontrar posts cercanos'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

  const fetchNearbyPosts = async () => {
    try {
      setLoading(true);
      const currentLocation = location || await getCurrentLocation();
      
      if (!currentLocation) {
        Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
        return;
      }

      const headers = await getAuthHeader();
      const response = await fetch(
        `${API_URL}/nearby?lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}&radius=5`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Error fetching nearby posts');
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching nearby posts:', error);
      Alert.alert('Error', 'No se pudieron cargar los posts cercanos');
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = useCallback(async () => {
    setPosts([]);
    await fetchNearbyPosts();
  }, []);

  return {
    posts,
    loading,
    location,
    fetchNearbyPosts,
    refreshPosts,
    getCurrentLocation,
  };
};