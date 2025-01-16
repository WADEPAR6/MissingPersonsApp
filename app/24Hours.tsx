// app/24HoursScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePosts } from '@/hooks/usePosts';

interface Post {
  id: number;
  title: string;
  description: string;
  image?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    lastname: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

const PostCard = ({ post }: { post: Post }) => {
  const [locationName, setLocationName] = React.useState<string>('');

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  React.useEffect(() => {
    const getLocationName = async () => {
      if (post.location?.latitude && post.location?.longitude) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${post.location.latitude}&lon=${post.location.longitude}&accept-language=es`
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
          
          setLocationName(parts.length > 0 ? parts.join(', ') : 'Ubicación desconocida');
        } catch (error) {
          console.error('Error obteniendo ubicación:', error);
          setLocationName('Ubicación no disponible');
        }
      }
    };

    getLocationName();
  }, [post.location]);

  return (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {post.user?.name?.[0] || ''}
            {post.user?.lastname?.[0] || ''}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {post.user?.name || 'Usuario'} {post.user?.lastname || ''}
          </Text>
          <View style={styles.postMetadata}>
            <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
            {locationName && (
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={12} color="#666" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {locationName}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {post.title && (
        <Text style={styles.title}>Nombre: {post.title}</Text>
      )}
      {post.description && (
        <Text style={styles.description}>{post.description}</Text>
      )}
      {post.image && (
        <Image
          source={{
            uri: post.image.startsWith('data:')
              ? post.image
              : `data:image/jpeg;base64,${post.image}`,
          }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const TwentyFourHoursScreen = () => {
  const { fetchPostsHours, loading } = usePosts();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await fetchPostsHours();
      console.log('Fetched posts:', fetchedPosts); // Para debug
      setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
    } catch (error) {
      console.error('Error cargando posts:', error);
      setPosts([]);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPosts();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !refreshing && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c00b0" />
        <Text style={styles.loadingText}>Cargando casos recientes...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Post }) => {
    if (!item?.id) {
      console.log('Invalid post item:', item); // Para debug
      return null;
    }
    return <PostCard post={item} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.warningTitle}>
          ¡Las primeras 24 horas son vitales!
        </Text>
        <Text style={styles.warningSubtitle}>
          Cuando alguien desaparece, las primeras 24 horas son cruciales para su búsqueda
        </Text>
      </View>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => (item?.id || '').toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4c00b0"
            colors={['#4c00b0']}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay casos reportados en las últimas 24 horas
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  warningSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e4e6eb',
  },
  postHeader: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4c00b0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#050505',
  },
  postMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#65676b',
    marginRight: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#65676b',
    marginLeft: 2,
    flex: 1,
  },
  title: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#050505',
  },
  description: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: '#050505',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f2f5',
  },
});

export default TwentyFourHoursScreen;