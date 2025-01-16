// // components/HomePage.tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';

// interface Post {
//   id: number;
//   title: string;
//   content: string;
//   createdAt: string; // Asegúrate de que este campo esté en el formato correcto
// }

// const HomePage: React.FC = () => {
//   const [posts, setPosts] = useState<Post[]>([]);

//   console.log('ESTADO DE PRUEBA');
//   console.log('ESTADO DE PRUEBA');

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const response = await fetch('http://192.168.100.13:3000/user')
//         const data = await response.json();
//         const sortedPosts = data.sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//         setPosts(sortedPosts);
//         console.log(sortedPosts);
//         console.log(data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchPosts();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={posts}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={styles.post}>
//             <Text style={styles.postTitle}>{item.title}</Text>
//             <Text>{item.content}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   post: {
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   postTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default HomePage;

// app/HomeScreen.tsx
import React from 'react';
import { View, FlatList, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { usePosts } from '@/hooks/usePosts';

interface PostCardProps {
  title: string;
  description: string;
  image: string;
  createdAt: string;
}

const PostCard: React.FC<PostCardProps> = ({ title, description, image, createdAt }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Image
      source={{ uri: `data:image/jpeg;base64,${image}` }}
      style={styles.image}
      resizeMode="cover"
    />
    <Text style={styles.description}>{description}</Text>
    <Text style={styles.date}>{new Date(createdAt).toLocaleDateString()}</Text>
  </View>
);

const HomeScreen = () => {
  const { posts, fetchPosts, loading, hasMore } = usePosts();

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="large" color="#4c00b0" />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            title={item.title}
            description={item.description}
            image={item.image}
            createdAt={item.createdAt}
          />
        )}
        onEndReached={fetchPosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;
