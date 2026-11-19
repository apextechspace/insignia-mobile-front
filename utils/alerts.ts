import { Alert as NativeAlert, Platform, type AlertButton, type AlertOptions } from 'react-native';

// React Native Web's Alert.alert is a no-op. Keep errors and confirmation
// callbacks functional in the web booking app without changing native dialogs.
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions): void {
    if (Platform.OS !== 'web') { NativeAlert.alert(title, message, buttons, options); return; }
    if (typeof window === 'undefined') return;
    const text = [title, message].filter(Boolean).join('\n\n');
    if (!buttons || buttons.length < 2) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancel = buttons.find(button => button.style === 'cancel');
    const actions = buttons.filter(button => button.style !== 'cancel');
    if (actions.length === 1) {
      if (window.confirm(`${text}\n\n${actions[0].text || 'Continue'}?`)) actions[0].onPress?.();
      else cancel?.onPress?.();
      return;
    }
    const selected = window.prompt(`${text}\n\n${actions.map((button, index) => `${index + 1}. ${button.text || 'Continue'}`).join('\n')}`);
    const index = Number(selected) - 1;
    if (selected !== null && Number.isInteger(index) && index >= 0 && index < actions.length) actions[index].onPress?.();
    else cancel?.onPress?.();
  },
};
