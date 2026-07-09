import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Platform, ActivityIndicator,
  Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { postEvent, uploadMedia } from '../lib/supabase';

const LOGO_LIGHT = require('../../assets/logo-light.png');

const W = Dimensions.get('window').width;
const ADMIN_PIN = '1234';

const CARD_COLORS = [
  '#D4A017', '#C03020', '#1A6B3C', '#7B4F9E',
  '#1A3A8F', '#C05A10', '#4A7A20', '#B02040',
];
const EVENT_TYPES = ['Exhibition', 'Open Call', 'Talk', 'Fair', 'Open Studio', 'Workshop'];
const BADGE_OPTIONS = [
  { label: 'TONIGHT', type: 'tonight' },
  { label: 'OPEN CALL', type: 'openCall' },
  { label: 'FREE', type: 'free' },
  { label: 'TODAY', type: 'tonight' },
  { label: 'THIS WEEK', type: 'soon' },
  { label: 'NEW SHOW', type: 'soon' },
];

function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [wrong, setWrong] = useState(false);

  const handleDigit = (d) => {
    const next = pin + d;
    if (next.length <= 4) {
      setPin(next);
      if (next.length === 4) {
        if (next === ADMIN_PIN) {
          onUnlock();
        } else {
          setWrong(true);
          setTimeout(() => { setPin(''); setWrong(false); }, 700);
        }
      }
    }
  };

  return (
    <View style={p.screen}>
      <Image source={LOGO_LIGHT} style={p.logoImg} resizeMode="contain" />
      <Text style={p.subtitle}>Admin Access</Text>
      <View style={p.dotsRow}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[p.dot, pin.length > i && p.dotFilled, wrong && p.dotWrong]} />
        ))}
      </View>
      <View style={p.keypad}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
          <TouchableOpacity
            key={i}
            style={[p.key, key === '' && p.keyEmpty]}
            onPress={() => key === '⌫' ? setPin(prev => prev.slice(0,-1)) : key ? handleDigit(key) : null}
            activeOpacity={key ? 0.6 : 1}
          >
            <Text style={p.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function MediaPicker({ mediaPreview, mediaType, onPick, onClear }) {
  const handleWebPick = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('video') ? 'video' : 'image';
        onPick(file, url, type, file.name, file.type);
      };
      input.click();
    }
  };

  if (!mediaPreview) {
    return (
      <TouchableOpacity style={m.picker} onPress={handleWebPick} activeOpacity={0.8}>
        <Text style={m.pickerIcon}>📷</Text>
        <Text style={m.pickerTitle}>Add Photo or Video</Text>
        <Text style={m.pickerSub}>JPG, PNG, MP4 · tap to browse</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      {mediaType === 'image' ? (
        <Image source={{ uri: mediaPreview }} style={m.previewImg} resizeMode="cover" />
      ) : (
        <View style={m.videoPlaceholder}>
          <Text style={m.videoIcon}>▶</Text>
          <Text style={m.videoLabel}>Video ready to upload</Text>
        </View>
      )}
      <View style={m.previewActions}>
        <TouchableOpacity style={m.changeBtn} onPress={handleWebPick}>
          <Text style={m.changeBtnText}>Change</Text>
        </TouchableOpacity>
        <TouchableOpacity style={m.clearBtn} onPress={onClear}>
          <Text style={m.clearBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);

  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [time, setTime] = useState('');
  const [openingDate, setOpeningDate] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [viewTill, setViewTill] = useState('');
  const [artistName, setArtistName] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [artistWebsite, setArtistWebsite] = useState('');
  const [price, setPrice] = useState('Free');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Exhibition');
  const [tags, setTags] = useState('');
  const [badge, setBadge] = useState('');
  const [badgeType, setBadgeType] = useState('soon');
  const [color, setColor] = useState(CARD_COLORS[0]);

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaFileName, setMediaFileName] = useState('');
  const [mediaMime, setMediaMime] = useState('');
  const [mediaType, setMediaType] = useState('image');

  const [uploading, setUploading] = useState(false);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState('');

  const handleMediaPick = (file, preview, type, name, mime) => {
    setMediaFile(file); setMediaPreview(preview);
    setMediaType(type); setMediaFileName(`${Date.now()}_${name}`);
    setMediaMime(mime);
  };

  const resetForm = () => {
    setTitle(''); setVenue(''); setArea(''); setAddress('');
    setDateLabel(''); setTime(''); setPrice('Free');
    setDescription(''); setType('Exhibition'); setTags('');
    setBadge(''); setBadgeType('soon'); setColor(CARD_COLORS[0]);
    setOpeningDate(''); setOpeningTime(''); setViewTill('');
    setArtistName(''); setArtistBio(''); setArtistWebsite('');
    setMediaFile(null); setMediaPreview(''); setMediaFileName('');
    setMediaMime(''); setMediaType('image');
  };

  const handlePost = async () => {
    if (!title.trim() || !venue.trim() || !dateLabel.trim()) {
      setError('Please fill in Title, Venue and Date.'); return;
    }
    setUploading(true); setError(''); setPosted(false);

    let mediaUrl = '';
    if (mediaFile) {
      const result = await uploadMedia(mediaFile, mediaFileName, mediaMime);
      if (result.error) {
        setError(`Upload failed: ${result.error}`); setUploading(false); return;
      }
      mediaUrl = result.url;
    }

    const event = {
      title, venue, area, address, dateLabel, time, price, description, type,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      openingDate, openingTime, viewTill,
      artistName, artistBio, artistWebsite,
      badge, badgeType, color, mediaUrl,
      mediaType: mediaFile ? mediaType : null,
      created_at: new Date().toISOString(),
    };

    const result = await postEvent(event);
    setUploading(false);

    if (result.error) {
      setError(`Connect Supabase to save events live.\n\nYour event is ready:\n"${title}" at ${venue}`);
    } else {
      setPosted(true);
      resetForm();
    }
  };

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <View style={[a.screen, { paddingTop: insets.top }]}>
      <View style={a.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}>
          <Text style={a.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={a.headerTitle}>Post Exhibition</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={a.scroll} contentContainerStyle={a.scrollContent} showsVerticalScrollIndicator={false}>

        {posted && (
          <View style={a.successBox}>
            <Text style={a.successText}>✓ Posted! Visible in the feed.</Text>
          </View>
        )}

        <Text style={a.sectionLabel}>PHOTO / VIDEO</Text>
        <MediaPicker
          mediaPreview={mediaPreview} mediaType={mediaType}
          onPick={handleMediaPick}
          onClear={() => { setMediaFile(null); setMediaPreview(''); }}
        />

        <Text style={a.sectionLabel}>CARD COLOUR</Text>
        <View style={a.colorRow}>
          {CARD_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[a.colorSwatch, { backgroundColor: c }, c === color && a.colorSwatchActive]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <Text style={a.label}>Exhibition Title *</Text>
        <TextInput style={a.input} placeholder="e.g. Fragments of Memory" placeholderTextColor="#666"
          value={title} onChangeText={setTitle} />

        <Text style={a.label}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={a.chipRow}>
            {EVENT_TYPES.map(t => (
              <TouchableOpacity key={t} style={[a.chip, t === type && a.chipActive]} onPress={() => setType(t)}>
                <Text style={[a.chipText, t === type && a.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={a.row}>
          <View style={a.rowHalf}>
            <Text style={a.label}>Gallery / Venue *</Text>
            <TextInput style={a.input} placeholder="Latitude 28" placeholderTextColor="#666"
              value={venue} onChangeText={setVenue} />
          </View>
          <View style={a.rowHalf}>
            <Text style={a.label}>Area</Text>
            <TextInput style={a.input} placeholder="Panchsheel Park" placeholderTextColor="#666"
              value={area} onChangeText={setArea} />
          </View>
        </View>

        <Text style={a.label}>Full Address</Text>
        <TextInput style={a.input} placeholder="S-278, Panchsheel Park, New Delhi" placeholderTextColor="#666"
          value={address} onChangeText={setAddress} />

        <View style={a.row}>
          <View style={a.rowHalf}>
            <Text style={a.label}>Date *</Text>
            <TextInput style={a.input} placeholder="Sat 24 May" placeholderTextColor="#666"
              value={dateLabel} onChangeText={setDateLabel} />
          </View>
          <View style={a.rowHalf}>
            <Text style={a.label}>Time</Text>
            <TextInput style={a.input} placeholder="6:00 – 9:00 PM" placeholderTextColor="#666"
              value={time} onChangeText={setTime} />
          </View>
        </View>

        <View style={a.row}>
          <View style={a.rowHalf}>
            <Text style={a.label}>Opening Date</Text>
            <TextInput style={a.input} placeholder="Fri 5 Jun" placeholderTextColor="#666"
              value={openingDate} onChangeText={setOpeningDate} />
          </View>
          <View style={a.rowHalf}>
            <Text style={a.label}>Opening Time</Text>
            <TextInput style={a.input} placeholder="6:00 – 9:00 PM" placeholderTextColor="#666"
              value={openingTime} onChangeText={setOpeningTime} />
          </View>
        </View>

        <View style={a.row}>
          <View style={a.rowHalf}>
            <Text style={a.label}>View Till</Text>
            <TextInput style={a.input} placeholder="30 Jun 2026" placeholderTextColor="#666"
              value={viewTill} onChangeText={setViewTill} />
          </View>
          <View style={a.rowHalf} />
        </View>

        <Text style={a.sectionLabel}>ARTIST DETAILS</Text>

        <Text style={a.label}>Artist Name</Text>
        <TextInput style={a.input} placeholder="e.g. Atul Dodiya" placeholderTextColor="#666"
          value={artistName} onChangeText={setArtistName} />

        <Text style={a.label}>Artist Bio</Text>
        <TextInput style={[a.input, a.textarea]}
          placeholder="Brief bio about the artist, their practice, background..."
          placeholderTextColor="#666" value={artistBio} onChangeText={setArtistBio}
          multiline numberOfLines={3} textAlignVertical="top" />

        <Text style={a.label}>Artist Website / Instagram</Text>
        <TextInput style={a.input} placeholder="instagram.com/artistname" placeholderTextColor="#666"
          value={artistWebsite} onChangeText={setArtistWebsite} />

        <View style={a.row}>
          <View style={a.rowHalf}>
            <Text style={a.label}>Price</Text>
            <TextInput style={a.input} placeholder="Free" placeholderTextColor="#666"
              value={price} onChangeText={setPrice} />
          </View>
          <View style={a.rowHalf}>
            <Text style={a.label}>Tags (comma separated)</Text>
            <TextInput style={a.input} placeholder="Painting, Free Entry" placeholderTextColor="#666"
              value={tags} onChangeText={setTags} />
          </View>
        </View>

        <Text style={a.label}>Badge</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={a.chipRow}>
            <TouchableOpacity style={[a.chip, badge === '' && a.chipActive]} onPress={() => { setBadge(''); setBadgeType('soon'); }}>
              <Text style={[a.chipText, badge === '' && a.chipTextActive]}>None</Text>
            </TouchableOpacity>
            {BADGE_OPTIONS.map(b => (
              <TouchableOpacity key={b.label} style={[a.chip, badge === b.label && a.chipActive]}
                onPress={() => { setBadge(b.label); setBadgeType(b.type); }}>
                <Text style={[a.chipText, badge === b.label && a.chipTextActive]}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={a.label}>Description</Text>
        <TextInput style={[a.input, a.textarea]}
          placeholder="Describe the exhibition, artists, themes..."
          placeholderTextColor="#666" value={description} onChangeText={setDescription}
          multiline numberOfLines={4} textAlignVertical="top" />

        {!!error && (
          <View style={a.errorBox}>
            <Text style={a.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={[a.submitBtn, uploading && { opacity: 0.6 }]}
          onPress={handlePost} disabled={uploading} activeOpacity={0.85}>
          {uploading
            ? <ActivityIndicator color="#000" />
            : <Text style={a.submitText}>POST EXHIBITION</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const p = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 22, fontWeight: '800', color: '#C8A96A', letterSpacing: 5, marginBottom: 6 },
  logoImg: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 40 },
  dotsRow: { flexDirection: 'row', gap: 14, marginBottom: 48 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  dotFilled: { backgroundColor: '#C8A96A', borderColor: '#C8A96A' },
  dotWrong: { backgroundColor: '#C84030', borderColor: '#C84030' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 240 },
  key: { width: 80, height: 72, alignItems: 'center', justifyContent: 'center' },
  keyEmpty: { opacity: 0 },
  keyText: { fontSize: 24, color: '#fff', fontWeight: '300' },
});

const m = StyleSheet.create({
  picker: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', borderStyle: 'dashed',
    borderRadius: 10, paddingVertical: 32, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 20,
  },
  pickerIcon: { fontSize: 32, marginBottom: 10 },
  pickerTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  pickerSub: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  previewImg: { width: '100%', height: 220, borderRadius: 10, marginBottom: 10 },
  videoPlaceholder: {
    height: 140, borderRadius: 10, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  videoIcon: { fontSize: 36, color: '#C8A96A', marginBottom: 6 },
  videoLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  previewActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  changeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  changeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  clearBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(200,60,40,0.2)', alignItems: 'center' },
  clearBtnText: { color: '#C84030', fontSize: 13, fontWeight: '600' },
});

const a = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  back: { color: '#C8A96A', fontSize: 14, width: 60 },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700',
    letterSpacing: 2, marginBottom: 12, marginTop: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600',
    letterSpacing: 0.5, marginBottom: 7, marginTop: 18,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14,
  },
  textarea: { height: 110, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  rowHalf: { flex: 1 },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4, paddingRight: 20 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: { backgroundColor: '#C8A96A', borderColor: '#C8A96A' },
  chipText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: '#000', fontWeight: '700' },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  colorSwatch: { width: 36, height: 36, borderRadius: 18 },
  colorSwatchActive: { borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.18 }] },
  successBox: {
    backgroundColor: 'rgba(26,107,60,0.25)', borderRadius: 8, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(26,107,60,0.5)',
  },
  successText: { color: '#4ADE80', fontWeight: '600', textAlign: 'center' },
  errorBox: {
    backgroundColor: 'rgba(200,60,40,0.12)', borderRadius: 8, padding: 14,
    marginTop: 16, borderWidth: 1, borderColor: 'rgba(200,60,40,0.3)',
  },
  errorText: { color: '#FCA5A5', fontSize: 12, lineHeight: 18 },
  submitBtn: {
    backgroundColor: '#C8A96A', borderRadius: 8,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  submitText: { color: '#000', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
});
