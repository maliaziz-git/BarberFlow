import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export const LoginScreen = () => {
  const { login, isLoading, serverUrl, setServerUrl } = useAuth();
  const [email, setEmail] = useState("barber@barberflow.com");
  const [password, setPassword] = useState("barber123");
  const [customServerUrl, setCustomServerUrl] = useState(serverUrl);
  const [showServerConfig, setShowServerConfig] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    try {
      if (customServerUrl !== serverUrl) {
        setServerUrl(customServerUrl);
      }
      await login(email, password);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Could not authenticate");
    }
  };

  const handleDemoBarber = () => {
    setEmail("barber@barberflow.com");
    setPassword("barber123");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>✂</Text>
          </View>
          <Text style={styles.brandTitle}>
            Barber<Text style={styles.brandGold}>Flow</Text>
          </Text>
          <Text style={styles.brandSubtitle}>Barber Mobile Companion</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Barber Chair Sign In</Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="barber@barberflow.com"
            placeholderTextColor="#71717a"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#71717a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Optional Server URL Config */}
          <TouchableOpacity
            onPress={() => setShowServerConfig(!showServerConfig)}
            style={styles.serverToggle}
          >
            <Text style={styles.serverToggleText}>
              {showServerConfig ? "Hide Server URL" : "⚙ Server API Endpoint"}
            </Text>
          </TouchableOpacity>

          {showServerConfig && (
            <View style={styles.serverConfigBox}>
              <Text style={styles.labelSmall}>Backend URL (Next.js REST API):</Text>
              <TextInput
                style={[styles.input, styles.inputSmall]}
                value={customServerUrl}
                onChangeText={setCustomServerUrl}
                autoCapitalize="none"
              />
              <Text style={styles.hint}>
                Use localhost:3000 for web/iOS sim, or 10.0.2.2:3000 for Android emulator.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#09090b" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In to Chair</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Fill Button */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoBarber}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>⚡ Auto-fill Demo Barber</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
    color: "#09090b",
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  brandGold: {
    color: "#f59e0b",
  },
  brandSubtitle: {
    fontSize: 13,
    color: "#a1a1aa",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d4d4d8",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 15,
    marginBottom: 16,
  },
  serverToggle: {
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  serverToggleText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
  },
  serverConfigBox: {
    backgroundColor: "#27272a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  labelSmall: {
    fontSize: 11,
    color: "#a1a1aa",
    marginBottom: 4,
  },
  inputSmall: {
    marginBottom: 4,
    fontSize: 13,
    paddingVertical: 8,
  },
  hint: {
    fontSize: 10,
    color: "#71717a",
  },
  loginButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  loginButtonText: {
    color: "#09090b",
    fontSize: 16,
    fontWeight: "700",
  },
  demoButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    alignItems: "center",
  },
  demoButtonText: {
    color: "#d4d4d8",
    fontSize: 13,
    fontWeight: "600",
  },
});
