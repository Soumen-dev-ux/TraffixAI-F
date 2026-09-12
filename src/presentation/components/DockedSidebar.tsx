import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Camera } from '../../domain/models/Camera';
import { Vehicle } from '../../domain/models/Vehicle';
import { VehicleTrajectory } from '../../domain/models/VehicleTrajectory';
import { TrafficAnalytics } from '../../domain/models/TrafficAnalytics';

type TabType = 'cameras' | 'tracking' | 'analytics' | 'alerts';
type FilterType = 'all' | 'online' | 'high';

type Props = {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onCameraPress: (camera: Camera) => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearch: () => void;
  searchLoading: boolean;
  vehicleError: string;
  onClearVehicleError: () => void;
  locationSearchText?: string;
  onLocationSearchTextChange?: (text: string) => void;
  onLocationSearch?: (locationQuery: string) => void;
  vehicle: Vehicle | null;
  trajectory: VehicleTrajectory | null;
  onClearVehicle: () => void;
  analytics: TrafficAnalytics | null;
  onSettingsPress: () => void;
  onProfilePress: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSelectQuickVehicle?: (plate: string) => void;
  onToggleCollapse?: () => void;
  liveDetections?: { id: string; plateNumber: string; cameraName: string; detectedAt: string; vehicleType?: string }[];
  onOpenAddCamera?: () => void;
  onDeleteCamera?: (cameraId: string) => void;
  onResetCameras?: (mode: 'clear' | 'reset') => void;
  onSimulateDetection?: (cameraId: string, plateNumber?: string) => void;
  onTriggerCameraDetection?: (cameraId: string) => void;
  onStopCameraDetection?: (cameraId: string) => void;
  onEditCamera?: (camera: Camera) => void;
  activeDetectingCameras?: string[];
};

const formatDisplayTime = (timeVal?: string | null) => {
  if (!timeVal) return '--:--:--';
  const trimmed = timeVal.trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  return trimmed;
};

