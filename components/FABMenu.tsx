import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { IconPlus, IconCalendarPlus, IconHammer } from "@tabler/icons-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 240,
  mass: 0.6,
};

interface FABMenuProps {
  style?: object;
}

export function FABMenu({ style }: FABMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(0);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    progress.value = withSpring(next ? 1 : 0, SPRING_CONFIG);
  };

  const close = () => {
    setIsOpen(false);
    progress.value = withSpring(0, SPRING_CONFIG);
  };

  // Menu entrance / exit animation (iOS style popup scale + soft translate)
  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2, 1], [0, 0.6, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [14, 0], Extrapolation.CLAMP) },
      { translateX: interpolate(progress.value, [0, 1], [8, 0], Extrapolation.CLAMP) },
      { scale: interpolate(progress.value, [0, 1], [0.86, 1], Extrapolation.CLAMP) },
    ],
  }));

  // Icon rotation to "X"
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [0, 45], Extrapolation.CLAMP)}deg` },
    ],
  }));

  // FAB subtle interactive spring
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 0.5, 1], [1, 0.94, 1], Extrapolation.CLAMP) },
    ],
  }));

  // Backdrop touch listener without visual blur
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <>
      {/* Invisible full-screen backdrop to dismiss on tap */}
      {isOpen && (
        <Animated.View style={[StyleSheet.absoluteFill, backdropAnimatedStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
      )}

      {/* Menu Container */}
      <View style={[styles.container, style]} pointerEvents="box-none">
        <Animated.View
          style={[styles.menuWrapper, menuAnimatedStyle]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <View style={styles.menuCard}>
            <Pressable
              onPress={() => {
                close();
                router.push("/service/new");
              }}
              style={styles.menuItem}
              className="active:bg-black/5"
            >
              <View style={styles.menuIconContainer}>
                <IconHammer size={20} color="#343433" strokeWidth={1.8} />
              </View>
              <Text style={styles.menuLabel}>Crear nuevo servicio</Text>
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              onPress={() => {
                close();
                router.push("/payment/new");
              }}
              style={styles.menuItem}
              className="active:bg-black/5"
            >
              <View style={styles.menuIconContainer}>
                <IconCalendarPlus size={20} color="#343433" strokeWidth={1.8} />
              </View>
              <Text style={styles.menuLabel}>Añadir fecha de pago</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* FAB Button */}
        <Pressable onPress={toggle} style={styles.fabWrapper}>
          <Animated.View style={[styles.fab, fabAnimatedStyle]}>
            <Animated.View style={iconAnimatedStyle}>
              <IconPlus size={24} color="#ffffff" strokeWidth={2.2} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    right: 32,
    alignItems: "flex-end",
  },
  fabWrapper: {
    borderRadius: 28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  menuWrapper: {
    marginBottom: 12,
    alignItems: "flex-end",
  },
  menuCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e8e6e3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    // @ts-ignore - iOS only property
    borderCurve: "continuous",
    minWidth: 224,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#f2f0ed",
    alignItems: "center",
    justifyContent: "center",
    // @ts-ignore - iOS only property
    borderCurve: "continuous",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e8e6e3",
    marginHorizontal: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#343433",
    letterSpacing: -0.2,
  },
});
