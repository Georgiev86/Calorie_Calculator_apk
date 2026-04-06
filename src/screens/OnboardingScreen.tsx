import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppShell } from "../components/AppShell";
import { GlassCard } from "../components/GlassCard";
import { SelectChips } from "../components/SelectChips";
import type { AppStateShape } from "../types";

export function OnboardingScreen({ app }: { app: AppStateShape }) {
  const { fields, setters, parsedProfile, actions, syncNotice } = app;

  return (
    <AppShell
      eyebrow="Onboarding"
      title="Настрой началния си профил"
      subtitle="Това е основата за калориите, плана, прогреса и AI препоръките."
    >
      <GlassCard>
        <Text style={styles.heading}>Твоите основни данни</Text>

        <SelectChips
          label="Пол"
          selectedValue={fields.gender}
          onChange={setters.setGender}
          options={[
            { label: "Мъж", value: "male" },
            { label: "Жена", value: "female" },
          ]}
        />

        <View style={styles.row}>
          <Field label="Възраст" value={fields.age} onChange={setters.setAge} />
          <Field label="Тегло" value={fields.weight} onChange={setters.setWeight} />
        </View>

        <View style={styles.row}>
          <Field label="Височина" value={fields.height} onChange={setters.setHeight} />
          <Field label="Хранения" value={fields.meals} onChange={setters.setMeals} />
        </View>

        <SelectChips
          label="Активност"
          selectedValue={fields.activity}
          onChange={setters.setActivity}
          options={[
            { label: "Ниска", value: "low" },
            { label: "Умерена", value: "medium" },
            { label: "Висока", value: "high" },
            { label: "Много активен", value: "athlete" },
          ]}
        />

        <SelectChips
          label="Цел"
          selectedValue={fields.goal}
          onChange={setters.setGoal}
          options={[
            { label: "Отслабване", value: "lose" },
            { label: "Поддържане", value: "maintain" },
            { label: "Покачване", value: "gain" },
          ]}
        />

        {syncNotice ? <Text style={styles.notice}>{syncNotice}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, !parsedProfile && styles.buttonDisabled]}
          disabled={!parsedProfile}
          onPress={actions.saveProfile}
        >
          <Text style={styles.primaryButtonText}>Запази профила</Text>
        </TouchableOpacity>
      </GlassCard>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        style={styles.input}
        placeholder={label}
        placeholderTextColor="#9d937f"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f271f",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 8,
  },
  label: {
    color: "#4d4335",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#f7eddc",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#2f261c",
    borderWidth: 1,
    borderColor: "#ead9c0",
  },
  notice: {
    color: "#476052",
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#10281f",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#fff7eb",
    fontSize: 16,
    fontWeight: "800",
  },
});
