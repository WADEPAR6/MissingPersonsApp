// screens/AuthScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

const { height } = Dimensions.get('window');

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<{ [key: string]: string }>({
    name: '',
    lastname: '',
    address: '',
    phone: '',
    birthdate: '',
    username: '',
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      await login(loginData);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const handleRegister = async () => {
    try {
      await register(registerData);
      Alert.alert('Éxito', 'Registro completado con éxito', [
        { text: 'OK', onPress: () => setActiveTab('login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error en el registro');
    }
  };

  const renderLoginForm = () => (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={loginData.email}
        onChangeText={(text) => setLoginData(prev => ({ ...prev, email: text }))}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={loginData.password}
        onChangeText={(text) => setLoginData(prev => ({ ...prev, password: text }))}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.form}>
      {[
        { key: 'name', placeholder: 'Nombre', type: 'default' },
        { key: 'lastname', placeholder: 'Apellido', type: 'default' },
        { key: 'address', placeholder: 'Dirección', type: 'default' },
        { key: 'phone', placeholder: 'Teléfono', type: 'phone-pad' },
        { key: 'birthdate', placeholder: 'Fecha (YYYY-MM-DD)', type: 'default' },
        { key: 'username', placeholder: 'Nombre de usuario', type: 'default' },
        { key: 'email', placeholder: 'Correo electrónico', type: 'email-address' },
        { key: 'password', placeholder: 'Contraseña', type: 'default', secure: true },
      ].map(field => (
        <TextInput
          key={field.key}
          style={styles.input}
          placeholder={field.placeholder}
          value={registerData[field.key]}
          onChangeText={(text) => setRegisterData(prev => ({ ...prev, [field.key]: text }))}
          keyboardType={field.type}
          secureTextEntry={field.secure}
          autoCapitalize={field.type === 'email-address' ? 'none' : 'sentences'}
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search By</Text>
        <View style={styles.tabContainer}>
          {['login', 'register'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4c00b0',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4c00b0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    paddingVertical: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#4c00b0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});