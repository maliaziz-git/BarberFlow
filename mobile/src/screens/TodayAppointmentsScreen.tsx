import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { api } from "../api/client";
import { Appointment } from "../types";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

const statusColors: Record<string, { bg: string; text: string }> = {
  BOOKED: { bg: "#1e3a8a", text: "#93c5fd" },
  CONFIRMED: { bg: "#312e81", text: "#c7d2fe" },
  IN_PROGRESS: { bg: "#78350f", text: "#fde68a" },
  COMPLETED: { bg: "#064e3b", text: "#a7f3d0" },
  CANCELLED: { bg: "#881337", text: "#fecdd3" },
  NO_SHOW: { bg: "#27272a", text: "#a1a1aa" },
};

export const TodayAppointmentsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchToday = useCallback(async () => {
    try {
      const data = await api.getTodayAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Error loading today appointments:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchToday();
    });
    return unsubscribe;
  }, [navigation, fetchToday]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchToday();
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const startTime = format(new Date(item.startTime), "hh:mm a");
    const endTime = format(new Date(item.endTime), "hh:mm a");
    const statusStyle = statusColors[item.status] || {
      bg: "#27272a",
      text: "#ffffff",
    };

    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("AppointmentDetail", { id: item.id })}
      >
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{startTime}</Text>
          <Text style={styles.durationText}>{item.service?.durationMinutes}m</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.customerName}>{item.customer?.name}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <Text style={styles.serviceName}>{item.service?.name}</Text>

          {item.notes ? (
            <Text style={styles.notesText} numberOfLines={1}>
              Note: {item.notes}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            <Text style={styles.timeRange}>
              {startTime} - {endTime}
            </Text>
            <Text style={styles.priceText}>${item.priceAtBooking}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, {user?.name}</Text>
          <Text style={styles.dateTitle}>
            Today&apos;s Chair Schedule ({format(new Date(), "MMM d")})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Fetching appointments...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyIcon}>✂</Text>
          <Text style={styles.emptyTitle}>No appointments today</Text>
          <Text style={styles.emptySubtitle}>
            Your schedule is currently clear for today.
          </Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f59e0b"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  welcomeText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 2,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 18,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
    flexDirection: "row",
    gap: 14,
  },
  timeBadge: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 68,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  durationText: {
    fontSize: 10,
    color: "#f59e0b",
    fontWeight: "600",
    marginTop: 2,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  serviceName: {
    fontSize: 13,
    color: "#a1a1aa",
    marginTop: 2,
  },
  notesText: {
    fontSize: 11,
    color: "#fbbf24",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  timeRange: {
    fontSize: 11,
    color: "#71717a",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#34d399",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: "#a1a1aa",
    fontSize: 14,
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 48,
    color: "#f59e0b",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#71717a",
    marginTop: 4,
    textAlign: "center",
  },
});
