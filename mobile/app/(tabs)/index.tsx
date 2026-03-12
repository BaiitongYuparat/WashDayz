import { router } from "expo-router";
import { Button, Pressable, ScrollView, StyleSheet, Text } from "react-native";

const products = [
  { id: "1", name: "iPhone 15", price: "32,900" },
  { id: "2", name: "iPad Air", price: "23,900" },
];
export default function Index() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Welcom Home</Text>
      <Button title="Go to Profile" onPress={() => router.push("/profile")} />
      
    
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    alignItems: "center",
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 20,
  },
  productCard: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
    width: "100%",
    borderRadius: 8,
  },
  price: {
    color: "#666",
    marginTop: 5,
  },
});
