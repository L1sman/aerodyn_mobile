import React, { useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, TouchableWithoutFeedback, ScrollView, Platform } from 'react-native';
import { Text, FAB, useTheme, IconButton, Button, Menu, ActivityIndicator, Searchbar, MD3Theme } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Delivery } from '../types/delivery';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DeliveryCard } from '../components/DeliveryCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DeliveriesScreenContent: React.FC = observer(() => {
  console.log('[DeliveriesScreen] Rendering DeliveriesScreen');
  const { deliveryStore } = useStore();
  const theme = useTheme<MD3Theme>();
  const navigation = useNavigation<NavigationProp>();
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [timeMenuVisible, setTimeMenuVisible] = useState(false);
  const [distanceMenuVisible, setDistanceMenuVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('Все время пути');
  const [selectedDistance, setSelectedDistance] = useState('Все дистанции');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Force re-render when deliveries change
  React.useEffect(() => {
    console.log('[DeliveriesScreen] Deliveries updated:', deliveryStore.deliveries);
  }, [deliveryStore.deliveries]);

  const filteredDeliveries = React.useMemo(() => {
    console.log('[DeliveriesScreen] Recalculating filtered deliveries');
    let filtered = [...deliveryStore.deliveries].reverse();

    // Filter by search query (delivery number)
    if (searchQuery.trim()) {
      filtered = filtered.filter(delivery => 
        delivery.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by time
    if (selectedTime !== 'Все время пути') {
      const hours = parseInt(selectedTime.split(' ')[0]);
      filtered = filtered.filter(delivery => 
        delivery.duration <= hours * 60
      );
    }

    // Filter by distance
    if (selectedDistance !== 'Все дистанции') {
      const km = parseInt(selectedDistance.split(' ')[0]);
      filtered = filtered.filter(delivery => 
        delivery.distance <= km
      );
    }

    return filtered;
  }, [deliveryStore.deliveries, searchQuery, selectedTime, selectedDistance]);

  const handleDeliveryPress = (delivery: Delivery) => {
    navigation.navigate('EditDelivery', { deliveryId: delivery.id });
  };

  const timeOptions = [
    'Все время пути',
    '2 часа',
    '4 часа',
    '6 часов',
    '8 часов',
    '10 часов',
    '12 часов',
    '14 часов',
    '16 часов',
    '18 часов',
    '20 часов',
    '22 часа',
    '24 часа'
  ];

  const distanceOptions = [
    'Все дистанции',
    '5 км',
    '10 км',
    '25 км',
    '50 км',
    '100 км',
    '500 км',
    '1000 км'
  ];

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  if (deliveryStore.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

  // Log deliveries for debugging
  console.log('Current deliveries:', deliveryStore.deliveries);

  return (
    <TouchableWithoutFeedback onPress={handleSearchClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {isSearchActive ? (
            <View style={styles.searchHeader}>
              <Searchbar
                placeholder="Поиск"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.expandedSearchBar}
                inputStyle={{ color: '#FFFFFF' }}
                iconColor="#FFFFFF"
                placeholderTextColor="#666666"
                autoFocus
                onTouchStart={(e) => e.stopPropagation()}
                right={(props) => (
                  <IconButton
                    icon="close"
                    iconColor="#FFFFFF"
                    onPress={handleSearchClose}
                  />
                )}
              />
            </View>
          ) : (
            <View style={styles.header}>
              <Text style={styles.title}>Доставки</Text>
              <View style={styles.headerButtons}>
                <IconButton
                  icon={({ size, color }) => (
                    <Icon name="magnify" size={24} color="#FFFFFF" />
                  )}
                  onPress={() => setIsSearchActive(true)}
                />
                <IconButton
                  icon={({ size, color }) => (
                    <Icon name="filter-variant" size={24} color="#FFFFFF" />
                  )}
                  onPress={() => setIsFiltersVisible(!isFiltersVisible)}
                />
              </View>
            </View>
          )}

          {isFiltersVisible && !isSearchActive && (
            <View style={styles.filterContainer}>
              <View style={styles.filterWrapper}>
                <Menu
                  visible={timeMenuVisible}
                  onDismiss={() => setTimeMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setTimeMenuVisible(true)}
                      style={styles.filterButtonContainer}
                      contentStyle={styles.filterButton}
                      icon={({ size, color }) => (
                        <Icon name="clock-outline" size={20} color={color} />
                      )}
                      textColor={theme.colors.onSurface}
                    >
                      {selectedTime}
                    </Button>
                  }
                  style={[styles.menuStyle, { marginTop: 45 }]}
                  contentStyle={styles.menuContent}
                >
                  <ScrollView style={styles.menuScrollContent} showsVerticalScrollIndicator={true}>
                    {timeOptions.map((option) => (
                      <Menu.Item
                        key={option}
                        onPress={() => {
                          setSelectedTime(option);
                          setTimeMenuVisible(false);
                        }}
                        title={option}
                        style={styles.menuItem}
                        titleStyle={styles.menuItemText}
                      />
                    ))}
                  </ScrollView>
                </Menu>
              </View>

              <View style={styles.filterWrapper}>
                <Menu
                  visible={distanceMenuVisible}
                  onDismiss={() => setDistanceMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setDistanceMenuVisible(true)}
                      style={styles.filterButtonContainer}
                      contentStyle={styles.filterButton}
                      icon={({ size, color }) => (
                        <Icon name="map-marker-distance" size={20} color={color} />
                      )}
                      textColor={theme.colors.onSurface}
                    >
                      {selectedDistance}
                    </Button>
                  }
                  style={[styles.menuStyle, { marginTop: 45 }]}
                  contentStyle={styles.menuContent}
                >
                  <ScrollView style={styles.menuScrollContent} showsVerticalScrollIndicator={true}>
                    {distanceOptions.map((option) => (
                      <Menu.Item
                        key={option}
                        onPress={() => {
                          setSelectedDistance(option);
                          setDistanceMenuVisible(false);
                        }}
                        title={option}
                        style={styles.menuItem}
                        titleStyle={styles.menuItemText}
                      />
                    ))}
                  </ScrollView>
                </Menu>
              </View>
            </View>
          )}

          <FlatList
            data={filteredDeliveries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <DeliveryCard
                key={item.id}
                delivery={item}
                onPress={() => handleDeliveryPress(item)}
              />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim() || selectedTime !== 'Все время пути' || selectedDistance !== 'Все дистанции'
                    ? 'Нет доставок, соответствующих фильтрам'
                    : 'Нет доставок'}
                </Text>
              </View>
            )}
          />

          <FAB
            icon={({ size, color }) => (
              <Icon name="plus" size={size} color={color} />
            )}
            style={[styles.fab, { backgroundColor: '#ABC7FF' }]}
            onPress={() => navigation.navigate('CreateDelivery')}
            color="#002F66"
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
});

const DeliveriesScreen: React.FC = observer(() => {
  return (
    <ErrorBoundary>
      <DeliveriesScreenContent />
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1B1F',
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1B1F',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1B1F',
    marginTop: Platform.OS === 'android' ? 40 : 0,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1B1F',
    marginTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    zIndex: 1,
  },
  filterWrapper: {
    flex: 1,
    zIndex: 2,
  },
  filterButtonContainer: {
    borderColor: '#334155',
    borderRadius: 20,
    width: '100%',
    backgroundColor: 'rgba(38, 41, 49, 0.3)',
  },
  filterButton: {
    height: 40,
  },
  menuStyle: {
    marginTop: 4,
    maxWidth: '100%',
  },
  menuContent: {
    backgroundColor: '#1A1B1F',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    width: '100%',
    maxWidth: '100%',
  },
  menuScrollContent: {
    maxHeight: 192,
  },
  menuItem: {
    height: 48,
    justifyContent: 'center',
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  listContent: {
    padding: 8,
  },
  expandedSearchBar: {
    elevation: 0,
    borderRadius: 8,
    backgroundColor: 'rgba(38, 41, 49, 0.3)',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default DeliveriesScreen; 