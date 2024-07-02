
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Image, FlatList, TouchableOpacity, RefreshControl, TextInput, Animated, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';
import * as Icons from 'react-native-heroicons/outline';
import { Title, Chip, Searchbar } from 'react-native-paper';
import TrackingModal from '../components/TrackingModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import StarterView from './starterView';
import { getLocales, getCalendars } from 'expo-localization';
import { useRouter } from 'expo-router';

const HomeView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ordersData, setOrdersData] = useState([] as any)
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalHeight] = useState(new Animated.Value(0));
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('All Shipments');




  const filteredOrders = () => {
    const filtered = searchTerm
      ? ordersData.filter(
        (item: any) =>
          item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : ordersData;

    if (selectedTab === 'All Shipments') {
      return ordersData;
    } else {
      return filtered.filter((item: any) => item.status === selectedTab);
    }
  };


  const fetchTrackingData = async (trackingNumber: any) => {
    try {
      const response = await axios.get('https://apidev.vanilla.digital/public/tracking/data', {
        params: {
          trackingNumber: trackingNumber,
          lang: i18n.locale,
          timezone: getCalendars()[0].timeZone,
        },
      });
      if (response.data.status.code === 'unknown') {
        return null;
      }
      return response.data;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const storedOrders = await AsyncStorage.getItem('orders');
        const initialData = storedOrders ? JSON.parse(storedOrders) : [];

        const updatedOrders = await Promise.all(
          initialData.map(async (order: any) => {
            const trackingData = await fetchTrackingData(order.trackingNumber);

            if (!trackingData) {
              return {
                ...order,
                status: 'unknown',
                sublabel: 'Unknown',
                estimatedDeliveryDate: 'Unknown',
                carrier: 'Unknown',
                carrier_slug: 'Unknown',
                icon_path: `../assets/carriers-icons/unknown.webp`
              };
            } else {
              return {
                ...order,
                status: trackingData.status.code,
                sublabel: trackingData.status.sublabel,
                estimatedDeliveryDate: trackingData.forecast.estimatedDeliveryDateMaxHumanReadable,
                carrier: trackingData.steps[0].carrier.name,
                carrier_slug: trackingData.steps[0].carrier.slug,
                icon_path: `../assets/carriers-icons/${trackingData.steps[0].carrier.slug}.webp`
              };
            }
          })
        );
        setOrdersData(updatedOrders);
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const updatedOrders = await Promise.all(
        ordersData.map(async (order: any) => {
          const trackingData = await fetchTrackingData(order.trackingNumber);

          return {
            ...order,
            status: trackingData.status.code,
            sublabel: trackingData.status.sublabel,
            estimatedDeliveryDate: trackingData.forecast.estimatedDeliveryDateMaxHumanReadable,
            carrier: trackingData.steps[0].carrier.name,
            carrier_slug: trackingData.steps[0].carrier.slug,
            icon_path: `../assets/carriers-icons/${trackingData.steps[0].carrier.slug}.webp`
          };
        })
      );
      setOrdersData(updatedOrders);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const statusCount = (status: any) => {

    if (status === 'All Shipments') {
      return ordersData.length;
    }
    else {
      return ordersData.filter((item: any) => item.status === status).length;
    }
  }



  const openModal = () => {
    setShowModal(true);
    Animated.timing(modalHeight, {
      toValue: 400,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowModal(false);
    });
  };

  if (isLoading || refreshing) {
    return <ActivityIndicator size="large" style={styles.container} />;
  }

  const tabs = ['All Shipments', 'transit', 'delivered', 'unknown']

  if (ordersData && ordersData.length > 0) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <TrackingModal visible={showModal} onClose={closeModal} onContinue={closeModal} />
        <View style={styles.dashedBorder}>
          <View style={styles.searchBarContainer}>
            <Icons.MagnifyingGlassIcon size={24} color="gray" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder={'Search'}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <StatusBar style="auto" />

          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              {tabs.map((tab) => (

                <Chip
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  selectedColor='blue'

                  selected={selectedTab === tab}
                  style={{
                    backgroundColor: selectedTab === tab ? 'lightgray' : 'white',

                    borderWidth: 1,
                    borderColor: selectedTab === tab ? 'lightgray' : 'white',
                    marginRight: 10,

                  }}>{tab} ({statusCount(tab)})
                </Chip>
              ))}
            </ScrollView>
          </View>

          {isLoading || refreshing || !ordersData ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <FlatList
              data={filteredOrders()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                 
                  router.push({pathname : "/TrackingView" , params : {name :  item.label,trackingNumber: item.trackingNumber}})
                }}
                  key={item.trackingNumber}
                >
                  <View style={{
                    ...styles.packageItem,
                    borderColor: item.status === 'transit' ? '#4285F4' : item.status === 'delivered' ? '#4CAF50' : '#FFC107',
                    width: '100%'
                  }}>
                    {item.carrier_slug && (
                      <Image
                        source={item.icon_path}
                        style={styles.carrierIcon}
                      />
                    )}

                    <View style={styles.packageContent}>
                      {item.label ? (
                        <Text style={styles.packageTitle}>{item.label}</Text>
                      ) : (
                        <Text style={styles.packageTitle}>{item.trackingNumber}</Text>
                      )}
                      <Text style={styles.packageTracking}>{item.trackingNumber} - {item.carrier}</Text>
                      <Text style={styles.packageStatus}>{item.sublabel}</Text>
                      <Text style={styles.packageDelivery}>
                        Estimated delivery date
                        : {item.estimatedDeliveryDate}
                      </Text>
                    </View>
                    <View style={styles.packageStatusButton}>
                      {item.status === 'transit' && (
                        <View style={[styles.statusButton, { backgroundColor: '#4285F4' }]}>
                          <Text style={styles.statusButtonText}>In transit</Text>
                        </View>
                      )}
                      {item.status === 'delivered' && (
                        <View style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}>
                          <Text style={styles.statusButtonText}>Delivered</Text>
                        </View>
                      )}
                      {item.status === 'unknown' && (
                        <View style={[styles.statusButton, { backgroundColor: '#FFC107' }]}>
                          <Text style={styles.statusButtonText}>Unknown</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.trackingNumber}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListEmptyComponent={() => (
                <View style={{
                  ...styles.emptyContainer,
                  marginTop: 20,
                }}>
                  <Text style={styles.emptyText}>No packages found</Text>
                </View>
              )}
            />
          )}

        </View>

        <TouchableOpacity onPress={openModal} style={styles.floatingButton}>
          <Icons.PlusIcon size={32} color="white" />
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <StarterView />
    );
  }
};

const styles = StyleSheet.create({
  carrierIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  packageItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  packageContent: {
    flex: 1,
  },
  packageStatusButton: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  packageTracking: {
    fontSize: 14,
    marginBottom: 5,
    color: 'gray',
  },
  packageStatus: {
    fontSize: 14,
    marginBottom: 5,
    color: '#4285F4', // Default color for in-transit status
  },
  packageDelivery: {
    fontSize: 14,
    color: 'gray',
  },
  statusButton: {
    padding: 8,
    borderRadius: 10,
  },
  statusButtonText: {
    fontSize: 12,
    color: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  tabButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'lightgray',
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  selectedTab: {
    backgroundColor: 'blue',
    borderWidth: 1,
    borderColor: 'blue',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cccccc',
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
  },
  searchBar: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  dashedBorder: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(161, 155, 183, 1)',
    padding: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  Title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 22,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  packageInfo: {
    flex: 1,
  },
  packageActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  packageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 50,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default HomeView;