import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { postEvent } from '../lib/supabase';

const ADMIN_PIN = '1234'; // Change this to your own PIN

const EVENT_TYPES = ['Exhibition', 'Open Call', 'Talk', 'Fair', 'Open Studio', 'Workshop'];
const BADGE_OPTIONS = ['TONIGHT', 'OPEN CALL', 'FREE', 'TODAY', 'THIS WEEK'];

export default function AdminScreen({ navigation }) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [posting, setPosting] = useState(false);

  const [form, setForm] = useState({
    title: '', venue: '', address: '',
    date: '', dateLabel: '', time: '',
    price: 'Free', type: 'Exhibition',
    badge: 'THIS WEEK', badgeType: 'soon',
    description: '', color: '#FFE000',
  });

  function checkPin() {
    if (pin === ADMIN_PIN) setAuthed(true);
    else Alert.alert('Wrong PIN', 'Please try again.');
  }

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handlePost() {
    if (!form.title || !form.venue || !form.date) {
      Alert.alert('Missing fields', 'Please fill in title, venue, and date.');
      return;
    }
    setPosting(true);
    const { error } = await postEvent({ ...form, created_at: new Date().toISOString() });
    setPosting(false);
    if (error) {
      Alert.alert('Error', 'Could not post. Check your Supabase connection.\n\n' + error.message);
    } else {
      Alert.alert('Posted!', `${form.title} is now live.`);
      setForm({ title: '', venue: '', address: '', date: '', dateLabel: '', time: '', price: 'Free', type: 'Exhibition', badge: 'THIS WEEK', badgeType: 'soon', description: '', color: '#FFE000' });
    }
  }

  if (!authed) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ADMIN</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.pinScreen}>
          <Text style={styles.pinTitle}>Enter PIN</Text>
          <Text style={styles.pinSub}>Admin access only</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            placeholder="••••"
            placeholderTextColor={colors.textLight}
          />
          <TouchableOpacity style={styles.pinBtn} onPress={checkPin}>
            <Text style={styles.pinBtnText}>ENTER</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>POST EVENT</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

          <Text style={styles.sectionLabel}>Event details</Text>

          <TextInput style={styles.input} placeholder="Title *" placeholderTextColor={colors.textLight}
            value={form.title} onChangeText={v => set('title', v)} />
          <TextInput style={styles.input} placeholder="Venue name *" placeholderTextColor={colors.textLight}
            value={form.venue} onChangeText={v => set('venue', v)} />
          <TextInput style={styles.input} placeholder="Full address" placeholderTextColor={colors.textLight}
            value={form.address} onChangeText={v => set('address', v)} />
          <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD) *" placeholderTextColor={colors.textLight}
            value={form.date} onChangeText={v => set('date', v)} />
          <TextInput style={styles.input} placeholder="Date label (e.g. Sat 25 May)" placeholderTextColor={colors.textLight}
            value={form.dateLabel} onChangeText={v => set('dateLabel', v)} />
          <TextInput style={styles.input} placeholder="Time (e.g. 6–9 PM)" placeholderTextColor={colors.textLight}
            value={form.time} onChangeText={v => set('time', v)} />
          <TextInput style={styles.input} placeholder="Price (e.g. Free / ₹100)" placeholderTextColor={colors.textLight}
            value={form.price} onChangeText={v => set('price', v)} />
          <TextInput style={[styles.input, styles.textarea]} placeholder="Description" placeholderTextColor={colors.textLight}
            value={form.description} onChangeText={v => set('description', v)}
            multiline numberOfLines={4} textAlignVertical="top" />

          <Text style={styles.sectionLabel}>Type</Text>
          <View style={styles.chipRow}>
            {EVENT_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, form.type === t && styles.chipActive]} onPress={() => set('type', t)}>
                <Text style={[styles.chipText, form.type === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Badge</Text>
          <View style={styles.chipRow}>
            {BADGE_OPTIONS.map(b => (
              <TouchableOpacity key={b} style={[styles.chip, form.badge === b && styles.chipActive]} onPress={() => set('badge', b)}>
                <Text style={[styles.chipText, form.badge === b && styles.chipTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Card colour</Text>
          <View style={styles.colorRow}>
            {['#FFE000','#E63020','#1A6B3C','#2040A8','#F07820','#C8A0D8','#A0C840','#E8304A'].map(c => (
              <TouchableOpacity key={c} onPress={() => set('color', c)}
                style={[styles.colorSwatch, { backgroundColor: c }, form.color === c && styles.colorSwatchActive]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.postBtn, posting && { opacity: 0.6 }]}
            onPress={handlePost}
            disabled={posting}
          >
            <Text style={styles.postBtnText}>{posting ? 'POSTING...' : 'POST EVENT'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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

  pinScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 40 },
  pinTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  pinSub: { fontSize: 13, color: colors.textLight },
  pinInput: {
    width: '100%', borderWidth: 0.5, borderColor: colors.border,
    borderRadius: 4, padding: spacing.md, fontSize: 20,
    textAlign: 'center', color: colors.text, letterSpacing: 8,
  },
  pinBtn: { backgroundColor: colors.black, borderRadius: 4, paddingHorizontal: 40, paddingVertical: 12 },
  pinBtnText: { color: '#fff', fontWeight: '700', letterSpacing: 2 },

  form: { padding: spacing.lg },
  sectionLabel: { fontSize: 9, fontWeight: '700', color: colors.textLight, letterSpacing: 2, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: {
    borderWidth: 0.5, borderColor: colors.border, borderRadius: 4,
    padding: spacing.md, fontSize: 14, color: colors.text,
    marginBottom: spacing.sm, backgroundColor: colors.bg,
  },
  textarea: { height: 90, paddingTop: spacing.sm },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: colors.border, borderRadius: 20 },
  chipActive: { backgroundColor: colors.black, borderColor: colors.black },
  chipText: { fontSize: 11, color: colors.textMid },
  chipTextActive: { color: '#fff' },

  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorSwatch: { width: 32, height: 32, borderRadius: 16 },
  colorSwatchActive: { borderWidth: 3, borderColor: colors.black },

  postBtn: {
    backgroundColor: colors.black, borderRadius: 4,
    padding: spacing.lg, alignItems: 'center', marginTop: spacing.xl,
  },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 2 },
});
