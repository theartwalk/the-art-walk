import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, StatusBar, Image, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { events as mockEvents } from '../data/mockData';
import { fetchEvents } from '../lib/supabase';

const { width: W, height: H } = Dimensions.get('window');
const CITIES = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Jaipur', 'Pune'];

// ── Abstract art fallback ──────────────────────────────────────────────────
function ArtComposition({ color, index }) {
  const comp  = index % 6;
  const dark  = darken(color, 0.3);
  const light = lighten(color, 0.25);
  if (comp === 0) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.bigCircle,   { backgroundColor: light, top: -W*0.3,  left: -W*0.3  }]} />
      <View style={[sh.smallCircle, { backgroundColor: dark,  bottom: H*0.3, right:-W*0.1  }]} />
      <View style={[sh.thinRect,    { backgroundColor: dark,  top: H*0.25,  left: W*0.1, transform:[{rotate:'15deg'}] }]} />
    </View>
  );
  if (comp === 1) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.bigRect,   { backgroundColor: light, top: H*0.05, left: W*0.55, transform:[{rotate:'-8deg'}] }]} />
      <View style={[sh.bigCircle, { backgroundColor: dark,  top: H*0.1,  left:-W*0.15, opacity:0.6 }]} />
      <View style={[sh.medCircle, { backgroundColor: light, bottom:H*0.25, right:W*0.1 }]} />
    </View>
  );
  if (comp === 2) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.halfCircle, { backgroundColor: light, top:-H*0.05, right:-W*0.1 }]} />
      <View style={[sh.smallCircle,{ backgroundColor: dark,  top: H*0.2,  left: W*0.1 }]} />
      <View style={[sh.bigRect,    { backgroundColor: dark,  bottom:H*0.2, left:-W*0.15, transform:[{rotate:'20deg'}] }]} />
    </View>
  );
  if (comp === 3) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.bigCircle, { backgroundColor: dark,  bottom:H*0.1, right:-W*0.25 }]} />
      <View style={[sh.thinRect,  { backgroundColor: light, top:H*0.15,  left:W*0.05, width:W*0.9, transform:[{rotate:'-3deg'}] }]} />
      <View style={[sh.medCircle, { backgroundColor: light, top:H*0.22,  left:W*0.55 }]} />
    </View>
  );
  if (comp === 4) return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.bigRect,   { backgroundColor: light, top:H*0.08, left:W*0.08, transform:[{rotate:'5deg'}] }]} />
      <View style={[sh.bigCircle, { backgroundColor: dark,  top:H*0.02, right:-W*0.3, opacity:0.7 }]} />
    </View>
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[sh.halfCircle,{ backgroundColor: dark,  bottom:H*0.15, left:-W*0.1, transform:[{rotate:'180deg'}] }]} />
      <View style={[sh.medCircle, { backgroundColor: light, top:H*0.08,   right:W*0.05 }]} />
    </View>
  );
}

function darken(hex, amount) {
  const n = parseInt(hex.replace('#',''), 16);
  return `rgb(${Math.max(0,(n>>16)-Math.round(255*amount))},${Math.max(0,((n>>8)&0xff)-Math.round(255*amount))},${Math.max(0,(n&0xff)-Math.round(255*amount))})`;
}
function lighten(hex, amount) {
  const n = parseInt(hex.replace('#',''), 16);
  return `rgb(${Math.min(255,(n>>16)+Math.round(255*amount))},${Math.min(255,((n>>8)&0xff)+Math.round(255*amount))},${Math.min(255,(n&0xff)+Math.round(255*amount))})`;
}
function getBadgeColor(type) {
  if (type === 'tonight') return '#C84030';
  if (type === 'openCall') return '#1A6B3C';
  if (type === 'free') return '#1A4A7A';
  return 'rgba(0,0,0,0.6)';
}

