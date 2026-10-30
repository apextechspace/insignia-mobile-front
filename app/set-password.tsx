import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import api from '../services/api';
import { useRouter } from 'expo-router';
export default function SetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true); setMessage('');
    try { await api.post('/user/password', { password, password_confirmation: confirmation }); setPassword(''); setConfirmation(''); setMessage('Password saved. You can now use it to sign in.'); }
    catch (error: any) { setMessage(error.response?.data?.message || 'Please sign in with a fresh email link before setting your password.'); }
    finally { setBusy(false); }
  };
  return <ScrollView style={{ backgroundColor: '#f9f7f5', flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 64, gap: 20 }}>
    <Text style={{ color: '#4b1d3f', fontSize: 26 }}>Set an optional password</Text>
    <Text>First sign in with a fresh email link or code. Use at least 12 characters, with uppercase and lowercase letters, a number and a symbol.</Text>
    <TextInput accessibilityLabel="New password" secureTextEntry value={password} onChangeText={setPassword} placeholder="New password" style={{ backgroundColor: 'white', padding: 16, borderWidth: 1, borderColor: '#cfc5cb', borderRadius: 10 }} />
    <TextInput accessibilityLabel="Confirm password" secureTextEntry value={confirmation} onChangeText={setConfirmation} placeholder="Confirm password" style={{ backgroundColor: 'white', padding: 16, borderWidth: 1, borderColor: '#cfc5cb', borderRadius: 10 }} />
    <Text accessibilityLiveRegion="polite">{message}</Text>
    <TouchableOpacity disabled={busy} onPress={save} style={{ backgroundColor: '#4b1d3f', padding: 16, borderRadius: 10 }}><Text style={{ color: 'white', textAlign: 'center' }}>{busy ? 'Saving…' : 'Save password'}</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => router.push('/access-stay')}><Text>Get a fresh email sign-in link</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => router.back()}><Text>Back to dashboard</Text></TouchableOpacity>
  </ScrollView>;
}
