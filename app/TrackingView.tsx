import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';
import * as Icons from 'react-native-heroicons/outline';
import { Title, Chip, Button, Paragraph, Divider, ProgressBar, MD3Colors, Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import for safe area insets
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import * as Clipboard from 'expo-clipboard';
import { getLocales, getCalendars } from 'expo-localization';

import { View, StyleSheet, Text, ActivityIndicator, Image, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Animated, ScrollView, SafeAreaView } from 'react-native';
;


const TrackingView = (params: any) => {
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState(0);
  const trackingNumber = (route.params as { trackingNumber?: string; name?: string })?.trackingNumber ?? '';
  const name = (route.params as { name?: string }).name ?? '';
  const [errorMessage, seterrorMessage] = useState('');
  const [visible, setVisible] = React.useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editLanguage, setEditLanguage] = useState(i18n.locale);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [carriers, setCarriers] = useState([]);

  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);

  // ... (Other state variables if needed)

  // ... (fetchCarriers function from your code)

  const TrackingNumberExist = async (trackingNumber: string) => {
    const storedOrders = await AsyncStorage.getItem('orders');
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    const orderIndex = orders.findIndex((o: { trackingNumber: string; }) => o.trackingNumber === trackingNumber);

    if (orderIndex !== -1) {
      return true;
    } else {
      return false;
    }
  };

  const fetchTrackingData = async (trackingNumber: string) => {
    try {
      const response = await axios.get('https://apidev.vanilla.digital/public/tracking/data', {
        params: {
          trackingNumber: trackingNumber,
          lang: i18n.locale,
          timezone: getCalendars()[0].timeZone,
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
      throw error;
    }
  };

  useEffect(() => {
    let interval_delivery: any;
    const fetchData = async () => {
      if (!trackingNumber) return;
      setIsLoading(true);
      try {
        const response = await fetchTrackingData(trackingNumber);
        if (response && response.data) {
          const data = response.data;
          setTrackingData(data);

          if (data.carriers.length === 0) {
            setProgressValue(1);
            seterrorMessage('Tracking number not found');
          } else {
            const newPackage = {
              trackingNumber: trackingNumber,
              label: name,
              forcedCarrier: selectedCarrier,
              data: null,
            };

            try {
              if (await TrackingNumberExist(newPackage.trackingNumber)) {
                console.log('Package already exist in local database');
              } else {
                const existingOrders = await AsyncStorage.getItem('orders');
                let orders = existingOrders ? JSON.parse(existingOrders) : [];
                orders.push(newPackage);
                await AsyncStorage.setItem('orders', JSON.stringify(orders));
                console.log('Package added to local database:', newPackage);
              }
            } catch (error) {
              console.error('Error storing package:', error);
            }
            interval_delivery = setInterval(() => {
              try {
                const shippingDate = moment(data.transit.shippingDate);
                const estimatedDeliveryDate = moment(data.forecast.estimatedDeliveryDateMax);
                const timeDifference = estimatedDeliveryDate.diff(shippingDate, 'days');
                const progress = timeDifference > 0 ? (moment().diff(shippingDate, 'days') / timeDifference) : 1;
                setDeliveryDate(progress);
              } catch (intervalError) {
                console.error('Error calculating delivery date:', intervalError);
              } finally {
                clearInterval(interval_delivery);
              }
            }, 20);
          }
        }
      } catch (error) {
        console.error('Error fetching tracking data:', error);
        seterrorMessage('Error fetching tracking data');
      } finally {
        setTimeout(() => {
          clearInterval(interval_delivery);
        }, 2000);
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      clearInterval(interval_delivery);
    };
  }, [trackingNumber]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get('https://apidev.vanilla.digital/public/tracking/data', {
        params: {
          trackingNumber: trackingNumber,
          lang: i18n.locale,
          timezone: getCalendars()[0].timeZone,
          //forceCarriers: selectedCarrier 
        },
      });
      setTrackingData(response.data);
    } catch (error) {
      console.error('Error refreshing tracking data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderStep = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.stepItem} key={item.humanReadableTime}>
      <Text style={styles.stepText}>{item.humanReadableStatus}</Text>
      <Text style={{
        fontSize: 12,
        color: 'gray',
        marginBottom: 5,
        fontWeight: 'bold'
      }}>{item.humanReadableTime} - {item.carrier.name}</Text>
      {item.lines.length > 0 && (
          <FlatList
            data={item.lines}
            renderItem={({ item, index }) => (
              <Text key={item.lineOriginal+index} style={styles.stepDate}>{item.lineOriginal}</Text>
            )}
            keyExtractor={(item, index) => item.lineOriginal + index.toString()}
          />
        )}
    </View>
  );
  const handleCopy = async () => {
    try {
      await Clipboard.setString(trackingNumber ?? '');
      onToggleSnackBar();
    } catch (error) {
      console.error('Error copying tracking number:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await AsyncStorage.removeItem('packages');
      await AsyncStorage.removeItem('orders');

      navigation.goBack();
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(name);
    setEditLanguage(i18n.locale);
  };

  const handleSaveEdit = async () => {
    try {
      const storedPackages = await AsyncStorage.getItem('packages');
      const packages = storedPackages ? JSON.parse(storedPackages) : [];
      const packageIndex = packages.findIndex((p: { trackingNumber: string | undefined; }) => p.trackingNumber === trackingNumber);

      if (packageIndex !== -1) {
        packages[packageIndex].label = editName;
        packages[packageIndex].forcedCarrier = selectedCarrier;
        await AsyncStorage.setItem('packages', JSON.stringify(packages));
      }

      const storedOrders = await AsyncStorage.getItem('orders');
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      const orderIndex = orders.findIndex((o: { trackingNumber: string | undefined; }) => o.trackingNumber === trackingNumber);

      if (orderIndex !== -1) {
        orders[orderIndex].label = editName;
        orders[orderIndex].forcedCarrier = selectedCarrier;
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
      }

      setIsEditing(false);
      handleRefresh();
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  if (errorMessage.length > 0) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingBottom: insets.bottom,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

      }}>
        <StatusBar style="auto" />
        <Text style={{
          marginLeft: 20,
          fontSize: 16,
          color: MD3Colors.neutral10,
          marginBottom: 10,
          fontWeight: 'bold',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }} >{errorMessage}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Icons.BackwardIcon size={24} color='black' />
          <Text style={{
            marginLeft: 10,
            fontSize: 16,
            color: MD3Colors.neutral10,
            fontWeight: 'bold',
          }} >Go back</Text>
        </TouchableOpacity>
      </View>
    );
  } else {

    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <StatusBar style="auto" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.BackwardIcon size={24} color='black' />
          </TouchableOpacity>

          <Text style={styles.trackingTitle}>
            {isEditing ? (
              <TextInput
                style={styles.trackingTitleInput}
                value={editName}
                onChangeText={setEditName}
              />
            ) : (
              name ? name : trackingNumber
            )}
          </Text>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <TouchableOpacity onPress={handleEdit} style={{
              marginRight: 10,
            }}>

              <Icons.PencilIcon size={24} color='black' />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Icons.TrashIcon size={24} color='black' />
            </TouchableOpacity>
          </View>
        </View>
        {isLoading || refreshing ? (
          <View style={styles.loader}>
            <Text style={{
              marginLeft: 20,
              fontSize: 16,
              color: MD3Colors.neutral10,
              marginBottom: 10,
              fontWeight: 'bold',
            }} >Loading...</Text>
            <ProgressBar progress={progressValue} color={MD3Colors.neutral10} />
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            <View>
              <Text style={{
                marginLeft: 20,
                fontSize: 14,
                color: 'gray',
                marginTop: 20,
                fontWeight: 'semibold',
              }} >Estimated delivery date</Text>
              <Text style={{
                marginLeft: 20,
                fontSize: 20,
                color: MD3Colors.neutral10,
                marginBottom: 10,
                fontWeight: 'bold',
              }} >{
                  trackingData?.status.label}</Text>
            </View>
            <ProgressBar progress={deliveryDate} color={MD3Colors.neutral10} style={{
              marginLeft: 20,
              marginRight: 20,
              marginBottom: 5,

            }} />
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }} >
              <Text style={{
                marginLeft: 20,
                fontSize: 14,
                color: MD3Colors.neutral10,
                marginTop: 10,
                fontWeight: 'bold',
              }} >{trackingData?.status.sublabel}</Text>
              <TouchableOpacity onPress={handleCopy}>
                <Icons.DocumentDuplicateIcon size={26} color='black' style={{ marginRight: 10, marginTop: 14 }} />
              </TouchableOpacity>
            </View>
            <View style={{
              borderStyle: 'solid',
              borderWidth: 0.5,
              borderColor: 'gray',
              marginTop: 20,
            }} />
            {trackingData?.steps?.length > 0 && (
              <View style={styles.trackingSteps}>
                <Text style={styles.stepsTitle}>Tracking History</Text>
                <FlatList
                  data={trackingData.steps}
                  renderItem={renderStep}
                  keyExtractor={(item) => item.dateHumanReadable}
                />
              </View>
            )}
          </View>
        )}
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}>
          Tracking number copied to clipboard!
        </Snackbar>
        {isEditing && (
          <EditOrderModal
            visible={isEditing}
            onClose={() => setIsEditing(false)}
            onSave={handleSaveEdit}
            name={editName}
            language={editLanguage}
            selectedCarrier={selectedCarrier}
            carriers={carriers}
            setSelectedCarrier={setSelectedCarrier}
            trackingNumber={trackingNumber}
          />
        )}
      </View>
    );
  }
};

