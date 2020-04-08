import React, { useCallback } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Linking, Alert } from 'react-native';

import globalStyles from "../styles/GlobalStyles";


const TrackListCard = (props) => {
    const { main, title, start, mainIndex, subIndex, current } = props;

    const backgroundColor = current ? "#1F348F" : "#1B1C23";
    const trackItemStyle = main ? styles.trackItem : styles.trackItemSub;
    const indexText = main ? mainIndex + 1 : `${mainIndex + 1}.${subIndex}`

    let searchFiltered = title.replace(/ft./g, '').replace(/(~|`|!|#|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g, "");
    const spotifySearchUri = `spotify:search:${searchFiltered}`

    const handlePress = useCallback(async () => {
        const supported = await Linking.canOpenURL(spotifySearchUri);

        if (supported) {
            await Linking.openURL(spotifySearchUri);
        } else {
            Alert.alert("Install spotify to open this url");
        }
    });

    return (
        <TouchableOpacity
            style={{ backgroundColor, ...trackItemStyle }}
            onPress={handlePress}
        >
            <View >
                <Text style={globalStyles.textLowEmphasis}>{indexText}]  </Text>
            </View>
            <View >
                <Text style={globalStyles.textNormal}>{title}</Text>
                <Text style={globalStyles.textLowEmphasis}>{start}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default TrackList = (props) => {
    const { trackList, current } = props;
    if (trackList && trackList.length > 0) {
        return trackList.map((trackItem, mainIndex) => {
            return trackItem.map((trackSubItem, subIndex) => {
                return <TrackListCard
                    key={`${mainIndex}.${subIndex}`}
                    main={subIndex === 0 ? true : false}
                    current={current.mainIndex === mainIndex && current.subIndex === subIndex ? true : false}
                    mainIndex={mainIndex}
                    subIndex={subIndex}
                    title={trackSubItem.title}
                    start={trackSubItem.start}
                />
            })
        })
    } else {
        return <Text style={globalStyles.textNormal}>Error getting tracklist, please contact neil@neilagarwal.me for help</Text>
    }
}

const styles = StyleSheet.create({
    trackItem: {
        flexDirection: 'row',
        marginVertical: 12,
        padding: 12,
        borderRadius: 4
    },
    trackItemSub: {
        flexDirection: 'row',
        marginLeft: 18,
        marginVertical: 12,
        padding: 12,
        borderRadius: 4
    },
})