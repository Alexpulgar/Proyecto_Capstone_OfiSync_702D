import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getUsuario, logout } from '../../services/usuarioService';
import API from '../api/api';
import colors from '../theme/colors';
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const navigation = useNavigation();

  // Estados Tarjeta 1 (Datos Personales)
  const [userData, setUserData] = useState(null);
  const [editableUserData, setEditableUserData] = useState({
    correo: '',
    telefono: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados Tarjeta 2 (Credenciales)
  const [username, setUsername] = useState('');
  const [passwordStep, setPasswordStep] = useState('idle');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Estados Generales 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar los datos del usuario (ambas tarjetas)
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

          setUsername(usuarioLogueado.nombre_usuario || '');

          const response = await API.get(`/personas/${usuarioLogueado.persona_id}`);
          const personaData = response.data;

          setUserData(personaData);
          setEditableUserData({
            correo: personaData.correo || '',
            telefono: personaData.telefono || '',
          });

        } catch (err) {
          const errorMsg = err.response?.data?.error || err.message || "Error al cargar los datos del perfil";
          setError(errorMsg);
          if (errorMsg !== "No se pudo obtener la información del usuario.") {
             Alert.alert("Error", errorMsg);
          }
        } finally {
          setLoading(false);
        }
      }
      loadUserData();

      return () => {
        setPasswordStep('idle');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
        setIsCodeLoading(false);
      };
    }, [])
  );

  //  Handlers Tarjeta 1 (Datos Personales) 
  const handleEditToggle = () => {
    if (isEditing) {
      if (userData) {
        setEditableUserData({
          correo: userData.correo || '',
          telefono: userData.telefono || '',
        });
      }
      Keyboard.dismiss();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    // Validaciones
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
    
    Keyboard.dismiss();
    setIsSaving(true);
    setError(null);

    try {
      const usuarioLogueado = await getUsuario();
      if (!usuarioLogueado || !usuarioLogueado.persona_id) {
        throw new Error("No se pudo obtener la información del usuario para guardar.");
      }

      const response = await API.put(`/personas/${usuarioLogueado.persona_id}`, {
        correo: editableUserData.correo,
        telefono: editableUserData.telefono,
      });

      const updatedData = response.data;
      setUserData(updatedData);
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

  // Handlers Tarjeta 2 (Credenciales)
  const handleRequestCode = async () => {
    if (!userData || !userData.correo) {
       Alert.alert("Error", "No se pudo encontrar tu correo electrónico para enviar el código.");
       return;
    }
    Keyboard.dismiss();
    setIsCodeLoading(true);
    try {
      const response = await API.post('/usuarios/solicitar-codigo');
      
      Alert.alert("Código Enviado", response.data.message || `Se ha enviado un código a ${userData.correo}`);
      setPasswordStep('code_sent');

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "No se pudo enviar el código";
      Alert.alert("Error", errorMsg);
    } finally {
      setIsCodeLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (resetCode.length !== 6 || isNaN(resetCode)) {
      Alert.alert("Error", "El código debe ser de 6 dígitos numéricos.");
      return;
    }
    Keyboard.dismiss();
    setIsCodeLoading(true);
    try {
      await API.post('/usuarios/verificar-codigo', { code: resetCode });

      setPasswordStep('code_verified');

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Error al verificar el código";
      Alert.alert("Error", errorMsg);
    } finally {
      setIsCodeLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    Keyboard.dismiss();
    setIsCodeLoading(true);
    try {
      await API.put('/usuarios/actualizar-password', { 
        code: resetCode, 
        newPassword: newPassword 
      });
      
      Alert.alert("Éxito", "Contraseña actualizada. Serás desconectado por seguridad.");
      await logout();
      navigation.replace('Login');

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "No se pudo actualizar la contraseña";
      Alert.alert("Error", errorMsg);
      setIsCodeLoading(false);
    }
  };

  const cancelPasswordChange = () => {
    setPasswordStep('idle');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setIsCodeLoading(false);
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
              navigation.replace('Login');
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert("Error", "No se pudo cerrar la sesión.");
            }
          },
        },
      ]
    );
  };

  // Renderizado 
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

  const isChangingPassword = passwordStep !== 'idle';
  const canEditData = !isChangingPassword;
  const canLogout = !isEditing && !isChangingPassword;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{width: '100%', alignItems: 'center'}}>

              {/* TARJETA 1: DATOS PERSONALES */}
              <View style={styles.cardContainer}>
                <Text style={styles.title}>Mis Datos</Text>
                {userData?.rut && (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>RUT</Text>
                    <TextInput style={[styles.input, styles.readOnlyInput]} value={userData.rut} editable={false} />
                  </View>
                )}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Nombre Completo</Text>
                  <TextInput style={[styles.input, styles.readOnlyInput]} value={userData?.nombre || ''} editable={false} />
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Correo Electrónico</Text>
                  <TextInput
                    style={(isEditing && canEditData) ? styles.input : [styles.input, styles.readOnlyInput]}
                    value={editableUserData.correo}
                    onChangeText={(text) => setEditableUserData({ ...editableUserData, correo: text })}
                    editable={isEditing && canEditData}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="ejemplo@correo.com"
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={(isEditing && canEditData) ? styles.input : [styles.input, styles.readOnlyInput]}
                    value={editableUserData.telefono}
                    onChangeText={(text) => setEditableUserData({ ...editableUserData, telefono: text })}
                    editable={isEditing && canEditData}
                    keyboardType="phone-pad"
                    placeholder="+569 o similar (9-12 dígitos)"
                  />
                </View>
                {canEditData && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, isEditing ? styles.cancelButton : styles.editButton]}
                      onPress={handleEditToggle}
                      disabled={isSaving}
                    >
                      <Ionicons name={isEditing ? "close-circle-outline" : "create-outline"} size={20} color={colors.white} style={styles.iconSpacing} />
                      <Text style={styles.buttonText}>{isEditing ? 'Cancelar' : 'Editar Datos'}</Text>
                    </TouchableOpacity>

                    {isEditing && (
                      <TouchableOpacity
                        style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? <ActivityIndicator color="#fff" size="small" style={styles.iconSpacing} /> : <Ionicons name="save-outline" size={20} color={colors.white} style={styles.iconSpacing} />}
                        <Text style={styles.buttonText}>Guardar Cambios</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* TARJETA 2: CREDENCIALES  */}
              {!isEditing && (
                <View style={[styles.cardContainer]}>
                  <Text style={styles.title}>Credenciales</Text>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Nombre de Usuario</Text>
                    <TextInput
                      style={[styles.input, styles.readOnlyInput]}
                      value={username}
                      editable={false}
                    />
                  </View>
                  
                  {/* Flujo de Cambio de Contraseña   */}

                  {/* Paso 1: Botón inicial "Cambiar" */}
                  {passwordStep === 'idle' && (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Contraseña</Text>
                      <View style={styles.passwordReadonlyContainer}>
                        <TextInput
                          style={[styles.input, styles.readOnlyInput, { flex: 1, marginBottom: 0 }]}
                          value={"********"}
                          editable={false}
                        />
                        <TouchableOpacity
                          style={styles.changePassButton}
                          onPress={handleRequestCode}
                          disabled={isCodeLoading}
                        >
                          {isCodeLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.changePassButtonText}>Cambiar</Text>}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  
                  {/* Paso 2: Ingresar Código */}
                  {passwordStep === 'code_sent' && (
                    <View>
                      <Text style={styles.label}>Código de Verificación</Text>
                      <Text style={styles.infoText}>Se envió un código a {userData?.correo}.</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ingresa el código de 6 dígitos"
                        keyboardType="number-pad"
                        value={resetCode}
                        onChangeText={(text) => setResetCode(text.replace(/[^0-9]/g, ""))}
                        maxLength={6}
                      />
                      <TouchableOpacity
                        style={[styles.button, styles.saveButton, isCodeLoading && styles.disabledButton]}
                        onPress={handleVerifyCode}
                        disabled={isCodeLoading}
                      >
                        {isCodeLoading ? <ActivityIndicator color="#fff" size="small" style={styles.iconSpacing} /> : <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} style={styles.iconSpacing} />}
                        <Text style={styles.buttonText}>Verificar Código</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={cancelPasswordChange}
                        disabled={isCodeLoading}
                      >
                        <Text style={[styles.buttonText]}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Paso 3: Ingresar Nueva Contraseña */}
                  {passwordStep === 'code_verified' && (
                    <View>
                      <Text style={styles.label}>Nueva Contraseña (mín. 6 caracteres)</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Nueva Contraseña"
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry={!isNewPasswordVisible}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          style={styles.eyeIcon}
                          onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                        >
                          <Ionicons name={isNewPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color={colors.primary} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Confirmar Contraseña"
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry={!isConfirmPasswordVisible}
                          autoCapitalize="none"
                        />
                         <TouchableOpacity
                          style={styles.eyeIcon}
                          onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        >
                          <Ionicons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity
                        style={[styles.button, styles.saveButton, isCodeLoading && styles.disabledButton]}
                        onPress={handleUpdatePassword}
                        disabled={isCodeLoading}
                      >
                        {isCodeLoading ? <ActivityIndicator color="#fff" size="small" style={styles.iconSpacing} /> : <Ionicons name="save-outline" size={20} color={colors.white} style={styles.iconSpacing} />}
                        <Text style={styles.buttonText}>Actualizar Contraseña</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={cancelPasswordChange}
                        disabled={isCodeLoading}
                      >
                        <Text style={[styles.buttonText]}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Botón Cerrar Sesión  */}
              {canLogout && (
                <TouchableOpacity
                  style={[styles.button, styles.logoutButton]}
                  onPress={handleLogout}
                  disabled={isSaving || loading || isCodeLoading}
                >
                  <Ionicons name="log-out-outline" size={20} color={colors.white} style={styles.iconSpacing} />
                  <Text style={styles.buttonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              )}

            </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Estilos
const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        backgroundColor: colors.background,
    },
    contentContainer:{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 15,
    },
    cardContainer: {
        width: '99%',
        maxWidth: 600,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3, },
        shadowOpacity: 0.18,
        shadowRadius: 4.65,
        elevation: 6,
        marginBottom: 20,
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
        color: colors.black,
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
    infoText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        height: 50,
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
    iconSpacing: {
      marginRight: 8,
    },
    editButton: {
        backgroundColor: colors.primary,
    },
    cancelButton: {
        backgroundColor: colors.danger, 
    },
    saveButton: {
        backgroundColor: colors.success,
        marginTop: 10,
    },
    logoutButton: {
        backgroundColor: colors.danger,
        width: '99%',
        maxWidth: 600,
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
    passwordReadonlyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    changePassButton: {
      paddingHorizontal: 15,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      marginLeft: 10,
      backgroundColor: '#f8f8ff'
    },
    changePassButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 16,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.textSecondary,
    },
    passwordInputContainer: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 25,
        backgroundColor: colors.white,
        height: 50,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    eyeIcon: {
        padding: 10,
        height: '100%',
        justifyContent: 'center',
    },
});

export default ProfileScreen;