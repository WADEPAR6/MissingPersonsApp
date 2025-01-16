// components/LocationPermission.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LocationPermissionProps = {
  onRequestLocation: () => Promise<void>;
  location: { latitude: number; longitude: number } | null;
};

export const LocationPermission: React.FC<LocationPermissionProps> = ({
  onRequestLocation,
  location,
}) => {
  return (
    <TouchableOpacity 
      style={styles.locationContainer}
      onPress={onRequestLocation}
    >
      <View style={styles.locationContent}>
        <Ionicons 
          name={location ? "location" : "location-outline"} 
          size={24} 
          color={location ? "#4c00b0" : "#666"}
        />
        <Text style={[
          styles.locationText,
          location && styles.locationActiveText
        ]}>
          {location 
            ? 'Ubicación agregada'
            : 'Agregar ubicación'
          }
        </Text>
      </View>
      {location && (
        <Text style={styles.locationDetail}>
          {`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  locationContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 15,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  locationActiveText: {
    color: '#4c00b0',
    fontWeight: '500',
  },
  locationDetail: {
    marginTop: 5,
    marginLeft: 34,
    fontSize: 12,
    color: '#888',
  },
});