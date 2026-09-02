import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Vehicle } from "../../domain/models/Vehicle";
import { VehicleTrajectory } from "../../domain/models/VehicleTrajectory";

type Props = {
  vehicle: Vehicle;
  trajectory: VehicleTrajectory | null;
  onClose: () => void;
};

function getVehicleEmoji(
  type: Vehicle["vehicleType"]
) {
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

export default function VehicleDetails({
  vehicle,
  trajectory,
  onClose,
}: Props) {
  const detections = trajectory?.detections ?? [];

  const lastDetection =
    detections.length > 0
      ? detections[detections.length - 1]
      : null;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleEmoji}>
            {getVehicleEmoji(vehicle.vehicleType)}
          </Text>

          <View>
            <Text style={styles.plate}>
              {vehicle.plateNumber}
            </Text>

            <Text style={styles.vehicleType}>
              {vehicle.color}{" "}
              {vehicle.vehicleType}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Location */}
      <View style={styles.infoCard}>
        <Text style={styles.label}>
          CURRENT LOCATION
        </Text>

        <Text style={styles.location}>
          📍{" "}
          {lastDetection?.cameraName ??
            vehicle.cameraName}
        </Text>
      </View>

      {/* Last Seen */}
      <View style={styles.infoCard}>
        <Text style={styles.label}>
          LAST SEEN
        </Text>

        <Text style={styles.location}>
          🕐{" "}
          {lastDetection?.detectedAt ??
            vehicle.detectedAt}
        </Text>
      </View>

      {/* Detection History */}
      <View style={styles.history}>
        <Text style={styles.historyTitle}>
          DETECTION HISTORY
        </Text>

        {detections.length === 0 ? (
          <Text style={styles.empty}>
            No detection history available.
          </Text>
        ) : (
          detections.map((detection, index) => (
            <View
              key={detection.id}
              style={styles.timelineItem}
            >
              <View style={styles.timelineLeft}>
                <View style={styles.dot}>
                  <Text style={styles.cameraEmoji}>
                    📹
                  </Text>
                </View>

                {index <
                  detections.length - 1 && (
                  <View style={styles.line} />
                )}
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.cameraName}>
                  {detection.cameraName}
                </Text>

                <Text style={styles.time}>
                  {detection.detectedAt}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginTop: 15,
    maxHeight: 420,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  vehicleEmoji: {
    fontSize: 36,
    marginRight: 12,
  },

  plate: {
    fontSize: 20,
    fontWeight: "700",
  },

  vehicleType: {
    color: "#777",
    marginTop: 3,
    textTransform: "capitalize",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    fontSize: 18,
    color: "#555",
  },

  infoCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    marginBottom: 5,
  },

  location: {
    fontSize: 15,
    fontWeight: "600",
  },

  history: {
    marginTop: 8,
  },

  historyTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },

  timelineItem: {
    flexDirection: "row",
    minHeight: 55,
  },

  timelineLeft: {
    width: 40,
    alignItems: "center",
  },

  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },

  cameraEmoji: {
    fontSize: 17,
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#ddd",
    marginVertical: 3,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 8,
    paddingTop: 2,
  },

  cameraName: {
    fontSize: 14,
    fontWeight: "600",
  },

  time: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },

  empty: {
    color: "#888",
    fontSize: 13,
  },
});
