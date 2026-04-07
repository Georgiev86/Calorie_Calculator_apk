import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, TouchableOpacity } from "react-native";
import { AuthScreen } from "../screens/AuthScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { PlanScreen } from "../screens/PlanScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { FoodsScreen } from "../screens/FoodsScreen";
import { RecipesScreen } from "../screens/RecipesScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import type { AppStateShape } from "../types";
import { getDiaryEntriesForDate } from "../utils/calorie";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f2eee7",
    card: "#ffffff",
    text: "#1e261e",
    border: "#e5d8c7",
    primary: "#d86b3a",
  },
};

function MainTabs({ app }: { app: AppStateShape }) {
  const todayEntries = getDiaryEntriesForDate(app.diaryEntries);

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#10281f",
          borderTopColor: "#1e4335",
          height: 74,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#ffd899",
        tabBarInactiveTintColor: "#c7d2c5",
      }}
    >
      <Tabs.Screen name="Начало">
        {() => <PlanScreen plan={app.plan!} profile={app.parsedProfile!} todayEntries={todayEntries} app={app} />}
      </Tabs.Screen>
      <Tabs.Screen name="История">
        {() => (
          <ProgressScreen
            entries={app.progressEntries}
            diaryEntries={app.diaryEntries}
            progressNote={app.progressNote}
            progressWeight={app.progressWeight}
            exportNotice={app.exportNotice}
            onProgressNoteChange={app.setters.setProgressNote}
            onProgressWeightChange={app.setters.setProgressWeight}
            onSaveEntry={app.actions.saveProgressEntry}
            onExportPdf={app.actions.exportPdfReport}
            onRemoveDiaryEntry={app.actions.removeDiaryEntry}
            onUpdateDiaryEntry={app.actions.updateDiaryEntry}
            targetWeightContext={app.progressEntries[0]?.weight ?? app.parsedProfile!.weight}
          />
        )}
      </Tabs.Screen>
      <Tabs.Screen name="Храни">
        {() => <FoodsScreen app={app} />}
      </Tabs.Screen>
      <Tabs.Screen name="Рецепти">
        {() => <RecipesScreen app={app} />}
      </Tabs.Screen>
      <Tabs.Screen name="Настройки">
        {() => <ProfileScreen app={app} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

export function AppNavigator({ app }: { app: AppStateShape }) {
  const hasProfile = app.hasSavedProfile && Boolean(app.parsedProfile);
  const hasSession = Boolean(app.session);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#10281f",
          },
          headerTintColor: "#fff7eb",
          headerTitleStyle: {
            fontWeight: "700",
          },
          contentStyle: {
            backgroundColor: "#f2eee7",
          },
        }}
      >
        {!hasSession ? (
          <Stack.Screen
            name="Auth"
            options={{ headerShown: false }}
          >
            {() => <AuthScreen app={app} />}
          </Stack.Screen>
        ) : !hasProfile ? (
          <Stack.Screen
            name="Onboarding"
            options={{ title: "Профил и цели" }}
          >
            {() => <OnboardingScreen app={app} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              options={({ navigation }) => ({
                title: "Calorie Coach BG",
                headerRight: () => (
                  <TouchableOpacity onPress={() => navigation.navigate("ProfileModal")}>
                    <Text style={{ color: "#ffd899", fontWeight: "700" }}>Профил</Text>
                  </TouchableOpacity>
                ),
              })}
            >
              {() => <MainTabs app={app} />}
            </Stack.Screen>
            <Stack.Screen
              name="ProfileModal"
              options={{ presentation: "modal", title: "Акаунт и синхронизация" }}
            >
              {() => <ProfileScreen app={app} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
