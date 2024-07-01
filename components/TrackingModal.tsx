import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Animated, Image, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios'; // Import axios for API requests
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../app/i18n';
import { getLocales, getCalendars } from 'expo-localization';
import { Portal, Title } from 'react-native-paper';

const TrackingModal = ({ visible, onClose, onContinue }: { visible: boolean, onClose: () => void, onContinue: () => void }) => {
  const [modalHeight] = useState(new Animated.Value(0));
  const [trackingNumber, setTrackingNumber] = useState('');
  const [name, setName] = useState('');
  const [showCarriersModal, setShowCarriersModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [carriers, setCarriers] = useState([]); // List of carriers

  const [showError, setShowError] = useState(false);

  const navigation = useNavigation();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isCarrierModalVisible, setIsCarrierModalVisible] = useState(false);



  const [selectedCarrierLogo, setSelectedCarrierLogo] = useState('');
  
  useEffect(() => {
    if (selectedCarrier) {
      const logoPath = `../assets/carriers-icons/${selectedCarrier.toLowerCase().replace(' ', '-')}.webp`;
      setSelectedCarrierLogo(logoPath)
    }
  }, [selectedCarrier]);

  const handleLanguageChange = async (newLocale: string) => {
    try {
      i18n.locale = newLocale;
      setIsLanguageModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const response = await axios.get('https://apidev.vanilla.digital/public/carrier');
        setCarriers(response.data);
      } catch (error) {
        console.error('Error fetching carriers:', error);
      }
    };

    fetchCarriers();
  }, []);
  useEffect(() => {
    if (visible) {
      Animated.timing(modalHeight, {
        toValue: 570,
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

  const validateTrackingNumber = (value: any) => {
    const upperValue = value.toUpperCase();
    const isValid = /^[A-Z0-9-]{5,}$/.test(upperValue) && !upperValue.startsWith('-') && !upperValue.endsWith('-');
    return isValid
  };


  const handleContinue = async () => {


    if (!validateTrackingNumber(trackingNumber)) {
      setShowError(true);
      return;
    } else {
      setShowError(false);



      const newPackage = {
        trackingNumber: trackingNumber,
        label: name,
        forcedCarrier: selectedCarrier,
        data: null,
      };


      try {
        await AsyncStorage.setItem('packages', JSON.stringify(newPackage));
        console.log('Package added to local database:', newPackage);
      } catch (error) {
        console.error('Error storing package:', error);
      }

      try {
        const existingOrders = await AsyncStorage.getItem('orders');
        let orders = existingOrders ? JSON.parse(existingOrders) : [];
        orders.push(newPackage);
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
        console.log('Package added to local database:', newPackage);
      } catch (error) {
        console.error('Error storing package:', error);
      }

      navigation.navigate('TrackingView', {
        trackingNumber: trackingNumber,
        name: name,
      });

      try {
        const response = await axios.get('https://apidev.vanilla.digital/public/tracking/data', {
          params: {
            trackingNumber: trackingNumber,
            lang: i18n.locale,
            timezone: getCalendars()[0].timeZone,
            forceCarriers: selectedCarrier ? selectedCarrier : null,
          },
        });


        console.log('Tracking data:', response.data);
      } catch (error) {
        console.error('Error fetching tracking data:', error);
      }

      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalContainer, { height: modalHeight }]}>
        <TouchableOpacity onPress={onClose} style={{ alignItems: 'flex-start', marginBottom: 10, marginLeft: 10 }}>
          <FontAwesome5 name="times" size={24} color="#3498db" />
        </TouchableOpacity>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter your tracking number</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={trackingNumber}
              onChangeText={(text) => setTrackingNumber(text)}
              placeholder={i18n.t('trackingNumber')}
              autoCapitalize="characters"
            />
            <TouchableOpacity onPress={() => { setTrackingNumber(''), setShowError(false) }} style={styles.clearButton}>
              <FontAwesome5 name="times-circle" size={18} color="#999" />
            </TouchableOpacity>
          </View>
          {showError && (
            <Text style={styles.errorText}>Invalid tracking number format</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(text) => setName(text.toUpperCase())}
              placeholder="Add a name (optional)"
            />
          </View>


          <TouchableOpacity onPress={() => setIsLanguageModalVisible(true)} style={styles.autoDetectButton}>
            {i18n.locale === 'en' ? <Image source={require('../assets/images/flag/usa.png')} style={{ width: 24, height: 24, marginRight: 10, }} /> : <Image source={require('../assets/images/flag/fr.png')} style={{ width: 24, height: 24, marginRight: 10, }} />}
            <Text style={styles.autoDetectText}>{i18n.locale === 'en' ? 'English' : 'Français'}</Text>
            <FontAwesome5 name="chevron-right" size={16} color="black" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.autoDetectButton} onPress={() => setIsCarrierModalVisible(true)}>
            {selectedCarrierLogo && selectedCarrierLogo !== '' ? (
              <Image
                source={{ uri: selectedCarrierLogo }}
                style={styles.carrierLogo}
                resizeMode="contain"
              />
            ) :
              <FontAwesome5 name="truck" size={24} color="black" style={{ marginRight: 10 }} />}

            <Text style={styles.autoDetectText}>{selectedCarrier.length > 0 ? `${selectedCarrier}` : 'Auto-detect'}</Text>
            <FontAwesome5 name="chevron-right" size={16} color="black" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <View style={{ justifyContent: 'flex-end', marginBottom: 36 }}>
            <TouchableOpacity disabled={
              trackingNumber === ''
            } onPress={handleContinue} style={[styles.continueButton, trackingNumber === '' && styles.disabledButton]}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      <LanguageModal
        visible={isLanguageModalVisible}
        onClose={() => setIsLanguageModalVisible(false)}
        onChange={handleLanguageChange}
      />
      <CarriersModal
        visible={isCarrierModalVisible}
        onClose={() => setIsCarrierModalVisible(false)}
        onChange={(carrier) => setSelectedCarrier(carrier)}
      />
    </Modal>
  );
};



const LanguageModal = ({ visible, onClose, onChange }: { visible: boolean, onClose: () => void, onChange: (locale: string) => void }) => {
  const [modalHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(modalHeight, {
        toValue: 250,
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
    <Portal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        onDismiss={onClose}
      >
        <Animated.View style={[styles.modalContainer, { height: modalHeight }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={24} color="#3498db" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Select Language</Title>
            <TouchableOpacity onPress={() => onChange('en')} style={styles.languageButton}>
              <Text style={styles.languageButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onChange('fr')} style={styles.languageButton}>
              <Text style={styles.languageButtonText}>Français</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </Portal>
  );
};


const CarriersModal = ({ visible, onClose, onChange }: { visible: boolean, onClose: () => void, onChange: (carrier: string) => void }) => {
  const [modalHeight] = useState(new Animated.Value(0));
  const [carriers, setCarriers] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const response = await axios.get('https://apidev.vanilla.digital/public/carrier');
        setCarriers(response.data);
      } catch (error) {
        console.error('Error fetching carriers:', error);
      }
    };

    fetchCarriers();
  }, []);

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


  const renderCarrierItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleCarrierSelect(item)}
      style={styles.carrierButton}>
      <Text style={styles.carrierButtonText}>{item}</Text>
    </TouchableOpacity>
  );

  const handleCarrierSelect = (carrier: string) => {
    onChange(carrier);
    onClose();
  }

  return (
    <Portal>
      <Modal
        ref={modalRef}
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        onDismiss={onClose}
      >
        <Animated.View style={[styles.modalContainer, { height: modalHeight }]}>
          <TouchableOpacity onPress={() => onClose()} style={styles.closeButton}>
            <FontAwesome5 name="times" size={24} color="#3498db" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Select Carrier</Title>
            <TouchableOpacity onPress={() => handleCarrierSelect('')}
              style={styles.carrierButton}>
              <Text style={styles.carrierButtonText}>Auto-detect</Text>
            </TouchableOpacity>
            <FlatList
              data={carriers}
              renderItem={renderCarrierItem}
              keyExtractor={(item) => item.toString()}
              contentContainerStyle={styles.carrierList}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              extraData={carriers}
            />
          </View>
        </Animated.View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  carrierLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  carrierList: {
    padding: 10,
    flexGrow: 1,
  },
  carrierButton: {
    backgroundColor: '#eee',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  carrierButtonText: {
    textAlign: 'center',
  },
  languageText: {
    color: 'gray',
    marginRight: 10,
    fontSize: 15,
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  languageButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  languageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: 'lightgray',
    padding: 10,
    width: '100%',
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

});

export default TrackingModal;