import { View, StyleSheet, Text, Image } from 'react-native';
import i18n from '../app/i18n';

import React from 'react';
import { Title, TouchableRipple } from 'react-native-paper';
import * as Icons from "react-native-heroicons/outline";

export default function App() {

 

  return (
    <View style={styles.container}>
      <View style={styles.dashedBorder}>

        
        <Image source={require('../../assets/images/logo-notext.png')} style={styles.logo} />
        <Title style={styles.Title}>{i18n.t('welcome')}</Title>
        <Text style={styles.paragraph}>{i18n.t('welcomeMessage')}</Text>


        <TouchableRipple
          style={styles.button}
          onPress={() => console.log('Pressed')}
        >
          <View style={styles.buttonContent}>
            <Icons.PlusIcon size={24} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>{i18n.t('addPackage')}</Text>
          </View>
        </TouchableRipple>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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