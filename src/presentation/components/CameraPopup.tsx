import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, ScrollView } from 'react-native';
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

  if (!camera) return null;

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
    car: <Ionicons name="car" size={20} color={colors.text} />,
    motorcycle: <MaterialCommunityIcons name="motorbike" size={20} color={colors.text} />,
    bus: <Ionicons name="bus" size={20} color={colors.text} />,
    truck: <MaterialCommunityIcons name="truck" size={20} color={colors.text} />,
    van: <Ionicons name="car" size={20} color={colors.text} />,
    taxi: <Ionicons name="car" size={20} color={colors.text} />
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          Platform.OS === 'web' ? styles.cardWeb : styles.cardMobile
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {camera.name}
            </Text>
            <Pressable 
              style={[styles.closeButton, { backgroundColor: colors.surfaceLight }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Row */}
            <View style={[styles.statusRow, { borderBottomColor: colors.border }]}>
              <View style={styles.statusCol}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Status</Text>
                <View style={styles.statusValueContainer}>
                  <View style={[
                    styles.statusDot, 
                    { backgroundColor: isOnline ? colors.accentGreen : colors.accentRed }
                  ]} />
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statusCol}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>FPS</Text>
                <Text style={[styles.statusText, { color: colors.text }]}>{camera.fps}</Text>
              </View>

              <View style={styles.statusCol}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Vehicles</Text>
                <Text style={[styles.statusText, { color: colors.text }]}>{camera.vehicleCount}</Text>
              </View>
            </View>

            {/* Video Feed Placeholder */}
            <View style={[styles.feedContainer, { backgroundColor: colors.background }]}>
              <Ionicons 
                name="videocam" 
                size={40} 
                color={isOnline ? colors.accent : colors.textMuted} 
              />
              <Text style={[
                styles.feedText, 
                { color: isOnline ? colors.accent : colors.textMuted }
              ]}>
                {isOnline ? 'LIVE FEED' : 'OFFLINE'}
              </Text>
              
              {isOnline && (
                <View style={[styles.liveBadge, { backgroundColor: colors.overlay }]}>
                  <View style={[styles.pulseDot, { backgroundColor: colors.accentGreen }]} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>

            {/* Traffic Level */}
            <View style={styles.trafficLevelContainer}>
              <View style={[styles.trafficLevelDot, { backgroundColor: trafficColor }]} />
              <Text style={[styles.trafficLevelText, { color: colors.text }]}>
                {camera.trafficLevel.toUpperCase()} TRAFFIC
              </Text>
            </View>

            {/* Detected Vehicles */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Detected Vehicles</Text>
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
                      <Text style={[styles.vehicleType, { color: colors.textSecondary }]}>{type}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Location */}
            <View style={[styles.locationContainer, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="location" size={20} color={colors.textSecondary} />
              <View style={styles.locationTextContainer}>
                <Text style={[styles.locationName, { color: colors.text }]}>{camera.name}</Text>
                <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
                  {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '85%',
  },
  cardWeb: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 380,
  },
  cardMobile: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  statusCol: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedContainer: {
    height: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  feedText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trafficLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  trafficLevelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  trafficLevelText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  vehiclesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    width: '48%',
  },
  vehicleCardText: {
    marginLeft: 10,
  },
  vehicleCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleType: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationCoords: {
    fontSize: 12,
    marginTop: 2,
  },
});
