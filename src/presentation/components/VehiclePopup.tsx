import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Vehicle } from '../../domain/models/Vehicle';
import { VehicleTrajectory } from '../../domain/models/VehicleTrajectory';

type Props = {
  vehicle: Vehicle | null;
  trajectory: VehicleTrajectory | null;
  visible: boolean;
  onClose: () => void;
};

const getVehicleIcon = (type: string) => {
  switch (type) {
    case 'car': return { iconSet: 'ionicons', name: 'car' };
    case 'motorcycle': return { iconSet: 'material', name: 'motorbike' };
    case 'bus': return { iconSet: 'ionicons', name: 'bus' };
    case 'truck': return { iconSet: 'material', name: 'truck' };
    case 'van': return { iconSet: 'material', name: 'van-utility' };
    case 'taxi': return { iconSet: 'ionicons', name: 'car-sport' };
    default: return { iconSet: 'ionicons', name: 'car' };
  }
};

export const VehiclePopup: React.FC<Props> = ({ vehicle, trajectory, visible, onClose }) => {
  const { colors } = useTheme();

  if (!vehicle) return null;

  const iconInfo = getVehicleIcon(vehicle.vehicleType);
  const detections = trajectory?.detections || [];
  
  // Sort detections by newest first if they aren't already
  const sortedDetections = [...detections].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );

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
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
                {iconInfo.iconSet === 'ionicons' ? (
                  <Ionicons name={iconInfo.name as any} size={24} color={colors.accent} />
                ) : (
                  <MaterialCommunityIcons name={iconInfo.name as any} size={24} color={colors.accent} />
                )}
              </View>
              <Text style={[styles.plateNumber, { color: colors.text }]}>
                {vehicle.plateNumber}
              </Text>
              <Pressable 
                style={[styles.closeButton, { backgroundColor: colors.surfaceLight }]}
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Info Row */}
            <View style={[styles.infoRow, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                <Text style={{ textTransform: 'capitalize' }}>{vehicle.color}</Text> {vehicle.vehicleType}
              </Text>
            </View>

            {/* Current Location & Time */}
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {vehicle.cameraName}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {new Date(vehicle.detectedAt).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Detection History */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>DETECTION HISTORY</Text>
            
            <View style={styles.timeline}>
              {sortedDetections.map((detection, index) => {
                const isLatest = index === 0;
                const isLast = index === sortedDetections.length - 1;
                
                return (
                  <View key={detection.id} style={styles.timelineItem}>
                    {/* Left Column - Dots & Lines */}
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        { 
                          backgroundColor: colors.surfaceLight,
                          borderColor: isLatest ? colors.accent : colors.border,
                          borderWidth: isLatest ? 2 : 1,
                        }
                      ]}>
                        <Ionicons 
                          name="videocam" 
                          size={14} 
                          color={isLatest ? colors.accent : colors.textSecondary} 
                        />
                      </View>
                      {!isLast && (
                        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                      )}
                    </View>
                    
                    {/* Right Column - Data */}
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineLocation, { color: colors.text }]} numberOfLines={1}>
                        {detection.cameraName}
                      </Text>
                      <Text style={[styles.timelineTime, { color: colors.textSecondary }]}>
                        {new Date(detection.detectedAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
              
              {sortedDetections.length === 0 && (
                <Text style={{ color: colors.textMuted, fontStyle: 'italic' }}>
                  No history available.
                </Text>
              )}
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
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  plateNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  infoRow: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metaContainer: {
    marginBottom: 24,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -4,
    marginBottom: -4,
    zIndex: 0,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
    paddingTop: 2,
  },
  timelineLocation: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 13,
  },
});
