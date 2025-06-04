import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Address'>;
type RouteProps = RouteProp<RootStackParamList, 'Address'>;

const initialRegion = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const AddressScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { deliveryStore } = useStore();
  const mapRef = useRef<MapView>(null);

  // Initial states
  const initialDistance = route.params?.distance ?? 0;
  const [fromLocation, setFromLocation] = useState(route.params?.fromLocation || '');
  const [toLocation, setToLocation] = useState(route.params?.toLocation || '');
  const [distance, setDistance] = useState<number>(initialDistance);
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);

  // Map markers state
  const [fromMarker, setFromMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [toMarker, setToMarker] = useState<{ latitude: number; longitude: number } | null>(null);

  // Log initial values
  React.useEffect(() => {
    console.log('AddressScreen - Initial values:', {
      fromLocation: route.params?.fromLocation,
      toLocation: route.params?.toLocation,
      distance: route.params?.distance
    });
  }, []);

  // Try to parse coordinates from location string
  const parseCoordinates = (locationString: string) => {
    if (!locationString) return null;
    const match = locationString.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2])
      };
    }
    return null;
  };

  // Update markers when locations change
  React.useEffect(() => {
    const fromCoords = parseCoordinates(fromLocation);
    if (fromCoords) {
      setFromMarker(fromCoords);
    }

    const toCoords = parseCoordinates(toLocation);
    if (toCoords) {
      setToMarker(toCoords);
    }
  }, [fromLocation, toLocation]);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const coordString = `(${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
    
    if (isSelectingFrom) {
      setFromLocation(coordString);
      setFromMarker({ latitude, longitude });
    } else {
      setToLocation(coordString);
      setToMarker({ latitude, longitude });
    }

    // Calculate distance if both points are set
    if (fromMarker && !isSelectingFrom || toMarker && isSelectingFrom) {
      const otherMarker = isSelectingFrom ? toMarker : fromMarker;
      if (otherMarker) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (latitude - otherMarker.latitude) * Math.PI / 180;
        const dLon = (longitude - otherMarker.longitude) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(otherMarker.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        setDistance(Math.round(R * c * 10) / 10);
      }
    }
  };

  const handleSave = () => {
    if (route.params?.onSaveKey && fromLocation && toLocation) {
      console.log('AddressScreen - Saving values:', {
        fromLocation,
        toLocation,
        distance
      });
      deliveryStore.setCallbackResult(route.params.onSaveKey, {
        fromLocation,
        toLocation,
        distance
      });
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {fromMarker && (
          <Marker
            coordinate={fromMarker}
            title="Откуда"
            pinColor={theme.colors.primary}
          />
        )}
        {toMarker && (
          <Marker
            coordinate={toMarker}
            title="Куда"
            pinColor={theme.colors.secondary}
          />
        )}
      </MapView>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formContainer}>
          <TextInput
            mode="outlined"
            label="Откуда"
            value={fromLocation}
            onChangeText={setFromLocation}
            onFocus={() => setIsSelectingFrom(true)}
            style={styles.input}
            contentStyle={styles.inputContent}
            outlineStyle={styles.outline}
            theme={{
              colors: {
                background: 'transparent',
                text: '#CCCCCC',
                primary: '#334155',
                onSurfaceVariant: '#666666',
                placeholder: '#666666',
              },
            }}
          />

          <TextInput
            mode="outlined"
            label="Куда"
            value={toLocation}
            onChangeText={setToLocation}
            onFocus={() => setIsSelectingFrom(false)}
            style={styles.input}
            contentStyle={styles.inputContent}
            outlineStyle={styles.outline}
            theme={{
              colors: {
                background: 'transparent',
                text: '#CCCCCC',
                primary: '#334155',
                onSurfaceVariant: '#666666',
                placeholder: '#666666',
              },
            }}
          />

          <TextInput
            mode="outlined"
            label="Дистанция"
            value={distance.toString()}
            onChangeText={(text) => {
              const numValue = parseFloat(text.replace(/[^0-9.]/g, ''));
              if (!isNaN(numValue)) {
                setDistance(numValue);
              }
            }}
            style={styles.input}
            contentStyle={styles.inputContent}
            outlineStyle={styles.outline}
            keyboardType="numeric"
            right={<TextInput.Affix text="км" textStyle={{ color: '#666666' }} />}
            theme={{
              colors: {
                background: 'transparent',
                text: '#CCCCCC',
                primary: '#334155',
                onSurfaceVariant: '#666666',
                placeholder: '#666666',
              },
            }}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!fromLocation || !toLocation || distance <= 0}
            style={[
              styles.button,
              {
                backgroundColor: fromLocation && toLocation && distance > 0 ? '#ABC7FF' : '#323337',
                borderRadius: 25
              }
            ]}
            labelStyle={{
              color: fromLocation && toLocation && distance > 0 ? '#002F66' : '#6D6E72'
            }}
          >
            Применить
          </Button>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  map: {
    height: '40%',
  },
  formContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1E293B',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
  },
  inputContent: {
    backgroundColor: 'transparent',
    color: '#CCCCCC',
    fontSize: 16,
    height: 48,
  },
  outline: {
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#1E293B',
  },
  button: {
    marginTop: 8,
    height: 50,
    justifyContent: 'center',
  },
});

export default AddressScreen; 