const EditOrderModal = ({ visible, onClose, onSave, name, language, selectedCarrier, carriers, setSelectedCarrier, trackingNumber }: {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  name: string;
  language: string;
  selectedCarrier: string;
  carriers: any[];
  setSelectedCarrier: React.Dispatch<React.SetStateAction<string>>;
  trackingNumber: string;
}) => {
  const [modalHeight] = useState(new Animated.Value(0));
  const [editName, setEditName] = useState(name);
  const [editLanguage, setEditLanguage] = useState(language);

  useEffect(() => {
    if (visible) {
      Animated.timing(modalHeight, {
        toValue: 400,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(modalHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalContainer, { height: modalHeight }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome5 name="times" size={24} color="#3498db" />
        </TouchableOpacity>
        <View style={styles.modalContent}>
          <Title style={styles.modalTitle}>{trackingNumber} - Edit</Title>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder={i18n.t('nameOptional')}
            />
          </View>

          <Picker
            selectedValue={editLanguage}
            onValueChange={setEditLanguage}
            style={styles.languagePicker}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Français" value="fr" />
          </Picker>

          <Picker
            selectedValue={selectedCarrier}
            onValueChange={(itemValue, itemIndex) => setSelectedCarrier(itemValue)}
            style={styles.carrierPicker}
          >
            <Picker.Item label={'select Carrier'} value="" />
            {carriers.map((carrier) => (
              <Picker.Item key={carrier} label={carrier} value={carrier} />
            ))}
          </Picker>

          <TouchableOpacity onPress={onSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  trackingTitleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    flex: 1, // Allow the input to fill the available space
    marginLeft: 10,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  modalContent: {
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
  },
  clearButton: {
    marginLeft: 10,
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 5,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  autoDetectIcon: {
    marginRight: 10,
  },
  autoDetectText: {
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',

  },
  disabledButton: {
    backgroundColor: 'lightgray',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  carrierPicker: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    height: 50,
  },
  languagePicker: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    height: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: 'lightgray',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  trackingInfo: {
    marginLeft: 10,
  },
  trackingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trackingCarrier: {
    fontSize: 16,
    marginBottom: 5,
    color: 'gray',
  },
  trackingStatus: {
    fontSize: 16,
    marginBottom: 5,
    color: '#4285F4',
  },
  trackingDelivery: {
    fontSize: 14,
    color: 'gray',
  },
  carrierIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  loader: {
    marginTop: 20,
  },
  trackingSteps: {
    padding: 20,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stepItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'lightgray',
  },
  stepText: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  stepDate: {
    fontSize: 12,
    color: 'gray',
  },
  copyButton: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  deleteButton: {
    marginTop: 10,
    marginHorizontal: 20,
  },
  scrollViewContent: {
    padding: 5,
  },
  progressBarContainer: {
    padding: 20,
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
  },
});

export default TrackingView;