// ── Event card ─────────────────────────────────────────────────────────────
function EventCard({ item, index, onPress, savedState, onSave }) {
  const insets = useSafeAreaInsets();
  const tags = item.tags?.length > 0
    ? item.tags
    : [item.type, item.price === 'Free' ? 'Free Entry' : item.price].filter(Boolean);

  return (
    <TouchableOpacity activeOpacity={0.98} onPress={onPress} style={[s.card, { height: H }]}>

      {/* Background */}
      {item.mediaUrl && item.mediaType === 'image' ? (
        <>
          <Image source={{ uri: item.mediaUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.68)' }]} />
        </>
      ) : (
        <>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: item.color }]} />
          <ArtComposition color={item.color} index={index} />
        </>
      )}

      {/* Gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.05)', 'transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.97)']}
        locations={[0, 0.22, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Badge */}
      {item.badge ? (
        <View style={[s.badge, { top: insets.top + 76, backgroundColor: getBadgeColor(item.badgeType) }]}>
          <Text style={s.badgeText}>{item.badge}</Text>
        </View>
      ) : null}

      {/* Card content */}
      <View style={[s.cardContent, { paddingBottom: insets.bottom + 116 }]}>
        <Text style={s.cardTitle} numberOfLines={3}>{item.title}</Text>
        <Text style={s.cardArtist} numberOfLines={1}>{item.venue}</Text>

        <View style={s.tagRow}>
          {tags.slice(0, 3).map((t, i) => (
            <View key={i} style={s.tagPill}>
              <Text style={s.tagText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={s.divider} />

        <View style={s.galleryRow}>
          <View style={[s.galDot, { backgroundColor: item.color || '#C8A96A' }]} />
          <Text style={s.galleryName}>{item.venue}</Text>
          <Text style={s.galleryArea}>· {item.area || 'Delhi NCR'}</Text>
        </View>

        <Text style={s.dateText}>
          {item.dateLabel}{item.time ? `  ·  ${item.time}` : ''}
        </Text>
      </View>

      {/* Floating save button */}
      <TouchableOpacity
        style={[s.saveBtn, { bottom: insets.bottom + 124 }, savedState && s.saveBtnSaved]}
        onPress={onSave}
        activeOpacity={0.85}
      >
        <Ionicons name={savedState ? 'bookmark' : 'bookmark-outline'} size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ── City picker ────────────────────────────────────────────────────────────
function CityPicker({ visible, city, onSelect, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>SELECT CITY</Text>
          {CITIES.map(c => (
            <TouchableOpacity key={c} style={s.cityRow} onPress={() => { onSelect(c); onClose(); }}>
              <Text style={[s.cityText, c === city && s.cityTextActive]}>{c}</Text>
              {c === city && <Ionicons name="checkmark" size={18} color="#C8A96A" />}
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeIdx, setActiveIdx] = useState(0);
  const [savedMap, setSavedMap]   = useState({});
  const [events, setEvents]       = useState(mockEvents);
  const [city, setCity]           = useState('Delhi NCR');
  const [cityOpen, setCityOpen]   = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    fetchEvents().then(data => {
      if (data && data.length > 0) setEvents(data);
    });
  }, []);

  const onViewRef     = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIdx(viewableItems[0].index ?? 0);
  });
  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 60 });

  const handleSave = useCallback(async (id) => {
    const next = !savedMap[id];
    setSavedMap(prev => ({ ...prev, [id]: next }));
    try {
      if (next) {
        const ev = events.find(e => e.id === id);
        await AsyncStorage.setItem(`saved_${id}`, JSON.stringify(ev));
      } else {
        await AsyncStorage.removeItem(`saved_${id}`);
      }
    } catch (_) {}
  }, [savedMap, events]);

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Feed */}
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

      {/* ── Top bar ── */}
      <View style={[s.topBar, { paddingTop: insets.top + 10 }]}>
        {/* User profile button */}
        <TouchableOpacity
          style={s.userBtn}
          onLongPress={() => navigation.navigate('Admin')}
          delayLongPress={1500}
          activeOpacity={0.85}
        >
          <Ionicons name="person-outline" size={22} color="#111" />
          <View style={s.notifDot} />
        </TouchableOpacity>

        {/* Right controls */}
        <View style={s.topRight}>
          <TouchableOpacity style={s.filterBtn} onPress={() => navigation.navigate('Alerts')}>
            <Ionicons name="options-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.cityPill} onPress={() => setCityOpen(true)}>
            <Text style={s.cityPillText}>{city}</Text>
            <Ionicons name="chevron-down" size={14} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scroll dots */}
      <View style={[s.dotsCol, { top: H * 0.38 }]}>
        {events.map((_, i) => (
          <View key={i} style={[s.dotV, i === activeIdx && s.dotVActive]} />
        ))}
      </View>

      {/* ── Bottom navigation ── */}
      <View style={[s.bottomArea, { paddingBottom: insets.bottom + 12 }]}>
        <View style={s.navRow}>
          {/* Main pill — 4 tabs */}
          <View style={s.navPill}>
            {[
              { key: 'map',    icon: 'map-outline',      onPress: () => navigation.navigate('Map') },
              { key: 'feed',   icon: 'menu-outline' },
              { key: 'people', icon: 'people-outline',   onPress: () => navigation.navigate('Alerts') },
              { key: 'saved',  icon: 'calendar-outline', onPress: () => navigation.navigate('Saved') },
            ].map(tab => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[s.navBtn, active && s.navBtnActive]}
                  onPress={() => { setActiveTab(tab.key); tab.onPress?.(); }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={tab.icon}
                    size={22}
                    color={active ? '#C84030' : 'rgba(255,255,255,0.65)'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Search pill — separate */}
          <TouchableOpacity style={s.searchPill} activeOpacity={0.75}>
            <Ionicons name="search" size={22} color="rgba(255,255,255,0.65)" />
          </TouchableOpacity>
        </View>
      </View>

      <CityPicker
        visible={cityOpen}
        city={city}
        onSelect={setCity}
        onClose={() => setCityOpen(false)}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  card:   { width: W, height: H, overflow: 'hidden' },

  badge: {
    position: 'absolute', left: 20,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  cardContent: {
    position: 'absolute', bottom: 0, left: 0, right: 76,
    paddingHorizontal: 22,
  },
  cardTitle: {
    fontSize: 30, fontWeight: '800', color: '#fff',
    letterSpacing: 0.2, lineHeight: 34, marginBottom: 7, fontStyle: 'italic',
  },
  cardArtist: {
    fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 14,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 16 },
  tagPill: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 5,
  },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 14 },
  galleryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  galDot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  galleryName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  galleryArea: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginLeft: 4 },
  dateText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  saveBtn: {
    position: 'absolute', right: 16,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#E03020',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 10,
  },
  saveBtnSaved: { backgroundColor: '#C8A96A' },

  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  userBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 6,
  },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#E03020',
    borderWidth: 1.5, borderColor: '#fff',
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  cityPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  cityPillText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  dotsCol: { position: 'absolute', right: 10, flexDirection: 'column', gap: 5 },
  dotV: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotVActive: { height: 18, borderRadius: 2, backgroundColor: '#fff' },

  // Bottom nav
  bottomArea: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    alignItems: 'center',
  },
  navRow: {
    alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  navPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(40,40,40,0.85)',
    borderRadius: 50, padding: 7, gap: 2,
  },
  navBtn: {
    width: 62, height: 54, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  navBtnActive: {
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  searchPill: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(40,40,40,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },

  // City picker
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 16, paddingBottom: 44, paddingHorizontal: 24,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: {
    color: 'rgba(255,255,255,0.35)', fontSize: 11,
    fontWeight: '700', letterSpacing: 2.5, marginBottom: 8,
  },
  cityRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  cityText: { color: '#fff', fontSize: 17 },
  cityTextActive: { color: '#C8A96A', fontWeight: '700' },
});

const sh = StyleSheet.create({
  bigCircle:   { position:'absolute', width:W*0.75, height:W*0.75, borderRadius:W*0.375, opacity:0.35 },
  medCircle:   { position:'absolute', width:W*0.42, height:W*0.42, borderRadius:W*0.21,  opacity:0.4  },
  smallCircle: { position:'absolute', width:W*0.22, height:W*0.22, borderRadius:W*0.11,  opacity:0.4  },
  halfCircle:  { position:'absolute', width:W*0.65, height:W*0.65, borderRadius:W*0.325, opacity:0.3  },
  bigRect:     { position:'absolute', width:W*0.35, height:H*0.22, borderRadius:6,        opacity:0.3  },
  thinRect:    { position:'absolute', width:W*0.3,  height:3,                             opacity:0.45 },
});
