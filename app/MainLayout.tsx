// app/_layout.tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Footer from '../components/Footer';
import HomeScreen from './HomeScreen';
import Hours24Screen from './24Hours';
import AddPostScreen from './AddPostScreen';
import MyPostsScreen from './MyPostsScreen';
import NearbyScreen from './NearbyScreen';
import OptionsScreen from './OptionsScreen';
import AboutScreen from './AboutScreen';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

const Drawer = createDrawerNavigator();

// Componente personalizado para el contenido del Drawer
function CustomDrawerContent(props) {
  const { logout } = useAuth();
  
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Search By</Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Cerrar Sesión"
        onPress={logout}
        labelStyle={styles.logoutLabel}
        style={styles.logoutItem}
      />
    </DrawerContentScrollView>
  );
}

// Componente que envuelve la pantalla con el footer


function ScreenWithFooter({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <Footer />
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4c00b0',
          },
          headerTintColor: '#fff',
          drawerStyle: {
            backgroundColor: '#2c3e50',
            width: '80%',
          },
          drawerLabelStyle: {
            color: '#fff',
          },
          drawerActiveBackgroundColor: '#4c00b0',
          drawerInactiveTintColor: '#fff',
        }}
      >
        <Drawer.Screen 
          name="Home"
          options={{ title: 'Inicio' }}
        >
          {(props) => (
            <ScreenWithFooter>
              <HomeScreen {...props} />
            </ScreenWithFooter>
          )}
        </Drawer.Screen>
        
        <Drawer.Screen 
          name="24Hours"
          options={{ title: '24 Horas' }}
        >
          {(props) => (
            <ScreenWithFooter>
              <Hours24Screen {...props} />
            </ScreenWithFooter>
          )}
        </Drawer.Screen>

        <Drawer.Screen 
          name="AddPost"
          options={{ title: 'Añadir Post' }}
        >
          {(props) => (
            <ScreenWithFooter>
              <AddPostScreen {...props} />
            </ScreenWithFooter>
          )}
        </Drawer.Screen>

        

        <Drawer.Screen 
          name="MyPosts"
          options={{ title: 'Mis Posts' }}
        >
          {(props) => (
            <ScreenWithFooter>
              <MyPostsScreen {...props} />
            </ScreenWithFooter>
          )}
        </Drawer.Screen>

        <Drawer.Screen 
          name="Nearby"
          options={{ title: 'Cercanos' }}
        >
          {(props) => (
            <ScreenWithFooter>
              <NearbyScreen {...props} />
            </ScreenWithFooter>
          )}
        </Drawer.Screen>

        <Drawer.Screen 
          name="Options"
          options={{ title: 'Opciones' }}
        >
          {(props) => (
            <ScreenWithFooter>
              <OptionsScreen {...props} />
            </ScreenWithFooter>
          )}
        </Drawer.Screen>

        <Drawer.Screen 
          name="About"
          options={{ title: 'Acerca de' }}
        >
          {(props) => (
            <ScreenWithFooter>
              <AboutScreen {...props} />
            </ScreenWithFooter>
          )}
        </Drawer.Screen>
      </Drawer.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: '#4c00b0',
    marginBottom: 10,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutItem: {
    backgroundColor: '#e74c3c',
    marginHorizontal: 10,
    marginTop: 'auto',
    marginBottom: 20,
    borderRadius: 8,
  },
  logoutLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
});