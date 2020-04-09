import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';

import TrackList from "./src/components/TrackList";
import ServiceButton from "./src/components/ServiceButton"
import MadeBy from "./src/components/MadeBy";
import About from './src/components/About';

import { updateNotification } from "./src/modules/Tracklist";
import globalStyles from "./src/styles/GlobalStyles";
import { checkBlocked, getLocalTracklist, getTracklist, getTracklistStartMap, getCurrentIndex } from "./src/utils/TracklistUtils";

const useIsMountedRef = () => {
  const isMountedRef = useRef(null);
  useEffect(() => {
    isMountedRef.current = true;
    return () => isMountedRef.current = false;
  });
  return isMountedRef;
}


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
  const [serviceStarted, setServiceStarted] = useState(false);

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
      <ScrollView
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
      >

        <View style={styles.headerView}>
          <Text style={globalStyles.textEmphasisBig}>
            {serviceStarted ? `Now playing` : `Tracklist`}
          </Text>

          <ServiceButton
            onChange={(val) => {
              setServiceStarted(val);
            }}
          />
        </View>

        {trackList.length > 0 && serviceStarted ?
          <>
            <Text style={[globalStyles.textLowEmphasisSmall, styles.mediaTitle]}>{mediaTitle}</Text>

            <View style={styles.currentPlaying}>
              <View style={styles.mediaTitleView}>
                <Text style={globalStyles.textNormalEmphasis}>{currentTrack.trackItem.title}</Text>
              </View>
              <View style={styles.startView}>
                <Text style={globalStyles.textLowEmphasisSmall}>{currentTrack.trackItem.start}</Text>
              </View>
            </View>

            <TrackList
              trackList={trackList}
              current={{
                mainIndex: currentTrack.mainIndex,
                subIndex: currentTrack.subIndex
              }}
            />
          </>
          : <About />
        }

        <MadeBy />
      </ScrollView>
    );
  }
};

export default App;

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#14151A',
    paddingTop: 30,
    padding: 24,
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  mediaTitleView: {
    flex: 0.84
  },
  startView: {
    flex: 0.16,
    alignItems: 'flex-end'
  },
  mediaTitle: {
    marginBottom: 16
  },
  currentPlaying: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginBottom: 10
  }
})