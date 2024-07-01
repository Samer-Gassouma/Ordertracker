import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Animated, ActivityIndicator, Linking } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Portal, Card, Title, Paragraph, Button } from 'react-native-paper';
import carriersData from '../assets/carriers-static.json';

const CarrierDetailsModel = ({ visible, onClose, carrier }: { visible: boolean, onClose: () => void, carrier: string }) => {
    const [modalHeight] = useState(new Animated.Value(0));
    const [selectedCarrier, setSelectedCarrier] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarrierDetails = async () => {
            try {
                const carrierInfo = carriersData.find(c => c.slug.includes(carrier.toLowerCase()));
                if (carrierInfo) {
                    setSelectedCarrier(carrierInfo);
                }
            } catch (e) {
                console.log("Error fetching carrier info:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchCarrierDetails();
    }, [carrier]);

    useEffect(() => {
        if (visible) {
            Animated.timing(modalHeight, {
                toValue: 490, 
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
                        <Title style={styles.modalTitle}>{carrier.toUpperCase()}</Title>

                        {loading ? (
                            <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
                        ) : selectedCarrier ? (
                            <Card style={styles.carrierCard}>
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.detailsLabel}>Average Delivery Time:</Text>
                                        <Text style={styles.detailsValue}>{selectedCarrier.companyDetails.avgInternationalDelivery}</Text>
                                    </View>
                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.detailsLabel}>Headquarters:</Text>
                                        <Text style={styles.detailsValue}>
                                            {selectedCarrier.companyDetails.headquarters.city}, {selectedCarrier.companyDetails.headquarters.country}
                                        </Text>
                                    </View>
                                    <Paragraph style={styles.summary}>
                                        {selectedCarrier.companyDetails.summary.length > 200
                                            ? selectedCarrier.companyDetails.summary.substring(0, 200) + '...'
                                            : selectedCarrier.companyDetails.summary}

                                        <Text >
                                            Read more at: <Text style={{ color: 'blue' }} onPress={() => Linking.openURL(selectedCarrier.url)}>{selectedCarrier.url}</Text>
                                        </Text>
                                    </Paragraph>
                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.detailsLabel}>Phone:</Text>
                                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${selectedCarrier.companyDetails.headquarters.phone}`)}>
                                            <Text style={styles.detailsValue}>{selectedCarrier.companyDetails.headquarters.phone}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.detailsLabel}>Email:</Text>
                                        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${selectedCarrier.companyDetails.headquarters.email}`)}>
                                            <Text style={styles.detailsValue}>{selectedCarrier.companyDetails.headquarters.email}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Card.Content>
                                <Card.Actions
                                    style={{ justifyContent: 'center' }}
                                >
                                    <Button
                                        icon="web"
                                        mode="contained"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '50%',
                                        }}
                                        onPress={() => Linking.openURL(selectedCarrier.url)}>Visit Website</Button>
                                </Card.Actions>
                            </Card>
                        ) : (
                            <Text style={styles.errorText}>Carrier not found.</Text>
                        )}
                    </View>
                </Animated.View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
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
        top: 30,
        right: 30,
    },
    carrierCard: {
        marginTop: 10,
        borderRadius: 10,
        elevation: 2,
    },
    cardContent: {
        padding: 15,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    detailsLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailsValue: {
        fontSize: 16,
    },
    summary: {
        marginTop: 10,
        fontSize: 14,
    },
    errorText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
    loader: {
        marginTop: 20,
    },
});

export default CarrierDetailsModel;