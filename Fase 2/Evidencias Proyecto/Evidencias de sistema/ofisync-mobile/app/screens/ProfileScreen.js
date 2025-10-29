import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getUsuario, logout } from '../../services/usuarioService';
import API from '../api/api';
import colors from '../theme/colors';
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [editableUserData, setEditableUserData] = useState({
    correo: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Cargar los datos del usuario al entrar en la pantalla
  useFocusEffect(
    useCallback(() => {
      async function loadUserData() {
        setLoading(true);
        setError(null);
        try {
          const usuarioLogueado = await getUsuario();
          if (!usuarioLogueado || !usuarioLogueado.persona_id) {
            throw new Error("No se pudo obtener la información del usuario.");
          }

          const response = await API.get(`/personas/${usuarioLogueado.persona_id}`);
          const personaData = response.data;

          setUserData(personaData); // Guardar todos los datos leídos
          // Inicializar el formulario solo con los campos editables
          setEditableUserData({
            correo: personaData.correo || '',
            telefono: personaData.telefono || '',
          });

        } catch (err) {
          const errorMsg = err.response?.data?.error || err.message || "Error al cargar los datos del perfil";
          setError(errorMsg);
          // Muestra alerta solo si el error no es por falta de usuario
          if (errorMsg !== "No se pudo obtener la información del usuario.") {
             Alert.alert("Error", errorMsg);
          } else {
          }
        } finally {
          setLoading(false);
        }
      }
      loadUserData();
      return () => {};
    }, [])
  );

  // Activar/desactivar el modo edición y restaurar datos si se cancela
  const handleEditToggle = () => {
    if (isEditing) {
      if (userData) {
        setEditableUserData({
          correo: userData.correo || '',
          telefono: userData.telefono || '',
        });
      }
    }
    setIsEditing(!isEditing); // Cambiar el estado de edición
  };

  // Guardar los cambios (solo correo y teléfono)
  const handleSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editableUserData.correo && editableUserData.correo.trim() !== '' && !emailRegex.test(editableUserData.correo)) {
        Alert.alert("Error de Validación", "Por favor ingresa un correo electrónico válido.");
        return;
    }

    if (editableUserData.telefono && editableUserData.telefono.trim() !== '') {
        const phoneDigits = editableUserData.telefono.replace(/\D/g, '');
        if (phoneDigits.length < 9 || phoneDigits.length > 12) {
            Alert.alert("Error de Validación", "El teléfono debe tener entre 9 y 12 dígitos.");
            return;
        }
    }

    setIsSaving(true);
    setError(null);

    try {
      const usuarioLogueado = await getUsuario();
      if (!usuarioLogueado || !usuarioLogueado.persona_id) {
        throw new Error("No se pudo obtener la información del usuario para guardar.");
      }

      // Llama a la API (PUT /personas/:id) enviando solo los campos editables
      const response = await API.put(`/personas/${usuarioLogueado.persona_id}`, {
        correo: editableUserData.correo,
        telefono: editableUserData.telefono,
      });

      // Actualiza el estado local con la respuesta completa del backend
      const updatedData = response.data;
      setUserData(updatedData); // Actualiza los datos mostrados (incluyendo nombre, rut)
      // Asegura que el formulario editable refleje lo guardado
      setEditableUserData({
          correo: updatedData.correo || '',
          telefono: updatedData.telefono || '',
      });

      setIsEditing(false);
      Alert.alert("Éxito", "Datos actualizados correctamente.");

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Error al guardar los datos";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      console.error("Error en handleSave:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Cierre de sesión
  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login'); // Redirige a Login
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert("Error", "No se pudo cerrar la sesión.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
     return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text>Cargando perfil...</Text>
        </View>
      );
  }
  if (error && !userData) {
     return (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { (async () => loadUserData())() }}>
             <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
  }

  // Renderizado principal
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.cardContainer}>
        <Text style={styles.title}>Mi Perfil</Text>

        {/* RUT (no editable) */}
        {userData?.rut && (
           <View style={styles.fieldContainer}>
             <Text style={styles.label}>RUT</Text>
             <TextInput
               style={[styles.input, styles.readOnlyInput]}
               value={userData.rut}
               editable={false}
             />
           </View>
        )}

        {/* Nombre (no editable) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={userData?.nombre || ''}
            editable={false}
            placeholder="Nombre Completo"
          />
        </View>

        {/* Correo (Editable) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={isEditing ? styles.input : [styles.input, styles.readOnlyInput]}
            value={editableUserData.correo}
            onChangeText={(text) => setEditableUserData({ ...editableUserData, correo: text })}
            editable={isEditing}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="ejemplo@correo.com"
          />
        </View>

        {/* Teléfono (Editable) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={isEditing ? styles.input : [styles.input, styles.readOnlyInput]}
            value={editableUserData.telefono}
            onChangeText={(text) => setEditableUserData({ ...editableUserData, telefono: text })}
            editable={isEditing}
            keyboardType="phone-pad"
            placeholder="+569 o similar (9-12 dígitos)"
          />
        </View>

        {/* Botones Editar/Guardar/Cancelar */}
        <View style={styles.buttonContainer}>
              <TouchableOpacity
                  style={[styles.button, isEditing ? styles.cancelButton : styles.editButton]}
                  onPress={handleEditToggle}
                  disabled={isSaving} // Deshabilitar si se está guardando
              >
                  <Ionicons
                  name={isEditing ? "close-circle-outline" : "create-outline"}
                  size={20} color={colors.white}
                  style={{marginRight: 5}}
                  />
                  <Text style={styles.buttonText}>{isEditing ? 'Cancelar' : 'Editar Datos'}</Text>
              </TouchableOpacity>

              {/* Botón Guardar (solo visible en modo edición) */}
              {isEditing && (
                  <TouchableOpacity
                      style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]}
                      onPress={handleSave}
                      disabled={isSaving} // Deshabilitar si se está guardando
                  >
                      {isSaving ? (
                      <ActivityIndicator color={colors.white} size="small" />
                      ) : (
                      <>
                      <Ionicons name="save-outline" size={20} color={colors.white} style={{marginRight: 5}}/>
                      <Text style={styles.buttonText}>Guardar Cambios</Text>
                      </>
                      )}
                  </TouchableOpacity>
              )}
        </View>

        {/* Botón Cerrar Sesión (solo visible si no se está editando) */}
        {!isEditing && (
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            disabled={isSaving || loading} // Deshabilitar si está cargando o guardando
          >
            <Ionicons name="log-out-outline" size={20} color={colors.white} style={{marginRight: 5}}/>
            <Text style={styles.buttonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        )}

      </View>
    </ScrollView>
  );
};

// Estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer:{
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    cardContainer: {
        width: '95%',
        maxWidth: 600,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3, },
        shadowOpacity: 0.18,
        shadowRadius: 4.65,
        elevation: 6,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: colors.danger,
        marginTop: 10,
        textAlign: 'center',
        fontSize: 16,
    },
    retryButton: {
        marginTop: 10,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 30,
        textAlign: 'center',
    },
    fieldContainer: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: colors.white,
    },
    readOnlyInput: {
        backgroundColor: '#f0f0f0',
        color: '#555',
    },
    buttonContainer: {
        marginTop: 15,
        marginBottom: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.1,
        shadowRadius: 2.00,
        elevation: 2,
    },
    editButton: {
        backgroundColor: colors.primary,
    },
    cancelButton: {
        backgroundColor: colors.danger,
    },
    saveButton: {
        backgroundColor: colors.success,
    },
    logoutButton: {
        backgroundColor: colors.danger,
    },
    buttonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: colors.gray,
        elevation: 0,
        shadowOpacity: 0,
    },
});

export default ProfileScreen;