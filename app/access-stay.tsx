import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { guestAccess } from '../services/guestAccess';
export default function AccessStay() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [requestId, setRequestId] = useState('');
  const [linkToken, setLinkToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (Platform.OS === 'web') {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      setRequestId(fragment.get('request_id') || ''); setLinkToken(fragment.get('token') || '');
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);
  const submit = async () => {
    setBusy(true); setMessage('');
    try {
      if (!requestId) {
        setRequestId((await guestAccess.request(email.trim())).request_id);
        setMessage('Check your email. Your code and sign-in link expire in 15 minutes.');
      } else {
        await guestAccess.verify(requestId, linkToken ? undefined : code, linkToken || undefined);
        router.replace('/(tabs)/profile');
      }
    } catch (error: any) { setMessage(error.response?.data?.message || 'Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  };
  return <ScrollView style={{ flex: 1, backgroundColor: '#f9f7f5' }} contentContainerStyle={{ padding: 24, paddingTop: 64, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
    <View style={{ width: '100%', maxWidth: 480, gap: 20 }}>
      <Text style={{ fontSize: 28, color: '#4b1d3f', fontWeight: '700' }}>Access My Stay</Text>
      <Text>No password required. Sign in securely to manage bookings, order food, shop and request services.</Text>
      {!requestId && <><Text>Email address</Text><TextInput accessibilityLabel="Email address" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ backgroundColor: 'white', padding: 16, borderWidth: 1, borderColor: '#cfc5cb', borderRadius: 10 }} /></>}
      {!!requestId && !linkToken && <><Text>Six-digit email code</Text><TextInput accessibilityLabel="Six-digit email code" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} style={{ backgroundColor: 'white', padding: 16, borderWidth: 1, borderColor: '#cfc5cb', borderRadius: 10 }} /></>}
      {!!message && <Text accessibilityLiveRegion="polite">{message}</Text>}
      <TouchableOpacity accessibilityRole="button" disabled={busy || (!requestId && !email) || (!!requestId && !linkToken && code.length !== 6)} onPress={submit} style={{ backgroundColor: '#4b1d3f', padding: 18, borderRadius: 10 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{busy ? 'Please wait…' : requestId ? 'Sign in to My Stay' : 'Email me a sign-in link'}</Text>
      </TouchableOpacity>
      {!!requestId && <TouchableOpacity onPress={() => { setRequestId(''); setLinkToken(''); setCode(''); setMessage(''); }}><Text>Request a new code or use another email</Text></TouchableOpacity>}
      <TouchableOpacity onPress={() => router.push('/login')}><Text>Sign in with a password</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/book-online')}><Text>Browse available suites</Text></TouchableOpacity>
      <Text style={{ color: '#70636d', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 24 }}>Managed by Masterpiece Capital</Text>
    </View>
  </ScrollView>;
}
