import React from "react";
import { Text, View, StyleSheet } from 'react-native';

import globalStyles from "../styles/GlobalStyles";


const TrackListCard = (props) => {
    const { main, title, start, mainIndex, subIndex } = props;

    if (main) {
        return (
            <View style={styles.trackItem}>
                <View style={styles.indexView}>
                    <Text style={globalStyles.textLowEmphasis}>{mainIndex + 1}]  </Text>
                </View>
                <View style={styles.titleView}>
                    <Text style={globalStyles.textNormal}>{title}</Text>
                    <Text style={globalStyles.textLowEmphasis}>{start}</Text>
                </View>
            </View>
        )
    } else {
        return (
            <View style={styles.trackItemSub}>
                <View style={styles.indexView}>
                    <Text style={globalStyles.textLowEmphasis}>{mainIndex + 1}.{subIndex}]  </Text>
                </View>
                <View style={styles.titleView}>
                    <Text style={globalStyles.textNormal}>{title}</Text>
                    <Text style={globalStyles.textLowEmphasis}>{start}</Text>
                </View>
            </View>
        )
    }
}

export default TrackList = (props) => {
    const { trackList } = props;
    if (trackList && trackList.length > 0) {
        return trackList.map((trackItem, mainIndex) => {
            return trackItem.map((trackSubItem, subIndex) => {
                if (subIndex === 0) {
                    return <TrackListCard key={`${mainIndex}.${subIndex}`} main mainIndex={mainIndex} subIndex={subIndex} title={trackSubItem.title} start={trackSubItem.start} />
                } else {
                    return <TrackListCard key={`${mainIndex}.${subIndex}`} mainIndex={mainIndex} subIndex={subIndex} title={trackSubItem.title} start={trackSubItem.start} />
                }
            })
        })
    } else {
        return <Text style={globalStyles.textNormal}>Error getting tracklist</Text>
    }
}

// export const TrackListCard = (props) => {
//     const { item, index } = props;
//     if (item.length > 1) {
//         // with sub
//         return renderTrackListSub(item);
//     } else if (item.length === 1) {
//         // only main
//         return renderTrackItem(item[0], index);
//     } else {
//         return <Text>Couldn't get tracklist, mail neil@neilagarwal.me for bugreports</Text>
//     }
// }

const styles = StyleSheet.create({
    trackItem: {
        // flex: 1,
        flexDirection: 'row',
        backgroundColor: '#1B1C23',
        margin: 12,
        padding: 12,
        borderRadius: 4
    },
    trackItemSub: {
        flexDirection: 'row',
        backgroundColor: '#1B1C23',
        marginLeft: 26,
        margin: 12,
        padding: 12,
        borderRadius: 4
    },
    indexView: {
    },
    titleView: {
    }
})