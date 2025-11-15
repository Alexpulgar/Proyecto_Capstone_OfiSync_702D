import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import API from "../api/api";
import colors from "../theme/colors";
import { Picker } from "@react-native-picker/picker";
import { getUsuario } from "../../services/usuarioService";

export default function ReserveServiceScreen({ route, navigation }) {
  const { service } = route.params;

  // Campos comunes
  const [quantity, setQuantity] = useState("");
  const [size, setSize] = useState("");
  const [file, setFile] = useState(null);

  // Campos sala de reuniones
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Estado de carga
  const [loading, setLoading] = useState(false);

  const [hasPendingDebt, setHasPendingDebt] = useState(false);
  const [isCheckingDebt, setIsCheckingDebt] = useState(true);

  // Seleccionar archivo con validación de tipo
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
        ],
      });

      if (result.canceled) return;

      const selectedFile = result.assets[0];
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (!allowedTypes.includes(selectedFile.mimeType)) {
        Alert.alert(
          "Archivo no válido",
          "Solo se permiten archivos PDF, DOCX o imágenes (JPG/PNG)."
        );
        return;
      }

      setFile(selectedFile);
    } catch (err) {
      console.error("Error seleccionando archivo:", err);
      Alert.alert("Error", "No se pudo seleccionar el archivo.");
    }
  };

  // Verifica si el horario está disponible
  const isSlotAvailable = () => {
    const start = startTime.getHours() * 60 + startTime.getMinutes();
    const end = endTime.getHours() * 60 + endTime.getMinutes();

    for (const slot of bookedSlots) {
      const [sh, sm] = slot.start_time.split(":");
      const [eh, em] = slot.end_time.split(":");
      const slotStart = parseInt(sh) * 60 + parseInt(sm);
      const slotEnd = parseInt(eh) * 60 + parseInt(em);

      if (
        (start >= slotStart && start < slotEnd) ||
        (end > slotStart && end <= slotEnd) ||
        (start <= slotStart && end >= slotEnd)
      ) {
        return false;
      }
    }
    return true;
  };

  // Cargar reservas existentes de la sala para la fecha seleccionada
  const fetchBookedSlots = async (selectedDate) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const res = await API.get(
        `/reservations/room/${service.id}/${formattedDate}`
      );
      const sortedSlots = res.data.sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );
      setBookedSlots(sortedSlots);
    } catch (err) {
      console.error("Error al obtener los horarios ocupados:", err);
    }
  };

  useEffect(() => {
    const checkDebtStatus = async () => {
      setIsCheckingDebt(true);
      try {
        const res = await API.get("/gasto-comun/status");
        if (res.data.hasPending) {
          setHasPendingDebt(true);
        }
      } catch (err) {
        console.error("Error al verificar deuda:", err);
      } finally {
        setIsCheckingDebt(false);
      }
    };

    checkDebtStatus();

    const initialEndTime = new Date(startTime.getTime() + 30 * 60000);
    setEndTime(initialEndTime);

    if (service.type === "room") {
      fetchBookedSlots(date);
    }
  }, []);

  useEffect(() => {
    if (service.type === "room") {
      fetchBookedSlots(date);
    }
  }, [date]);

  const handleReserve = async () => {
    setLoading(true);
    try {
      const usuario = await getUsuario();
      if (!usuario || !usuario.id) {
        Alert.alert(
          "Error de autenticación",
          "No se pudo obtener el usuario. Por favor, inicie sesión de nuevo."
        );
        setLoading(false);
        return;
      }
      const realUserId = usuario.id;

      // Validación cantidad para servicios distintos de sala
      if (service.type !== "room") {
        const numQuantity = parseInt(quantity, 10);
        if (
          !quantity ||
          quantity.trim() === "" ||
          isNaN(numQuantity) ||
          numQuantity <= 0
        ) {
          Alert.alert("Por favor ingresa una cantidad válida (mayor a 0).");
          setLoading(false);
          return;
        }

        // Validar cantidad máxima
        if (numQuantity > 1000) {
          Alert.alert("Error", "La cantidad no puede ser mayor a 1000.");
          setLoading(false);
          return;
        }

        // Validar tamaño seleccionado
        if (!size || size.trim() === "") {
          Alert.alert("Debes seleccionar un tamaño de hoja.");
          setLoading(false);
          return;
        }

        // Validar archivo adjunto
        if (!file) {
          Alert.alert("Debes adjuntar un archivo antes de reservar.");
          setLoading(false);
          return;
        }

        // Validar tipo de archivo
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
          "image/gif",
        ];
        if (!allowedTypes.includes(file.mimeType)) {
          Alert.alert(
            "Tipo de archivo no permitido. Solo PDF, DOC, DOCX o imágenes."
          );
          setLoading(false);
          return;
        }
      }

      // Validación para sala de reuniones
      if (service.type === "room") {
        const now = new Date();

        // Crear fecha completa usando componentes
        const selectedStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          startTime.getHours(),
          startTime.getMinutes()
        );

        const selectedEnd = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          endTime.getHours(),
          endTime.getMinutes()
        );

        if (selectedStart <= now) {
          Alert.alert("No puedes reservar un horario que ya pasó.");
          setLoading(false);
          return;
        }

        if (selectedEnd <= selectedStart) {
          Alert.alert(
            "La hora de término debe ser posterior a la hora de inicio."
          );
          setLoading(false);
          return;
        }

        // validar duración minima 30 minutos
        const durationInMilliseconds =
          selectedEnd.getTime() - selectedStart.getTime();
        const durationInMinutes = durationInMilliseconds / (1000 * 60);
        if (durationInMinutes < 30) {
          Alert.alert(
            "Error",
            "La duración mínima de la reserva debe ser de 30 minutos."
          );
          setLoading(false);
          return;
        }

        // Validar disponibilidad
        if (!isSlotAvailable()) {
          Alert.alert(
            "Horario ocupado",
            "El horario seleccionado ya está reservado."
          );
          setLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("user_id", realUserId);
      formData.append("service_id", service.id);
      formData.append("date", date.toISOString().split("T")[0]);

      if (service.type !== "room") {
        formData.append("quantity", quantity);
        formData.append("size", size);
        if (file) {
          const fileName = file.name || "archivo";
          formData.append("file", {
            uri: file.uri,
            name: fileName,
            type: file.mimeType || "application/octet-stream",
          });
        }
      } else {
        const pad = (num) => num.toString().padStart(2, "0");
        formData.append(
          "start_time",
          `${pad(startTime.getHours())}:${pad(startTime.getMinutes())}:00`
        );
        formData.append(
          "end_time",
          `${pad(endTime.getHours())}:${pad(endTime.getMinutes())}:00`
        );
      }

      // Enviar reserva
      const res = await fetch(`${API.defaults.baseURL}/reservations`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Error desconocido del servidor");
      }

      Alert.alert("Éxito", "Reserva creada con éxito");
      navigation.goBack();
    } catch (err) {
      console.error("Error creando reserva:", err);
      Alert.alert("Error", err.message || "No se pudo crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 15, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        {service.name}
      </Text>

      {isCheckingDebt ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : hasPendingDebt ? (
        <View style={{ alignItems: "center", padding: 20 }}>
          <Text
            style={{
              color: colors.danger,
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Acceso denegado
          </Text>
          <Text style={{ textAlign: "center" }}>
            No puedes realizar reservas en este momento. Tienes gastos comunes
            pendientes de pago asociados a tu oficina.
          </Text>
        </View>
      ) : (
        <>
          {/* Servicios de impresión */}
          {service.type !== "room" ? (
            <>
              <Text>Cantidad:</Text>
              <TextInput
                placeholder="Ingrese la cantidad"
                keyboardType="numeric"
                value={quantity}
                onChangeText={(text) =>
                  setQuantity(text.replace(/[^0-9]/g, ""))
                }
                style={styles.input}
                maxLength={4}
              />

              <Text>Tamaño de hoja:</Text>
              <Picker
                testID="size-picker"
                selectedValue={size}
                onValueChange={(itemValue) => setSize(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona un tamaño" value="" />
                <Picker.Item label="A4" value="A4" />
                <Picker.Item label="A3" value="A3" />
                <Picker.Item label="Carta" value="Carta" />
              </Picker>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={pickDocument}
              >
                <Text style={styles.buttonText}>
                  {file
                    ? `Archivo: ${file.name}`
                    : "Adjuntar archivo (PDF, DOCX o imagen)"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Campos sala de reuniones */}
              <Text>Fecha:</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{date.toISOString().split("T")[0]}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={(event, selected) => {
                    setShowDatePicker(false);
                    if (selected) setDate(selected);
                  }}
                />
              )}

              <Text>Hora inicio:</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartPicker(true)}
              >
                <Text>{startTime.toTimeString().slice(0, 5)}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selected) => {
                    setShowStartPicker(false);
                    if (selected) {
                      setStartTime(selected);
                      // Opcional: auto-ajustar fin si es menor que inicio + 30
                      const minEndTime = new Date(
                        selected.getTime() + 30 * 60000
                      );
                      if (endTime < minEndTime) {
                        setEndTime(minEndTime);
                      }
                    }
                  }}
                />
              )}

              <Text>Hora término:</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndPicker(true)}
              >
                <Text>{endTime.toTimeString().slice(0, 5)}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date(startTime.getTime() + 30 * 60000)} // Mínimo 30 mins después de inicio
                  onChange={(event, selected) => {
                    setShowEndPicker(false);
                    if (selected) {
                      const minEndTime = new Date(
                        startTime.getTime() + 30 * 60000
                      );
                      if (selected < minEndTime) {
                        Alert.alert(
                          "Hora inválida",
                          "La duración mínima es de 30 minutos.",
                          [{ text: "OK" }]
                        );
                        setEndTime(minEndTime); // Forzar al mínimo
                      } else {
                        setEndTime(selected);
                      }
                    }
                  }}
                />
              )}

              {bookedSlots.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                    Horarios ocupados:
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {bookedSlots.map((slot, i) => (
                      <View key={i} style={styles.busySlot}>
                        <Text style={{ color: "#fff", fontSize: 12 }}>
                          {slot.start_time.slice(0, 5)} -{" "}
                          {slot.end_time.slice(0, 5)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: loading ? "#aaa" : colors.primary },
            ]}
            onPress={handleReserve}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reservar</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  busySlot: {
    backgroundColor: "#dc3545",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
};
