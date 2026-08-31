import type { ViewProps } from "react-native";
import { View } from "react-native";

export function ThemedView({ style, ...props }: ViewProps) {
  return <View {...props} style={style} />;
}
