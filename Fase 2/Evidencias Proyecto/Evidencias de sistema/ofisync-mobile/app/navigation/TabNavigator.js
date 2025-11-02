import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ServicesScreen from "../screens/ServicesScreen";
import MyReservationsScreen from "../screens/MyReservationsScreen";
import GastosComunesScreen from "../screens/GastosComunesScreen"; 
import ProfileScreen from "../screens/ProfileScreen";
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

          if (route.name === "Servicios") {
            iconName = "construct-outline";
          } else if (route.name === "Mis Reservas") {
            iconName = "calendar-outline";
          } else if (route.name === "Gastos Comunes") {
            iconName = "wallet-outline";
          }
            else if (route.name === "Perfil") {
            iconName = "person-circle-outline";
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Servicios" component={ServicesScreen} />
      <Tab.Screen name="Mis Reservas" component={MyReservationsScreen} />
      <Tab.Screen name="Gastos Comunes" component={GastosComunesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}