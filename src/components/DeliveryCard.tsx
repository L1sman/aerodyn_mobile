import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, MD3Theme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Delivery, TechnicalState } from '../types/delivery';
import { DeliveryStatus } from './DeliveryStatusSelector';
import { STATUS_COLORS } from '../constants/colors';
import { observer } from 'mobx-react-lite';

interface DeliveryCardProps {
  delivery: Delivery;
  onPress?: () => void;
}

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'technical';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const getStatusColor = () => {
    if (type === 'technical') {
      switch (status) {
        case 'Исправно':
          return { bg: STATUS_COLORS.success.background, text: STATUS_COLORS.success.text };
        case 'Требует проверки':
          return { bg: STATUS_COLORS.warning.background, text: STATUS_COLORS.warning.text };
        case 'Неисправно':
          return { bg: STATUS_COLORS.error.background, text: STATUS_COLORS.error.text };
        default:
          return { bg: STATUS_COLORS.default.background, text: STATUS_COLORS.default.text };
      }
    } else {
      switch (status) {
        case 'В ожидании':
          return { bg: STATUS_COLORS.warning.background, text: STATUS_COLORS.warning.text };
        case 'В пути':
          return { bg: STATUS_COLORS.warning.background, text: STATUS_COLORS.warning.text };
        case 'Доставлен':
          return { bg: STATUS_COLORS.success.background, text: STATUS_COLORS.success.text };
        case 'Отменен':
          return { bg: STATUS_COLORS.error.background, text: STATUS_COLORS.error.text };
        case 'Проведен':
          return { bg: STATUS_COLORS.success.background, text: STATUS_COLORS.success.text };
        default:
          return { bg: STATUS_COLORS.default.background, text: STATUS_COLORS.default.text };
      }
    }
  };

  const { bg, text } = getStatusColor();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
};

const getFirstWord = (location: any): string => {
  if (!location) return 'Не указано';
  
  // Handle empty object case
  if (typeof location === 'object' && Object.keys(location).length === 0) {
    return 'Не указано';
  }
  
  // If location is an object with address property
  if (typeof location === 'object' && location.address) {
    const words = location.address.split(' ');
    return words[0] || 'Не указано';
  }
  
  // If location is a string, check if it's coordinates
  if (typeof location === 'string') {
    // Check if it's a coordinate string like "(55.344334, 37.123456)"
    const coordMatch = location.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
    if (coordMatch) {
      // Return just the first coordinate number without parentheses and comma
      return coordMatch[1];
    }
    // If not coordinates, return first word
    const words = location.split(' ');
    return words[0] || 'Не указано';
  }
  
  return 'Не указано';
};

export const DeliveryCard: React.FC<DeliveryCardProps> = observer(({ delivery, onPress }) => {
  const theme = useTheme<MD3Theme>();

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.id, { color: theme.colors.onSurface }]}>№{delivery.vehicleNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={16} color={theme.colors.onSurface} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              {Math.floor(delivery.duration / 60)}ч {delivery.duration % 60}м
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="map-marker-distance" size={16} color={theme.colors.onSurface} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              {delivery.distance} км
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="package-variant" size={16} color={theme.colors.onSurface} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              {delivery.services[0]?.name || 'Нет услуг'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="package" size={16} color={theme.colors.onSurface} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              {delivery.packageType}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="map-marker" size={16} color={theme.colors.onSurface} />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              {getFirstWord(delivery.fromLocation)} → {getFirstWord(delivery.toLocation)}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          {delivery.isProcessed && (
            <StatusBadge status="Проведен" type="status" />
          )}
          <StatusBadge status={delivery.status} type="status" />
          {delivery.technicalState && (
            <StatusBadge status={delivery.technicalState} type="technical" />
          )}
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Icon name="chevron-right" size={24} color={theme.colors.onSurface} />
      </View>
      <View style={styles.divider} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    marginRight: 24,
  },
  header: {
    marginBottom: 12,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  id: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    opacity: 0.8,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}); 