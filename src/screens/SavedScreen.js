import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../theme';

export default function SavedScreen({ navigation }) {
  const [saved, setSaved] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [])
  );

  async function loadSaved() {
    const keys = await AsyncStorage.getAllKeys();
    const eventKeys = keys.filter(k => k.startsWith('saved_'));
    const pairs = await AsyncStorage.multiGet(eventKeys);
    const items = pairs.map(([, v]) => JSON.parse(v)).filter(Boolean);
    setSaved(items);
  }

  async function removeSaved(id) {
    await AsyncStorage.removeItem(`saved_${id}`);
    setSaved(prev => prev.filter(e => e.id !== id));
  }

  if (saved.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SAVED</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>Tap ♡ on any event to save it here</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SAVED · {saved.length}</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={saved}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          >
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowVenue}>{item.venue}</Text>
              <Text style={styles.rowDate}>{item.dateLabel} · {item.time}</Text>
            </View>
            <TouchableOpacity onPress={() => removeSaved(item.id)} style={styles.removeBtn}>
              <Text style={styles.removeIcon}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
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

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48, color: colors.border },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textMid },
  emptySub: { fontSize: 13, color: colors.textLight },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg, gap: 12,
  },
  colorBar: { width: 4, height: 52, borderRadius: 2 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  rowVenue: { fontSize: 12, color: colors.textMid, marginBottom: 2 },
  rowDate: { fontSize: 11, color: colors.gold, fontWeight: '500' },
  removeBtn: { padding: 8 },
  removeIcon: { fontSize: 20, color: colors.textLight },
  sep: { height: 0.5, backgroundColor: colors.border, marginHorizontal: spacing.lg },
});
