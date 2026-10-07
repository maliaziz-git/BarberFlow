import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { api } from "../api/client";
import { Appointment } from "../types";
import { format } from "date-fns";

const allStatuses = [
  "BOOKED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export const AppointmentDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchAppointment = async () => {
    try {
      const data = await api.getAppointment(id);
      setAppointment(data);
      setNotes(data.notes || "");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load appointment details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateAppointmentStatus(id, newStatus, notes);
      setAppointment(updated);
      Alert.alert("Status Updated", `Appointment is now marked as ${newStatus}`);
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const updated = await api.updateAppointmentStatus(
        id,
        appointment?.status || "CONFIRMED",
        notes
      );
      setAppointment(updated);
      Alert.alert("Saved", "Barber notes saved successfully");
    } catch (err: any) {
      Alert.alert("Save Failed", err.message || "Could not save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCallCustomer = () => {
    if (appointment?.customer?.phone) {
      Linking.openURL(`tel:${appointment.customer.phone}`);
    }
  };

  if (isLoading || !appointment) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const startTime = format(new Date(appointment.startTime), "EEEE, MMM d 'at' hh:mm a");
  const endTime = format(new Date(appointment.endTime), "hh:mm a");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Customer Header Box */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.customerName}>{appointment.customer?.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.customerProfileBtn}
            onPress={() =>
              navigation.navigate("CustomerDetail", {
                customerId: appointment.customerId,
              })
            }
          >
            <Text style={styles.customerProfileBtnText}>View History &rarr;</Text>
          </TouchableOpacity>
        </View>

        {appointment.customer?.phone && (
          <TouchableOpacity style={styles.phoneRow} onPress={handleCallCustomer}>
            <Text style={styles.phoneIcon}>📞</Text>
            <Text style={styles.phoneText}>{appointment.customer.phone}</Text>
            <Text style={styles.callBadge}>Tap to call</Text>
          </TouchableOpacity>
        )}

        {appointment.customer?.email && (
          <Text style={styles.emailText}>✉ {appointment.customer.email}</Text>
        )}
      </View>

      {/* Service & Schedule Box */}
      <View style={styles.card}>
        <Text style={styles.label}>Service Details</Text>
        <Text style={styles.serviceTitle}>{appointment.service?.name}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Duration:</Text>
          <Text style={styles.infoVal}>
            {appointment.service?.durationMinutes} minutes
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Price at Booking:</Text>
          <Text style={[styles.infoVal, styles.priceGold]}>
            ${appointment.priceAtBooking}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Scheduled Time:</Text>
          <Text style={styles.infoVal}>
            {startTime} - {endTime}
          </Text>
        </View>
      </View>

      {/* Status Update Actions */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Appointment Status</Text>
          <Text style={styles.currentStatusBadge}>{appointment.status}</Text>
        </View>

        <Text style={styles.subtext}>Quick update status from the chair:</Text>

        <View style={styles.statusGrid}>
          {allStatuses.map((st) => {
            const isCurrent = appointment.status === st;
            return (
              <TouchableOpacity
                key={st}
                style={[
                  styles.statusButton,
                  isCurrent && styles.statusButtonActive,
                ]}
                disabled={isUpdatingStatus}
                onPress={() => handleUpdateStatus(st)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    isCurrent && styles.statusButtonTextActive,
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Notes Section */}
      <View style={styles.card}>
        <Text style={styles.label}>Barber Notes & Style Preferences</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={4}
          placeholder="e.g. Skin fade preferences, sensitive neck skin, product used..."
          placeholderTextColor="#71717a"
          value={notes}
          onChangeText={setNotes}
        />
        <TouchableOpacity
          style={styles.saveNotesBtn}
          onPress={handleSaveNotes}
          disabled={isSavingNotes}
        >
          {isSavingNotes ? (
            <ActivityIndicator color="#09090b" size="small" />
          ) : (
            <Text style={styles.saveNotesBtnText}>Save Notes</Text>
          )}
        </TouchableOpacity>
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  customerProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#27272a",
  },
  customerProfileBtnText: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "700",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: "#27272a",
    padding: 10,
    borderRadius: 10,
  },
  phoneIcon: {
    fontSize: 16,
  },
  phoneText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    flex: 1,
  },
  callBadge: {
    fontSize: 11,
    color: "#34d399",
    fontWeight: "700",
  },
  emailText: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 8,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  infoKey: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  infoVal: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
  },
  priceGold: {
    color: "#34d399",
    fontWeight: "800",
  },
  currentStatusBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16a34a",
    backgroundColor: "rgba(22, 163, 74, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subtext: {
    fontSize: 12,
    color: "#71717a",
    marginVertical: 10,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  statusButtonActive: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#d4d4d8",
  },
  statusButtonTextActive: {
    color: "#ffffff",
  },
  notesInput: {
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    padding: 12,
    color: "#ffffff",
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: 8,
  },
  saveNotesBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveNotesBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
