import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Camera } from '../../domain/models/Camera';

type Props = {
  camera: Camera | null;
  visible: boolean;
  onClose: () => void;
};

export const CameraPopup: React.FC<Props> = ({ camera, visible, onClose }) => {
  const { colors } = useTheme();

  if (!camera || !visible) return null;

  const isOnline = camera.status === 'online';

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return colors.accentGreen;
      case 'moderate': return colors.accentAmber;
      case 'high':
      case 'critical': return colors.accentRed;
      default: return colors.textSecondary;
    }
  };

  const trafficColor = getTrafficColor(camera.trafficLevel);

  const vehicleIcons = {
    car: <Ionicons name="car" size={18} color={colors.accent} />,
    motorcycle: <MaterialCommunityIcons name="motorbike" size={18} color={colors.accent} />,
    bus: <Ionicons name="bus" size={18} color={colors.accent} />,
    truck: <MaterialCommunityIcons name="truck" size={18} color={colors.accent} />,
    van: <Ionicons name="car" size={18} color={colors.accent} />,
    taxi: <Ionicons name="car" size={18} color={colors.accent} />,
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Platform.OS === 'web' ? styles.cardWeb : styles.cardMobile,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.accentGreen : colors.accentRed }]} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {camera.name}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.surfaceLight }]}
          onPress={onClose}
          hitSlop={8}
        >
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
        {/* Status & Metrics Strip */}
        <View style={[styles.statusRow, { borderBottomColor: colors.border, backgroundColor: colors.surfaceLight }]}>
          <View style={styles.statusCol}>
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>STATUS</Text>
            <Text style={[styles.statusText, { color: isOnline ? colors.accentGreen : colors.accentRed }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          <View style={styles.statusCol}>
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>FRAME RATE</Text>
            <Text style={[styles.statusText, { color: colors.text }]}>{camera.fps} FPS</Text>
          </View>

          <View style={styles.statusCol}>
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>COUNT</Text>
            <Text style={[styles.statusText, { color: colors.accent }]}>{camera.vehicleCount} veh</Text>
          </View>
        </View>

        {/* Video Feed Placeholder */}
        <View style={[styles.feedContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons
            name="videocam"
            size={36}
            color={isOnline ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.feedText,
              { color: isOnline ? colors.accent : colors.textMuted },
            ]}
          >
            {isOnline ? 'LIVE ANPR STREAM' : 'FEED OFFLINE'}
          </Text>

          {isOnline && (
            <View style={[styles.liveBadge, { backgroundColor: colors.surface }]}>
              <View style={[styles.pulseDot, { backgroundColor: colors.accentGreen }]} />
              <Text style={[styles.liveText, { color: colors.accentGreen }]}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Traffic Level Banner */}
        <View style={[styles.trafficBanner, { backgroundColor: colors.surfaceLight, borderColor: trafficColor }]}>
          <View style={[styles.trafficLevelDot, { backgroundColor: trafficColor }]} />
          <Text style={[styles.trafficLevelText, { color: colors.text }]}>
            {camera.trafficLevel.toUpperCase()} TRAFFIC DENSITY
          </Text>
        </View>

        {/* Detected Vehicles Grid */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DETECTED VEHICLES</Text>
        <View style={styles.vehiclesGrid}>
          {Object.entries(camera.detectedVehicles).map(([type, count]) => {
            if (count === 0) return null;
            const icon = vehicleIcons[type as keyof typeof vehicleIcons] || vehicleIcons.car;

            return (
              <View
                key={type}
                style={[styles.vehicleCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              >
                {icon}
                <View style={styles.vehicleCardText}>
                  <Text style={[styles.vehicleCount, { color: colors.text }]}>{count}</Text>
                  <Text style={[styles.vehicleType, { color: colors.textMuted }]}>{type}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Coordinates Location */}
        <View style={[styles.locationContainer, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
          <Ionicons name="location" size={18} color={colors.accent} />
          <View style={styles.locationTextContainer}>
            <Text style={[styles.locationName, { color: colors.text }]}>{camera.name}</Text>
            <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
              {camera.latitude.toFixed(5)}°N, {camera.longitude.toFixed(5)}°E
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  if (Platform.OS === 'web') {
    return cardContent;
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {cardContent}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cardWeb: {
    position: 'absolute',
    top: 58,
    right: 16,
    width: 350,
    maxHeight: '80%',
    zIndex: 40,
  },
  cardMobile: {
    width: '100%',
    maxHeight: '80%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    maxHeight: 480,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  statusCol: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  feedContainer: {
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  feedText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.8,
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
  },
  trafficBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 12,
    gap: 8,
  },
  trafficLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trafficLevelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  vehiclesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    gap: 6,
  },
  vehicleCardText: {
    justifyContent: 'center',
  },
  vehicleCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleType: {
    fontSize: 9,
    textTransform: 'capitalize',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 4,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationCoords: {
    fontSize: 10,
    marginTop: 1,
  },
});
