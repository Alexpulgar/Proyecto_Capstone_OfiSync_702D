import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ServicesScreen from "../screens/ServicesScreen";
import MyReservationsScreen from "../screens/MyReservationsScreen";
// 1. IMPORTA LA NUEVA PANTALLA
import GastosComunesScreen from "../screens/GastosComunesScreen"; 
import colors from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // 2. AJUSTA LA LÓGICA DE ICONOS
          if (route.name === "Servicios") {
            iconName = "construct-outline";
          } else if (route.name === "Mis Reservas") {
            iconName = "calendar-outline";
          } else if (route.name === "Gastos Comunes") {
            iconName = "stats-chart-outline"; // Icono para gastos
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Servicios" component={ServicesScreen} />
      <Tab.Screen name="Mis Reservas" component={MyReservationsScreen} />
      {/* 3. AGREGA LA NUEVA PANTALLA AL TAB */}
      <Tab.Screen name="Gastos Comunes" component={GastosComunesScreen} />
    </Tab.Navigator>
  );
}