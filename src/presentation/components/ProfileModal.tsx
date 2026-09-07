import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const ProfileModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
          
          <View style={styles.header}>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarText}>OP</Text>
            </View>
            
            <Text style={[styles.name, { color: colors.text }]}>Operator</Text>
            <Text style={[styles.role, { color: colors.textSecondary }]}>Traffic Control Center</Text>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.text }]}>Clearance Level: Admin</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.text }]}>Kolkata Metro Division</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.accent} />
                <View style={styles.sessionRow}>
                  <Text style={[styles.infoText, { color: colors.text }]}>Session: Active</Text>
                  <View style={[styles.statusDot, { backgroundColor: colors.accentGreen }]} />
                </View>
              </View>
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
    width: 340,
    maxWidth: '90%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 28,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 16,
    textAlign: 'center',
  },
  role: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
  infoContainer: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 15,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
