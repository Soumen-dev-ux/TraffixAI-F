import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearch: () => void;
  searchLoading: boolean;
  onSettingsPress: () => void;
  onProfilePress: () => void;
};

export const TopBar: React.FC<Props> = ({
  searchText,
  onSearchTextChange,
  onSearch,
  searchLoading,
  onSettingsPress,
  onProfilePress
}) => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.overlay, borderBottomColor: colors.border }]}>
      <View style={styles.leftSection}>
        <Text style={[styles.logoText, { color: colors.accent }]}>TraffixAI</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>ANPR Tracking</Text>
      </View>

      <View style={styles.centerSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search vehicle number..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={onSearchTextChange}
            onSubmitEditing={onSearch}
            autoCapitalize="characters"
          />
          {searchLoading ? (
            <ActivityIndicator size="small" color={colors.accent} style={styles.searchButton} />
          ) : (
            <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
              <Ionicons name="arrow-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surfaceLight }]} onPress={toggleTheme}>
          <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surfaceLight }]} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surfaceLight }]} onPress={onProfilePress}>
          <Ionicons name="person-circle-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 60,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  searchButton: {
    padding: 4,
    marginLeft: 4,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
