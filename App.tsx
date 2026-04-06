import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from "react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useAppBootstrap } from "./src/services/useAppBootstrap";

export default function App() {
  const app = useAppBootstrap();

  if (app.isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#ffd89f" />
        <Text style={styles.loadingTitle}>Calorie Coach BG</Text>
        <Text style={styles.loadingText}>Подготвям профила, сесията и cloud данните ти...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator app={app} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#10281f",
    gap: 10,
    paddingHorizontal: 24,
  },
  loadingTitle: {
    color: "#fff7eb",
    fontSize: 28,
    fontWeight: "800",
  },
  loadingText: {
    color: "#d7ddcf",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});
