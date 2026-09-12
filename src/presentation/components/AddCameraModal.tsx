import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Camera } from '../../domain/models/Camera';
import { CameraApi, AvailableVideo } from '../../data/api/CameraApi';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAddCamera: (cameraData: {
    name: string;
    latitude: number;
    longitude: number;
    direction: string;
    stream_url: string;
  }) => Promise<void>;
};

const KOLKATA_PRESETS = [
  { name: 'Salt Lake Sector V', lat: 22.5769, lng: 88.4331, dir: 'Eastbound', video: '/videos/sample_traffic.mp4' },
  { name: 'Howrah Bridge', lat: 22.5958, lng: 88.3476, dir: 'Westbound', video: '/videos/junction_traffic.mp4' },
  { name: 'Park Street Junction', lat: 22.5535, lng: 88.3525, dir: 'Northbound', video: '/videos/sample_traffic.mp4' },
  { name: 'Esplanade Crossing', lat: 22.5646, lng: 88.3512, dir: 'Southbound', video: '/videos/junction_traffic.mp4' },
  { name: 'Gariahat Junction', lat: 22.5186, lng: 88.3654, dir: 'Southbound', video: '/videos/sample_traffic.mp4' },
  { name: 'Airport Express Crossing', lat: 22.6547, lng: 88.4467, dir: 'Northbound', video: '/videos/junction_traffic.mp4' },
];

const DIRECTIONS = ['Northbound', 'Southbound', 'Eastbound', 'Westbound', '360° Pan'];

export const AddCameraModal: React.FC<Props> = ({ visible, onClose, onAddCamera }) => {
  const { colors } = useTheme();

  const [name, setName] = useState('Salt Lake Sector V');
  const [latitude, setLatitude] = useState('22.5769');
  const [longitude, setLongitude] = useState('88.4331');
  const [direction, setDirection] = useState('Eastbound');
  const [streamUrl, setStreamUrl] = useState('/videos/sample_traffic.mp4');
  const [isCustomUrl, setIsCustomUrl] = useState(false);
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [availableVideos, setAvailableVideos] = useState<AvailableVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (visible) {
      CameraApi.getAvailableVideos().then((vids) => {
        if (vids && vids.length > 0) {
          setAvailableVideos(vids);
          if (!streamUrl) {
            setStreamUrl(vids[0].path);
          }
        }
      });
    }
  }, [visible]);

  const handleSelectPreset = (preset: typeof KOLKATA_PRESETS[0]) => {
    setName(preset.name);
    setLatitude(preset.lat.toString());
    setLongitude(preset.lng.toString());
    setDirection(preset.dir);
    setStreamUrl(preset.video);
    setIsCustomUrl(false);
    setCustomStreamUrl('');
    setError('');
  };

  const handleSubmit = async () => {
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (!name.trim()) {
      setError('Camera name is required.');
      return;
    }
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Please enter a valid latitude (-90 to 90).');
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Please enter a valid longitude (-180 to 180).');
      return;
    }

    const finalStreamUrl = isCustomUrl ? customStreamUrl.trim() : streamUrl;
    if (!finalStreamUrl) {
      setError('Please select or specify a video source.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onAddCamera({
        name: name.trim(),
        latitude: latNum,
        longitude: lngNum,
        direction,
        stream_url: finalStreamUrl,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to add camera.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="videocam" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Deploy Camera</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Place a new surveillance node on the city map
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]} onPress={onClose}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Kolkata Presets */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>QUICK PRESETS (KOLKATA)</Text>
            <View style={styles.presetsWrap}>
              {KOLKATA_PRESETS.map((preset) => {
                const isSelected = name === preset.name;
                return (
                  <TouchableOpacity
                    key={preset.name}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surfaceLight,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectPreset(preset)}
                  >
                    <Ionicons
                      name="location-sharp"
                      size={12}
                      color={isSelected ? '#ffffff' : colors.accent}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: isSelected ? '#ffffff' : colors.text },
                      ]}
                    >
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Camera Name */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CAMERA NAME / JUNCTION</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Salt Lake Sector 5"
              placeholderTextColor={colors.textMuted}
            />

            {/* Coordinates Row */}
            <View style={styles.coordRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>LATITUDE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                  placeholder="22.5769"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>LONGITUDE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                  placeholder="88.4331"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Direction */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CAMERA FACING DIRECTION</Text>
            <View style={styles.dirRow}>
              {DIRECTIONS.map((dir) => {
                const isSelected = direction === dir;
                return (
                  <TouchableOpacity
                    key={dir}
                    style={[
                      styles.dirChip,
                      {
                        backgroundColor: isSelected ? colors.accent + '25' : colors.surfaceLight,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setDirection(dir)}
                  >
                    <Text
                      style={[
                        styles.dirText,
                        { color: isSelected ? colors.accent : colors.textSecondary },
                      ]}
                    >
                      {dir}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Video Footage Selection */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>ASSIGNED VIDEO FOOTAGE</Text>
            {availableVideos.map((vp, index) => {
              const isSelected = !isCustomUrl && (streamUrl === vp.path || streamUrl === vp.id || streamUrl.endsWith(vp.filename));
              return (
                <TouchableOpacity
                  key={vp.path || vp.id || index}
                  style={[
                    styles.videoOption,
                    {
                      backgroundColor: isSelected ? colors.accent + '20' : colors.surfaceLight,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setIsCustomUrl(false);
                    setStreamUrl(vp.path);
                  }}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={16}
                    color={isSelected ? colors.accent : colors.textMuted}
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.videoOptionText, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                      Feed {index + 1}: {vp.filename}
                    </Text>
                    {vp.sizeFormatted && (
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 8 }}>
                        {vp.sizeFormatted}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Custom Stream URL / Video Path Option */}
            <TouchableOpacity
              style={[
                styles.videoOption,
                {
                  backgroundColor: isCustomUrl ? colors.accent + '20' : colors.surfaceLight,
                  borderColor: isCustomUrl ? colors.accent : colors.border,
                },
              ]}
              onPress={() => {
                setIsCustomUrl(true);
              }}
            >
              <Ionicons
                name={isCustomUrl ? 'radio-button-on' : 'radio-button-off'}
                size={16}
                color={isCustomUrl ? colors.accent : colors.textMuted}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.videoOptionText, { color: colors.text }]}>
                Custom RTSP / HTTP Stream / Video File Path
              </Text>
            </TouchableOpacity>

            {isCustomUrl && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.accent,
                    color: colors.text,
                    marginTop: 6,
                  },
                ]}
                value={customStreamUrl}
                onChangeText={setCustomStreamUrl}
                placeholder="e.g. rtsp://192.168.1.100:554/stream or /videos/my_video.mp4"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            )}

            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.accentRed + '20' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.accentRed} />
                <Text style={[styles.errorText, { color: colors.accentRed }]}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Deploy to Map</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1000,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  presetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dirRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dirChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dirText: {
    fontSize: 12,
    fontWeight: '600',
  },
  videoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  videoOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
