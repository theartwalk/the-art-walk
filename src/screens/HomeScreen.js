import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, StatusBar, Image,
} from 'react-native';

const LOGO_DARK = require('../../assets/logo-dark.png');
const LOGO_LIGHT = require('../../assets/logo-light.png');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import { events as mockEvents } from '../data/mockData';
import { fetchEvents } from '../lib/supabase';

const { width: W, height: H } = Dimensions.get('window');

// ── Abstract art compositions ──────────────────────────────────────────────
// Each composition is a different arrangement of shapes — like abstract art
function ArtComposition({ color, index, title }) {
  const comp = index % 6;
  const dark = darken(color, 0.3);
  const light = lighten(color, 0.25);

  if (comp === 0) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.bigCircle, { backgroundColor: light, top: -W * 0.3, left: -W * 0.3 }]} />
      <View style={[sh.smallCircle, { backgroundColor: dark, bottom: H * 0.3, right: -W * 0.1 }]} />
      <View style={[sh.thinRect, { backgroundColor: dark, top: H * 0.25, left: W * 0.1, transform: [{ rotate: '15deg' }] }]} />
      <View style={[sh.dot, { backgroundColor: light, top: H * 0.45, right: W * 0.2 }]} />
    </View>
  );
  if (comp === 1) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.bigRect, { backgroundColor: light, top: H * 0.05, left: W * 0.55, transform: [{ rotate: '-8deg' }] }]} />
      <View style={[sh.bigCircle, { backgroundColor: dark, top: H * 0.1, left: -W * 0.15, opacity: 0.6 }]} />
      <View style={[sh.medCircle, { backgroundColor: light, bottom: H * 0.25, right: W * 0.1 }]} />
      <View style={[sh.thinRect, { backgroundColor: dark, top: H * 0.5, left: W * 0.15, transform: [{ rotate: '45deg' }] }]} />
    </View>
  );
  if (comp === 2) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.halfCircle, { backgroundColor: light, top: -H * 0.05, right: -W * 0.1 }]} />
      <View style={[sh.smallCircle, { backgroundColor: dark, top: H * 0.2, left: W * 0.1 }]} />
      <View style={[sh.bigRect, { backgroundColor: dark, bottom: H * 0.2, left: -W * 0.15, transform: [{ rotate: '20deg' }] }]} />
      <View style={[sh.dot, { backgroundColor: light, top: H * 0.35, right: W * 0.3 }]} />
      <View style={[sh.dot, { backgroundColor: light, top: H * 0.42, right: W * 0.15 }]} />
    </View>
  );
  if (comp === 3) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.bigCircle, { backgroundColor: dark, bottom: H * 0.1, right: -W * 0.25 }]} />
      <View style={[sh.thinRect, { backgroundColor: light, top: H * 0.15, left: W * 0.05, width: W * 0.9, transform: [{ rotate: '-3deg' }] }]} />
      <View style={[sh.medCircle, { backgroundColor: light, top: H * 0.22, left: W * 0.55 }]} />
      <View style={[sh.smallCircle, { backgroundColor: dark, top: H * 0.3, left: W * 0.05, opacity: 0.5 }]} />
    </View>
  );
  if (comp === 4) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.bigRect, { backgroundColor: light, top: H * 0.08, left: W * 0.08, transform: [{ rotate: '5deg' }] }]} />
      <View style={[sh.bigCircle, { backgroundColor: dark, top: H * 0.02, right: -W * 0.3, opacity: 0.7 }]} />
      <View style={[sh.dot, { backgroundColor: dark, bottom: H * 0.35, left: W * 0.15 }]} />
      <View style={[sh.dot, { backgroundColor: dark, bottom: H * 0.35, left: W * 0.3 }]} />
      <View style={[sh.dot, { backgroundColor: dark, bottom: H * 0.35, left: W * 0.45 }]} />
    </View>
  );
  // comp === 5
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.halfCircle, { backgroundColor: dark, bottom: H * 0.15, left: -W * 0.1, transform: [{ rotate: '180deg' }] }]} />
      <View style={[sh.medCircle, { backgroundColor: light, top: H * 0.08, right: W * 0.05 }]} />
      <View style={[sh.thinRect, { backgroundColor: dark, top: H * 0.3, left: W * 0.0, width: W * 0.5, transform: [{ rotate: '90deg' }] }]} />
      <View style={[sh.dot, { backgroundColor: light, top: H * 0.18, left: W * 0.2 }]} />
    </View>
  );
}

