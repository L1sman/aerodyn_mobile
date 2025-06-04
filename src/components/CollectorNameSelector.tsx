import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, Modal, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import { Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface CollectorName {
  firstName: string;
  surname: string;
  lastName: string;
}

interface CollectorNameSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (name: CollectorName) => void;
  currentName?: CollectorName;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT / 2;

// This function only formats the display value, not the stored value
export const formatCollectorNameDisplay = (name: CollectorName): string => {
  if (!name.surname && !name.firstName && !name.lastName) return '';
  const firstInitial = name.firstName ? name.firstName.charAt(0) : '';
  const lastInitial = name.lastName ? name.lastName.charAt(0) : '';
  return `${name.surname}${firstInitial ? ' ' + firstInitial : ''}${lastInitial ? '.' + lastInitial : ''}.`;
};

const CollectorNameSelector: React.FC<CollectorNameSelectorProps> = ({
  isVisible,
  onClose,
  onSave,
  currentName = { firstName: '', surname: '', lastName: '' }
}) => {
  const translateY = useSharedValue(MODAL_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const overlayOpacity = useSharedValue(0);

  const [name, setName] = useState<CollectorName>(currentName);

  const hasChanges = useCallback(() => {
    return name.surname !== currentName.surname ||
           name.firstName !== currentName.firstName ||
           name.lastName !== currentName.lastName;
  }, [name, currentName]);

  const handleClose = useCallback(() => {
    translateY.value = withSpring(MODAL_HEIGHT, { damping: 15 });
    overlayOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(onClose, 300);
  }, [onClose]);

  React.useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 15 });
      overlayOpacity.value = withTiming(1, { duration: 200 });
      setName(currentName);
    }
  }, [isVisible, currentName]);

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

  const handleSave = () => {
    onSave(name);
    handleClose();
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={handleClose}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <GestureDetector gesture={gesture}>
            <View style={styles.container}>
              <Animated.View style={[styles.overlay, rOverlayStyle]} />
              <View style={styles.modalContainer}>
                <Animated.View style={[styles.content, rModalStyle]}>
                  <View style={styles.handle} />
                  
                  <View style={styles.header}>
                    <Text style={styles.title}>ФИО сборщика</Text>
                  </View>

                  <View style={styles.inputsContainer}>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Фамилия</Text>
                      <TextInput
                        style={styles.input}
                        value={name.surname}
                        onChangeText={(text) => setName(prev => ({ ...prev, surname: text }))}
                        placeholder="Введите фамилию"
                        placeholderTextColor="#666666"
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Имя</Text>
                      <TextInput
                        style={styles.input}
                        value={name.firstName}
                        onChangeText={(text) => setName(prev => ({ ...prev, firstName: text }))}
                        placeholder="Введите имя"
                        placeholderTextColor="#666666"
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Отчество</Text>
                      <TextInput
                        style={styles.input}
                        value={name.lastName}
                        onChangeText={(text) => setName(prev => ({ ...prev, lastName: text }))}
                        placeholder="Введите отчество"
                        placeholderTextColor="#666666"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleSave}
                    style={[
                      styles.saveButton,
                      !hasChanges() && styles.saveButtonDisabled
                    ]}
                    labelStyle={[
                      styles.saveButtonText,
                      !hasChanges() && styles.saveButtonTextDisabled
                    ]}
                    disabled={!hasChanges()}
                    contentStyle={styles.saveButtonContent}
                  >
                    Сохранить
                  </Button>
                </Animated.View>
              </View>
            </View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    height: SCREEN_HEIGHT / 2,
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
  inputsContainer: {
    width: '100%',
    gap: 16,
  },
  inputWrapper: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(38, 41, 49, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  saveButton: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#ABC7FF',
    borderRadius: 25,
    height: 50,
  },
  saveButtonDisabled: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  saveButtonContent: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002F66',
    textAlign: 'center',
  },
  saveButtonTextDisabled: {
    color: '#666666',
  },
});

export default CollectorNameSelector; 