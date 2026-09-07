import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  is3DView: boolean;
  onToggle3D: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
};

export const SettingsModal: React.FC<Props> = ({
  visible,
  onClose,
  is3DView,
  onToggle3D,
  showHeatmap,
  onToggleHeatmap,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
          
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
            <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.rowLeft}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.accent} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Map Options</Text>
            <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.rowLeft}>
                <MaterialCommunityIcons name="rotate-3d-variant" size={20} color={colors.accent} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>3D Buildings</Text>
              </View>
              <Switch
                value={is3DView}
                onValueChange={onToggle3D}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <MaterialCommunityIcons name="fire" size={20} color={colors.accent} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>Traffic Heatmap</Text>
              </View>
              <Switch
                value={showHeatmap}
                onValueChange={onToggleHeatmap}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
            <View style={styles.aboutContainer}>
              <Text style={[styles.aboutText, { color: colors.text }]}>TraffixAI v1.0</Text>
              <Text style={[styles.aboutTextSecondary, { color: colors.textSecondary }]}>Smart India Hackathon 2026</Text>
              <Text style={[styles.aboutTextMuted, { color: colors.textMuted }]}>PS 26127 - Bharat Electronics Limited</Text>
            </View>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 360,
    maxWidth: '90%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
  },
  aboutContainer: {
    paddingVertical: 12,
    gap: 4,
  },
  aboutText: {
    fontSize: 16,
  },
  aboutTextSecondary: {
    fontSize: 14,
  },
  aboutTextMuted: {
    fontSize: 12,
  },
});
