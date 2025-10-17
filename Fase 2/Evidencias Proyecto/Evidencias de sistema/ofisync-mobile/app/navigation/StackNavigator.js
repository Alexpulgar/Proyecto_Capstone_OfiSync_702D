import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./TabNavigator";
import ReserveServiceScreen from "../screens/ReserveServiceScreen";
import colors from "../theme/colors";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Screen
          name="Inicio"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Reserva"
          component={ReserveServiceScreen}
          options={{ title: "Nueva reserva" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
