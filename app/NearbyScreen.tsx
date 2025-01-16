// app/NearbyScreen.tsx
import React, { useEffect } from 'react';
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
import { useNearbyPosts } from '@/hooks/useNearbybyPosts';

interface Post {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  distance: number;
  image?: string;
  user: {
    name: string;
    lastname: string;
  };
  cityInfo?: {
    city: string;
    state: string;
  };
}

const PostCard = ({ post }: { post: Post }) => {
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
            {post.cityInfo && (
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={12} color="#666" />
                <Text style={styles.locationText}>
                  {post.cityInfo.city}, {post.cityInfo.state}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Contenido del post */}
      <Text style={styles.title}>Nombre: {post.title}</Text>
      <Text style={styles.description}>{post.description}</Text>
      
      {/* Distancia */}
      <View style={styles.distanceContainer}>
        <Ionicons name="navigate" size={14} color="#4c00b0" />
        <Text style={styles.distanceText}>
          A {post.distance.toFixed(2)} km de distancia
        </Text>
      </View>

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

const NearbyScreen = () => {
  const { posts, loading, fetchNearbyPosts, refreshPosts } = useNearbyPosts();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchNearbyPosts();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshPosts();
    } finally {
      setRefreshing(false);
    }
  }, [refreshPosts]);

  if (loading && !refreshing && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c00b0" />
        <Text style={styles.loadingText}>Buscando posts cercanos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Posts Cercanos</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
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
                No hay posts cercanos en este momento
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
  locationText: {
    fontSize: 12,
    color: '#65676b',
    marginLeft: 4,
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
    paddingBottom: 8,
    fontSize: 14,
    color: '#050505',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#4c00b0',
    marginLeft: 4,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f2f5',
  },
});

export default NearbyScreen;