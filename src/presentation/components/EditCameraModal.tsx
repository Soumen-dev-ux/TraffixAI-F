import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Camera } from '../../domain/models/Camera';
import { CameraApi, AvailableVideo } from '../../data/api/CameraApi';

type Props = {
  camera: Camera | null;
  visible: boolean;
  onClose: () => void;
  onUpdateCamera: (
    cameraId: string,
    updateData: {
      name?: string;
      latitude?: number;
      longitude?: number;
      direction?: string;
      stream_url?: string;
    }
  ) => Promise<void>;
  onDeleteCamera?: (cameraId: string) => Promise<void>;
};

const DIRECTIONS = ['Northbound', 'Southbound', 'Eastbound', 'Westbound', '360° Pan'];

export const EditCameraModal: React.FC<Props> = ({
  camera,
  visible,
  onClose,
  onUpdateCamera,
  onDeleteCamera,
}) => {
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [direction, setDirection] = useState('Northbound');
  const [streamUrl, setStreamUrl] = useState('');
  const [isCustomUrl, setIsCustomUrl] = useState(false);
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [availableVideos, setAvailableVideos] = useState<AvailableVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      CameraApi.getAvailableVideos().then((vids) => {
        if (vids && vids.length > 0) {
          setAvailableVideos(vids);
        }
      });
    }
  }, [visible]);

  useEffect(() => {
    if (camera) {
      setName(camera.name || '');
      setLatitude(camera.latitude?.toString() || '22.5535');
      setLongitude(camera.longitude?.toString() || '88.3525');
      setDirection(camera.direction || 'Northbound');
      
      const currentUrl = camera.stream_url || (camera as any).streamUrl || '/videos/sample_traffic.mp4';
      const isKnownPreset = availableVideos.some((p) => p.path === currentUrl || p.id === currentUrl);
      if (isKnownPreset || currentUrl.startsWith('/videos/')) {
        setStreamUrl(currentUrl);
        setIsCustomUrl(false);
        setCustomStreamUrl('');
      } else {
        setIsCustomUrl(true);
        setStreamUrl(currentUrl);
        setCustomStreamUrl(currentUrl);
      }
      setError('');
    }
  }, [camera, visible, availableVideos]);

  if (!camera) return null;

  const handleSubmit = async () => {
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (!name.trim()) {
      setError('Camera name cannot be empty.');
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
      await onUpdateCamera(camera.id, {
        name: name.trim(),
        latitude: latNum,
        longitude: lngNum,
        direction,
        stream_url: finalStreamUrl,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to update camera.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteCamera) return;
    setLoading(true);
    try {
      await onDeleteCamera(camera.id);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to delete camera.');
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
                <Ionicons name="create-outline" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Configure Camera</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {camera.id} • Replace video stream or reposition
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]} onPress={onClose}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Camera Name */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CAMERA NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Park Street Junction"
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
                  placeholder="22.5535"
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
                  placeholder="88.3525"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Direction */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>SURVEILLANCE DIRECTION</Text>
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
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>ASSIGN VIDEO SOURCE / STREAM</Text>
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
                placeholder="e.g. rtsp://192.168.1.100:554/stream or /path/to/video.mp4"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            )}

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.accentRed + '20' }]}>
                <Ionicons name="alert-circle" size={14} color={colors.accentRed} />
                <Text style={[styles.errorText, { color: colors.accentRed }]}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            {onDeleteCamera && (
              <TouchableOpacity
                style={[styles.deleteBtn, { borderColor: colors.accentRed }]}
                onPress={handleDelete}
                disabled={loading}
              >
                <Ionicons name="trash-outline" size={16} color={colors.accentRed} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.surfaceLight }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-sharp" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
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
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
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
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  coordRow: {
    flexDirection: 'row',
  },
  dirRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dirChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  videoOptionText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 'auto',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
