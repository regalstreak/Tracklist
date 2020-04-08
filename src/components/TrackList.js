import React from "react";
import { Text, View, StyleSheet } from 'react-native';

import globalStyles from "../styles/GlobalStyles";


const TrackListCard = (props) => {
    const { main, title, start, mainIndex, subIndex, current } = props;

    const backgroundColor = current ? "#231B1B" : "#1B1C23";
    const trackItemStyle = main ? styles.trackItem : styles.trackItemSub;
    const indexText = main ? mainIndex + 1 : `${mainIndex + 1}.${subIndex}`

    return (
        <View style={{ backgroundColor, ...trackItemStyle }}>
            <View >
                <Text style={globalStyles.textLowEmphasis}>{indexText}]  </Text>
            </View>
            <View >
                <Text style={globalStyles.textNormal}>{title}</Text>
                <Text style={globalStyles.textLowEmphasis}>{start}</Text>
            </View>
        </View>
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