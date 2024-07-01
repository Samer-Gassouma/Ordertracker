import { View, StyleSheet, Text, ActivityIndicator, Image } from 'react-native';
import i18n from '../i18n';

import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, Title, TouchableRipple } from 'react-native-paper';
import * as Icons from "react-native-heroicons/outline";
import { TextInput, TouchableOpacity, Modal, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import TrackingModal from '../../components/TrackingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeView from '../HomeView'
import StarterView from '../starterView';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalHeight] = useState(new Animated.Value(0));
  const [OrdersData, setOrdersData] = useState([]);
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

  useEffect(() => {
    async function fetchData() {
      try {
        const storedPackage = await AsyncStorage.getItem('orders');

        const initialData = storedPackage ? JSON.parse(storedPackage) : null;
        setOrdersData(initialData);
      }
      catch (error) {
        console.error('Error fetching package data:', error);
      }
      finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [OrdersData]);

  
  
  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.container} />;
  }
  if (!OrdersData || OrdersData.length == 0 || OrdersData == null ) {

    return (
      <StarterView />
    );
  }
  else{
    return (
      <HomeView  />
    );
  }
}
  
  const styles = StyleSheet.create({
    packageItem: {
      padding: 15,
      borderWidth: 1,
      borderColor: 'lightgray',
      borderRadius: 10,
      marginBottom: 10,
    },
    packageText: {
      fontSize: 18,
    },
    refreshButton: {
      marginTop: 20,
    },
    refreshButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
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
      padding: 50,

    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 20,
      backgroundColor: '#f0f0f0',

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

  });