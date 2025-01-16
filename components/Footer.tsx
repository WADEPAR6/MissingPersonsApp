// components/Footer.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Footer = () => {
  const navigation = useNavigation();
  
  const menuItems = [
    { name: 'home', label: 'Inicio', screen: 'Home' },
    { name: 'time-outline', label: '24 Horas', screen: '24Hours' },
    { name: 'add-circle', label: 'Añadir', screen: 'AddPost' },
    { name: 'list', label: 'Mis Posts', screen: 'MyPosts' },
    { name: 'location-outline', label: 'Cercanos', screen: 'Nearby' },
  ];

  return (
    <View style={styles.footer}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons name={item.name} size={24} color="#fff" />
          <Text style={styles.menuLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#4c00b0',
    borderTopWidth: 1,
    borderTopColor: '#3a008c',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: 12,
  },
  menuLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Footer;