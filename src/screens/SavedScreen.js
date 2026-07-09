import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const W = Dimensions.get('window').width;

export default function SavedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState([]);

  useFocusEffect(
    useCallback(() => { loadSaved(); }, [])
  );

  async function loadSaved() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const eventKeys = keys.filter(k => k.startsWith('saved_'));
      if (!eventKeys.length) { setSaved([]); return; }
      const pairs = await AsyncStorage.multiGet(eventKeys);
      const items = pairs
        .map(([, v]) => { try { return JSON.parse(v); } catch { return null; } })
        .filter(item => item && typeof item === 'object' && item.id);
      setSaved(items);
    } catch (e) {
      setSaved([]);
    }
  }

  async function removeSaved(id) {
    await AsyncStorage.removeItem(`saved_${id}`);
    setSaved(prev => prev.filter(e => e.id !== id));
  }

  const renderEmpty = () => (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>♡</Text>
      <Text style={s.emptyTitle}>Nothing saved yet</Text>
      <Text style={s.emptySub}>Tap ♡ Save on any exhibition</Text>
    </View>
  );

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          SAVED{saved.length > 0 ? ` · ${saved.length}` : ''}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {saved.length === 0 ? renderEmpty() : (
        <FlatList
          data={saved}
          keyExtractor={i => i.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('EventDetail', { event: item })}
              activeOpacity={0.85}
            >
              {/* Thumbnail */}
              <View style={[s.thumb, { backgroundColor: item.color || '#C8A96A' }]}>
                {item.mediaUrl
                  ? <Image source={{ uri: item.mediaUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  : <Text style={s.thumbEmoji}>🎨</Text>
                }
              </View>

              {/* Info */}
              <View style={s.info}>
                <Text style={s.title} numberOfLines={2}>{item.title}</Text>
                {item.artistName ? (
                  <Text style={s.artist} numberOfLines={1}>{item.artistName}</Text>
                ) : null}
                <Text style={s.venue} numberOfLines={1}>{item.venue}</Text>
                <Text style={s.date}>{item.dateLabel}{item.viewTill ? ` · Until ${item.viewTill}` : ''}</Text>
              </View>

              {/* Remove */}
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => removeSaved(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={s.removeCircle}>
                  <Text style={s.removeText}>♥</Text>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40 },
  backText: { fontSize: 20, color: '#111' },
  headerTitle: {
    fontSize: 12, fontWeight: '800', letterSpacing: 3, color: '#111',
  },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  emptyIcon: { fontSize: 52, color: '#DDD', marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#AAA' },

  list: { paddingVertical: 8 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  thumb: {
    width: 64, height: 64, borderRadius: 12,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  thumbEmoji: { fontSize: 26 },

  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '800', color: '#111', marginBottom: 3, lineHeight: 18 },
  artist: { fontSize: 12, color: '#555', marginBottom: 2 },
  venue: { fontSize: 12, color: '#888', marginBottom: 2 },
  date: { fontSize: 11, color: '#C8A96A', fontWeight: '600' },

  removeBtn: { paddingLeft: 8 },
  removeCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  removeText: { fontSize: 14, color: '#C84030' },

  sep: { height: 0.5, backgroundColor: '#F5F5F5', marginHorizontal: 16 },
});
