import { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, Text } from "react-native";
import API from "../api/api";
import colors from "../theme/colors";
import { useNavigation } from "@react-navigation/native";

export default function ServicesScreen() {
  const [services, setServices] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    API.get("/reservations/services")
    .then((res) => {
      setServices(res.data);
    })
    .catch((err) => {
      console.error("Error al cargar servicios:", err);
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 15 }}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: colors.white,
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              borderLeftWidth: 5,
              borderLeftColor: colors.primary,
            }}
            onPress={() => navigation.navigate("Reserva", { service: item })}
          >
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{item.name}</Text>
            <Text style={{ color: "#555" }}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
