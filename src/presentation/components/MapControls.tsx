import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  is3DView: boolean;
  onToggle3D: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  onRecenter?: () => void;
};

export const MapControls: React.FC<Props> = ({
  is3DView,
  onToggle3D,
  showHeatmap,
  onToggleHeatmap,
  onRecenter,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* 3D / 2D Toggle */}
      <TouchableOpacity
        style={[
          styles.controlBtn,
          is3DView && { backgroundColor: colors.surfaceLight },
        ]}
        onPress={onToggle3D}
        accessibilityLabel="Toggle 3D Buildings"
      >
        <MaterialCommunityIcons
          name="rotate-3d-variant"
          size={18}
          color={is3DView ? colors.accent : colors.textSecondary}
        />
        <Text style={[styles.controlText, { color: is3DView ? colors.accent : colors.textSecondary }]}>
          {is3DView ? '3D' : '2D'}
        </Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Heatmap Toggle */}
      <TouchableOpacity
        style={[
          styles.controlBtn,
          showHeatmap && { backgroundColor: colors.surfaceLight },
        ]}
        onPress={onToggleHeatmap}
        accessibilityLabel="Toggle Traffic Heatmap"
      >
        <MaterialCommunityIcons
          name="fire"
          size={18}
          color={showHeatmap ? colors.accentAmber : colors.textSecondary}
        />
        <Text style={[styles.controlText, { color: showHeatmap ? colors.accentAmber : colors.textSecondary }]}>
          Heat
        </Text>
      </TouchableOpacity>

      {onRecenter ? (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={onRecenter}
            accessibilityLabel="Recenter Map"
          >
            <Ionicons name="locate" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  controlText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 18,
    marginHorizontal: 2,
  },
});
