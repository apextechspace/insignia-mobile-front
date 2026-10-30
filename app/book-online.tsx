import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { roomService } from '../services/rooms';
import { authService } from '../services/auth';
import { sessionService } from '../services/session';
import { guestAccess } from '../services/guestAccess';
import { bookingService } from '../services/bookings';
import { paymentService } from '../services/payment';
import api from '../services/api';

const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export default function BookOnline() {
  const router = useRouter();
  const params = useLocalSearchParams<{ checkIn?: string; checkOut?: string; roomId?: string; guests?: string; bookingId?: string }>();
  const [checkIn, setCheckIn] = useState(params.checkIn || day(1));
  const [checkOut, setCheckOut] = useState(params.checkOut || day(2));
  const [guests, setGuests] = useState(params.guests || '1');
  const [rooms, setRooms] = useState<any[] | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState<any>(null);
  useEffect(() => { void (async () => {
    if (!(await sessionService.getToken())) return;
    try {
      const user = await authService.getUser(); setSignedIn(true); setName(user.name); setEmail(user.email); setPhone(user.phone || '');
      if (params.bookingId) {
        const held = (await bookingService.getMyBookings()).find(item => String(item.id) === params.bookingId);
        if (held && !held.paid_at && held.status === 'pending') {
          const selected = { ...held.room, id: held.room_id, stay_total: held.total_price };
          setBooking(held); setRoom(selected); setRooms([selected]); setCheckIn(held.check_in); setCheckOut(held.check_out); setGuests(String(held.guests || 1));
        }
      }
    } catch { router.replace('/book-online'); }
  })(); }, []);
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setMessage('');
    try { await action(); } catch (error: any) { setMessage(error.response?.data?.message || error.message || 'Unable to continue. Please try again.'); }
    finally { setBusy(false); }
  };
  const search = () => run(async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut) || checkOut <= checkIn) throw new Error('Choose valid check-in and check-out dates.');
    const data = await roomService.getAvailableRooms(checkIn, checkOut, Number(guests));
    setRooms(data); setRoom(data.find((item: any) => String(item.id) === params.roomId) || null);
    if (!data.length) setMessage('No suites are available for these dates. Please try different dates.');
  });
  const checkout = () => run(async () => {
    if (!room || (!booking && (!name.trim() || phone.trim().length < 7))) throw new Error('Enter the lead guest’s full name and phone number.');
    let authorized = signedIn;
    // An email link may have signed this guest in through another browser tab.
    if (!authorized && await sessionService.getToken()) {
      const user = await authService.getUser();
      if (String(user.email).toLowerCase() !== email.trim().toLowerCase()) throw new Error('A different customer is signed in. Please use their email or sign out before continuing.');
      authorized = true; setSignedIn(true);
    }
    if (!authorized) {
      if (!requestId) {
        setRequestId((await guestAccess.request(email.trim(), name.trim(), phone.trim())).request_id);
        setMessage('We emailed you a code. Enter it here to secure your booking and dashboard access. No password is needed.'); return;
      }
      await guestAccess.verify(requestId, code); setSignedIn(true);
    }
    let held = booking;
    if (!held) {
      const form = new FormData();
      Object.entries({ room_id: room.id, check_in: checkIn, check_out: checkOut, guests,
        guest_name: name.trim(), guest_phone: phone.trim(), special_requests: notes }).forEach(([key, value]) => form.append(key, String(value)));
      held = await bookingService.createBooking(form); setBooking(held);
      if (Number(held.total_price) !== Number(room.stay_total)) {
        setRoom({ ...room, stay_total: held.total_price });
        throw new Error('The current suite price has changed. Review the updated total, then continue payment.');
      }
    }
    if (held.hold_expires_at && Date.parse(held.hold_expires_at) <= Date.now()) { setBooking(null); setRoom(null); setRooms(null); throw new Error('Your checkout hold expired. Please check availability again.'); }
    const payment = await paymentService.initializeFlutterwave('booking', held.id);
    const checkoutUrl = payment.payment_url || payment.cashier_url;
    if (!checkoutUrl) throw new Error('Unable to open checkout. Please retry.');
    await paymentService.openFlutterwaveCheckout(checkoutUrl);
    if (Platform.OS !== 'web') {
      const result = await paymentService.verifyFlutterwave(payment.reference);
      setMessage(result.is_paid ? 'Payment verified. Your reservation is confirmed.' : 'Payment is awaiting verification. Check My Stays before arrival.');
      if (result.is_paid) router.replace('/management/bookings');
    }
  });
  const changeDates = (setter: (v: string) => void) => (value: string) => { setter(value); setRooms(null); setRoom(null); };
  const field = (label: string, value: string, change: (v: string) => void, options: any = {}) => <View style={{ gap: 8 }}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={change} style={s.input} editable={!busy && !booking} {...options} /></View>;
  const dateField = (label: string, value: string, change: (v: string) => void, min: string) => Platform.OS === 'web'
    ? <View style={{ flex: 1, minWidth: 140, gap: 8 }}><Text style={s.label}>{label}</Text>{React.createElement('input', { type: 'date', 'aria-label': label, value, min, disabled: busy || !!booking, onChange: (e: any) => change(e.target.value), style: { padding: 14, border: '1px solid #cfc5cb', borderRadius: 10, fontSize: 16, background: '#fff', color: '#29212a', width: '100%', boxSizing: 'border-box' } })}</View>
    : field(`${label} (YYYY-MM-DD)`, value, change, { autoCapitalize: 'none' });
  return <ScrollView style={{ flex: 1, backgroundColor: '#f9f7f5' }} contentContainerStyle={{ padding: 24, paddingTop: 52, paddingBottom: 50, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
    <View style={{ width: '100%', maxWidth: 880, gap: 20 }}>
      <Text style={{ color: '#4b1d3f', fontWeight: '700', letterSpacing: 2 }}>INSIGNIA COURTS</Text>
      <Text style={s.title}>Find your next stay</Text>
      <Text style={s.body}>Choose your dates and suite. Book securely without creating a password.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {dateField('Check-in', checkIn, changeDates(setCheckIn), day(0))}
        {dateField('Check-out', checkOut, changeDates(setCheckOut), checkIn)}
      </View>
      {field('Guests (1–4)', guests, changeDates(setGuests), { keyboardType: 'number-pad', maxLength: 1 })}
      {!booking && <TouchableOpacity accessibilityRole="button" style={s.button} disabled={busy} onPress={search}><Text style={s.buttonText}>{busy ? 'Please wait…' : 'Check availability'}</Text></TouchableOpacity>}
      {(room ? [room] : rooms)?.map(item => <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Select ${item.name}`} key={item.id} disabled={busy || !!booking} onPress={() => setRoom(item)} style={[s.card, room?.id === item.id && { borderColor: '#4b1d3f', borderWidth: 2 }]}>
        {!!item.image && <Image source={{ uri: item.image }} style={{ height: 180, width: '100%', borderRadius: 10 }} />}
        <Text style={s.subtitle}>{item.name}</Text><Text style={s.body}>{item.type} · {item.nights} nights</Text>
        <Text style={s.body}>{item.description}</Text>
        <Text style={s.body}>₦{Number(item.stay_total).toLocaleString()} total · ₦{Number(item.price_per_night).toLocaleString()} / night</Text>
        <Text style={{ color: '#4b1d3f' }}>{room?.id === item.id ? 'Selected' : 'Select suite'}</Text>
      </TouchableOpacity>)}
      {!!room && <View style={s.card}>
        {!booking && <TouchableOpacity disabled={busy} onPress={() => setRoom(null)}><Text style={s.link}>Choose a different suite</Text></TouchableOpacity>}
        <Text style={s.subtitle}>Lead guest details</Text>
        {field('Full name', name, setName, { autoComplete: 'name' })}
        {field('Email address', email, value => { setEmail(value); setRequestId(''); setCode(''); }, { autoCapitalize: 'none', keyboardType: 'email-address', editable: !busy && !booking && !signedIn })}
        {field('Phone number', phone, setPhone, { keyboardType: 'phone-pad' })}
        {field('Special requests (optional)', notes, setNotes, { multiline: true, maxLength: 2000 })}
        {!signedIn && !!requestId && <>{field('Six-digit email code', code, setCode, { keyboardType: 'number-pad', maxLength: 6 })}<TouchableOpacity onPress={() => { setRequestId(''); setCode(''); }}><Text>Request a new code</Text></TouchableOpacity></>}
        <Text style={s.body}>{booking ? `Suite held until ${new Date(booking.hold_expires_at).toLocaleTimeString()}. Payment must be verified before confirmation.` : 'Your suite is reserved temporarily when checkout starts. Final availability and price are checked by Insignia Courts.'}</Text>
        <TouchableOpacity accessibilityRole="button" disabled={busy} style={s.button} onPress={checkout}><Text style={s.buttonText}>{busy ? 'Please wait…' : signedIn ? booking ? 'Continue payment' : 'Continue to secure payment' : requestId ? 'Verify email and continue' : 'Continue as guest'}</Text></TouchableOpacity>
        {!!booking && <><Text style={s.body}>Only release this checkout if you have not paid. Payments received after release require review.</Text><TouchableOpacity disabled={busy} onPress={() => run(async () => { await api.post(`/bookings/${booking.id}/cancel-checkout`); setBooking(null); setRoom(null); setRooms(null); })}><Text style={s.link}>Release checkout and choose again</Text></TouchableOpacity></>}
      </View>}
      {!!message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: '#5d173c', fontSize: 16 }}>{message}</Text>}
      <TouchableOpacity onPress={() => router.push('/access-stay')}><Text style={s.link}>Already booked? Access My Stay</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/login')}><Text style={s.link}>Sign in with a password</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)')}><Text style={s.link}>Explore services and shop</Text></TouchableOpacity>
    </View>
  </ScrollView>;
}
const s = StyleSheet.create({ title: { fontSize: 32, fontWeight: '700', color: '#4b1d3f' }, subtitle: { fontSize: 21, color: '#29212a', fontWeight: '700' }, body: { color: '#50434d', fontSize: 15, lineHeight: 23 }, label: { color: '#29212a', fontSize: 14, fontWeight: '600' }, input: { backgroundColor: '#fff', borderColor: '#cfc5cb', borderWidth: 1, borderRadius: 10, padding: 14, color: '#29212a', fontSize: 16 }, card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, gap: 16, borderWidth: 1, borderColor: '#ded5db' }, button: { backgroundColor: '#4b1d3f', padding: 18, borderRadius: 10 }, buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15 }, link: { color: '#4b1d3f', textDecorationLine: 'underline', lineHeight: 24 } });
