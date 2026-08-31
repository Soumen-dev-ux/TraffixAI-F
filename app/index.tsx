import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TraffixAI</Text>
      <Text style={styles.subtitle}>
        City-Wide AI Traffic Intelligence
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
  },
});