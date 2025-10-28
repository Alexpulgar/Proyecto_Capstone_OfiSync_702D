// ofisync-mobile/app/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator, // Importa el indicador de carga
} from "react-native";
import colors from "../theme/colors";
import { loginApi } from "../../services/usuarioService"; // <- Importa tu nuevo servicio

const logo = require("../../assets/icon.png");

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // <- Estado para la carga

  const handleLogin = async () => { // <- Convierte la función a async
    if (username.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Por favor ingresa usuario y contraseña");
      return;
    }

    setLoading(true); // Inicia la carga

    try {
      // Llama a la API
      const credenciales = {
        nombre_usuario: username,
        contrasena: password,
      };
      const data = await loginApi(credenciales);

      // Si todo sale bien, navega a la pantalla principal
      navigation.replace("MainTabs");

    } catch (error) {
      // Si hay un error, muéstralo
      Alert.alert("Error de Login", error.message);
    } finally {
      setLoading(false); // Detiene la carga
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>Ofisync</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Oculta la contraseña
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading} // <- Deshabilita el botón mientras carga
      >
        {loading ? (
          <ActivityIndicator color="#fff" /> // Muestra el spinner
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  button: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});