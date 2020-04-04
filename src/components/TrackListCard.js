import React from "react";
import { Text, View, StyleSheet } from 'react-native';

import globalStyles from "../styles/GlobalStyles";

const renderTrackListSub = (item) => {
    return null
}

const renderTrackItem = (item, index) => {
    return (
        <View style={styles.trackItem}>
            <Text style={globalStyles.textNormal}>{index + 1} - {item.start}</Text>
            <Text style={globalStyles.textNormal}>{item.startSeconds}</Text>
            <Text style={globalStyles.textNormal}>{item.title}</Text>
        </View>
    )
}

export default TracListCard = (props) => {
    const { item, index } = props;
    if (item.length > 1) {
        // with sub
        return renderTrackListSub(item);
    } else if (item.length === 1) {
        // only main
        return renderTrackItem(item[0], index);
    } else {
        return <Text>Couldn't get tracklist, mail neil@neilagarwal.me for bugreports</Text>
    }
}

const styles = StyleSheet.create({
    trackItem: {
        flex: 1,
        backgroundColor: '#1B1C23',
        margin: 12,
        padding: 8,
        borderRadius: 4
    }
})