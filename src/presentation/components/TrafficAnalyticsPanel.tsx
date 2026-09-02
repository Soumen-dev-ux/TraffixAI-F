import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

import { TrafficAnalytics } from "../../domain/models/TrafficAnalytics";

type Props = {
  analytics: TrafficAnalytics;
};

const vehicleIcons = {
  car: "🚗",
  motorcycle: "🏍️",
  bus: "🚌",
  truck: "🚚",
  van: "🚐",
  taxi: "🚕",
};

const congestionEmoji = {
  low: "🟢",
  moderate: "🟠",
  high: "🔴",
  critical: "🚨",
};

export default function TrafficAnalyticsPanel({
  analytics,
}: Props) {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>📊 Traffic Analytics</Text>

      <Text style={styles.subtitle}>
        City-wide traffic intelligence
      </Text>

      {/* Overview Cards */}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🚗</Text>
          <Text style={styles.statValue}>
            {analytics.totalVehicles}
          </Text>
          <Text style={styles.statLabel}>
            Total Vehicles
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📹</Text>
          <Text style={styles.statValue}>
            {analytics.activeCameras}/
            {analytics.totalCameras}
          </Text>
          <Text style={styles.statLabel}>
            Active Cameras
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>
            {congestionEmoji[analytics.congestionLevel]}
          </Text>

          <Text style={styles.statValue}>
            {analytics.congestionLevel.toUpperCase()}
          </Text>

          <Text style={styles.statLabel}>
            Congestion
          </Text>
        </View>
      </View>

      {/* Vehicle Distribution */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Vehicle Distribution
        </Text>

        <View style={styles.vehicleGrid}>
          {Object.entries(
            analytics.vehicleDistribution
          ).map(([type, count]) => (
            <View
              key={type}
              style={styles.vehicleCard}
            >
              <Text style={styles.vehicleIcon}>
                {
                  vehicleIcons[
                    type as keyof typeof vehicleIcons
                  ]
                }
              </Text>

              <Text style={styles.vehicleCount}>
                {count}
              </Text>

              <Text style={styles.vehicleType}>
                {type}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Camera Traffic */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Camera-wise Traffic
        </Text>

        {analytics.cameraTraffic.map((camera) => (
          <View
            key={camera.cameraId}
            style={styles.cameraCard}
          >
            <View style={styles.cameraInfo}>
              <Text style={styles.cameraName}>
                📹 {camera.cameraName}
              </Text>

              <Text style={styles.cameraId}>
                {camera.cameraId}
              </Text>
            </View>

            <View style={styles.cameraTraffic}>
              <Text style={styles.cameraCount}>
                {camera.vehicleCount}
              </Text>

              <Text style={styles.cameraLevel}>
                {
                  congestionEmoji[
                    camera.congestionLevel
                  ]
                }{" "}
                {camera.congestionLevel}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Hourly Traffic */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Hourly Traffic
        </Text>

        {analytics.hourlyTraffic.map((item) => (
          <View
            key={item.hour}
            style={styles.hourRow}
          >
            <Text style={styles.hour}>
              {item.hour}
            </Text>

            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${Math.min(
                      item.vehicleCount,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.hourCount}>
              {item.vehicleCount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: "#777",
    marginTop: 4,
    marginBottom: 20,
  },

  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 14,
  },

  statIcon: {
    fontSize: 24,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },

  statLabel: {
    color: "#777",
    fontSize: 11,
    marginTop: 4,
  },

  section: {
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  vehicleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  vehicleCard: {
    width: "30%",
    minWidth: 90,
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  vehicleIcon: {
    fontSize: 26,
  },

  vehicleCount: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
  },

  vehicleType: {
    color: "#777",
    textTransform: "capitalize",
    fontSize: 12,
  },

  cameraCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  cameraInfo: {
    flex: 1,
  },

  cameraName: {
    fontWeight: "600",
  },

  cameraId: {
    color: "#888",
    fontSize: 11,
    marginTop: 4,
  },

  cameraTraffic: {
    alignItems: "flex-end",
  },

  cameraCount: {
    fontSize: 18,
    fontWeight: "700",
  },

  cameraLevel: {
    color: "#666",
    fontSize: 11,
    marginTop: 3,
    textTransform: "capitalize",
  },

  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },

  hour: {
    width: 45,
    fontSize: 12,
  },

  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#e5e5e5",
    borderRadius: 10,
    overflow: "hidden",
  },

  bar: {
    height: "100%",
    backgroundColor: "#333",
    borderRadius: 10,
  },

  hourCount: {
    width: 30,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
  },
});