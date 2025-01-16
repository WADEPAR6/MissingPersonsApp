import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';

const { height, width } = Dimensions.get('window'); // Obtener las dimensiones de la pantalla

const Header: React.FC = () => {
  const navigation = useNavigation();
  const { isLoggedIn, logout } = useAuth(); // Asumiendo que tienes un hook de autenticación
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width)); // Iniciar el menú fuera de la pantalla a la izquierda

  const openMenu = () => {
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0, // Deslizar el menú hacia la derecha (mostrarlo)
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.spring(slideAnim, {
      toValue: -width, // Deslizar el menú hacia la izquierda (ocultarlo)
      useNativeDriver: true,
    }).start(() => setModalVisible(false)); // Cerrar después de la animación
  };

  return (
    <View style={styles.header}>
      {/* Menú Hamburguesa */}
      <TouchableOpacity onPress={openMenu}>
        <Text style={styles.menuButton}>☰</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Search By</Text>

      {/* Botón de Cerrar Sesión */}
      {isLoggedIn && (
        <TouchableOpacity style={styles.logoutBottom} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}

      {/* Modal con el menú deslizable */}
      {modalVisible && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay}>
            <Animated.View
              style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}
            >
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.menuContent}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('Options' as never); closeMenu(); }}>
                    <Text style={styles.menuItemText}>Opciones</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('About' as never); closeMenu(); }}>
                    <Text style={styles.menuItemText}>Acerca de</Text>
                  </TouchableOpacity>
                </View>
                {/* Botón de Cerrar Sesión en la parte inferior */}
                <TouchableOpacity style={styles.logoutBottom} onPress={() => { logout(); closeMenu(); }}>
                  <Text style={styles.logoutBottomText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4c00b0',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
    flex: 1,
    textAlign: 'center',
  },

  // Estilos para el menú deslizable
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',  // Ancho del menú (80% de la pantalla)
    height: height, // Altura completa de la pantalla
    backgroundColor: '#2c3e50', // Fondo azul oscuro
    zIndex: 9999, // Asegurar que el modal se sobreponga a otros componentes
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    zIndex: 999, // Asegura que esté debajo del menú
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#2c3e50', // Fondo azul oscuro
  },
  menuContent: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 50, // Deja un espacio desde arriba
    paddingLeft: 20,
    paddingRight: 20,
  },
  menuItem: {
    marginBottom: 20,
    paddingVertical: 15,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '600',
    backgroundImage: 'linear-gradient(to right, #ffffff, #00aaff)', // Degradado de blanco a celeste
    backgroundClip: 'text',
    color: 'transparent', // Texto transparente para que el degradado sea visible
    textAlign: 'center',
  },

  // Estilo para el botón de Cerrar Sesión en la parte inferior
  logoutBottom: {
    paddingVertical: 15,
    backgroundColor: '#e74c3c', // Fondo rojo para el botón
    marginBottom: 20,
    borderRadius: 5,
    marginHorizontal: 20,
    position: 'absolute',
    bottom: 30,  // Lo mantiene en la parte inferior
    left: '50%',
    transform: [{ translateX: -150 }],
  },
  logoutText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  logoutBottomText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },

});

export default Header;
