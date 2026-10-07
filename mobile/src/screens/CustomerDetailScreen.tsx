import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from "react-native";
import { api } from "../api/client";
import { Customer, Appointment } from "../types";
import { format } from "date-fns";

export const CustomerDetailScreen = ({ route }: any) => {
  const { customerId } = route.params;
  const [customer, setCustomer] = useState<(Customer & { appointments: Appointment[] }) | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      try {
        const data = await api.getCustomer(customerId);
        setCustomer(data);
      } catch (err) {
        console.error("Error loading customer profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomer();
  }, [customerId]);

  if (isLoading || !customer) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const visits = customer.appointments || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Info */}
      <View style={styles.card}>
        <Text style={styles.clientTitle}>{customer.name}</Text>
        <Text style={styles.visitsCount}>{visits.length} Total Chair Visits</Text>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL(`tel:${customer.phone}`)}
        >
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={styles.contactText}>{customer.phone}</Text>
          <Text style={styles.callBadge}>Call</Text>
        </TouchableOpacity>

        {customer.email && (
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>✉</Text>
            <Text style={styles.contactText}>{customer.email}</Text>
          </View>
        )}

        {customer.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesHeader}>Customer Style Preferences:</Text>
            <Text style={styles.notesBody}>{customer.notes}</Text>
          </View>
        ) : null}
      </View>

      {/* Appointment History */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Visit History</Text>

        {visits.length === 0 ? (
          <Text style={styles.noVisits}>No recorded appointments.</Text>
        ) : (
          <View style={styles.historyList}>
            {visits.map((appt) => (
              <View key={appt.id} style={styles.historyItem}>
                <View style={styles.historyTop}>
                  <Text style={styles.serviceName}>{appt.service?.name}</Text>
                  <Text style={styles.historyPrice}>${appt.priceAtBooking}</Text>
                </View>

                <View style={styles.historyBottom}>
                  <Text style={styles.historyDate}>
                    {format(new Date(appt.startTime), "MMM d, yyyy 'at' hh:mm a")}
                  </Text>
                  <Text style={styles.statusBadge}>{appt.status}</Text>
                </View>

                {appt.notes ? (
                  <Text style={styles.apptNote}>Note: {appt.notes}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  centerBox: {
    flex: 1,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
  },
  clientTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  visitsCount: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#27272a",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  contactIcon: {
    fontSize: 14,
  },
  contactText: {
    fontSize: 14,
    color: "#ffffff",
    flex: 1,
    fontWeight: "500",
  },
  callBadge: {
    color: "#34d399",
    fontWeight: "700",
    fontSize: 12,
  },
  notesBox: {
    backgroundColor: "rgba(22, 163, 74, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(22, 163, 74, 0.25)",
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  notesHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16a34a",
    textTransform: "uppercase",
  },
  notesBody: {
    fontSize: 13,
    color: "#d4d4d8",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
  },
  noVisits: {
    color: "#71717a",
    fontSize: 13,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 12,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  historyPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#34d399",
  },
  historyBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  historyDate: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16a34a",
  },
  apptNote: {
    fontSize: 11,
    color: "#fbbf24",
    marginTop: 6,
    fontStyle: "italic",
  },
});
