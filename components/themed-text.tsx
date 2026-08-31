import type { TextProps } from "react-native";
import { StyleSheet, Text } from "react-native";

type ThemedTextType = "default" | "title" | "link";

type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
};

export function ThemedText({
  style,
  type = "default",
  ...props
}: ThemedTextProps) {
  return (
    <Text
      {...props}
      style={[
        styles.default,
        type === "title" && styles.title,
        type === "link" && styles.link,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    color: "#111827",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  link: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },
});
