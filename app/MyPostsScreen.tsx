"use client";

// app/MyPostsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePosts } from '@/hooks/usePosts';
import { useNavigation } from '@react-navigation/native';
import EditPostModal from '@/components/EditPostModal';

// Definición de interfaces
interface Post {
  id: number;
  title: string;
  description: string;
  image?: string;
  status?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
  onEdit: (post: Post) => void;
}



const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onEdit }) => {
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

  const handleEdit = () => {
    onEdit(post);
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar esta publicación?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(post.id)
        }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.title}</Text>
          {/* Modificación para mostrar el estado */}
          {post.status && (
            <View
              style={[
                styles.statusBadge,
                post.status === 'Perdid@' && styles.statusLost,
                post.status === 'Encontrad@' && styles.statusFound,
                post.status === 'Muert@' && styles.statusDeceased
              ]}
            >
              <Text style={styles.statusText}>{post.status}</Text>
            </View>
          )}
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

      <Text style={styles.description}>{post.description}</Text>

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

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MyPostsScreen = () => {
  const { fetchUserPosts, deletePost, loading } = usePosts();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const loadPosts = async () => {
    try {
      const userPosts = await fetchUserPosts();
      setPosts(userPosts);
    } catch (error) {
      console.error('Error cargando posts:', error);
    }
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (postId: number) => {
    try {
      await deletePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error eliminando post:', error);
    }
  };

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
        <Text style={styles.loadingText}>Cargando tus publicaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Publicaciones</Text>
      </View>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
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
                No tienes publicaciones aún
              </Text>
            </View>
          ) : null
        }
      />
      {/* Agregar el Modal */}
      <EditPostModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        post={selectedPost}
        onUpdateSuccess={() => {
          loadPosts();
          setIsEditModalVisible(false);
        }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#050505',
  },
  postMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#e4e6eb',
    justifyContent: 'space-around',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4c00b0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  statusLost: {
    backgroundColor: '#FFF4E5', // Amarillo claro
    borderColor: '#FFB300',     // Naranja amarillento
    borderWidth: 1,
  },
  statusFound: {
    backgroundColor: '#E8F5E9', // Verde muy claro
    borderColor: '#4CAF50',     // Verde
    borderWidth: 1,
  },
  statusDeceased: {
    backgroundColor: '#F5F5F5', // Gris muy claro
    borderColor: '#9E9E9E',     // Gris
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
});

export default MyPostsScreen;