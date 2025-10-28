import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api/api";
import colors from "../theme/colors";
import { getUsuario } from "../../services/usuarioService";

export default function MyReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para cargar reservas y actualizar reuniones pasadas
  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    setReservations([]);
    try {
      const usuario = await getUsuario();

      if (!usuario || !usuario.id) {
        throw new Error("No se pudo obtener la información del usuario. Por favor, inicie sesión de nuevo.");
      }

      await API.put("/reservations/complete-past");
      const res = await API.get(`/reservations/user/${usuario.id}`);
      setReservations(res.data);

    } catch (err) {
      console.error("Error fetching reservations:", err);
      const errorMsg = err.response?.data?.error || err.message || "Error al cargar las reservas";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Recargar cada vez que se enfoque la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [])
  );

  // Cancelar reserva
  const cancelReservation = async (id) => {
    try {
      await API.put(`/reservations/${id}/cancel`);
      Alert.alert("Éxito", "Reserva cancelada");
      fetchReservations();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || "Error al cancelar la reserva";
      Alert.alert("Error", errorMsg);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pendiente":
        return { backgroundColor: "#c9ab00ff" };
      case "completada":
        return { backgroundColor: "#28a745" };
      case "cancelada":
        return { backgroundColor: "#dc3545" };
      default:
        return { backgroundColor: "#ccc" };
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (value) => {
    return value?.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    });
  };

  // Preview visual de archivos
  const renderFilePreview = (file_url) => {
    if (!file_url) return null;

    const extension = file_url.split(".").pop().toLowerCase();
    const fileName = file_url.split("/").pop();

    let iconName;

    // Determinar el ícono basado en la extensión
    if (extension === "pdf") {
      iconName = "picture-as-pdf";
    } else if (["doc", "docx"].includes(extension)) {
      iconName = "description";
    } else if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      iconName = "image";
    } else {
      iconName = "attach-file";
    }

    // Retornar siempre la "fileCard"
    return (
      <View style={styles.fileCard}>
        <MaterialIcons name={iconName} size={32} color={colors.primary} />
        <Text style={styles.fileName}>
          {fileName}
        </Text>
      </View>
    );
  };

  // Render de cada item
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.serviceName}>{item.service_name}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.quantity && <Text>Cantidad: {item.quantity}</Text>}
      {item.valor_base && <Text>Valor base: {formatCurrency(item.valor_base)}</Text>}
      {item.valor_total && <Text>Valor total: {formatCurrency(item.valor_total)}</Text>}
      {item.size && <Text>Tamaño: {item.size}</Text>}
      {item.date && <Text>Fecha: {formatDate(item.date)}</Text>}
      {item.start_time && <Text>Hora inicio: {item.start_time.slice(0, 5)}</Text>}
      {item.end_time && <Text>Hora término: {item.end_time.slice(0, 5)}</Text>}

      {renderFilePreview(item.file_url)}

      {item.status === "pendiente" && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => cancelReservation(item.id)}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando mis reservas...</Text>
      </View>
    );
  }

  if (error && reservations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reservations}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={() => (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No tienes reservas activas.</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
  },
  fileName: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});