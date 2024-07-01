import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, Animated, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Icons from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { Portal, Card, Title, Paragraph } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import i18n from '../i18n';

const SettingsView = () => {
  const navigation = useNavigation();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  const handleLanguageChange = async (newLocale: string) => {
    try {
      i18n.locale = newLocale;
      setIsLanguageModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <LinkContainer 
          title="Language" 
          onPress={() => setIsLanguageModalVisible(true)} 
        />
        <LinkContainer 
          title="Carriers" 
          onPress={() => navigation.navigate('CarriersView' as never)} 
        />
        <LinkContainer 
          title="FAQ" 
          onPress={() => {}} 
        />

<View style={{
          padding: 10,
          alignItems: 'flex-start'
        }}>
          <Text style={{
            fontSize: 25,
            padding: 5,
            fontWeight: 'bold',
          }}>Information</Text>
          <Text style={{
            color: 'gray',
            fontSize: 15,
            padding: 10,
          }}>we are commmited to creating a transparent and secure experience for our users</Text>

        </View>

        <View style={{
          padding: 10,
          alignItems: 'flex-start'
        }}>
          <Text style={{
            fontSize: 20,
            padding: 5,
            fontWeight: 'semibold',
          }}>Data & Privacy</Text>
          <Text style={{
            color: 'gray',
            fontSize: 15,
            padding: 5,
          }}>Privacy Policy</Text>

        </View>

        <LanguageModal 
          visible={isLanguageModalVisible} 
          onClose={() => setIsLanguageModalVisible(false)} 
          onChange={handleLanguageChange} 
        />
      </View>
    </View>
  );
};

const LinkContainer = ({ title, onPress }: { title: string, onPress: () => void }) => {

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>{title}</Text>
        <View style={styles.chevronContainer}>
          {title === 'Language' ? (
            <Text style={styles.languageText}>
              {i18n.locale === 'en' ? 'English' : 'Français'}
            </Text>
          ) : null}
          <Icons.ChevronRightIcon size={20} color="gray" />
        </View>
      </View>
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    padding: 20,
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
  linkContainer: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 18,
  },
  chevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    color: 'gray',
    marginRight: 10,
    fontSize: 15,
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
    fontSize: 20, 
    fontWeight: 'bold',
    marginBottom: 10,
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
});

export default SettingsView;