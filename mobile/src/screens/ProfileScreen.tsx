import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, serverUrl } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out from BarberFlow?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>✂</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>
          {user?.role === "ADMIN" ? "Shop Administrator" : "Active Barber"}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Connected Server</Text>
        <Text style={styles.serverText}>{serverUrl}</Text>
        <Text style={styles.serverHint}>
          Syncing directly with Neon PostgreSQL backend via REST API
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
    padding: 20,
    justifyContent: "space-between",
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 20,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    color: "#ffffff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  userRole: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
  },
  userEmail: {
    fontSize: 13,
    color: "#71717a",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#a1a1aa",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  serverText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  serverHint: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: "#27272a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3f3f46",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutText: {
    color: "#fb7185",
    fontSize: 16,
    fontWeight: "700",
  },
});
