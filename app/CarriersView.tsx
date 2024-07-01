import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Icons from 'react-native-heroicons/outline';
import axios from 'axios'; 
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';

import { Title, Card, Paragraph, Modal, Portal, Button, PaperProvider } from 'react-native-paper';
import CarrierDetailsModel from '@/components/CarrierDetailsModel';

interface Carrier {
  name: string;
}

const CarriersView = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [carriers, setCarriers] = useState([] as Carrier[]);
  const flatListRef = useRef(null); 

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const response = await axios.get('https://apidev.vanilla.digital/public/carrier');

        setCarriers(response.data.map((carrier: any) => ({
          name: carrier.includes(' ') ? carrier.replace(' ', '-').toLowerCase() : carrier.toLowerCase(),
        })));
      } catch (error) {
        console.error('Error fetching carriers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarriers();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [modalHeight] = useState(new Animated.Value(0));

  const openModal = (c_name: string) => {
    setShowModal(true);
    setSelectedCarrier(c_name);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const renderCarrierItem = ({ item }: { item: Carrier }) => (
    <TouchableOpacity onPress={() => openModal(item.name)}>
      <Card style={styles.carrierCard}>
        <Card.Content>
          <View style={styles.carrierContent}>
            <Icons.ChevronRightIcon style={{ position: 'absolute', right: 10 }} size={24} color="black" />
            <Image source={require('../assets/images/logo-notext.png')} style={styles.carrierLogo} contentFit='contain' />
            <Text style={styles.carrierName}>{item.name}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.BackwardIcon size={24} color='black' />
        </TouchableOpacity>
      </View>
      <CarrierDetailsModel visible={showModal} onClose={closeModal} carrier={selectedCarrier} />

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            ref={flatListRef} 
            data={carriers}
            renderItem={renderCarrierItem}
            keyExtractor={(item) => item.name.toString()}
            contentContainerStyle={styles.carriersList}
            initialNumToRender={5} 
            windowSize={5} 
          />
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: 'lightgray',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loader: {
    marginTop: 20,
  },
  carriersList: {
    flexGrow: 1, 
    paddingBottom: 20, 
  },
  carrierCard: {
    marginBottom: 10,
    borderRadius: 10,
  },
  carrierContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carrierLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
    backgroundColor: 'blue',
    borderRadius: 10,
    color: 'white',
  },
  carrierName: {
    fontSize: 16,
  },
});

export default CarriersView;