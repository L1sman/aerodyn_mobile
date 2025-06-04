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

interface CommentSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (comment: string) => void;
  currentComment?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT / 2;

export const formatCommentPreview = (comment: string): string => {
  if (!comment) return '';
  const words = comment.split(' ');
  if (words.length <= 1) return comment;
  return `${words[0]}...`;
};

const CommentSelector: React.FC<CommentSelectorProps> = ({
  isVisible,
  onClose,
  onSave,
  currentComment = ''
}) => {
  const translateY = useSharedValue(MODAL_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const overlayOpacity = useSharedValue(0);

  const [comment, setComment] = useState<string>(currentComment);

  const hasChanges = useCallback(() => {
    return comment !== currentComment;
  }, [comment, currentComment]);

  const handleClose = useCallback(() => {
    translateY.value = withSpring(MODAL_HEIGHT, { damping: 15 });
    overlayOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(onClose, 300);
  }, [onClose]);

  React.useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 15 });
      overlayOpacity.value = withTiming(1, { duration: 200 });
      setComment(currentComment);
    }
  }, [isVisible, currentComment]);

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
    onSave(comment);
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
                    <Text style={styles.title}>Комментарий</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textArea}
                      value={comment}
                      onChangeText={setComment}
                      placeholder="Введите комментарий"
                      placeholderTextColor="#666666"
                      multiline
                      textAlignVertical="top"
                      numberOfLines={6}
                    />
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
  inputContainer: {
    width: '100%',
  },
  textArea: {
    backgroundColor: 'rgba(38, 41, 49, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 120,
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

export default CommentSelector; 