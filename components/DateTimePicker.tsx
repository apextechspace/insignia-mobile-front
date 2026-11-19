import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import NativeDateTimePicker from '@react-native-community/datetimepicker';

type Props = React.ComponentProps<typeof NativeDateTimePicker>;
const valueFor = (value: Date, mode: string) => {
  const pad = (part: number) => String(part).padStart(2, '0');
  const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  const time = `${pad(value.getHours())}:${pad(value.getMinutes())}`;
  return mode === 'datetime' ? `${date}T${time}` : mode === 'time' ? time : date;
};

export default function DateTimePicker(props: Props) {
  const mode = ('mode' in props && props.mode) || 'date';
  const [draft, setDraft] = React.useState(valueFor(props.value, mode));
  const [error, setError] = React.useState('');
  React.useEffect(() => { setDraft(valueFor(props.value, mode)); }, [props.value.getTime(), mode]);
  if (Platform.OS !== 'web') return <NativeDateTimePicker {...props} />;
  return <View style={{ gap: 10, paddingVertical: 12 }}>
    {React.createElement('input', {
      type: mode === 'datetime' ? 'datetime-local' : mode === 'time' ? 'time' : 'date',
      value: draft, min: props.minimumDate ? valueFor(props.minimumDate, mode) : undefined,
      max: props.maximumDate ? valueFor(props.maximumDate, mode) : undefined,
      'aria-label': mode === 'date' ? 'Choose date' : 'Choose date and time',
      onChange: (event: any) => { setDraft(event.target.value); setError(''); },
      style: { padding: 12, width: '100%', boxSizing: 'border-box', fontSize: 16, color: '#29212a', background: '#fff', border: '1px solid #bfc9d8', borderRadius: 8 },
    })}
    <TouchableOpacity accessibilityRole="button" disabled={!draft} onPress={() => {
      const selected = mode === 'time' ? new Date(props.value) : new Date(`${draft}${mode === 'date' ? 'T12:00:00' : ''}`);
      if (mode === 'time') { const [hours, minutes] = draft.split(':').map(Number); selected.setHours(hours, minutes, 0, 0); }
      const outsideMinimum = props.minimumDate && (mode === 'date' ? valueFor(selected, 'date') < valueFor(props.minimumDate, 'date') : selected < props.minimumDate);
      const outsideMaximum = props.maximumDate && (mode === 'date' ? valueFor(selected, 'date') > valueFor(props.maximumDate, 'date') : selected > props.maximumDate);
      if (!Number.isFinite(selected.getTime()) || outsideMinimum || outsideMaximum) { setError('Choose a valid date and time within the allowed range.'); return; }
      props.onChange?.({ type: 'set', nativeEvent: { timestamp: selected.getTime(), utcOffset: -selected.getTimezoneOffset() } }, selected);
    }} style={{ padding: 12, borderRadius: 8, backgroundColor: '#4a0e2e' }}><Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Apply Selection</Text></TouchableOpacity>
    {!!error && <Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{error}</Text>}
  </View>;
}
