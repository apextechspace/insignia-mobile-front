import React from 'react';
import { View, Text } from 'react-native';

type DiscountRoom = {
  discount_enabled?: boolean;
  discount_percentage?: string | number | null;
  discount_label?: string | null;
  show_vat_included?: boolean;
};

export default function RoomDiscountBadge({ room }: { room?: DiscountRoom | null }) {
  const percentage = Number(room?.discount_percentage);
  const offer = !!room?.discount_enabled && Number.isFinite(percentage) && percentage > 0 && percentage < 100;
  if (!offer && !room?.show_vat_included) return null;
  return <View style={{ gap: 6, marginVertical: 6 }}>
    {offer && <View style={{ alignSelf: 'flex-start', backgroundColor: '#f4e7ed', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 7 }}>
    <Text style={{ color: '#5d173c', fontSize: 13, fontWeight: '700' }}>
      {room?.discount_label?.trim() || 'Special offer'} · {percentage}% off
    </Text></View>}
    {room?.show_vat_included && <Text style={{ color: '#806479', fontSize: 12 }}>Includes 7.5% VAT</Text>}
  </View>;
}
