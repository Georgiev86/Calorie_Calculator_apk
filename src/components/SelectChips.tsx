import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function SelectChips<T extends string>({
  label,
  options,
  selectedValue,
  onChange,
}: {
  label: string;
  options: Array<{ label: string; value: T }>;
  selectedValue: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chipsWrap}>
        {options.map((option) => {
          const isActive = option.value === selectedValue;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.85}
              onPress={() => onChange(option.value)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4d4335",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#efe4d2",
  },
  chipActive: {
    backgroundColor: "#c96f3b",
  },
  chipText: {
    color: "#534839",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fffaf5",
  },
});