export const DockedSidebar: React.FC<Props> = ({
  cameras,
  selectedCamera,
  onCameraPress,
  searchText,
  onSearchTextChange,
  onSearch,
  searchLoading,
  vehicleError,
  onClearVehicleError,
  locationSearchText,
  onLocationSearchTextChange,
  onLocationSearch,
  vehicle,
  trajectory,
  onClearVehicle,
  analytics,
  onSettingsPress,
  onProfilePress,
  activeTab,
  onTabChange,
  onSelectQuickVehicle,
  onToggleCollapse,
  liveDetections = [],
  onOpenAddCamera,
  onDeleteCamera,
  onResetCameras,
  onSimulateDetection,
  onTriggerCameraDetection,
  onStopCameraDetection,
  onEditCamera,
  activeDetectingCameras = [],
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');
  const [localLocationSearch, setLocalLocationSearch] = useState('');

  const locQuery = locationSearchText !== undefined ? locationSearchText : localLocationSearch;
  const setLocQuery = onLocationSearchTextChange || setLocalLocationSearch;

  const filteredCameras = cameras.filter((camera) => {
    if (filter === 'online') return camera.status === 'online';
    if (filter === 'high') return camera.trafficLevel === 'high' || camera.trafficLevel === 'critical';
    if (locQuery.trim()) {
      const q = locQuery.trim().toLowerCase();
      const matchName = camera.name.toLowerCase().includes(q);
      const matchId = camera.id.toLowerCase().includes(q);
      const matchDir = camera.direction ? camera.direction.toLowerCase().includes(q) : false;
      return matchName || matchId || matchDir;
    }
    return true;
  });

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return colors.accentGreen;
      case 'moderate': return colors.accentAmber;
      case 'high':
      case 'critical': return colors.accentRed;
      default: return colors.textMuted;
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return <Ionicons name="car" size={20} color={colors.accent} />;
      case 'motorcycle': return <MaterialCommunityIcons name="motorbike" size={20} color={colors.accent} />;
      case 'bus': return <Ionicons name="bus" size={20} color={colors.accent} />;
      case 'truck': return <MaterialCommunityIcons name="truck" size={20} color={colors.accent} />;
      case 'van': return <MaterialCommunityIcons name="van-utility" size={20} color={colors.accent} />;
      case 'taxi': return <Ionicons name="car-sport" size={20} color={colors.accent} />;
      default: return <Ionicons name="car" size={20} color={colors.accent} />;
    }
  };

  const sortedDetections = trajectory?.detections
    ? [...trajectory.detections].sort(
        (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
      )
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      {/* 1. Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandIcon, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="radio" size={20} color={colors.accent} />
          </View>
          <View style={styles.brandInfo}>
            <Text style={[styles.brandTitle, { color: colors.text }]}>TraffixAI</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>ANPR Command Center</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={toggleTheme}
            accessibilityLabel="Toggle Theme"
          >
            <Ionicons name={isDark ? "moon" : "sunny"} size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={onSettingsPress}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={onProfilePress}
            accessibilityLabel="Profile"
          >
            <Ionicons name="person-circle-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          {onToggleCollapse && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceLight }]}
              onPress={onToggleCollapse}
              accessibilityLabel="Collapse Sidebar"
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. Dynamic Search Bar (Vehicle Search on Tracking tab; Location/Camera Search on other tabs) */}
      <View style={[styles.searchSection, { borderBottomColor: colors.border }]}>
        {activeTab === 'tracking' ? (
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
            <Ionicons name="car-sport-outline" size={18} color={colors.accent} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search vehicle plate number..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={onSearchTextChange}
              onSubmitEditing={onSearch}
              autoCapitalize="characters"
            />
            {searchLoading ? (
              <ActivityIndicator size="small" color={colors.accent} style={styles.searchSubmitBtn} />
            ) : (
              <TouchableOpacity onPress={onSearch} style={styles.searchSubmitBtn} accessibilityLabel="Search Vehicle">
                <Ionicons name="arrow-forward" size={18} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
            <Ionicons name="location-outline" size={18} color={colors.accent} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search location or camera (e.g. Park Street)..."
              placeholderTextColor={colors.textMuted}
              value={locQuery}
              onChangeText={setLocQuery}
              onSubmitEditing={() => onLocationSearch?.(locQuery)}
              autoCapitalize="words"
            />
            {locQuery.trim().length > 0 ? (
              <TouchableOpacity
                onPress={() => setLocQuery('')}
                style={{ paddingHorizontal: 6 }}
                hitSlop={8}
                accessibilityLabel="Clear location search"
              >
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => onLocationSearch?.(locQuery)}
              style={styles.searchSubmitBtn}
              accessibilityLabel="Search Location"
            >
              <Ionicons name="arrow-forward" size={18} color={colors.accent} />
            </TouchableOpacity>
          </View>
        )}

        {/* Error Banner for vehicle search */}
        {activeTab === 'tracking' && vehicleError ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.surfaceLight, borderColor: colors.accentRed }]}>
            <Ionicons name="alert-circle" size={16} color={colors.accentRed} />
            <Text style={[styles.errorBannerText, { color: colors.text }]}>{vehicleError}</Text>
            <TouchableOpacity onPress={onClearVehicleError}>
              <Ionicons name="close" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* 3. Navigation Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'cameras' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
          onPress={() => onTabChange('cameras')}
        >
          <Ionicons
            name="videocam-outline"
            size={16}
            color={activeTab === 'cameras' ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'cameras' ? colors.text : colors.textSecondary }]}>
            Cameras
          </Text>
          <View style={[styles.tabBadge, { backgroundColor: colors.surfaceLight }]}>
            <Text style={[styles.tabBadgeText, { color: colors.textSecondary }]}>{cameras.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tracking' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
          onPress={() => onTabChange('tracking')}
        >
          <Ionicons
            name="navigate-outline"
            size={16}
            color={activeTab === 'tracking' ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'tracking' ? colors.text : colors.textSecondary }]}>
            Tracking
          </Text>
          {vehicle ? (
            <View style={[styles.activeDot, { backgroundColor: colors.accentGreen }]} />
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'analytics' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
          onPress={() => onTabChange('analytics')}
        >
          <Ionicons
            name="stats-chart-outline"
            size={16}
            color={activeTab === 'analytics' ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'analytics' ? colors.text : colors.textSecondary }]}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'alerts' && { borderBottomColor: colors.accentRed, borderBottomWidth: 2 }]}
          onPress={() => onTabChange('alerts')}
        >
          <Ionicons
            name="warning-outline"
            size={16}
            color={activeTab === 'alerts' ? colors.accentRed : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'alerts' ? colors.text : colors.textSecondary }]}>
            Alerts
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Tab Body Content */}
      <View style={styles.contentArea}>
        {/* TAB 1: CAMERAS LIST */}
        {activeTab === 'cameras' && (
          <View style={styles.tabContentContainer}>
            {/* MVP Route Simulator (Camera A -> Camera B) */}
            <View style={[styles.mvpSimulatorBox, { backgroundColor: colors.surfaceLight, borderColor: colors.accent }]}>
              <View style={styles.mvpHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="git-network-outline" size={15} color={colors.accent} />
                  <Text style={[styles.mvpTitle, { color: colors.text }]}>MVP ROUTE SIMULATOR</Text>
                </View>
                {trajectory && trajectory.detections.length > 0 && (
                  <TouchableOpacity onPress={onClearVehicle} style={styles.mvpResetBtn} hitSlop={6}>
                    <Ionicons name="trash-outline" size={12} color={colors.accentRed} style={{ marginRight: 3 }} />
                    <Text style={[styles.mvpResetText, { color: colors.accentRed }]}>Clear Route</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.mvpSub, { color: colors.textSecondary }]}>
                Click cameras in order to simulate transit (Camera A ➔ Camera B):
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mvpCamScroll}>
                {cameras.map((cam, idx) => {
                  const isVisited = trajectory?.detections.some((d) => d.cameraId === cam.id);
                  const isCurrent = vehicle?.cameraId === cam.id;
                  return (
                    <TouchableOpacity
                      key={cam.id}
                      style={[
                        styles.mvpCamChip,
                        {
                          backgroundColor: isCurrent ? colors.accent : isVisited ? colors.surface : colors.surfaceLight,
                          borderColor: isCurrent ? colors.accent : isVisited ? colors.accentGreen : colors.border,
                        },
                      ]}
                      onPress={() => {
                        onTriggerCameraDetection?.(cam.id);
                        onSimulateDetection?.(cam.id, vehicle?.plateNumber);
                      }}
                    >
                      <Text
                        style={[
                          styles.mvpCamChipText,
                          { color: isCurrent ? '#ffffff' : isVisited ? colors.accentGreen : colors.text },
                        ]}
                      >
                        {idx + 1}. {cam.name.split(' ')[0]}
                      </Text>
                      {isVisited && (
                        <Ionicons
                          name="checkmark-circle"
                          size={12}
                          color={isCurrent ? '#ffffff' : colors.accentGreen}
                          style={{ marginLeft: 3 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Camera Actions Bar */}
            <View style={styles.cameraActionBar}>
              <TouchableOpacity
                style={[styles.addCamBtn, { backgroundColor: colors.accent }]}
                onPress={onOpenAddCamera}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.addCamBtnText}>Add Camera</Text>
              </TouchableOpacity>

              <View style={styles.camResetGroup}>
                <TouchableOpacity
                  style={[styles.resetCamBtn, { borderColor: colors.border, backgroundColor: colors.surfaceLight }]}
                  onPress={() => onResetCameras?.('clear')}
                  accessibilityLabel="Clear all cameras to start fresh"
                >
                  <Ionicons name="trash-outline" size={13} color={colors.accentRed} style={{ marginRight: 4 }} />
                  <Text style={[styles.resetCamText, { color: colors.accentRed }]}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resetCamBtn, { borderColor: colors.border, backgroundColor: colors.surfaceLight }]}
                  onPress={() => onResetCameras?.('reset')}
                  accessibilityLabel="Restore default Kolkata junction cameras"
                >
                  <Ionicons name="refresh-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.resetCamText, { color: colors.textSecondary }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
              {(['all', 'online', 'high'] as FilterType[]).map((f) => {
                const isActive = filter === f;
                const label = f === 'all' ? 'All' : f === 'online' ? 'Online' : 'High Traffic';
                return (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.filterChip,
                      { borderColor: colors.border, backgroundColor: isActive ? colors.accent : colors.surfaceLight },
                    ]}
                    onPress={() => setFilter(f)}
                  >
                    <Text style={[styles.filterChipText, { color: isActive ? '#ffffff' : colors.textSecondary }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cameras ScrollView */}
            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
              {filteredCameras.length === 0 ? (
                locQuery.trim().length > 0 ? (
                  <View style={[styles.emptyCameraState, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={34} color={colors.accent} />
                    <Text style={[styles.emptyCameraTitle, { color: colors.text }]}>No Matching Cameras</Text>
                    <Text style={[styles.emptyCameraSub, { color: colors.textMuted }]}>
                      No camera location found matching "{locQuery}". Try searching "Park Street", "Esplanade", "Howrah", or "Salt Lake".
                    </Text>
                    <TouchableOpacity
                      style={[styles.addFirstCamBtn, { backgroundColor: colors.accent }]}
                      onPress={() => setLocQuery('')}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.addFirstCamBtnText}>Clear Search Filter</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.emptyCameraState, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                    <Ionicons name="videocam-off-outline" size={36} color={colors.textMuted} />
                    <Text style={[styles.emptyCameraTitle, { color: colors.text }]}>No Cameras Deployed</Text>
                    <Text style={[styles.emptyCameraSub, { color: colors.textMuted }]}>
                      Click "+ Add Camera" to deploy a camera node by coordinates and assign video footage.
                    </Text>
                    <TouchableOpacity
                      style={[styles.addFirstCamBtn, { backgroundColor: colors.accent }]}
                      onPress={onOpenAddCamera}
                    >
                      <Ionicons name="add" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.addFirstCamBtnText}>Deploy First Camera</Text>
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                filteredCameras.map((camera) => {
                  const isSelected = selectedCamera?.id === camera.id;
                  const isOnline = camera.status === 'online';
                  const trafficColor = getTrafficColor(camera.trafficLevel);

                  return (
                    <TouchableOpacity
                      key={camera.id}
                      style={[
                        styles.cameraCard,
                        {
                          backgroundColor: isSelected ? colors.surfaceLight : colors.surface,
                          borderColor: isSelected ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => onCameraPress(camera)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.statusIndicator, { backgroundColor: isOnline ? colors.accentGreen : colors.accentRed }]} />
                      <View style={styles.cameraCardBody}>
                        <Text style={[styles.cameraNameText, { color: colors.text }]} numberOfLines={1}>
                          {camera.name}
                        </Text>
                        <View style={styles.cameraMetaRow}>
                          <Text style={[styles.cameraVehicleCount, { color: colors.textSecondary }]}>
                            {camera.vehicleCount} veh
                          </Text>
                          {camera.direction ? (
                            <Text style={[styles.dirTag, { color: colors.accent }]}>
                              • {camera.direction}
                            </Text>
                          ) : null}
                          <Text style={[styles.trafficTag, { color: trafficColor }]}>
                            • {camera.trafficLevel.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {onSimulateDetection && (
                        <TouchableOpacity
                          style={[
                            styles.quickDetectBtn,
                            activeDetectingCameras.includes(camera.id)
                              ? { backgroundColor: '#ef444422', borderColor: '#ef4444' }
                              : { backgroundColor: colors.accent + '22', borderColor: colors.accent }
                          ]}
                          onPress={(e) => {
                            e.stopPropagation();
                            if (activeDetectingCameras.includes(camera.id)) {
                              onStopCameraDetection?.(camera.id);
                            } else {
                              onTriggerCameraDetection?.(camera.id);
                              onSimulateDetection(camera.id, vehicle?.plateNumber);
                            }
                          }}
                          hitSlop={4}
                        >
                          <Ionicons
                            name={activeDetectingCameras.includes(camera.id) ? "stop" : "play"}
                            size={10}
                            color={activeDetectingCameras.includes(camera.id) ? "#ef4444" : colors.accent}
                            style={{ marginRight: 3 }}
                          />
                          <Text
                            style={[
                              styles.quickDetectText,
                              { color: activeDetectingCameras.includes(camera.id) ? "#ef4444" : colors.accent }
                            ]}
                          >
                            {activeDetectingCameras.includes(camera.id) ? "Stop" : "Detect"}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {onEditCamera && (
                        <TouchableOpacity
                          style={styles.deleteCamBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            onEditCamera(camera);
                          }}
                          hitSlop={6}
                          accessibilityLabel="Edit Camera / Stream"
                        >
                          <Ionicons name="create-outline" size={15} color={colors.accent} />
                        </TouchableOpacity>
                      )}

                      {onDeleteCamera && (
                        <TouchableOpacity
                          style={styles.deleteCamBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            onDeleteCamera(camera.id);
                          }}
                          hitSlop={6}
                        >
                          <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                        </TouchableOpacity>
                      )}

                      <Ionicons name="chevron-forward" size={18} color={isSelected ? colors.accent : colors.textMuted} />
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {/* TAB 2: VEHICLE TRACKING */}
        {activeTab === 'tracking' && (
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {vehicle ? (
              <View style={styles.trackingContainer}>
                {/* MVP Trajectory Advance Strip */}
                <View style={[styles.mvpSimulatorBox, { backgroundColor: colors.surfaceLight, borderColor: colors.accent, marginBottom: 12 }]}>
                  <View style={styles.mvpHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="git-network-outline" size={14} color={colors.accent} />
                      <Text style={[styles.mvpTitle, { color: colors.text }]}>ADVANCE ROUTE TO NEXT CAMERA</Text>
                    </View>
                    <TouchableOpacity onPress={onClearVehicle} style={styles.mvpResetBtn} hitSlop={6}>
                      <Ionicons name="trash-outline" size={12} color={colors.accentRed} style={{ marginRight: 3 }} />
                      <Text style={[styles.mvpResetText, { color: colors.accentRed }]}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mvpCamScroll}>
                    {cameras.map((cam, idx) => {
                      const isVisited = trajectory?.detections.some((d) => d.cameraId === cam.id);
                      const isCurrent = vehicle?.cameraId === cam.id;
                      return (
                        <TouchableOpacity
                          key={cam.id}
                          style={[
                            styles.mvpCamChip,
                            {
                              backgroundColor: isCurrent ? colors.accent : isVisited ? colors.surface : colors.surfaceLight,
                              borderColor: isCurrent ? colors.accent : isVisited ? colors.accentGreen : colors.border,
                            },
                          ]}
                          onPress={() => onSimulateDetection?.(cam.id, vehicle?.plateNumber)}
                        >
                          <Text
                            style={[
                              styles.mvpCamChipText,
                              { color: isCurrent ? '#ffffff' : isVisited ? colors.accentGreen : colors.text },
                            ]}
                          >
                            {idx + 1}. {cam.name.split(' ')[0]}
                          </Text>
                          {isVisited && (
                            <Ionicons
                              name="checkmark-circle"
                              size={12}
                              color={isCurrent ? '#ffffff' : colors.accentGreen}
                              style={{ marginLeft: 3 }}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Vehicle Header Card */}
                <View style={[styles.vehicleHeaderCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                  <View style={styles.vehicleCardTop}>
                    <View style={styles.vehicleTypePill}>
                      {getVehicleIcon(vehicle.vehicleType)}
                      <Text style={[styles.vehicleTypeLabel, { color: colors.text }]}>
                        {vehicle.color.toUpperCase()} {vehicle.vehicleType.toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={onClearVehicle} style={styles.clearVehicleBtn}>
                      <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.plateContainer, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
                    <Text style={[styles.plateText, { color: colors.accent }]}>{vehicle.plateNumber}</Text>
                  </View>

                  <View style={styles.vehicleMetaGrid}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.metaValue, { color: colors.text }]}>
                        {formatDisplayTime(vehicle.detectedAt)}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={1}>
                        {vehicle.cameraName}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Timeline Header */}
                <View style={styles.timelineHeaderRow}>
                  <Text style={[styles.timelineTitle, { color: colors.textSecondary }]}>
                    DETECTION HISTORY ({sortedDetections.length} WAYPOINTS)
                  </Text>
                </View>

                {/* Vertical Connected Timeline */}
                <View style={styles.timelineList}>
                  {sortedDetections.map((detection, index) => {
                    const isLatest = index === 0;
                    const isLast = index === sortedDetections.length - 1;

                    return (
                      <View key={detection.id} style={styles.timelineRow}>
                        <View style={styles.timelineGutter}>
                          <View
                            style={[
                              styles.timelineDot,
                              {
                                backgroundColor: isLatest ? colors.accent : colors.surfaceLight,
                                borderColor: isLatest ? '#ffffff' : colors.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name="videocam"
                              size={12}
                              color={isLatest ? '#ffffff' : colors.textSecondary}
                            />
                          </View>
                          {!isLast && <View style={[styles.timelineBar, { backgroundColor: colors.border }]} />}
                        </View>

                        <View
                          style={[
                            styles.timelineCard,
                            {
                              backgroundColor: isLatest ? colors.surfaceLight : colors.surface,
                              borderColor: isLatest ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          <View style={styles.timelineCardHeader}>
                            <Text style={[styles.waypointName, { color: colors.text }]} numberOfLines={1}>
                              {detection.cameraName}
                            </Text>
                            {isLatest && (
                              <View style={[styles.latestPill, { backgroundColor: colors.accentGreen }]}>
                                <Text style={styles.latestPillText}>LATEST</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.waypointTime, { color: colors.textSecondary }]}>
                            {formatDisplayTime(detection.detectedAt)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.emptyTrackingContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="navigate-circle-outline" size={48} color={colors.accent} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Vehicle ANPR Tracking</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Enter any vehicle license plate number in the search bar to track its historical route and camera detections in real time.
                </Text>

                {liveDetections.length > 0 ? (
                  <View style={{ width: '100%', marginTop: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <View style={[styles.livePulseDot, { backgroundColor: colors.accentGreen }]} />
                      <Text style={[styles.suggestedTitle, { color: colors.text, marginBottom: 0 }]}>
                        LIVE AI DETECTIONS ({liveDetections.length})
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 12 }}>
                      Recent vehicles detected by YOLOv8 vision pipeline:
                    </Text>
                    <View style={{ gap: 8 }}>
                      {liveDetections.slice(0, 8).map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 10,
                            borderRadius: 10,
                            backgroundColor: colors.surfaceLight,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }}
                          onPress={() => onSelectQuickVehicle?.(item.plateNumber)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="car-sport" size={16} color={colors.accent} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{item.plateNumber}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 11, color: colors.textSecondary }}>{item.cameraName}</Text>
                            <Text style={{ fontSize: 10, color: colors.textMuted }}>{formatDisplayTime(item.detectedAt)}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={{ backgroundColor: colors.surfaceLight, borderColor: colors.border, borderWidth: 1, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 }}>
                    <Ionicons name="scan-outline" size={28} color={colors.accent} style={{ marginBottom: 8 }} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4, textAlign: 'center' }}>
                      No Vehicles Detected Yet
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, textAlign: 'center', lineHeight: 16 }}>
                      Start AI detection on Camera A or Camera B in the Cameras tab to scan vehicles in real time.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* TAB 3: CITY TRAFFIC ANALYTICS */}
        {activeTab === 'analytics' && (
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            <View style={styles.analyticsContainer}>
              {/* Stat Cards Grid */}
              <View style={styles.statsGrid}>
                <View style={[styles.statTile, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                  <Ionicons name="car-sport" size={22} color={colors.accent} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {analytics?.totalVehicles ?? '--'}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Active Vehicles</Text>
                </View>

                <View style={[styles.statTile, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                  <Ionicons name="videocam" size={22} color={colors.accentGreen} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {cameras.length} / {cameras.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Online Cameras</Text>
                </View>

                <View style={[styles.statTile, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                  <Ionicons name="speedometer" size={22} color={colors.accentRed} />
                  <Text style={[styles.statValue, { color: colors.accentRed }]}>
                    {analytics?.congestionLevel?.toUpperCase() ?? 'MODERATE'}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>City Congestion</Text>
                </View>
              </View>

              {/* Vehicle Breakdown */}
              <Text style={[styles.analyticsSectionTitle, { color: colors.text }]}>
                Vehicle Distribution
              </Text>
              <View style={[styles.breakdownCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                {[
                  { type: 'Cars', count: '54', icon: 'car', isMaterial: false },
                  { type: 'Buses', count: '16', icon: 'bus', isMaterial: false },
                  { type: 'Trucks', count: '12', icon: 'truck', isMaterial: true },
                  { type: 'Motorcycles', count: '9', icon: 'bicycle', isMaterial: false },
                ].map((item) => (
                  <View key={item.type} style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.breakdownLeft}>
                      {item.isMaterial ? (
                        <MaterialCommunityIcons name="truck" size={18} color={colors.accent} />
                      ) : (
                        <Ionicons name={item.icon as any} size={18} color={colors.accent} />
                      )}
                      <Text style={[styles.breakdownLabel, { color: colors.text }]}>{item.type}</Text>
                    </View>
                    <Text style={[styles.breakdownCount, { color: colors.text }]}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* TAB 4: SECURITY & ANOMALY ALERTS */}
        {activeTab === 'alerts' && (
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            <View style={styles.alertsContainer}>
              <View style={{ backgroundColor: colors.surfaceLight, borderColor: colors.border, borderWidth: 1, padding: 24, borderRadius: 12, alignItems: 'center', marginTop: 16 }}>
                <Ionicons name="shield-checkmark" size={36} color={colors.accentGreen} style={{ marginBottom: 10 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4, textAlign: 'center' }}>
                  Surveillance Network Secure
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 }}>
                  No active plate cloning or velocity anomalies detected across monitored cameras.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* 5. Footer Status Strip */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.footerStatusRow}>
          <View style={[styles.livePulseDot, { backgroundColor: colors.accentGreen }]} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Realtime ANPR Stream Active
          </Text>
        </View>
        <Text style={[styles.footerDivision, { color: colors.textMuted }]}>
          Kolkata Metro Surveillance
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 380,
    maxWidth: '100%',
    height: '100%',
    borderRightWidth: 1,
    flexDirection: 'column',
    zIndex: 20,
    ...Platform.select({
      web: {
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInfo: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
    fontWeight: '500',
  },
  searchSubmitBtn: {
    padding: 6,
    marginLeft: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  alertCountBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  alertCountBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  contentArea: {
    flex: 1,
  },
  tabContentContainer: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cameraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cameraCardBody: {
    flex: 1,
  },
  cameraNameText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  cameraMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cameraVehicleCount: {
    fontSize: 11,
  },
  trafficTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  trackingContainer: {
    paddingVertical: 12,
  },
  vehicleHeaderCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  vehicleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  vehicleTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clearVehicleBtn: {
    padding: 2,
  },
  plateContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  plateText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  vehicleMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  timelineHeaderRow: {
    marginBottom: 10,
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineGutter: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineBar: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineCard: {
    flex: 1,
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  waypointName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  latestPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  latestPillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  waypointTime: {
    fontSize: 10,
  },
  emptyTrackingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  suggestedTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  suggestedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestedChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  analyticsContainer: {
    paddingVertical: 12,
  },
  statsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  statTile: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  analyticsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  breakdownCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  breakdownCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerDivision: {
    fontSize: 10,
    paddingLeft: 16,
  },
  alertsContainer: {
    paddingVertical: 12,
    gap: 12,
  },
  alertCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertHeaderInfo: {
    flex: 1,
  },
  alertTypeTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  alertTimestamp: {
    fontSize: 10,
    marginTop: 1,
  },
  alertPlatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  alertPlateText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  alertPlateSub: {
    fontSize: 11,
  },
  alertDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
  alertActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  alertActionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  cameraActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  addCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addCamBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  camResetGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  resetCamText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dirTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteCamBtn: {
    padding: 6,
    marginRight: 4,
  },
  emptyCameraState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    margin: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyCameraTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyCameraSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
    maxWidth: 240,
  },
  addFirstCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
  },
  addFirstCamBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  mvpSimulatorBox: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  mvpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mvpTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mvpResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#ef444420',
  },
  mvpResetText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mvpSub: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 14,
  },
  mvpCamScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 2,
  },
  mvpCamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  mvpCamChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 4,
  },
  quickDetectText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
