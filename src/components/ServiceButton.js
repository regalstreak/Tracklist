import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { startService, stopService, serviceStatus } from '../modules/Tracklist'

export default ServiceButton = () => {
    const [started, setStarted] = useState(false);
    useEffect(() => {
        let mounted = true;
        if (mounted) {
            serviceStatus().then(val => {
                setStarted(val)
                console.log(val)
            })
        }

        return () => mounted = false;
    }, [started])

    if (started) {
        return (
            <TouchableOpacity
                onPress={() => {
                    stopService()
                    setStarted(false);
                }}
            >
                <Icon style={styles.icon} name='md-square' size={24} color={'#fff'} />
            </TouchableOpacity>
        )
    } else {
        return (
            <TouchableOpacity
                onPress={() => {
                    startService()
                    setStarted(true);
                }}
            >
                <Icon style={styles.icon} name='md-play' size={24} color={'#fff'} />
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    icon: {
        marginLeft: 20
    }
});