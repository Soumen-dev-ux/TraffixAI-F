import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Camera } from "../../domain/models/Camera";

type Props = {
  camera: Camera | null;
  visible: boolean;
  onClose: () => void;
};

const vehicleIcons = {
  car: "🚗",
  motorcycle: "🏍️",
  bus: "🚌",
  truck: "🚚",
  van: "🚐",
  taxi: "🚕",
};

const trafficColors = {
  low: "🟢",
  moderate: "🟠",
  high: "🔴",
  critical: "🔴",
};

export default function CameraBottomSheet({
  camera,
  visible,
  onClose,
}: Props) {
  if (!camera) return null;

  const isWeb = Platform.OS === "web";
  const vehicles = camera.detectedVehicles;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isWeb ? "fade" : "slide"}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, isWeb && styles.webOverlay]}>
        {/* Backdrop Pressable */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Modal Card / Bottom Sheet View */}
        <View style={[styles.sheet, isWeb && styles.webSheet]}>
          {!isWeb && <View style={styles.handle} />}

          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.title}>📹 {camera.id}</Text>
                <Text style={styles.location}>{camera.name}</Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Camera Feed */}
            <View style={styles.feed}>
              <Text style={styles.feedIcon}>🎥</Text>

              <Text style={styles.feedText}>
                {camera.status === "online"
                  ? "LIVE CAMERA FEED"
                  : "CAMERA OFFLINE"}
              </Text>

              {camera.status === "online" && (
                <View style={styles.fakeVehicles}>
                  <Text>🚗</Text>
                  <Text>🚗</Text>
                  <Text>🏍️</Text>
                  <Text>🚌</Text>
                  <Text>🚚</Text>
                </View>
              )}

              {camera.status === "online" && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>

            {/* Camera Status */}
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>STATUS</Text>
                <Text style={styles.infoValue}>
                  {camera.status === "online"
                    ? "🟢 Online"
                    : "🔴 Offline"}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>FPS</Text>
                <Text style={styles.infoValue}>{camera.fps}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>VEHICLES</Text>
                <Text style={styles.infoValue}>{camera.vehicleCount}</Text>
              </View>
            </View>

            {/* Traffic Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Traffic Intelligence</Text>

              <View style={styles.trafficCard}>
                <Text style={styles.trafficEmoji}>
                  {trafficColors[camera.trafficLevel]}
                </Text>

                <View>
                  <Text style={styles.trafficTitle}>
                    {camera.trafficLevel.toUpperCase()}
                  </Text>

                  <Text style={styles.trafficSubtitle}>
                    Current traffic condition
                  </Text>
                </View>
              </View>
            </View>

            {/* Vehicle Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detected Vehicles</Text>

              <View style={styles.vehicleGrid}>
                {Object.entries(vehicles).map(([type, count]) => (
                  <View style={styles.vehicleCard} key={type}>
                    <Text style={styles.vehicleEmoji}>
                      {vehicleIcons[type as keyof typeof vehicleIcons]}
                    </Text>

                    <Text style={styles.vehicleCount}>{count}</Text>

                    <Text style={styles.vehicleType}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Camera Location</Text>

              <View style={styles.locationCard}>
                <Text style={styles.locationText}>📍 {camera.name}</Text>

                <Text style={styles.coordinates}>
                  {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  webOverlay: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 24,
    paddingRight: 24,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  webSheet: {
    width: 380,
    maxWidth: "90%",
    maxHeight: 650,
    borderRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  handle: {
    width: 45,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  location: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 14,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 18,
    color: "#4b5563",
  },
  feed: {
    height: 180,
    backgroundColor: "#17202a",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  feedIcon: {
    fontSize: 40,
  },
  feedText: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "600",
  },
  fakeVehicles: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    fontSize: 22,
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },
  liveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
  },
  infoValue: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  trafficCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  trafficEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  trafficTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111827",
  },
  trafficSubtitle: {
    color: "#6b7280",
    marginTop: 3,
    fontSize: 12,
  },
  vehicleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  vehicleCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  vehicleEmoji: {
    fontSize: 24,
  },
  vehicleCount: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    color: "#111827",
  },
  vehicleType: {
    color: "#6b7280",
    fontSize: 11,
    textTransform: "capitalize",
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  locationText: {
    fontWeight: "600",
    color: "#111827",
  },
  coordinates: {
    color: "#6b7280",
    marginTop: 5,
    fontSize: 12,
  },
});