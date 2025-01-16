import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AboutScreen: React.FC = () => {
  const handleEmergencyCall = () => {
    Linking.openURL('tel:911');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="account-search" size={64} color="#FF6B6B" />
        <Text style={styles.title}>EncontrarLos</Text>
        <Text style={styles.subtitle}>Unidos en la búsqueda</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nuestra Misión</Text>
        <Text style={styles.sectionText}>
          EncontrarLos es una red social dedicada a la búsqueda y localización de personas desaparecidas. 
          Facilitamos la difusión inmediata de información crítica y conectamos comunidades para 
          maximizar las posibilidades de encuentro.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Cómo Funciona?</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Icon name="bell-ring" size={32} color="#4A90E2" />
            <Text style={styles.featureText}>
              Alertas inmediatas cuando se reporta una persona desaparecida en tu área
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="map-marker-radius" size={32} color="#4A90E2" />
            <Text style={styles.featureText}>
              Geolocalización para difundir reportes en zonas relevantes
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="share-variant" size={32} color="#4A90E2" />
            <Text style={styles.featureText}>
              Compartir información verificada con la comunidad y autoridades
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="shield-check" size={32} color="#4A90E2" />
            <Text style={styles.featureText}>
              Colaboración directa con las autoridades y organizaciones de búsqueda
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recursos de Emergencia</Text>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleEmergencyCall}
        >
          <Icon name="phone" size={24} color="#FFF" />
          <Text style={styles.emergencyButtonText}>Llamar a Emergencias</Text>
        </TouchableOpacity>
        
        <View style={styles.helpInfo}>
          <Text style={styles.helpTitle}>Líneas de Ayuda 24/7:</Text>
          <Text style={styles.helpText}>• Policía Nacional: 911</Text>
          <Text style={styles.helpText}>• Locatel: [Número local]</Text>
          <Text style={styles.helpText}>• Fiscalía Especializada: [Número]</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compromiso con la Privacidad</Text>
        <Text style={styles.sectionText}>
          Protegemos la información sensible y verificamos todos los reportes para 
          prevenir el mal uso de la plataforma. Trabajamos en conjunto con autoridades 
          para garantizar la seguridad de todos los usuarios.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Versión 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 EncontrarLos</Text>
        <Text style={styles.supportEmail}>soporte@encontrarlos.org</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  featureList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    marginLeft: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  helpInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  version: {
    fontSize: 14,
    color: '#666',
  },
  copyright: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  supportEmail: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 4,
  },
});

export default AboutScreen;