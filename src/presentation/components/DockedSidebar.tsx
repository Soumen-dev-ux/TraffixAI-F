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
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredCameras = cameras.filter((camera) => {
    if (filter === 'online') return camera.status === 'online';
    if (filter === 'high') return camera.trafficLevel === 'high' || camera.trafficLevel === 'critical';
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

      {/* 2. Integrated Search Bar */}
      <View style={[styles.searchSection, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
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
            <ActivityIndicator size="small" color={colors.accent} style={styles.searchSubmitBtn} />
          ) : (
            <TouchableOpacity onPress={onSearch} style={styles.searchSubmitBtn}>
              <Ionicons name="arrow-forward" size={18} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Error Banner */}
        {vehicleError ? (
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
          <View style={[styles.alertCountBadge, { backgroundColor: colors.accentRed }]}>
            <Text style={styles.alertCountBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. Tab Body Content */}
      <View style={styles.contentArea}>
        {/* TAB 1: CAMERAS LIST */}
        {activeTab === 'cameras' && (
          <View style={styles.tabContentContainer}>
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
              {filteredCameras.map((camera) => {
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
                          {camera.vehicleCount} vehicles
                        </Text>
                        <Text style={[styles.trafficTag, { color: trafficColor }]}>
                          • {camera.trafficLevel.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={isSelected ? colors.accent : colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* TAB 2: VEHICLE TRACKING */}
        {activeTab === 'tracking' && (
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {vehicle ? (
              <View style={styles.trackingContainer}>
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
                        {new Date(vehicle.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                            {new Date(detection.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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

                <Text style={[styles.suggestedTitle, { color: colors.textMuted }]}>TRY DEMO VEHICLES:</Text>
                <View style={styles.suggestedRow}>
                  {['WB12AB1234', 'WB06CD5678'].map((plate) => (
                    <TouchableOpacity
                      key={plate}
                      style={[styles.suggestedChip, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                      onPress={() => onSelectQuickVehicle?.(plate)}
                    >
                      <Ionicons name="car-outline" size={14} color={colors.accent} />
                      <Text style={[styles.suggestedChipText, { color: colors.text }]}>{plate}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                  { type: 'Cars', count: '54', icon: 'car' },
                  { type: 'Buses', count: '16', icon: 'bus' },
                  { type: 'Trucks', count: '12', icon: 'truck' },
                  { type: 'Motorcycles', count: '9', icon: 'bicycle' },
                ].map((item) => (
                  <View key={item.type} style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.breakdownLeft}>
                      <Ionicons name={item.icon as any} size={18} color={colors.accent} />
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
              {/* Alert 1: Cloned Plate Anomaly */}
              <View style={[styles.alertCard, { backgroundColor: colors.surfaceLight, borderColor: colors.accentRed }]}>
                <View style={styles.alertCardHeader}>
                  <View style={[styles.alertIconBadge, { backgroundColor: colors.surface }]}>
                    <Ionicons name="warning" size={18} color={colors.accentRed} />
                  </View>
                  <View style={styles.alertHeaderInfo}>
                    <Text style={[styles.alertTypeTitle, { color: colors.accentRed }]}>CLONED PLATE DETECTED</Text>
                    <Text style={[styles.alertTimestamp, { color: colors.textMuted }]}>2 min ago • Critical Anomaly</Text>
                  </View>
                </View>

                <View style={[styles.alertPlatePill, { backgroundColor: colors.surface, borderColor: colors.accentRed }]}>
                  <Text style={[styles.alertPlateText, { color: colors.text }]}>WB12AB1234</Text>
                  <Text style={[styles.alertPlateSub, { color: colors.textSecondary }]}>White Car</Text>
                </View>

                <Text style={[styles.alertDescription, { color: colors.textSecondary }]}>
                  Simultaneous detection at <Text style={{ color: colors.text, fontWeight: '700' }}>Esplanade Crossing</Text> and <Text style={{ color: colors.text, fontWeight: '700' }}>Salt Lake Sector V</Text> within 30 seconds. Spatial-temporal velocity exceeds physical limits.
                </Text>

                <TouchableOpacity
                  style={[styles.alertActionBtn, { backgroundColor: colors.accentRed }]}
                  onPress={() => onSelectQuickVehicle?.('WB12AB1234')}
                >
                  <Ionicons name="locate" size={14} color="#ffffff" />
                  <Text style={styles.alertActionBtnText}>Inspect Trajectory</Text>
                </TouchableOpacity>
              </View>

              {/* Alert 2: Stolen / Hotlist Vehicle Match */}
              <View style={[styles.alertCard, { backgroundColor: colors.surfaceLight, borderColor: colors.accentAmber }]}>
                <View style={styles.alertCardHeader}>
                  <View style={[styles.alertIconBadge, { backgroundColor: colors.surface }]}>
                    <Ionicons name="shield-half" size={18} color={colors.accentAmber} />
                  </View>
                  <View style={styles.alertHeaderInfo}>
                    <Text style={[styles.alertTypeTitle, { color: colors.accentAmber }]}>HOTLIST / STOLEN MATCH</Text>
                    <Text style={[styles.alertTimestamp, { color: colors.textMuted }]}>7 min ago • Wanted Notice</Text>
                  </View>
                </View>

                <View style={[styles.alertPlatePill, { backgroundColor: colors.surface, borderColor: colors.accentAmber }]}>
                  <Text style={[styles.alertPlateText, { color: colors.text }]}>WB18GH3456</Text>
                  <Text style={[styles.alertPlateSub, { color: colors.textSecondary }]}>Red Truck</Text>
                </View>

                <Text style={[styles.alertDescription, { color: colors.textSecondary }]}>
                  Flagged in West Bengal Police FIR-2026-BEL-04 (Commercial Cargo Theft). Last observed crossing <Text style={{ color: colors.text, fontWeight: '700' }}>Howrah Bridge</Text> heading East.
                </Text>

                <TouchableOpacity
                  style={[styles.alertActionBtn, { backgroundColor: colors.surface, borderColor: colors.accentAmber, borderWidth: 1 }]}
                  onPress={() => onSelectQuickVehicle?.('WB18GH3456')}
                >
                  <Ionicons name="navigate" size={14} color={colors.accentAmber} />
                  <Text style={[styles.alertActionBtnText, { color: colors.accentAmber }]}>Track Live Waypoints</Text>
                </TouchableOpacity>
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
});
