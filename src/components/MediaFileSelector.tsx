import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';

interface MediaFileSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectFile: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT / 4;

const MediaFileSelector: React.FC<MediaFileSelectorProps> = ({
  isVisible,
  onClose,
  onSelectFile,
}) => {
  const translateY = useSharedValue(MODAL_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const overlayOpacity = useSharedValue(0);

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
                <Text style={styles.title}>Выберите медиафайл</Text>
              </View>

              <TouchableOpacity 
                style={styles.selectButton}
                onPress={onSelectFile}
              >
                <Icon name="file-upload-outline" size={24} color="#FFFFFF" />
                <Text style={styles.selectButtonText}>Выбрать файл</Text>
              </TouchableOpacity>
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
    height: SCREEN_HEIGHT / 4,
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default MediaFileSelector; 