import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { TrafficAnalytics } from '../../domain/models/TrafficAnalytics';

type Props = {
  cameraCount: number;
  analytics: TrafficAnalytics | null;
};

export const StatsBar: React.FC<Props> = ({ cameraCount, analytics }) => {
  const { colors } = useTheme();

  const getCongestionColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return colors.accentGreen;
      case 'moderate': return colors.accentAmber;
      case 'high':
      case 'critical': return colors.accentRed;
      default: return colors.text;
    }
  };

  const congestionColor = getCongestionColor(analytics?.congestionLevel);

  return (
    <View style={[styles.container, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
      <View style={styles.statItem}>
        <Ionicons name="videocam" size={18} color={colors.accent} />
        <View style={styles.statTextContainer}>
          <Text style={[styles.statValue, { color: colors.text }]}>{cameraCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Cameras</Text>
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statItem}>
        <Ionicons name="car" size={18} color={colors.accent} />
        <View style={styles.statTextContainer}>
          <Text style={[styles.statValue, { color: colors.text }]}>{analytics?.totalVehicles ?? '--'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Vehicles</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statItem}>
        <Ionicons name="speedometer" size={18} color={colors.accent} />
        <View style={styles.statTextContainer}>
          <Text style={[styles.statValue, { color: congestionColor }]}>{analytics?.congestionLevel?.toUpperCase() ?? '--'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Traffic</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 50,
    ...Platform.select({
      web: {
        bottom: 16,
        right: 16,
      },
      default: {
        bottom: 16,
        left: 16,
        right: 16,
      },
    }),
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statTextContainer: {
    justifyContent: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statLabel: {
    fontSize: 10,
  },
  divider: {
    width: 1,
    height: '100%',
    marginHorizontal: 8,
  },
});
