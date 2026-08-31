import MapView, { Marker } from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Camera } from "../../domain/models/Camera";

type Props = {
  cameras: Camera[];
  onCameraPress: (camera: Camera) => void;
};

export default function CityMap({
  cameras,
  onCameraPress,
}: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 22.5726,
        longitude: 88.3639,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {cameras.map((camera) => (
        <Marker
          key={camera.id}
          coordinate={{
            latitude: camera.latitude,
            longitude: camera.longitude,
          }}
          title={camera.name}
          description={camera.id}
          onPress={() => onCameraPress(camera)}
        >
          <View style={styles.cameraMarker}>
            <Text style={styles.cameraEmoji}>
              📹
            </Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
  },

  cameraMarker: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cameraEmoji: {
    fontSize: 24,
  },
});