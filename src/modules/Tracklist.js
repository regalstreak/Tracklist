import { NativeModules } from 'react-native';
const Tracklist = NativeModules.Tracklist;

export const startService = Tracklist.startService;
export const stopService = Tracklist.stopService;
export const updateNotification = Tracklist.updateNotification;