function darken(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `rgb(${r},${g},${b})`;
}
function lighten(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `rgb(${r},${g},${b})`;
}

// ── Tag chip ───────────────────────────────────────────────────────────────
function Tag({ label }) {
  return (
    <View style={s.tag}>
      <Text style={s.tagText}>{label}</Text>
    </View>
  );
}

// ── Single full-screen event card ──────────────────────────────────────────
function EventCard({ item, index, onPress, savedState, onSave }) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      activeOpacity={0.97}
      onPress={onPress}
      style={[s.card, { height: H }]}
    >
      {/* Background — real image if available, else abstract art */}
      {item.mediaUrl && item.mediaType === 'image' ? (
        <>
          <Image source={{ uri: item.mediaUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {/* Dark overlay so poster text doesn't clash with card text */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
        </>
      ) : (
        <>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: item.color }]} />
          <ArtComposition color={item.color} index={index} title={item.title} />
        </>
      )}

      {/* Gradient overlay — transparent top → black bottom */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content at bottom */}
      <View style={[s.cardContent, { paddingBottom: insets.bottom + 100 }]}>

        {/* Badge */}
        {item.badge && (
          <View style={[s.badge, { backgroundColor: getBadgeColor(item.badgeType) }]}>
            <Text style={s.badgeText}>{item.badge}</Text>
          </View>
        )}

        {/* Title */}
        <Text style={s.cardTitle} numberOfLines={3}>{item.title.toUpperCase()}</Text>

        {/* Artist / Type */}
        <Text style={s.cardArtist}>{item.type}</Text>

        {/* Tags */}
        <View style={s.tagRow}>
          {(item.tags || [item.type, item.price === 'Free' ? 'Free Entry' : null].filter(Boolean)).map((t, i) => (
            <Tag key={i} label={t} />
          ))}
        </View>

        {/* Gallery info */}
        <View style={s.galleryRow}>
          <View style={[s.galDot, { backgroundColor: item.color }]} />
          <Text style={s.galleryName}>{item.venue}</Text>
          <Text style={s.galleryArea}>· {item.area || 'Delhi NCR'}</Text>
        </View>

        {/* Date + time */}
        <Text style={s.dateText}>{item.dateLabel} · {item.time}</Text>

        {/* Action buttons */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, savedState && s.actionBtnActive]}
            onPress={onSave}
          >
            <Text style={[s.actionBtnText, savedState && s.actionBtnTextActive]}>
              {savedState ? '♥ Saved' : '♡ Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtnOutline} onPress={onPress}>
            <Text style={s.actionBtnOutlineText}>View Details →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getBadgeColor(type) {
  if (type === 'tonight') return '#C84030';
  if (type === 'openCall') return '#1A6B3C';
  if (type === 'free') return '#1A4A7A';
  return 'rgba(0,0,0,0.6)';
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeIdx, setActiveIdx] = useState(0);
  const [savedMap, setSavedMap] = useState({});
  const [events, setEvents] = useState(mockEvents);

  useEffect(() => {
    fetchEvents().then(data => {
      if (data && data.length > 0) setEvents(data);
    });
  }, []);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIdx(viewableItems[0].index ?? 0);
  });
  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 60 });

  const handleSave = useCallback(async (id) => {
    const next = !savedMap[id];
    setSavedMap(prev => ({ ...prev, [id]: next }));
    try {
      if (next) {
        const event = events.find(e => e.id === id);
        await AsyncStorage.setItem(`saved_${id}`, JSON.stringify(event));
      } else {
        await AsyncStorage.removeItem(`saved_${id}`);
      }
    } catch (_) {}
  }, [savedMap, events]);

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Vertical full-screen feed */}
      <FlatList
        data={events}
        keyExtractor={i => i.id}
        pagingEnabled
        snapToInterval={H}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        getItemLayout={(_, index) => ({ length: H, offset: H * index, index })}
        renderItem={({ item, index }) => (
          <EventCard
            item={item}
            index={index}
            savedState={!!savedMap[item.id]}
            onSave={() => handleSave(item.id)}
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          />
        )}
      />

      {/* Top bar — floats over the feed */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        {/* Logo — long press opens admin */}
        <TouchableOpacity
          onLongPress={() => navigation.navigate('Admin')}
          delayLongPress={1500}
          activeOpacity={0.9}
        >
          <Image source={LOGO_DARK} style={s.topLogo} resizeMode="contain" />
        </TouchableOpacity>

        <View style={s.topRight}>
          <TouchableOpacity style={s.topPill} onPress={() => navigation.navigate('Alerts')}>
            <Text style={s.topPillText}>⚙</Text>
          </TouchableOpacity>
          <View style={s.topCityPill}>
            <Text style={s.topCityText}>Delhi NCR ▾</Text>
          </View>
        </View>
      </View>

      {/* Dot indicators — right side */}
      <View style={[s.dotsCol, { top: H * 0.35 }]}>
        {events.map((_, i) => (
          <View key={i} style={[s.dotV, i === activeIdx && s.dotVActive]} />
        ))}
      </View>

      {/* Bottom nav bar */}
      <View style={[s.bottomNav, { paddingBottom: insets.bottom + 4 }]}>
        <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Map')}>
          <Text style={s.navIcon}>🗺</Text>
          <Text style={s.navLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={[s.navIcon, s.navIconActive]}>◉</Text>
          <Text style={[s.navLabel, s.navLabelActive]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Saved')}>
          <Text style={s.navIcon}>♡</Text>
          <Text style={s.navLabel}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Alerts')}>
          <Text style={s.navIcon}>🔔</Text>
          <Text style={s.navLabel}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIcon}>⊙</Text>
          <Text style={s.navLabel}>Explore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },

  card: { width: W, height: H, overflow: 'hidden' },

  cardContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24,
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 4, marginBottom: 12,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  cardTitle: {
    fontSize: 32, fontWeight: '800', color: '#fff',
    letterSpacing: 0.5, lineHeight: 36, marginBottom: 8,
    fontStyle: 'italic',
  },
  cardArtist: {
    fontSize: 14, color: 'rgba(255,255,255,0.75)',
    marginBottom: 12, letterSpacing: 0.3,
  },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  tagText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, letterSpacing: 0.3 },

  galleryRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 6,
  },
  galDot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  galleryName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  galleryArea: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginLeft: 4 },

  dateText: {
    color: 'rgba(255,255,255,0.6)', fontSize: 12,
    marginBottom: 18, letterSpacing: 0.2,
  },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  actionBtn: {
    flex: 1, paddingVertical: 13,
    backgroundColor: '#fff',
    borderRadius: 6, alignItems: 'center',
  },
  actionBtnActive: { backgroundColor: '#C8A96A' },
  actionBtnText: { color: '#111', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  actionBtnTextActive: { color: '#fff' },
  actionBtnOutline: {
    flex: 1, paddingVertical: 13,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 6, alignItems: 'center',
  },
  actionBtnOutlineText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  topLogo: {
    width: 48, height: 48, borderRadius: 24,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topPill: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  topPillText: { color: '#fff', fontSize: 16 },
  topCityPill: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  topCityText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Side dots
  dotsCol: {
    position: 'absolute', right: 10,
    flexDirection: 'column', gap: 5,
  },
  dotV: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotVActive: {
    height: 18, borderRadius: 2,
    backgroundColor: '#fff',
  },

  // Bottom nav
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(10,10,10,0.88)',
    borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
  },
  navItem: {
    flex: 1, alignItems: 'center', gap: 3,
  },
  navIcon: { fontSize: 18, color: 'rgba(255,255,255,0.45)' },
  navIconActive: { color: '#C8A96A' },
  navLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.3 },
  navLabelActive: { color: '#C8A96A', fontWeight: '700' },
});

// Abstract shape styles
const sh = StyleSheet.create({
  bigCircle: {
    position: 'absolute',
    width: W * 0.75, height: W * 0.75,
    borderRadius: W * 0.375, opacity: 0.35,
  },
  medCircle: {
    position: 'absolute',
    width: W * 0.42, height: W * 0.42,
    borderRadius: W * 0.21, opacity: 0.4,
  },
  smallCircle: {
    position: 'absolute',
    width: W * 0.22, height: W * 0.22,
    borderRadius: W * 0.11, opacity: 0.4,
  },
  halfCircle: {
    position: 'absolute',
    width: W * 0.65, height: W * 0.65,
    borderRadius: W * 0.325, opacity: 0.3,
  },
  bigRect: {
    position: 'absolute',
    width: W * 0.35, height: H * 0.22,
    borderRadius: 6, opacity: 0.3,
  },
  thinRect: {
    position: 'absolute',
    width: W * 0.3, height: 3,
    opacity: 0.45,
  },
  dot: {
    position: 'absolute',
    width: 14, height: 14,
    borderRadius: 7, opacity: 0.55,
  },
});
