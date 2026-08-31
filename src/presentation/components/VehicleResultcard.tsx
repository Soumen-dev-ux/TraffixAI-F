import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Vehicle } from "../../domain/models/Vehicle";

type Props = {
  vehicle: Vehicle;
  onPress: () => void;
};

function getVehicleEmoji(type: Vehicle["vehicleType"]) {
  switch (type) {
    case "car":
      return "🚗";

    case "motorcycle":
      return "🏍️";

    case "bus":
      return "🚌";

    case "truck":
      return "🚚";

    case "van":
      return "🚐";

    case "taxi":
      return "🚕";

    default:
      return "🚗";
  }
}

export default function VehicleResultCard({
  vehicle,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.emoji}>
        {getVehicleEmoji(vehicle.vehicleType)}
      </Text>

      <View style={styles.details}>
        <Text style={styles.plate}>
          {vehicle.plateNumber}
        </Text>

        <Text style={styles.info}>
          {vehicle.color} {vehicle.vehicleType}
        </Text>

        <Text style={styles.location}>
          📹 {vehicle.cameraName}
        </Text>
      </View>

      <Text style={styles.arrow}>
        ›
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 15,
  },

  emoji: {
    fontSize: 32,
    marginRight: 12,
  },

  details: {
    flex: 1,
  },

  plate: {
    fontSize: 17,
    fontWeight: "700",
  },

  info: {
    color: "#666",
    marginTop: 3,
    textTransform: "capitalize",
  },

  location: {
    color: "#888",
    marginTop: 3,
    fontSize: 13,
  },

  arrow: {
    fontSize: 28,
    color: "#888",
  },
});