import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

const mockAlerts = [
  { id: '1', title: '🚨 TONIGHT — Fragments of Memory', body: 'Opening at Latitude 28, Lado Sarai. 6–9 PM, free entry.', time: '2 hours ago', dot: '#C84030' },
  { id: '2', title: 'New open call posted', body: 'Emerging Artists Grant — ₹50,000. Deadline June 30.', time: '5 hours ago', dot: '#1A6B3C' },
  { id: '3', title: 'Shades of Mughal closes in 3 days', body: 'NGMA Delhi. Don\'t miss it — open until 5 PM.', time: 'Yesterday', dot: colors.gold },
  { id: '4', title: 'Weekend picks are live', body: '6 events across South Delhi this weekend.', time: 'Yesterday', dot: colors.textLight },
  { id: '5', title: 'Artist Talk: Atul Dodiya', body: 'Sunday 5–7 PM at Vadehra Art Gallery, Defence Colony. Free.', time: '2 days ago', dot: colors.textLight },
];

export default function AlertsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ALERTS</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={mockAlerts}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: item.dot }]} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowBody}>{item.body}</Text>
              <Text style={styles.rowTime}>{item.time}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>Notifications are posted by Matin for the Artsy Places NCR community.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  back: { fontSize: 20, color: colors.text, width: 44 },
  headerTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 3, color: colors.text },

  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 3, lineHeight: 18 },
  rowBody: { fontSize: 12, color: colors.textMid, lineHeight: 18, marginBottom: 4 },
  rowTime: { fontSize: 10, color: colors.textLight },
  sep: { height: 0.5, backgroundColor: colors.border, marginHorizontal: spacing.lg },

  footer: { padding: spacing.xl },
  footerText: { fontSize: 11, color: colors.textLight, textAlign: 'center', lineHeight: 16 },
});
