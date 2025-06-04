import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TechnicalState } from './TechnicalStateSelector';

interface TechnicalStateIndicatorProps {
  state: TechnicalState;
  size?: 'small' | 'large';
}

const TechnicalStateIndicator: React.FC<TechnicalStateIndicatorProps> = ({
  state,
  size = 'small',
}) => {
  const getBackgroundColor = () => {
    switch (state) {
      case 'Исправно':
        return 'rgba(76, 175, 80, 0.2)'; // Green with opacity
      case 'Неисправно':
        return 'rgba(244, 67, 54, 0.2)'; // Red with opacity
      case 'На ремонте':
        return 'rgba(255, 152, 0, 0.2)'; // Orange with opacity
      default:
        return 'rgba(102, 102, 102, 0.2)';
    }
  };

  const getTextColor = () => {
    switch (state) {
      case 'Исправно':
        return '#4CAF50'; // Green
      case 'Неисправно':
        return '#F44336'; // Red
      case 'На ремонте':
        return '#FF9800'; // Orange
      default:
        return '#666666';
    }
  };

  return (
    <View style={[
      styles.container,
      size === 'small' ? styles.smallContainer : styles.largeContainer,
      { backgroundColor: getBackgroundColor() }
    ]}>
      <Text style={[
        styles.text,
        size === 'small' ? styles.smallText : styles.largeText,
        { color: getTextColor() }
      ]}>
        {state}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  largeContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  text: {
    fontWeight: '500',
  },
  smallText: {
    fontSize: 13,
  },
  largeText: {
    fontSize: 15,
  },
});

export default TechnicalStateIndicator; 