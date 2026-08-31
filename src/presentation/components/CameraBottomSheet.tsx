import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

type Camera = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  visible: boolean;
  camera: Camera | null;
  onClose: () => void;
};

export default function CameraBottomSheet({
  visible,
  camera,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Camera Details</Text>

              {camera && (
                <Text style={styles.cameraName}>
                  {camera.name}
                </Text>
              )}
            </View>

            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {/* Camera Feed */}
          <View style={styles.feed}>
            <Text style={styles.feedText}>
              📹 CAMERA FEED
            </Text>

            <Text style={styles.feedSubtext}>
              Live footage will appear here
            </Text>
          </View>

          {/* Camera information */}
          {camera && (
            <View style={styles.info}>

              <InfoRow
                label="Camera ID"
                value={camera.id}
              />

              <InfoRow
                label="Location"
                value={camera.name}
              />

              <InfoRow
                label="Status"
                value="🟢 Online"
              />

              <InfoRow
                label="FPS"
                value="24"
              />

              <InfoRow
                label="Vehicles"
                value="71"
              />

              <InfoRow
                label="Congestion"
                value="🔴 High"
              />

            </View>
          )}

          <Pressable
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>
              Close
            </Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  cameraName: {
    color: "#777",
    marginTop: 4,
  },

  close: {
    fontSize: 22,
    color: "#555",
  },

  feed: {
    height: 180,
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  feedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  feedSubtext: {
    color: "#aaa",
    marginTop: 8,
  },

  info: {
    gap: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    color: "#777",
    fontSize: 15,
  },

  value: {
    fontWeight: "600",
    fontSize: 15,
  },

  button: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});