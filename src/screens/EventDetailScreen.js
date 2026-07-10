import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Share, Linking, StatusBar, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '../theme';

const WHATSAPP_GROUP = 'https://chat.whatsapp.com/Kirekmo0Qiw9Tzpc8uxdt7?mode=gi_t';

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    try {
      const key = `saved_${event.id}`;
      if (saved) {
        await AsyncStorage.removeItem(key);
        setSaved(false);
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(event));
        setSaved(true);
        Alert.alert('Saved!', `${event.title} added to your saved events.`);
      }
    } catch (e) { console.error(e); }
  }

  async function handleShare() {
    const message =
      `🎨 *${event.title}*\n` +
      `📍 ${event.venue}, ${event.address}\n` +
      `🗓 ${event.dateLabel} · ${event.time}\n` +
      `💰 ${event.price}\n\n` +
      `Discover more art events in Delhi NCR 👇\n${WHATSAPP_GROUP}`;
    await Share.share({ message });
  }

  function handleMap() {
    const query = encodeURIComponent(`${event.venue}, ${event.address}`);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  }

  const badgeColors = {
    tonight: '#C84030', openCall: '#1A6B3C', free: '#1A4A7A', soon: '#444',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EVENT</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={[styles.saveIcon, saved && styles.saveIconActive]}>
            {saved ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Large hero — poster image if available, else colour block */}
        <View style={[styles.hero, { backgroundColor: event.color }]}>
          {(event.imageUrl || event.mediaUrl) ? (
            <Image
              source={{ uri: event.imageUrl || event.mediaUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <>
              <View style={styles.heroCircleOuter} />
              <View style={styles.heroCircleInner} />
            </>
          )}
          {event.badge ? (
            <View
              style={[
                styles.badgePill,
                { backgroundColor: badgeColors[event.badgeType] || '#444' },
              ]}
            >
              <Text style={styles.badgePillText}>{event.badge}</Text>
            </View>
          ) : null}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.typeLabel}>{event.type.toUpperCase()}</Text>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📍</Text>
            <View>
              <Text style={styles.metaMain}>{event.venue}</Text>
              <Text style={styles.metaSub}>{event.address}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>🗓</Text>
            <View>
              <Text style={styles.metaMain}>{event.dateLabel}</Text>
              <Text style={styles.metaSub}>{event.time}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>💰</Text>
            <Text style={styles.metaMain}>{event.price}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.divider} />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleMap}>
              <Text style={styles.actionIcon}>🗺</Text>
              <Text style={styles.actionLabel}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
              <Text style={styles.actionIcon}>{saved ? '♥' : '♡'}</Text>
              <Text style={[styles.actionLabel, saved && { color: '#C84030' }]}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleShare}>
              <Text style={styles.actionIconWhite}>↗</Text>
              <Text style={styles.actionLabelWhite}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* WhatsApp join */}
          <TouchableOpacity
            style={styles.whatsappBar}
            onPress={() => Linking.openURL(WHATSAPP_GROUP)}
          >
            <Text style={styles.whatsappText}>
              Join The Art Walk WhatsApp group →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4, minWidth: 44 },
  backArrow: { fontSize: 20, color: colors.text },
  headerTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 3, color: colors.text },
  saveBtn: { padding: 4, minWidth: 44, alignItems: 'flex-end' },
  saveIcon: { fontSize: 22, color: colors.textLight },
  saveIconActive: { color: '#C84030' },

  hero: {
    height: 220, justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  badgePill: {
    position: 'absolute', top: 16, left: 0,
    paddingHorizontal: 12, paddingVertical: 4,
    borderTopRightRadius: 4, borderBottomRightRadius: 4,
  },
  badgePillText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  heroCircleOuter: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)',
    position: 'absolute',
  },
  heroCircleInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.08)',
    position: 'absolute',
  },

  content: { padding: spacing.lg },
  typeLabel: {
    fontSize: 10, color: colors.gold, fontWeight: '700',
    letterSpacing: 2, marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, lineHeight: 32 },

  divider: { height: 0.5, backgroundColor: colors.border, marginVertical: spacing.lg },

  metaRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, marginBottom: spacing.md,
  },
  metaIcon: { fontSize: 16, width: 24 },
  metaMain: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 2 },
  metaSub: { fontSize: 12, color: colors.textMid },

  descTitle: { fontSize: 11, fontWeight: '700', color: colors.textLight, letterSpacing: 1.5, marginBottom: spacing.sm },
  description: { fontSize: 14, color: colors.textMid, lineHeight: 22 },

  actions: {
    flexDirection: 'row', gap: spacing.sm,
  },
  actionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    borderWidth: 0.5, borderColor: colors.border, borderRadius: 4,
  },
  actionBtnPrimary: { backgroundColor: colors.black, borderColor: colors.black },
  actionIcon: { fontSize: 18, marginBottom: 4 },
  actionIconWhite: { fontSize: 18, marginBottom: 4, color: '#fff' },
  actionLabel: { fontSize: 11, color: colors.textMid },
  actionLabelWhite: { fontSize: 11, color: '#fff' },

  whatsappBar: {
    marginTop: spacing.lg,
    backgroundColor: colors.goldLight,
    borderRadius: 4,
    padding: spacing.md,
    borderWidth: 0.5, borderColor: '#E8D8A0',
  },
  whatsappText: { fontSize: 12, color: colors.gold, textAlign: 'center', fontWeight: '500' },
});
