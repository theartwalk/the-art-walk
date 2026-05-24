import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, Linking, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { galleries, events } from '../data/mockData';

const { width: W, height: H } = Dimensions.get('window');

// Simple map placeholder (replace with react-native-maps once location permission is set up)
function MapPlaceholder({ galleries, onPin }) {
  // Normalise lat/lng to screen positions
  const lats = galleries.map(g => g.lat);
  const lngs = galleries.map(g => g.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padFrac = 0.12;
  const latRange = (maxLat - minLat) || 0.01;
  const lngRange = (maxLng - minLng) || 0.01;
  const mapH = H * 0.45;

  function pinX(lng) {
    return ((lng - minLng) / lngRange) * (W * (1 - padFrac * 2)) + W * padFrac;
  }
  function pinY(lat) {
    return (1 - (lat - minLat) / latRange) * (mapH * (1 - padFrac * 2)) + mapH * padFrac;
  }

  return (
    <View style={[styles.mapBg, { height: mapH }]}>
      <Text style={styles.mapLabel}>Delhi NCR · {galleries.length} galleries</Text>
      {galleries.map(g => (
        <TouchableOpacity
          key={g.id}
          onPress={() => onPin(g)}
          style={[styles.pin, { left: pinX(g.lng) - 10, top: pinY(g.lat) - 20 }]}
        >
          <View style={styles.pinDot} />
          <View style={styles.pinStem} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function MapScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  function galleryEvents(galleryName) {
    return events.filter(e => e.venue === galleryName);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GALLERY MAP</Text>
        <View style={{ width: 44 }} />
      </View>

      <MapPlaceholder galleries={galleries} onPin={setSelected} />

      <View style={styles.listHeader}>
        <Text style={styles.listLabel}>All galleries</Text>
        <Text style={styles.listSub}>{galleries.length} spaces</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {galleries.map(g => {
          const ev = galleryEvents(g.name);
          return (
            <TouchableOpacity
              key={g.id}
              style={styles.galleryRow}
              onPress={() => setSelected(g)}
            >
              <View style={[styles.galleryDot, { backgroundColor: colors.cardColors[parseInt(g.id) % 12] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.galleryName}>{g.name}</Text>
                <Text style={styles.galleryAddr}>{g.address}</Text>
                {ev.length > 0 && (
                  <Text style={styles.galleryEvent}>
                    Now: {ev[0].title}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(g.name + ' ' + g.address)}`)}
                style={styles.dirBtn}
              >
                <Text style={styles.dirBtnText}>Go →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Gallery detail modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {selected && (
              <>
                <Text style={styles.modalName}>{selected.name}</Text>
                <Text style={styles.modalAddr}>{selected.address}</Text>
                <Text style={styles.modalHours}>⏱ {selected.hours}</Text>
                {galleryEvents(selected.name).length > 0 && (
                  <View style={styles.modalEventBox}>
                    <Text style={styles.modalEventLabel}>ON NOW</Text>
                    <Text style={styles.modalEventTitle}>{galleryEvents(selected.name)[0].title}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(selected.name + ' ' + selected.address)}`)}
                >
                  <Text style={styles.modalBtnText}>OPEN IN MAPS</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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

  mapBg: {
    backgroundColor: '#EDE9E0', position: 'relative', overflow: 'hidden',
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  mapLabel: {
    position: 'absolute', top: 10, left: 14,
    fontSize: 10, color: '#888', fontWeight: '500',
  },
  pin: { position: 'absolute', alignItems: 'center' },
  pinDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#C84030', borderWidth: 2, borderColor: '#fff' },
  pinStem: { width: 2, height: 6, backgroundColor: '#C84030' },

  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  listLabel: { fontSize: 10, fontWeight: '700', color: colors.text, letterSpacing: 1.5 },
  listSub: { fontSize: 10, color: colors.textLight },

  galleryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.border, gap: 12,
  },
  galleryDot: { width: 10, height: 10, borderRadius: 5 },
  galleryName: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 2 },
  galleryAddr: { fontSize: 11, color: colors.textMid },
  galleryEvent: { fontSize: 10, color: colors.gold, marginTop: 2, fontStyle: 'italic' },
  dirBtn: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5, borderColor: colors.border, borderRadius: 3 },
  dirBtnText: { fontSize: 11, color: colors.textMid },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalSheet: {
    backgroundColor: colors.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: spacing.xl, paddingBottom: spacing.xxl,
  },
  modalHandle: { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  modalName: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
  modalAddr: { fontSize: 13, color: colors.textMid, marginBottom: 4 },
  modalHours: { fontSize: 12, color: colors.textLight, marginBottom: spacing.md },
  modalEventBox: {
    backgroundColor: colors.goldLight, borderRadius: 4, padding: spacing.md,
    borderWidth: 0.5, borderColor: '#E8D8A0', marginBottom: spacing.md,
  },
  modalEventLabel: { fontSize: 9, fontWeight: '700', color: colors.gold, letterSpacing: 1.5, marginBottom: 3 },
  modalEventTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  modalBtn: {
    backgroundColor: colors.black, borderRadius: 4, padding: spacing.md, alignItems: 'center',
  },
  modalBtnText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 2 },
});
