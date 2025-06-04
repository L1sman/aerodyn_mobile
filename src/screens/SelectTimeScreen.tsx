import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { Text, useTheme, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStore } from '../store';
import Slider from '@react-native-community/slider';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'SelectTime'>;

const SelectTimeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const route = useRoute<RouteProps>();
  const { deliveryStore } = useStore();

  const [departureDate, setDepartureDate] = useState<string>(
    route.params?.departureDate ? route.params.departureDate.toLocaleDateString('ru-RU') : ''
  );
  const [departureTime, setDepartureTime] = useState<string>(
    route.params?.departureTime ? 
    `${route.params.departureTime.slice(0, 2)}:${route.params.departureTime.slice(2)}` : 
    ''
  );
  const [deliveryDate, setDeliveryDate] = useState<string>(
    route.params?.deliveryDate ? route.params.deliveryDate.toLocaleDateString('ru-RU') : ''
  );
  const [deliveryTime, setDeliveryTime] = useState<string>(
    route.params?.deliveryTime ? 
    `${route.params.deliveryTime.slice(0, 2)}:${route.params.deliveryTime.slice(2)}` : 
    ''
  );
  const [transitTime, setTransitTime] = useState<string>(
    route.params?.transitTimeMinutes !== null && route.params?.transitTimeMinutes !== undefined ? 
    `${Math.floor(route.params.transitTimeMinutes / 60).toString().padStart(2, '0')}:${(route.params.transitTimeMinutes % 60).toString().padStart(2, '0')}` : 
    ''
  );
  const [transitTimeMinutes, setTransitTimeMinutes] = useState<number>(
    route.params?.transitTimeMinutes !== null && route.params?.transitTimeMinutes !== undefined ? 
    route.params.transitTimeMinutes : 
    0
  );

  const formatTimeInput = (value: string): string => {
    // Remove all non-digits
    let numbers = value.replace(/\D/g, '');
    
    // Limit to 4 digits
    numbers = numbers.slice(0, 4);
    
    // Validate hours and minutes
    if (numbers.length >= 2) {
      const hours = parseInt(numbers.slice(0, 2));
      if (hours > 23) {
        numbers = '23' + numbers.slice(2);
      }
    }
    if (numbers.length >= 4) {
      const minutes = parseInt(numbers.slice(2, 4));
      if (minutes > 59) {
        numbers = numbers.slice(0, 2) + '59';
      }
    }
    
    // Add colon after 2 digits if we have more than 2
    if (numbers.length > 2) {
      return numbers.slice(0, 2) + ':' + numbers.slice(2);
    }
    
    return numbers;
  };

  const handleTimeChange = (field: 'departureTime' | 'deliveryTime' | 'transitTime', value: string) => {
    const formattedValue = formatTimeInput(value);
    
    switch (field) {
      case 'departureTime':
        setDepartureTime(formattedValue);
        break;
      case 'deliveryTime':
        setDeliveryTime(formattedValue);
        break;
      case 'transitTime':
        console.log('Setting transit time:', formattedValue);
        setTransitTime(formattedValue);
        const [hours, minutes] = formattedValue.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const totalMinutes = hours * 60 + minutes;
          if (totalMinutes >= 0 && totalMinutes <= 24 * 60) {
            console.log('Setting transit minutes:', totalMinutes);
            setTransitTimeMinutes(totalMinutes);
          }
        }
        break;
    }
  };

  const handleTransitTimeChange = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    console.log('Slider changed:', { minutes, hours, mins });
    setTransitTimeMinutes(minutes);
    const newTransitTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    console.log('Setting new transit time:', newTransitTime);
    setTransitTime(newTransitTime);
  };

  const formatDateInput = (value: string): string => {
    // Remove all non-digits
    let numbers = value.replace(/\D/g, '');
    
    // Limit to 8 digits
    numbers = numbers.slice(0, 8);
    
    // Validate day
    if (numbers.length >= 2) {
      const day = parseInt(numbers.slice(0, 2));
      if (day > 31) {
        numbers = '31' + numbers.slice(2);
      } else if (day === 0) {
        numbers = '01' + numbers.slice(2);
      }
    }
    
    // Validate month
    if (numbers.length >= 4) {
      const month = parseInt(numbers.slice(2, 4));
      if (month > 12) {
        numbers = numbers.slice(0, 2) + '12' + numbers.slice(4);
      } else if (month === 0) {
        numbers = numbers.slice(0, 2) + '01' + numbers.slice(4);
      }
    }
    
    // Add dots
    if (numbers.length > 4) {
      return numbers.slice(0, 2) + '.' + numbers.slice(2, 4) + '.' + numbers.slice(4);
    } else if (numbers.length > 2) {
      return numbers.slice(0, 2) + '.' + numbers.slice(2);
    }
    
    return numbers;
  };

  const handleDateChange = (field: 'departureDate' | 'deliveryDate', value: string) => {
    const formattedValue = formatDateInput(value);
    
    if (field === 'departureDate') {
      setDepartureDate(formattedValue);
    } else {
      setDeliveryDate(formattedValue);
    }
  };

  const calculateTimeDifference = (depTime: string, depDate: string, delTime: string, delDate: string): number | null => {
    if (!depTime || !depDate || !delTime || !delDate) return null;

    const [depHours, depMinutes] = depTime.split(':').map(Number);
    const [delHours, delMinutes] = delTime.split(':').map(Number);
    const [depDay, depMonth, depYear] = depDate.split('.').map(Number);
    const [delDay, delMonth, delYear] = delDate.split('.').map(Number);

    if (isNaN(depHours) || isNaN(depMinutes) || isNaN(delHours) || isNaN(delMinutes) ||
        isNaN(depDay) || isNaN(depMonth) || isNaN(depYear) || 
        isNaN(delDay) || isNaN(delMonth) || isNaN(delYear)) {
      return null;
    }

    const depDateTime = new Date(depYear, depMonth - 1, depDay, depHours, depMinutes);
    const delDateTime = new Date(delYear, delMonth - 1, delDay, delHours, delMinutes);

    if (depDateTime.toString() === 'Invalid Date' || delDateTime.toString() === 'Invalid Date') {
      return null;
    }

    const diffMinutes = Math.floor((delDateTime.getTime() - depDateTime.getTime()) / (1000 * 60));
    return diffMinutes >= 0 ? diffMinutes : null;
  };

  const handleSave = () => {
    const parseDate = (dateStr: string): Date | null => {
      const [day, month, year] = dateStr.split('.').map(Number);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month - 1, day);
        if (date.toString() !== 'Invalid Date') {
          return date;
        }
      }
      return null;
    };

    const depDate = parseDate(departureDate);
    const delDate = parseDate(deliveryDate);

    if (depDate && delDate && departureTime && deliveryTime) {
      // Create full date objects for comparison
      const depDateTime = new Date(depDate);
      const [depHours, depMinutes] = departureTime.match(/\d{2}/g)?.map(Number) || [0, 0];
      depDateTime.setHours(depHours, depMinutes);

      const delDateTime = new Date(delDate);
      const [delHours, delMinutes] = deliveryTime.match(/\d{2}/g)?.map(Number) || [0, 0];
      delDateTime.setHours(delHours, delMinutes);

      // Validate delivery time is after departure time
      if (delDateTime <= depDateTime) {
        // Show error to user
        Alert.alert(
          "Invalid Time Selection",
          "Delivery time must be after departure time",
          [{ text: "OK" }]
        );
        return;
      }

      // If transit time input has a value, use it
      // Otherwise calculate from departure/delivery difference
      let finalTransitMinutes: number | null = null;
      
      if (transitTime.trim()) {
        // Use manually set transit time
        finalTransitMinutes = transitTimeMinutes;
        console.log('Using manual transit time:', {
          transitTime,
          transitTimeMinutes,
          finalTransitMinutes
        });
      } else {
        // Calculate from difference
        finalTransitMinutes = calculateTimeDifference(
          departureTime,
          departureDate,
          deliveryTime,
          deliveryDate
        );
        console.log('Using calculated transit time:', {
          finalTransitMinutes
        });
      }

      // Ensure transit time is valid
      if (finalTransitMinutes !== null && (finalTransitMinutes < 0 || finalTransitMinutes > 24 * 60)) {
        console.warn('Invalid transit time minutes:', finalTransitMinutes);
        finalTransitMinutes = Math.min(Math.max(0, finalTransitMinutes), 24 * 60);
      }

      const result = {
        departureDate: depDate,
        departureTime: departureTime.replace(':', ''),
        deliveryDate: delDate,
        deliveryTime: deliveryTime.replace(':', ''),
        transitTimeMinutes: finalTransitMinutes,
        hasManualTransitTime: transitTime.trim().length > 0,
        transitTimeFormatted: transitTime.trim() || null // Add formatted time string for debugging
      };

      console.log('Final save values:', result);

      deliveryStore.setCallbackResult(route.params.onSaveKey, result);
      navigation.goBack();
    }
  };

  const canSave = departureDate.length > 0 && departureTime.length > 0 && 
                 deliveryDate.length > 0 && deliveryTime.length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              Отправка и доставка
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleSave}
            style={[
              styles.saveButton,
              { backgroundColor: canSave ? '#ABC7FF' : '#666666' }
            ]}
          >
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>ОТПРАВКА</Text>
          <View style={styles.row}>
            <TextInput
              mode="outlined"
              label="Дата"
              value={departureDate}
              onChangeText={(text) => handleDateChange('departureDate', text)}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              keyboardType="numeric"
              maxLength={10}
              placeholder="DD.MM.YYYY"
              theme={{
                colors: {
                  primary: '#0A84FF',
                  onSurfaceVariant: '#666666',
                  placeholder: '#666666',
                }
              }}
            />
            <TextInput
              mode="outlined"
              label="Время"
              value={departureTime}
              onChangeText={(text) => handleTimeChange('departureTime', text)}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              maxLength={5}
              keyboardType="numeric"
              placeholder="HH:MM"
              theme={{
                colors: {
                  primary: '#0A84FF',
                  onSurfaceVariant: '#666666',
                  placeholder: '#666666',
                }
              }}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ДОСТАВКА</Text>
          <View style={styles.row}>
            <TextInput
              mode="outlined"
              label="Дата"
              value={deliveryDate}
              onChangeText={(text) => handleDateChange('deliveryDate', text)}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              keyboardType="numeric"
              maxLength={10}
              placeholder="DD.MM.YYYY"
              theme={{
                colors: {
                  primary: '#0A84FF',
                  onSurfaceVariant: '#666666',
                  placeholder: '#666666',
                }
              }}
            />
            <TextInput
              mode="outlined"
              label="Время"
              value={deliveryTime}
              onChangeText={(text) => handleTimeChange('deliveryTime', text)}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              maxLength={5}
              keyboardType="numeric"
              placeholder="HH:MM"
              theme={{
                colors: {
                  primary: '#0A84FF',
                  onSurfaceVariant: '#666666',
                  placeholder: '#666666',
                }
              }}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ВРЕМЯ В ПУТИ</Text>
          <View style={styles.transitTimeContainer}>
            <View style={styles.row}>
              <TextInput
                mode="outlined"
                label="Время"
                value={transitTime}
                onChangeText={(text) => handleTimeChange('transitTime', text)}
                style={[styles.input]}
                outlineStyle={styles.inputOutline}
                contentStyle={styles.inputContent}
                keyboardType="numeric"
                maxLength={5}
                placeholder="HH:MM"
                theme={{
                  colors: {
                    primary: '#0A84FF',
                    onSurfaceVariant: '#666666',
                    placeholder: '#666666',
                  }
                }}
              />
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                value={transitTimeMinutes}
                onValueChange={handleTransitTimeChange}
                minimumValue={0}
                maximumValue={24 * 60}
                step={1}
                style={styles.slider}
                minimumTrackTintColor="#0A84FF"
                maximumTrackTintColor="#333333"
                thumbTintColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 20,
    marginTop: 20,
    height: 140,
  },
  backButton: {
    marginLeft: -8,
    width: 50,
    height: 50,
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    minHeight: 44,
  },
  saveButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 8,
    borderWidth: 1,
  },
  inputContent: {
    backgroundColor: 'transparent',
  },
  transitTimeContainer: {
    marginTop: 8,
  },
  sliderContainer: {
    paddingVertical: 16,
  },
  slider: {
    height: 40,
  },
});

export default SelectTimeScreen; 