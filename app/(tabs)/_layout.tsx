import React from "react";
import { Tabs } from "expo-router";
import { Home } from "lucide-react-native";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5B7FFF",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Voice Assistant",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          tabBarLabel: "Home",
        }}
      />
    </Tabs>
  );
}