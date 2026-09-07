import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Camera } from '../../domain/models/Camera';

type Props = {
  cameras: Camera[];
  onCameraPress: (camera: Camera) => void;
  selectedCameraId: string | null;
};

type FilterType = 'all' | 'online' | 'high';

export const CameraSidebar: React.FC<Props> = ({
  cameras,
  onCameraPress,
  selectedCameraId,
}) => {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredCameras = cameras.filter((camera) => {
    if (filter === 'online') {
      return camera.status === 'online';
    }
    if (filter === 'high') {
      return camera.trafficLevel === 'high' || camera.trafficLevel === 'critical';
    }
    return true;
  });

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return colors.accentGreen;
      case 'moderate': return colors.accentAmber;
      case 'high':
      case 'critical':
        return colors.accentRed;
      default: return colors.textMuted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Cameras</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: colors.border },
              filter === 'all' && { backgroundColor: colors.accent, borderColor: colors.accent }
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, { color: filter === 'all' ? '#fff' : colors.text }]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: colors.border },
              filter === 'online' && { backgroundColor: colors.accent, borderColor: colors.accent }
            ]}
            onPress={() => setFilter('online')}
          >
            <Text style={[styles.filterText, { color: filter === 'online' ? '#fff' : colors.text }]}>Online</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: colors.border },
              filter === 'high' && { backgroundColor: colors.accent, borderColor: colors.accent }
            ]}
            onPress={() => setFilter('high')}
          >
            <Text style={[styles.filterText, { color: filter === 'high' ? '#fff' : colors.text }]}>High Traffic</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredCameras.map((camera) => {
          const isSelected = camera.id === selectedCameraId;
          const statusColor = camera.status === 'online' ? colors.accentGreen : colors.accentRed;

          return (
            <TouchableOpacity
              key={camera.id}
              style={[
                styles.cameraItem,
                { backgroundColor: colors.surfaceLight },
                isSelected && { borderColor: colors.accent, borderWidth: 1, backgroundColor: colors.surface }
              ]}
              onPress={() => onCameraPress(camera)}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              
              <View style={styles.cameraInfo}>
                <Text style={[styles.cameraName, { color: colors.text }]} numberOfLines={1}>
                  {camera.name}
                </Text>
                <View style={styles.cameraStats}>
                  <Text style={[styles.statsText, { color: colors.textSecondary }]}>
                    {camera.vehicleCount} vehicles
                  </Text>
                  <Text style={[styles.trafficBadge, { color: getTrafficColor(camera.trafficLevel) }]}>
                    • {camera.trafficLevel.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70,
    left: 12,
    bottom: 12,
    width: 300,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 50,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  cameraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  cameraInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cameraName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cameraStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
  },
  trafficBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
