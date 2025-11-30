import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import TabNavigator from "./TabNavigator";
import ReserveServiceScreen from "../screens/ReserveServiceScreen";
import colors from "../theme/colors";
import LoginScreen from "../screens/LoginScreen";
import { getToken } from "../../services/usuarioService";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();
        setInitialRoute(token ? "MainTabs" : "Login");
      } catch {
        setInitialRoute("Login");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading || !initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
