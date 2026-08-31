import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  loading: boolean;
};

export default function VehicleSearch({
  value,
  onChangeText,
  onSearch,
  loading,
}: Props) {
  return (
    <View style={styles.container}>

      <View style={styles.inputContainer}>

        <TextInput
          style={styles.input}
          placeholder="Search vehicle number..."
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={onSearch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "..." : "Search"}
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },

  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },

  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  button: {
    paddingHorizontal: 18,
    justifyContent: "center",
    backgroundColor: "#111",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});