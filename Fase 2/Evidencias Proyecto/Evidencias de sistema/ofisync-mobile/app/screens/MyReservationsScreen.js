import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api/api";
import colors from "../theme/colors";

export default function MyReservationsScreen() {
  const [reservations, setReservations] = useState([]);

  // Función para cargar reservas y actualizar reuniones pasadas
  const fetchReservations = async () => {
    try {
      await API.put("/reservations/complete-past"); // actualizar reuniones pasadas
      const res = await API.get("/reservations/user/1"); // usuario simulado
      setReservations(res.data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
  };

  // Recargar cada vez que se enfoque la pantalla
  useFocusEffect(
    React.useCallback(() => {
      fetchReservations();
    }, [])
  );

  // Cancelar reserva
  const cancelReservation = async (id) => {
    try {
      await API.put(`/reservations/${id}/cancel`);
      Alert.alert("Reserva cancelada");
      fetchReservations();
    } catch (err) {
      console.error(err);
      Alert.alert("Error al cancelar reserva");
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
    const uri = `http://192.168.100.5:4000${file_url}`;

    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return <Image source={{ uri }} style={styles.imagePreview} resizeMode="contain" />;
    }

    if (["pdf", "doc", "docx"].includes(extension)) {
      const iconName = extension === "pdf" ? "picture-as-pdf" : "description";
      return (
        <View style={styles.fileCard}>
          <MaterialIcons name={iconName} size={32} color={colors.primary} />
          <Text style={styles.fileName}>
            {fileName}
          </Text>
        </View>
      );
    }

    return (
      <Text style={{ color: colors.primary }}>{fileName}</Text>
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

  return (
    <FlatList
      data={reservations}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
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
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
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
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginTop: 5,
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
});
