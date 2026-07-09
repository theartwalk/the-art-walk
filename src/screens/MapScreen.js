import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, Platform, Linking, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { galleries, events } from '../data/mockData';

const { width: W, height: H } = Dimensions.get('window');

// ── Web Map using Leaflet ──────────────────────────────────────────────────
function WebMap({ galleries, events, onGallerySelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [ready, setReady] = useState(false);

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = window.L;

      const map = L.map(mapRef.current, {
        center: [28.57, 77.21],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Light clean tiles — CartoDB Positron (same style as CUR8)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add gallery markers
      galleries.forEach(gallery => {
        // Find event for this gallery
        const event = events.find(e => e.venue === gallery.name);
        const color = event ? event.color : '#C8A96A';

        // Custom marker HTML
        const markerHtml = `
          <div style="
            background: white;
            border-radius: 12px;
            padding: 3px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.18);
            cursor: pointer;
            transition: transform 0.15s;
            border: 2px solid white;
          ">
            <div style="
              width: 56px; height: 56px;
              border-radius: 10px;
              background: ${color};
              display: flex; align-items: center; justify-content: center;
              overflow: hidden;
              position: relative;
            ">
              ${event && event.mediaUrl
                ? `<img src="${event.mediaUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"/>`
                : `<div style="
                    width: 30px; height: 30px; border-radius: 15px;
                    background: rgba(255,255,255,0.25);
                    display:flex;align-items:center;justify-content:center;
                    font-size:18px;
                  ">🎨</div>`
              }
            </div>
          </div>
          <div style="
            background: white;
            border-radius: 8px;
            padding: 4px 8px;
            margin-top: 4px;
            box-shadow: 0 1px 6px rgba(0,0,0,0.12);
            text-align: center;
            max-width: 110px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">
            <div style="font-size:11px;font-weight:700;color:#111;font-family:sans-serif;">
              ${gallery.name}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [80, 90],
          iconAnchor: [40, 90],
        });

        const marker = L.marker([gallery.lat, gallery.lng], { icon }).addTo(map);
        marker.on('click', () => {
          onGallerySelect(gallery);
          map.setView([gallery.lat, gallery.lng], 14, { animate: true });
        });
      });

      setReady(true);
    };

    loadLeaflet();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#f0ede8',
      }}
    />
  );
}

