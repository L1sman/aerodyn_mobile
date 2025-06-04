import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { STATUS_COLORS } from '../constants/colors';
import { apiClient } from '../api/client';
import { DeliveryStatus as APIDeliveryStatus } from '../types/api';

export type DeliveryStatus = string;
export const DEFAULT_STATUS = 'В ожидании';

interface DeliveryStatusSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (status: DeliveryStatus) => void;
  currentStatus: DeliveryStatus;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT / 3;

const DeliveryStatusSelector: React.FC<DeliveryStatusSelectorProps> = ({
  isVisible,
  onClose,
  onSelect,
  currentStatus,
}) => {
  const [deliveryStatuses, setDeliveryStatuses] = useState<APIDeliveryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateY = useSharedValue(MODAL_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      loadDeliveryStatuses();
    }
  }, [isVisible]);

  const loadDeliveryStatuses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getDeliveryStatuses();
      setDeliveryStatuses(response.data);
    } catch (err) {
      console.error('Failed to load delivery statuses:', err);
      setError('Failed to load delivery statuses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    translateY.value = withSpring(MODAL_HEIGHT, { damping: 15 });
    overlayOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(onClose, 300);
  }, [onClose]);

  React.useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 15 });
      overlayOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isVisible]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value.y + event.translationY);
    })
    .onEnd((event) => {
      if (event.velocityY > 500 || translateY.value > MODAL_HEIGHT * 0.3) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const rModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const rOverlayStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      opacity: overlayOpacity.value,
    };
  });

  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'В ожидании':
        return STATUS_COLORS.pending.background;
      case 'Проведено':
        return STATUS_COLORS.success.background;
      case 'Отменено':
        return STATUS_COLORS.error.background;
      default:
        return STATUS_COLORS.default.background;
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'В ожидании':
        return STATUS_COLORS.pending.text;
      case 'Доставлен':
        return STATUS_COLORS.success.text;
      case 'Отменено':
        return STATUS_COLORS.error.text;
      default:
        return STATUS_COLORS.default.text;
    }
  };

  const handleSelect = (status: string) => {
    onSelect(status);
    handleClose();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ABC7FF" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        {deliveryStatuses.map((status) => (
          <TouchableOpacity 
            key={status.id}
            style={styles.option}
            onPress={() => handleSelect(status.name)}
          >
            <View style={[
              styles.stateContainer,
              { backgroundColor: getBackgroundColor(status.name) }
            ]}>
              <Text style={[
                styles.stateText,
                { color: getTextColor(status.name) }
              ]}>
                {status.name}
              </Text>
            </View>
            {currentStatus === status.name && (
              <Icon name="check" size={24} color="#0A84FF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={handleClose}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <Animated.View style={[styles.overlay, rOverlayStyle]} />
          <View style={styles.modalContainer}>
            <Animated.View style={[styles.content, rModalStyle]}>
              <View style={styles.handle} />
              
              <View style={styles.header}>
                <Text style={styles.title}>Статус заказа</Text>
              </View>

              {renderContent()}
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#1C1C1E',
    height: SCREEN_HEIGHT / 3,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#666666',
    borderRadius: 2,
    marginBottom: 20,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  stateContainer: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  stateText: {
    fontSize: 15,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 15,
  },
});

export default DeliveryStatusSelector; 