import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import { useTheme, Text } from 'react-native-paper';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface LocationObject {
  address: string;
  [key: string]: any;
}

// Helper function to parse coordinates from location string
const parseCoordinates = (location: string | LocationObject | null | undefined) => {
  // Return null if location is undefined or null
  if (!location) {
    return null;
  }

  // If it's an object with address property (old format)
  if (typeof location === 'object' && 'address' in location) {
    location = location.address;
  }

  // If not a string at this point, return null
  if (typeof location !== 'string') {
    return null;
  }

  const match = location.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2])
    };
  }
  return null;
};

const MapScreenContent: React.FC = observer(() => {
  console.log('[MapScreen] Rendering MapScreen');
  const { deliveryStore } = useStore();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Карта</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 55.7558,
            longitude: 37.6173,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {deliveryStore.deliveries.flatMap((delivery) => {
            console.log('[MapScreen] Processing delivery locations:', {
              fromLocation: delivery.fromLocation,
              toLocation: delivery.toLocation
            });
            
            const fromCoords = parseCoordinates(delivery.fromLocation);
            const toCoords = parseCoordinates(delivery.toLocation);
            
            const markers = [];
            
            if (fromCoords) {
              markers.push(
                <Marker
                  key={`${delivery.id}-from`}
                  coordinate={fromCoords}
                  title="Откуда"
                  description={typeof delivery.fromLocation === 'string' ? delivery.fromLocation : ''}
                  pinColor={theme.colors.primary}
                />
              );
            }
            
            if (toCoords) {
              markers.push(
                <Marker
                  key={`${delivery.id}-to`}
                  coordinate={toCoords}
                  title="Куда"
                  description={typeof delivery.toLocation === 'string' ? delivery.toLocation : ''}
                  pinColor={theme.colors.secondary}
                />
              );
            }
            
            return markers;
          })}
        </MapView>
      </View>
    </View>
  );
});

const MapScreen: React.FC = () => {
  return (
    <ErrorBoundary>
      <MapScreenContent />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen; 