// ── Gallery bottom card ────────────────────────────────────────────────────
function GalleryCard({ gallery, events, active, onPress }) {
  const event = events.find(e => e.venue === gallery.name);
  const color = event ? event.color : '#C8A96A';

  return (
    <TouchableOpacity
      style={[c.card, active && c.cardActive]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Image / color block */}
      <View style={[c.cardImg, { backgroundColor: color }]}>
        {event && event.mediaUrl ? (
          <Image source={{ uri: event.mediaUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Text style={c.cardEmoji}>🎨</Text>
        )}
      </View>

      {/* Info */}
      <View style={c.cardInfo}>
        <Text style={c.cardName} numberOfLines={1}>{gallery.name}</Text>
        <Text style={c.cardArea} numberOfLines={1}>{gallery.address}</Text>
        <Text style={c.cardHours}>{gallery.hours}</Text>
        {event && (
          <View style={[c.cardBadge, { backgroundColor: color }]}>
            <Text style={c.cardBadgeText}>{event.type}</Text>
          </View>
        )}
      </View>

      {/* Directions */}
      <TouchableOpacity
        style={c.dirBtn}
        onPress={() => Linking.openURL(`https://maps.google.com/?q=${gallery.lat},${gallery.lng}`)}
      >
        <Text style={c.dirBtnText}>→</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ── Detail bottom sheet ────────────────────────────────────────────────────
function DetailSheet({ gallery, events, onClose }) {
  if (!gallery) return null;
  const event = events.find(e => e.venue === gallery.name);
  const color = event ? event.color : '#C8A96A';

  return (
    <View style={d.sheet}>
      <View style={d.handle} />
      <View style={d.row}>
        <View style={[d.thumb, { backgroundColor: color }]}>
          {event && event.mediaUrl
            ? <Image source={{ uri: event.mediaUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <Text style={d.thumbEmoji}>🎨</Text>
          }
        </View>
        <View style={d.info}>
          <Text style={d.name}>{gallery.name}</Text>
          <Text style={d.address}>{gallery.address}</Text>
          <Text style={d.hours}>{gallery.hours}</Text>
        </View>
        <TouchableOpacity style={d.closeBtn} onPress={onClose}>
          <Text style={d.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {event && (
        <View style={[d.eventRow, { borderLeftColor: color }]}>
          <Text style={d.eventTitle}>{event.title}</Text>
          <Text style={d.eventDate}>{event.dateLabel} · {event.time}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[d.mapsBtn, { backgroundColor: color }]}
        onPress={() => Linking.openURL(`https://maps.google.com/?q=${gallery.lat},${gallery.lng}`)}
      >
        <Text style={d.mapsBtnText}>OPEN IN MAPS</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const handleGallerySelect = (gallery) => setSelected(gallery);

  return (
    <View style={s.screen}>

      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.searchPill}>
          <Text style={s.searchIcon}>⊙</Text>
          <Text style={s.searchText}>Delhi NCR Galleries</Text>
        </View>
        <View style={s.filterBtn}>
          <Text style={s.filterText}>⚙</Text>
        </View>
      </View>

      {/* Map */}
      <View style={s.mapContainer}>
        {Platform.OS === 'web' ? (
          <WebMap
            galleries={galleries}
            events={events}
            onGallerySelect={handleGallerySelect}
          />
        ) : (
          // Fallback for native — simple placeholder
          <View style={s.mapFallback}>
            <Text style={s.mapFallbackText}>🗺</Text>
            <Text style={s.mapFallbackLabel}>Map view on web</Text>
          </View>
        )}
      </View>

      {/* Bottom — detail sheet or gallery cards */}
      {selected ? (
        <DetailSheet
          gallery={selected}
          events={events}
          onClose={() => setSelected(null)}
        />
      ) : (
        <View style={[s.bottomCards, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={s.bottomLabel}>
            {galleries.length} galleries in Delhi NCR
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.cardsRow}
          >
            {galleries.map(g => (
              <GalleryCard
                key={g.id}
                gallery={g}
                events={events}
                active={selected?.id === g.id}
                onPress={() => handleGallerySelect(g)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F3EF' },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingBottom: 10, gap: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  backText: { fontSize: 18, color: '#111' },
  searchPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  searchIcon: { fontSize: 14, color: '#888' },
  searchText: { fontSize: 13, color: '#333', fontWeight: '500' },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  filterText: { fontSize: 16, color: '#111' },

  mapContainer: { flex: 1 },
  mapFallback: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0EDE8',
  },
  mapFallbackText: { fontSize: 48, marginBottom: 8 },
  mapFallbackLabel: { color: '#888', fontSize: 14 },

  bottomCards: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 8,
  },
  bottomLabel: {
    fontSize: 11, color: '#999', fontWeight: '600',
    letterSpacing: 1, paddingHorizontal: 20, marginBottom: 10,
    textTransform: 'uppercase',
  },
  cardsRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
});

// Gallery card styles
const c = StyleSheet.create({
  card: {
    width: 200, backgroundColor: '#fff', borderRadius: 14,
    overflow: 'hidden', flexDirection: 'row',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardActive: { borderColor: '#C8A96A', borderWidth: 2 },
  cardImg: {
    width: 64, height: 80,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  cardEmoji: { fontSize: 24 },
  cardInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  cardName: { fontSize: 12, fontWeight: '700', color: '#111', marginBottom: 2 },
  cardArea: { fontSize: 10, color: '#999', marginBottom: 4 },
  cardHours: { fontSize: 9, color: '#BBB', marginBottom: 5 },
  cardBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  cardBadgeText: { fontSize: 8, fontWeight: '700', color: '#fff' },
  dirBtn: {
    width: 32, alignItems: 'center', justifyContent: 'center',
    borderLeftWidth: 1, borderLeftColor: '#F0F0F0',
  },
  dirBtnText: { fontSize: 16, color: '#999' },
});

// Detail sheet styles
const d = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 16,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  thumb: {
    width: 60, height: 60, borderRadius: 12,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  thumbEmoji: { fontSize: 26 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 3 },
  address: { fontSize: 12, color: '#888', marginBottom: 2 },
  hours: { fontSize: 11, color: '#AAA' },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
  },
  closeText: { fontSize: 11, color: '#888', fontWeight: '700' },
  eventRow: {
    borderLeftWidth: 3, paddingLeft: 12, marginBottom: 16,
  },
  eventTitle: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 3 },
  eventDate: { fontSize: 11, color: '#888' },
  mapsBtn: {
    paddingVertical: 13, borderRadius: 10,
    alignItems: 'center',
  },
  mapsBtnText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
});
