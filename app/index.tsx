// app/index.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const IndexPage = () => (
  <View style={styles.container}>
    <Text>Bienvenido a la Página de Inicio</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IndexPage;
