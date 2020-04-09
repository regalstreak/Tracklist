import React from 'react';
import { Text, View, StyleSheet, Linking } from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';

export default About = () => {
    return (
        <View style={styles.container}>

            <View style={styles.headerView}>
                <Text style={GlobalStyles.textNormal}>
                    Welcome to <Text style={GlobalStyles.textEmphasis}>Tracklist!</Text>
                </Text>
                <Text style={GlobalStyles.textLowEmphasisMedium}>
                    v1.0
                </Text>
            </View>

            <Text style={GlobalStyles.textNormal}>
                {'\n'}
                <Text style={GlobalStyles.textLowEmphasisMedium}>1]  </Text>
                Get started by listening to a set on your favourite music streaming platform.
                {'\n'}{'\n'}
                <Text style={GlobalStyles.textLowEmphasisMedium}>2]  </Text>
                Press the top right icon button to start or stop the service.
                {'\n'}{'\n'}
                <Text style={GlobalStyles.textLowEmphasisMedium}>3]  </Text>
                The app requires notification access to get current playing media and will ask for the same.
                {'\n'}{'\n'}
                <Text style={GlobalStyles.textLowEmphasisMedium}>4]  </Text>
                Tracklist gives you a notification with current and previous Spotify links.
                You can also click on a list item in the app to visit Spotify.
                {'\n'}
            </Text>
            <Text style={GlobalStyles.textNormal}>
                Some tracks and timestamps might be inaccurate.
                Please listen to tracks before adding them to your playlists!
                 {'\n'}
            </Text>
            <Text style={GlobalStyles.textNormal}>
                Tracklist is fully open source and available on
                <Text style={GlobalStyles.textLink} onPress={() => Linking.openURL("https://github.com/regalstreak/tracklist")}> Github</Text>.
                Latest releases are available there. Pull requests and Issues are welcome.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 12
    },
    headerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
});