import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Camera } from '../../domain/models/Camera';
import { CameraApi } from '../../data/api/CameraApi';

export type BoundingBoxData = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  frame_width?: number;
  frame_height?: number;
};

export type DetectedVehicleItem = {
  id: string;
  plateNumber: string;
  cameraName: string;
  cameraId?: string;
  detectedAt: string;
  vehicleType?: string;
  confidence?: number;
  boundingBox?: BoundingBoxData | null;
  localTrackId?: string;
  inFrame?: boolean;
  timestampMs?: number;
};

type Props = {
  camera: Camera | null;
  visible: boolean;
  onClose: () => void;
  onTriggerCameraDetection?: (cameraId: string) => Promise<void> | void;
  onEditCamera?: (camera: Camera) => void;
  sessionDetections?: DetectedVehicleItem[];
  onSelectVehicle?: (plateNumber: string, vehicleType?: string) => void;
};

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'car', label: 'Car' },
  { id: 'motorcycle', label: 'Motorcycle' },
  { id: 'truck', label: 'Truck' },
  { id: 'bus', label: 'Bus' },
  { id: 'van', label: 'Van' },
  { id: 'taxi', label: 'Taxi' },
  { id: 'other', label: 'Other' },
];

export const CameraPopup: React.FC<Props> = ({
  camera,
  visible,
  onClose,
  onTriggerCameraDetection,
  onEditCamera,
  sessionDetections = [],
  onSelectVehicle,
}) => {
  const { colors } = useTheme();
  const [currentTime, setCurrentTime] = React.useState(() => new Date().toLocaleTimeString());
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [detectedNotice, setDetectedNotice] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const cameraDetections = React.useMemo(() => {
    if (!camera || !sessionDetections) return [];
    return sessionDetections.filter(
      (d) => !d.cameraId || d.cameraId === camera.id || d.cameraName === camera.name
    );
  }, [camera, sessionDetections]);

  const filteredDetections = React.useMemo(() => {
    if (selectedCategory === 'all') return cameraDetections;
    return cameraDetections.filter((d) => {
      const type = (d.vehicleType || 'car').toLowerCase();
      if (selectedCategory === 'other') {
        return ['other', 'unknown'].includes(type) || !['car', 'motorcycle', 'truck', 'bus', 'van', 'taxi'].includes(type);
      }
      return type === selectedCategory;
    });
  }, [cameraDetections, selectedCategory]);

  const activeBoundingBoxes = React.useMemo(() => {
    if (!camera || !sessionDetections) return [];
    const now = Date.now();
    return sessionDetections.filter(
      (d) =>
        (d.cameraId === camera.id || d.cameraName === camera.name) &&
        d.boundingBox &&
        d.inFrame !== false &&
        now - (d.timestampMs || 0) < 6000
    );
  }, [sessionDetections, camera]);

  const isVehicleInFrame = (d: DetectedVehicleItem) => {
    if (typeof d.inFrame === 'boolean') return d.inFrame;
    if (d.timestampMs) {
      return Date.now() - d.timestampMs < 12000;
    }
    if (d.detectedAt) {
      const age = Date.now() - new Date(d.detectedAt).getTime();
      return age < 12000;
    }
    return false;
  };

  React.useEffect(() => {
    if (!visible || !camera) return;
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, camera]);

  if (!camera || !visible) return null;

  const handleTriggerDetection = async () => {
    if (!camera) return;
    setIsDetecting(true);
    try {
      if (onTriggerCameraDetection) {
        await onTriggerCameraDetection(camera.id);
      } else {
        await CameraApi.triggerCameraDetection(camera.id, 'auto');
      }
      setDetectedNotice(`AI Detection active at ${camera.name}! Scanning video...`);
      setTimeout(() => setDetectedNotice(null), 4000);
    } catch (err) {
      console.error('Failed to trigger AI detection:', err);
    } finally {
      setIsDetecting(false);
    }
  };

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
    car: <Ionicons name="car" size={18} color={colors.accent} />,
    motorcycle: <MaterialCommunityIcons name="motorbike" size={18} color={colors.accent} />,
    bus: <Ionicons name="bus" size={18} color={colors.accent} />,
    truck: <MaterialCommunityIcons name="truck" size={18} color={colors.accent} />,
    van: <Ionicons name="car" size={18} color={colors.accent} />,
    taxi: <Ionicons name="car" size={18} color={colors.accent} />,
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Platform.OS === 'web' ? styles.cardWeb : styles.cardMobile,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.accentGreen : colors.accentRed }]} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {camera.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {onEditCamera && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.surfaceLight }]}
              onPress={() => onEditCamera(camera)}
              hitSlop={8}
              accessibilityLabel="Edit Camera / Video"
            >
              <Ionicons name="create-outline" size={16} color={colors.accent} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.surfaceLight }]}
            onPress={onClose}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
        {/* Status & Metrics Strip */}
        <View style={[styles.statusRow, { borderBottomColor: colors.border, backgroundColor: colors.surfaceLight }]}>
          <View style={styles.statusCol}>
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>STATUS</Text>
            <Text style={[styles.statusText, { color: isOnline ? colors.accentGreen : colors.accentRed }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          <View style={styles.statusCol}>
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>FRAME RATE</Text>
            <Text style={[styles.statusText, { color: colors.text }]}>{camera.fps} FPS</Text>
          </View>

          <View style={styles.statusCol}>
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>COUNT</Text>
            <Text style={[styles.statusText, { color: colors.accent }]}>{camera.vehicleCount} veh</Text>
          </View>
        </View>

        {/* Real Live Video Feed */}
        <View style={[styles.feedContainer, { backgroundColor: '#000000', borderColor: colors.border }]}>
          {isOnline ? (
            Platform.OS === 'web' ? (
              React.createElement('video', {
                key: `${camera.id}_${camera.streamUrl || camera.stream_url || ''}`,
                src: camera.streamUrl || camera.stream_url || (camera.id === 'CAM_002' || camera.id === 'CAM_004' ? '/videos/junction_traffic.mp4' : '/videos/sample_traffic.mp4'),
                autoPlay: true,
                loop: true,
                muted: true,
                playsInline: true,
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 10,
                },
              })
            ) : (
              <View style={styles.feedCenterContent}>
                <Ionicons name="videocam" size={36} color={colors.accent} />
                <Text style={[styles.feedText, { color: colors.accent }]}>LIVE ANPR STREAM</Text>
              </View>
            )
          ) : (
            <View style={styles.feedCenterContent}>
              <Ionicons name="videocam-off" size={36} color={colors.textMuted} />
              <Text style={[styles.feedText, { color: colors.textMuted }]}>FEED OFFLINE</Text>
            </View>
          )}

          {/* Real-time AI Bounding Box Overlays */}
          {isOnline && activeBoundingBoxes.map((item) => {
            const b = item.boundingBox!;
            const fw = b.frame_width || 768;
            const fh = b.frame_height || 432;
            const leftPct = Math.max(0, Math.min(100, (b.x1 / fw) * 100));
            const topPct = Math.max(0, Math.min(100, (b.y1 / fh) * 100));
            const widthPct = Math.max(4, Math.min(100 - leftPct, ((b.x2 - b.x1) / fw) * 100));
            const heightPct = Math.max(4, Math.min(100 - topPct, ((b.y2 - b.y1) / fh) * 100));

            const hasOcrPlate = item.plateNumber && !item.plateNumber.startsWith('TRACK_') && !item.plateNumber.startsWith('CAM_') && !item.plateNumber.startsWith('NO_PLATE');
            const boxColor = hasOcrPlate ? '#38bdf8' : '#10b981';

            return (
              <View
                key={`bbox_${item.id}_${item.plateNumber}`}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                  borderWidth: 2,
                  borderColor: boxColor,
                  backgroundColor: hasOcrPlate ? 'rgba(56, 189, 248, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                  borderRadius: 4,
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                {/* Floating Tag */}
                <View
                  style={{
                    position: 'absolute',
                    top: -22,
                    left: -2,
                    backgroundColor: boxColor,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 3,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 2,
                  }}
                >
                  <Text style={{ color: '#000000', fontSize: 10, fontWeight: '800' }}>
                    {hasOcrPlate
                      ? item.plateNumber
                      : `${(item.vehicleType || 'VEHICLE').toUpperCase()} #${item.localTrackId ? item.localTrackId.split('_').pop() : (item.id || '').slice(-3)}`}
                  </Text>
                  {item.confidence ? (
                    <Text style={{ color: '#002511', fontSize: 9, fontWeight: '700' }}>
                      {Math.round(item.confidence * 100)}%
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}

          {isOnline && (
            <>
              {/* Overlay Top Left: Camera ID & FPS */}
              <View style={styles.feedOverlayCamId}>
                <Text style={styles.feedOverlayCamText}>{camera.id}</Text>
                {camera.direction ? <Text style={styles.feedOverlayFpsText}>• {camera.direction}</Text> : null}
                <Text style={styles.feedOverlayFpsText}>• {camera.fps} FPS</Text>
              </View>

              {/* Overlay Top Right: Live Badge */}
              <View style={styles.liveBadge}>
                <View style={[styles.pulseDot, { backgroundColor: colors.accentGreen }]} />
                <Text style={[styles.liveText, { color: colors.accentGreen }]}>LIVE</Text>
              </View>

              {/* Overlay Bottom Right: Timecode */}
              <View style={styles.feedOverlayTime}>
                <Text style={styles.feedOverlayTimeText}>{currentTime}</Text>
              </View>
            </>
          )}
        </View>

        {/* AI Detection Trigger & Live Feedback */}
        {detectedNotice ? (
          <View style={[styles.detectedNoticeBox, { backgroundColor: colors.accentGreen + '20', borderColor: colors.accentGreen }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.accentGreen} />
            <Text style={[styles.detectedNoticeText, { color: colors.text }]}>{detectedNotice}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startFeedBtn, { backgroundColor: colors.accent }]}
            onPress={handleTriggerDetection}
            disabled={isDetecting}
          >
            <Ionicons name="scan-circle-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.startFeedBtnText}>
              {isDetecting ? 'Running AI Detection...' : '▶ Start AI Detection'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Traffic Level Banner */}
        <View style={[styles.trafficBanner, { backgroundColor: colors.surfaceLight, borderColor: trafficColor }]}>
          <View style={[styles.trafficLevelDot, { backgroundColor: trafficColor }]} />
          <Text style={[styles.trafficLevelText, { color: colors.text }]}>
            {camera.trafficLevel.toUpperCase()} TRAFFIC DENSITY
          </Text>
        </View>

        {/* Live Detected Vehicles Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LIVE DETECTED VEHICLES</Text>
          <View style={[styles.countBadge, { backgroundColor: colors.surfaceLight }]}>
            <Text style={[styles.countBadgeText, { color: colors.accent }]}>
              {cameraDetections.length} total
            </Text>
          </View>
        </View>

        {/* Category Filter Chips Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.accent : colors.surfaceLight,
                    borderColor: isActive ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? '#ffffff' : colors.textSecondary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Detected Vehicles List */}
        {filteredDetections.length === 0 ? (
          <View style={[styles.emptyDetectionsCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
            <Ionicons name="scan-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.emptyDetectionsTitle, { color: colors.text }]}>
              {cameraDetections.length === 0
                ? 'No Vehicles Detected Yet'
                : `No ${selectedCategory.toUpperCase()} detected`}
            </Text>
            <Text style={[styles.emptyDetectionsSub, { color: colors.textMuted }]}>
              {cameraDetections.length === 0
                ? 'Tap "▶ Start AI Detection" above to scan video and track plates.'
                : 'Select "All" to view all vehicles processed at this camera.'}
            </Text>
          </View>
        ) : (
          <View style={styles.detectedList}>
            {filteredDetections.map((item) => {
              const inFrame = isVehicleInFrame(item);
              const icon = vehicleIcons[item.vehicleType as keyof typeof vehicleIcons] || vehicleIcons.car;

              return (
                <TouchableOpacity
                  key={item.id || item.plateNumber}
                  style={[
                    styles.detectedRow,
                    {
                      backgroundColor: colors.surfaceLight,
                      borderColor: inFrame ? colors.accentGreen + '50' : colors.border,
                    },
                  ]}
                  onPress={() => onSelectVehicle?.(item.plateNumber, item.vehicleType)}
                  activeOpacity={0.7}
                >
                  {/* Left: Vehicle Icon Box */}
                  <View style={[styles.vehicleIconBadge, { backgroundColor: colors.surface }]}>
                    {icon}
                  </View>

                  {/* Center: ID + Plate + Type + Time */}
                  <View style={{ flex: 1, gap: 4 }}>
                    {/* Top Row: AI Track ID + Plate Pill */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {/* AI Unique Track ID */}
                      <View style={[styles.trackIdPill, { backgroundColor: '#0f172a', borderColor: '#334155' }]}>
                        <Text style={[styles.trackIdText, { color: '#94a3b8' }]}>
                          {`ID #${item.localTrackId ? item.localTrackId.split('_').pop() : (item.id || '').slice(-3)}`}
                        </Text>
                      </View>

                      {/* License Plate Number or Dash */}
                      {(() => {
                        const hasOcrPlate = item.plateNumber && !item.plateNumber.startsWith('TRACK_') && !item.plateNumber.startsWith('CAM_') && !item.plateNumber.startsWith('NO_PLATE') && !item.plateNumber.startsWith('UNREADABLE');
                        const borderColor = hasOcrPlate ? '#38bdf8' : '#334155';
                        const textColor = hasOcrPlate ? '#38bdf8' : '#64748b';
                        const plateDisplay = hasOcrPlate ? item.plateNumber : '—';

                        return (
                          <View style={[styles.platePill, { backgroundColor: '#020617', borderColor }]}>
                            <Text style={[styles.plateText, { color: textColor }]}>
                              {`PLATE: ${plateDisplay}`}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>

                    {/* Bottom Meta Row: Vehicle Type + Confidence + Time */}
                    {(() => {
                      const vType = item.vehicleType ? item.vehicleType.trim() : '';
                      const isIdentified = vType && vType !== 'unknown' && vType !== 'other';
                      const typeLabel = isIdentified ? vType.toUpperCase() : 'UNIDENTIFIED';
                      const confText = item.confidence ? ` (${Math.round(item.confidence * 100)}% conf)` : '';

                      return (
                        <Text style={[styles.vehicleMetaText, { color: colors.textMuted }]}>
                          <Text style={{ color: colors.text, fontWeight: '600' }}>{typeLabel}</Text>
                          {confText}
                          {` • ${formatTime(item.detectedAt)}`}
                        </Text>
                      );
                    })()}
                  </View>

                  {/* Right: In-Frame Status Badge */}
                  <View
                    style={[
                      styles.frameBadge,
                      {
                        backgroundColor: inFrame ? colors.accentGreen + '20' : colors.surface,
                        borderColor: inFrame ? colors.accentGreen : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.frameDot,
                        { backgroundColor: inFrame ? colors.accentGreen : colors.textMuted },
                      ]}
                    />
                    <Text
                      style={[
                        styles.frameText,
                        { color: inFrame ? colors.accentGreen : colors.textMuted },
                      ]}
                    >
                      {inFrame ? 'IN FRAME' : 'EXITED'}
                    </Text>
                  </View>

                  {/* Arrow Indicator */}
                  <Ionicons name="chevron-forward" size={14} color={colors.accent} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Coordinates Location */}
        <View style={[styles.locationContainer, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
          <Ionicons name="location" size={18} color={colors.accent} />
          <View style={styles.locationTextContainer}>
            <Text style={[styles.locationName, { color: colors.text }]}>{camera.name}</Text>
            <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
              {camera.latitude.toFixed(5)}°N, {camera.longitude.toFixed(5)}°E
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  if (Platform.OS === 'web') {
    return cardContent;
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {cardContent}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cardWeb: {
    position: 'absolute',
    top: 58,
    right: 16,
    width: 450,
    maxHeight: '85%',
    zIndex: 40,
  },
  cardMobile: {
    width: '100%',
    maxHeight: '85%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    maxHeight: 520,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  statusCol: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  feedContainer: {
    height: 240,
    aspectRatio: 16 / 9,
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  feedCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.8,
  },
  feedOverlayCamId: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  feedOverlayCamText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  feedOverlayFpsText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '600',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
  },
  feedOverlayTime: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  feedOverlayTimeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  trafficBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 12,
    gap: 8,
  },
  trafficLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trafficLevelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  filterScroll: {
    marginBottom: 10,
  },
  filterScrollContent: {
    gap: 6,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detectedList: {
    gap: 8,
    marginBottom: 12,
  },
  detectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  vehicleIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIdPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  trackIdText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  platePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  plateText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  vehicleMetaText: {
    fontSize: 10,
    fontWeight: '600',
  },
  frameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  frameDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  frameText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  emptyDetectionsCard: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyDetectionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  emptyDetectionsSub: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 4,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationCoords: {
    fontSize: 10,
    marginTop: 1,
  },
  detectedNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  detectedNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  startFeedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  startFeedBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
