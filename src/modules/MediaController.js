import { NativeModules } from 'react-native';
const MediaController = NativeModules.MediaController;

export async function getTitle() {
    try {
        return await MediaController.getTitle();
    } catch (e) {
        console.error(e);
    }
}