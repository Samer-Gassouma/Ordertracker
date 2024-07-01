import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const TRACKED_PACKAGES_KEY = 'trackedPackagesCount';

export async function initTrackedPackagesCount() {
    try {
        const value = await AsyncStorage.getItem(TRACKED_PACKAGES_KEY);
        if (value === null) {
            await AsyncStorage.setItem(TRACKED_PACKAGES_KEY, '0');
        }
    } catch (error) {
        console.error('Error initializing tracked packages count:', error);
    }
}

export async function getTrackedPackagesCount() {
    try {
        const value = await AsyncStorage.getItem(TRACKED_PACKAGES_KEY);
        return value !== null ? parseInt(value, 10) : 0;
    } catch (error) {
        console.error('Error getting tracked packages count:', error);
        return 0;
    }
}

export async function incrementTrackedPackagesCount() {
    try {
        const value = await AsyncStorage.getItem(TRACKED_PACKAGES_KEY);
        const count = value !== null ? parseInt(value, 10) : 0;
        await AsyncStorage.setItem(TRACKED_PACKAGES_KEY, (count + 1).toString());
        checkForRatingPrompt(count + 1);
    } catch (error) {
        console.error('Error incrementing tracked packages count:', error);
    }
}

async function checkForRatingPrompt(count: number) {
    if (count % 5 === 0) {
        if (await StoreReview.hasAction()) {
            StoreReview.requestReview();
        }
    }
}
