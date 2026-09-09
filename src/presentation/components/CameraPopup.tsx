import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Camera } from '../../domain/models/Camera';
import { CameraApi } from '../../data/api/CameraApi';

type Props = {
  camera: Camera | null;
  visible: boolean;
  onClose: () => void;
  onSimulateDetection?: (cameraId: string, plateNumber?: string) => void;
};

export const CameraPopup: React.FC<Props> = ({ camera, visible, onClose, onSimulateDetection }) => {
  const { colors } = useTheme();
  const [currentTime, setCurrentTime] = React.useState(() => new Date().toLocaleTimeString());
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [detectedNotice, setDetectedNotice] = React.useState<string | null>(null);

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
      if (onSimulateDetection) {
        onSimulateDetection(camera.id, 'WB12AB1234');
      } else {
        await CameraApi.dispatchDetection({
          cameraId: camera.id,
          plateNumber: 'WB12AB1234',
          vehicleType: 'car',
          color: 'White',
        });
      }
      setDetectedNotice(`Vehicle WB12AB1234 detected at ${camera.name}! Route updated.`);
      setTimeout(() => setDetectedNotice(null), 4000);
    } catch (err) {
      console.error('Failed to dispatch detection:', err);
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
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.surfaceLight }]}
          onPress={onClose}
          hitSlop={8}
        >
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
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
                key: camera.id,
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
              {isDetecting ? 'Running AI Detection...' : 'Start Feed & Detect Vehicle (WB12AB1234)'}
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

        {/* Detected Vehicles Grid */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DETECTED VEHICLES</Text>
        <View style={styles.vehiclesGrid}>
          {Object.entries(camera.detectedVehicles).map(([type, count]) => {
            if (count === 0) return null;
            const icon = vehicleIcons[type as keyof typeof vehicleIcons] || vehicleIcons.car;

            return (
              <View
                key={type}
                style={[styles.vehicleCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              >
                {icon}
                <View style={styles.vehicleCardText}>
                  <Text style={[styles.vehicleCount, { color: colors.text }]}>{count}</Text>
                  <Text style={[styles.vehicleType, { color: colors.textMuted }]}>{type}</Text>
                </View>
              </View>
            );
          })}
        </View>

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
    width: 350,
    maxHeight: '80%',
    zIndex: 40,
  },
  cardMobile: {
    width: '100%',
    maxHeight: '80%',
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
    maxHeight: 480,
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
    height: 160,
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
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  vehiclesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    gap: 6,
  },
  vehicleCardText: {
    justifyContent: 'center',
  },
  vehicleCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleType: {
    fontSize: 9,
    textTransform: 'capitalize',
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
