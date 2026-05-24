import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, ScrollView, StatusBar, Share, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { events } from '../data/mockData';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.floor(SCREEN_W * 0.38);
const CARD_H = Math.floor(CARD_W * 1.85);

const BADGE_STYLES = {
  tonight: { bg: '#C84030', text: '#fff' },
  openCall: { bg: '#1A6B3C', text: '#fff' },
  free: { bg: '#1A4A7A', text: '#fff' },
  soon: { bg: 'rgba(0,0,0,0.55)', text: '#fff' },
};

function Badge({ label, type }) {
  const s = BADGE_STYLES[type] || BADGE_STYLES.soon;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{label}</Text>
    </View>
  );
}

function EventCard({ item, onPress, active }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.cardCol}
    >
      <View style={[
        styles.cardImg,
        { backgroundColor: item.color },
        active && styles.cardImgActive,
      ]}>
        <Badge label={item.badge} type={item.badgeType} />
        {/* Decorative shape */}
        <View style={styles.shapeOuter} />
        <View style={styles.shapeInner} />
      </View>
      <View style={styles.cardCaption}>
        <Text style={styles.captionTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.captionVenue} numberOfLines={1}>{item.venue}</Text>
        <Text style={styles.captionDate}>{item.dateLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef = useRef(null);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIdx(viewableItems[0].index ?? 0);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}>
          <Text style={styles.navSide}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity onLongPress={() => navigation.navigate('Admin')} delayLongPress={1500}>
          <Text style={styles.navCenter}>ARTSY NCR</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Saved')}>
          <Text style={styles.navSide}>Saved</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navBorder} />

      {/* World2-style horizontal card strip */}
      <FlatList
        ref={flatRef}
        data={events}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + 2}
        decelerationRate="fast"
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        contentContainerStyle={styles.stripContent}
        renderItem={({ item, index }) => (
          <EventCard
            item={item}
            active={index === activeIdx}
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          />
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dotRow}>
        {events.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              flatRef.current?.scrollToIndex({ index: i, animated: true });
              setActiveIdx(i);
            }}
          >
            <View style={[styles.dot, i === activeIdx && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navBorder} />

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.bottomActionText}>Gallery Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomCTA}
          onPress={() => Linking.openURL('https://artsy-map.vercel.app')}
        >
          <Text style={styles.bottomCTAText}>ALL EVENTS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => navigation.navigate('Alerts')}
        >
          <Text style={styles.bottomActionText}>Alerts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navSide: { fontSize: 13, color: colors.textLight, letterSpacing: 0.3 },
  navCenter: {
    fontSize: 14, fontWeight: '700', color: colors.black,
    letterSpacing: 3,
  },
  navBorder: { height: 0.5, backgroundColor: colors.border, marginHorizontal: 0 },

  stripContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },

  cardCol: { width: CARD_W, marginRight: 2 },
  cardImg: {
    width: CARD_W, height: CARD_H,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImgActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },

  badge: {
    position: 'absolute', top: 8, left: 0,
    paddingHorizontal: 8, paddingVertical: 3,
    borderTopRightRadius: 3, borderBottomRightRadius: 3,
  },
  badgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },

  shapeOuter: {
    width: CARD_W * 0.7, height: CARD_W * 0.7,
    borderRadius: CARD_W * 0.35,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.1)',
    position: 'absolute',
  },
  shapeInner: {
    width: CARD_W * 0.4, height: CARD_W * 0.4,
    borderRadius: CARD_W * 0.2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    position: 'absolute',
  },

  cardCaption: {
    paddingTop: 8, paddingBottom: 4,
    paddingHorizontal: 2,
    minHeight: 64,
  },
  captionTitle: { fontSize: 12, fontWeight: '600', color: colors.text, lineHeight: 16, marginBottom: 3 },
  captionVenue: { fontSize: 10, color: colors.textMid, marginBottom: 2 },
  captionDate: { fontSize: 10, color: colors.gold, fontWeight: '500' },

  dotRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 4, paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#DEDEDE' },
  dotActive: { width: 14, borderRadius: 2, backgroundColor: colors.black },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
  },
  bottomAction: { paddingVertical: 4 },
  bottomActionText: { fontSize: 12, color: colors.textLight, letterSpacing: 0.3 },
  bottomCTA: {
    borderWidth: 1, borderColor: colors.black,
    paddingHorizontal: spacing.lg, paddingVertical: 8,
    borderRadius: 2,
  },
  bottomCTAText: { fontSize: 11, fontWeight: '700', color: colors.black, letterSpacing: 2 },
});
