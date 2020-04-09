import React from 'react';
import { Text, View, StyleSheet, Linking } from 'react-native';
import globalStyles from '../styles/GlobalStyles';

export default MadeBy = () => {
    return (
        <View style={styles.container}>
            <Text onPress={() => Linking.openURL("https://github.com/regalstreak")} style={[globalStyles.textNormal, styles.text]}>
                Made with ♥ by <Text style={[globalStyles.textNormalEmphasis, globalStyles.textUnderline]}>Neil Agarwal</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 30,
        marginBottom: 50,
    },
    text: {
        textAlign: 'center'
    }
});