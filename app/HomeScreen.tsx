import React from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePosts } from '@/hooks/usePosts';

interface User {
  id: number;
  name: string;
  lastname: string;
  username: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  user: User;
  location: {
    latitude: number;
    longitude: number;
  };
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [locationName, setLocationName] = React.useState<string>('');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  React.useEffect(() => {
    const getLocationName = async () => {
      if (post.location) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${post.location.latitude}&lon=${post.location.longitude}&accept-language=es`
          );
          const data = await response.json();
          
          // Construir una descripción de ubicación más amigable
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
      {/* Header del post */}
      <View style={styles.postHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {post.user.name[0]}
            {post.user.lastname[0]}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {post.user.name} {post.user.lastname}
          </Text>
          <View style={styles.postMetadata}>
            <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
            {post.location && (
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
      {/* Titulo */}
      {post.title && (
        <Text style={styles.description}>Nombre: {post.title}</Text>
      )}
      {/* Descripción */}
      {post.description && (
        <Text style={styles.description}>{post.description}</Text>
      )}
      {/* Imagen */}
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

const HomeScreen = () => {
  const { fetchPosts, refreshPosts, loading, hasMore } = usePosts();
  const [postes, setPostes] = React.useState<Post[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchPosts();
        setPostes(fetchedPosts);
      } catch (error) {
        console.error('Error cargando posts:', error);
      }
    };

    loadPosts();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshPosts();
      const freshPosts = await fetchPosts();
      setPostes(freshPosts);
    } catch (error) {
      console.error('Error al refrescar:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshPosts, fetchPosts]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4c00b0" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inicio</Text>
      </View>
      <FlatList
        data={postes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={hasMore ? fetchPosts : null}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4c00b0"
            colors={['#4c00b0']}
            progressBackgroundColor="#ffffff"
            title="Actualizando..."
            titleColor="#4c00b0"
          />
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#050505',
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
    marginRight: 4,
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
  loader: {
    paddingVertical: 20,
  },
});

export default HomeScreen;
