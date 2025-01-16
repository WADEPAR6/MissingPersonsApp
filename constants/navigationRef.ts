import { createNavigationContainerRef } from '@react-navigation/native';

// Crea la referencia de navegación global
export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: any, params?: any) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    } else {
      console.warn('La navegación no está lista aún.');
    }
  }