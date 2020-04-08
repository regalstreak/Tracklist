import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Button,
  Text,
  DeviceEventEmitter,
} from 'react-native';

import TrackList from "./src/components/TrackList";
import { startService, stopService, updateNotification } from "./src/modules/Tracklist";
import globalStyles from "./src/styles/GlobalStyles";
import { checkBlocked, getLocalTracklist, getTracklist, getTracklistStartMap, getCurrentIndex } from "./src/utils/TracklistUtils";



const App = () => {

  const [blocked, setBlocked] = useState(false);
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaPosition, setMediaPosition] = useState(0)
  const [trackList, setTrackList] = useState([]);
  const [trackListStartMap, setTrackListStartMap] = useState([]);
  const [currentTrack, setCurrentTrack] = useState({
    mainIndex: 0,
    subIndex: 0,
    trackItem: { title: '', startSeconds: 0, start: '' }
  })

  useEffect(() => {
    DeviceEventEmitter.addListener('MediaControllerService', (data) => {
      if (mediaTitle !== data.mediaTitle) {
        setMediaTitle(data.mediaTitle)
      }
      setMediaPosition(data.mediaPosition)
    })
  }, [])

  useEffect(() => {
    if (mediaTitle.length > 0) {
      getLocalTracklist(mediaTitle).then(localTracklist => {
        if (localTracklist) {
          setTrackList(localTracklist)
        } else {
          checkBlocked().then(blck => {
            setBlocked(blck)
            if (!blck) {
              getTracklist(mediaTitle).then((tl) => {
                setTrackList(tl)
              }).catch(err => {
                console.log(err)
              })
            }
          });
        }
      }).catch(e => {
        console.log('error getting local tracklist info, getting from url', e);
        checkBlocked().then(blck => {
          setBlocked(blck)
          if (!blck) {
            getTracklist(mediaTitle).then((tl) => {
              setTrackList(tl)
            }).catch(err => {
              console.log(err)
            })
          }
        });
      })
    }
  }, [mediaTitle])

  useEffect(() => {
    if (mediaPosition >= 0 && trackList.length > 0) {
      let trackListStartMapLocal = getTracklistStartMap(trackList);
      setTrackListStartMap(trackListStartMapLocal);
      let currentIndex = getCurrentIndex(trackListStartMapLocal, mediaPosition);
      if (trackList[currentIndex]) {
        let mainIndex = trackListStartMapLocal[currentIndex].index;
        let subIndex = trackListStartMapLocal[currentIndex].subIndex;

        if (currentTrack) {
          if (currentTrack.trackItem.mainIndex !== mainIndex && currentTrack.trackItem.subIndex !== subIndex) {
            setCurrentTrack({ mainIndex, subIndex, trackItem: trackList[mainIndex][subIndex] })
          } else if (currentTrack.trackItem.title.length === 0) {
            setCurrentTrack({ mainIndex, subIndex, trackItem: trackList[mainIndex][subIndex] })
          }
        } else {
          setCurrentTrack({ mainIndex, subIndex, trackItem: trackList[mainIndex][subIndex] })
        }
      }
    }
  }, [mediaPosition, trackList])

  useEffect(() => {
    if (currentTrack && currentTrack.trackItem.title.length > 0) {

      let previousTrack, nextTrack;
      let tlsmCurrentIndex = -1;

      if (trackListStartMap.length > 0) {
        tlsmCurrentIndex = trackListStartMap.findIndex(element => {
          if (element.index === currentTrack.mainIndex && element.subIndex === currentTrack.subIndex) {
            return true
          }
        })
      }

      if (tlsmCurrentIndex === 0) {
        // first Track
        const tlsmNextTrack = trackListStartMap[tlsmCurrentIndex + 1]

        previousTrack = null;
        nextTrack = trackList[tlsmNextTrack.index][tlsmNextTrack.subIndex];
      } else if (tlsmCurrentIndex === (trackListStartMap.length - 1)) {
        // last Track
        const tlsmPreviousTrack = trackListStartMap[tlsmCurrentIndex - 1]

        previousTrack = trackList[tlsmPreviousTrack.index][tlsmPreviousTrack.subIndex];
        nextTrack = null;
      } else if (tlsmCurrentIndex === -1) {
        console.log('tlsmCurrentIndex not found')
      } else {
        const tlsmPreviousTrack = trackListStartMap[tlsmCurrentIndex - 1]
        const tlsmNextTrack = trackListStartMap[tlsmCurrentIndex + 1]

        previousTrack = trackList[tlsmPreviousTrack.index][tlsmPreviousTrack.subIndex];
        nextTrack = trackList[tlsmNextTrack.index][tlsmNextTrack.subIndex];
      }

      const payload = {
        index: currentTrack.mainIndex,
        currentTrack: currentTrack.trackItem,
        previousTrack,
        nextTrack
      }

      updateNotification(payload);

    }

  }, [currentTrack])

  if (blocked) {
    return (
      <WebView
        source={{ uri: 'https://www.1001tracklists.com/' }}
        onNavigationStateChange={newNavState => {
          if (!newNavState.loading && !newNavState.title.includes('403')) {
            setBlocked(false);
          }
        }}
      />
    )
  } else {

    return (
      <>
        <ScrollView
          style={globalStyles.scrollView}
          contentInsetAdjustmentBehavior="automatic">
          <Text style={globalStyles.textEmphasis}>Now playing</Text>
          <Text style={globalStyles.textEmphasis}>{mediaTitle}</Text>
          <Text style={globalStyles.textNormal}>{mediaPosition}</Text>
          <Text style={globalStyles.textNormal}>{currentTrack.trackItem.startSeconds} - {currentTrack.trackItem.title}</Text>
          <Button
            color="#385CFF"
            onPress={() => {
              startService();
            }}
            title='Start service'
          />
          <Button
            onPress={() => {
              stopService();
            }}
            title='Stop service'
          />

          {trackList.length > 0 ? <TrackList trackList={trackList} /> : null}
        </ScrollView>
      </>
    );
  }
};

export default App;
