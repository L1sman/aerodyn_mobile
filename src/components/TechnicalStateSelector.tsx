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
import { TechnicalCondition } from '../types/api';

export type TechnicalState = string;

interface TechnicalStateSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (state: TechnicalState) => void;
  currentState: TechnicalState;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT / 3;

const TechnicalStateSelector: React.FC<TechnicalStateSelectorProps> = ({
  isVisible,
  onClose,
  onSelect,
  currentState,
}) => {
  const [technicalConditions, setTechnicalConditions] = useState<TechnicalCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateY = useSharedValue(MODAL_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      loadTechnicalConditions();
    }
  }, [isVisible]);

  const loadTechnicalConditions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getTechnicalConditions();
      setTechnicalConditions(response.data);
    } catch (err) {
      console.error('Failed to load technical conditions:', err);
      setError('Failed to load technical conditions');
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

  const getBackgroundColor = (state: string) => {
    switch (state) {
      case 'Исправно':
        return STATUS_COLORS.success.background;
      case 'Неисправно':
        return STATUS_COLORS.error.background;
      case 'На ремонте':
        return STATUS_COLORS.warning.background;
      default:
        return STATUS_COLORS.default.background;
    }
  };

  const getTextColor = (state: string) => {
    switch (state) {
      case 'Исправно':
        return STATUS_COLORS.success.text;
      case 'Неисправно':
        return STATUS_COLORS.error.text;
      case 'На ремонте':
        return STATUS_COLORS.warning.text;
      default:
        return STATUS_COLORS.default.text;
    }
  };

  const handleSelect = (state: string) => {
    onSelect(state);
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
        {technicalConditions.map((condition) => (
          <TouchableOpacity 
            key={condition.id}
            style={styles.option}
            onPress={() => handleSelect(condition.value)}
          >
            <View style={[
              styles.stateContainer,
              { backgroundColor: getBackgroundColor(condition.value) }
            ]}>
              <Text style={[
                styles.stateText,
                { color: getTextColor(condition.value) }
              ]}>
                {condition.value}
              </Text>
            </View>
            {currentState === condition.value && (
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
                <Text style={styles.title}>Тех. исправность</Text>
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

export default TechnicalStateSelector; 