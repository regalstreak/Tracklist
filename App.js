import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Button,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';

import TrackListCard from "./src/components/TrackListCard";
import { startService, stopService, updateNotification } from "./src/modules/Tracklist";
import globalStyles from "./src/styles/GlobalStyles";

const cheerio = require('cheerio-without-node-native');

async function checkBlocked() {
  let content = await fetch('https://www.1001tracklists.com/');
  try {
    let rawHTML = await content.text();
    if (rawHTML) {
      let $ = cheerio.load(rawHTML);
      const blockedText = 'Fill out the reCAPTCHA to unblock your IP'
      if ($('body').text().trim().includes(blockedText)) {
        return true;
      } else {
        return false
      }
    }
  } catch (e) {
    console.log(e)
  }
}

async function getLocalTracklist(mediaTitle) {
  try {
    let localTracklist = await AsyncStorage.getItem(`@Tracklist:${mediaTitle}`)
    if (localTracklist !== null) {
      console.log('Local Tracklist available')
      return JSON.parse(localTracklist);
    } else {
      return false;
    }
  }
  catch (error) {
    console.log(error)
  }
}

async function getTracklistUrl(mediaTitle) {
  let formData = new FormData();
  formData.append('main_search', mediaTitle);
  formData.append('search_selection', '9');

  let search = await fetch('https://www.1001tracklists.com/search/result.php', {
    body: formData,
    method: 'POST'
  })

  try {
    let rawSearchHTML = await search.text();

    if (rawSearchHTML) {
      let $ = cheerio.load(rawSearchHTML);
      let tlLink = $('div.tlLink a').attr('href');
      return `https://www.1001tracklists.com${tlLink}`;
    } else {
      console.log('No Search html')
    }

  } catch (e) {
    console.error(e)
  }
}

async function getTracklist(mediaTitle) {
  console.log('Getting tracklist from url')
  const url = await getTracklistUrl(mediaTitle)

  if (url.length > 0) {
    const data = await fetch(url)
    let $ = cheerio.load(await data.text());

    //  trackList schema:
    //  [ // main array
    //    [ // Rows
    //      { // main track
    //        sub: false,
    //        title: '',
    //        start: '',
    //        startSeconds: 0
    //      },
    //      { // played with (if available)
    //        sub: true,
    //        title: '',
    //        start: '',
    //        startSeconds: 0
    //      }
    //    ]
    //  ]

    // TODO: Use itemprops
    let trackList = []

    // Iterate through all .tlpItem, separate .tlpTog and .tlpSubTog (/w tracks)
    $('.tlpItem').each(function (tlpItemIndex, tlpItem) {
      let title = $('span.trackFormat', tlpItem).text().trim()
      let start = $('.cueValueField', tlpItem).text().trim()
      let startSeconds = hmsToSecondsOnly(start);

      if ($(tlpItem).hasClass('tlpSubTog')) {
        // sub
        trackList[trackList.length - 1].push({
          sub: true,
          title,
          start,
          startSeconds
        })
      } else {
        // main
        if (start === '' && trackList.length === 0) {
          start = '00:00'
          startSeconds = 0;
        }
        trackList.push([
          {
            sub: false,
            title,
            start,
            startSeconds
          }
        ])
      }
    })

    try {
      AsyncStorage.setItem(`@Tracklist:${mediaTitle}`, JSON.stringify(trackList))
    } catch (error) {
      console.log('Error setting data', error)
    }
    return trackList;
  }

}

const getTracklistStartMap = (trackList) => {
  let trackListStartMap = [];

  // old without flat
  // trackList.forEach((element, index) => {
  //   if (element.length > 1) {
  //     element.forEach((subElement, subIndex) => {
  //       if (!trackListStartMap[index]) {
  //         trackListStartMap[index] = [subElement.startSeconds];
  //       } else {
  //         trackListStartMap[index][subIndex] = subElement.startSeconds;
  //       }
  //     });
  //   } else {
  //     trackListStartMap[index] = [element[0].startSeconds];
  //   }
  // });

  trackList.forEach((element, index) => {
    if (element.length > 1) {
      element.forEach((subElement, subIndex) => {
        if (subElement.startSeconds === -1) {
          trackListStartMap.push({
            startSeconds: trackList[index][0].startSeconds + 60,
            index,
            subIndex
          });
        } else {
          trackListStartMap.push({
            startSeconds: subElement.startSeconds,
            index,
            subIndex
          });
        }
      });
    } else {
      trackListStartMap.push({
        startSeconds: element[0].startSeconds,
        index,
        subIndex: 0
      });
    }
  });

  trackListStartMap.sort((a, b) => a.startSeconds - b.startSeconds);

  return trackListStartMap;
}

const renderTrackList = (trackList) => {
  return trackList.map(function (item, index) {
    return <TrackListCard item={item} index={index} />
  })
}

const hmsToSecondsOnly = (str) => {
  if (str) {
    let p = str.split(':'),
      s = 0, m = 1;
    while (p.length > 0) {
      s += m * parseInt(p.pop(), 10);
      m *= 60;
    }
    return s;
  } else {
    return -1;
  }
}

const getCurrentIndex = (trackListMap, position) => {
  if (trackListMap && trackListMap.length > 0 && position) {
    let x = -1;
    for (let b = trackListMap.length; b >= 1;) {
      while (trackListMap[x + b].startSeconds && position > trackListMap[x + b].startSeconds) {
        x += b;
      }
      b = Math.floor(b / 2);
    }
    return x;
  } else {
    return 0;
  }
}

const App = () => {

  const [blocked, setBlocked] = useState(false);
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaPosition, setMediaPosition] = useState('')
  const [trackList, setTrackList] = useState([]);
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
      let trackListStartMap = getTracklistStartMap(trackList);
      let currentIndex = getCurrentIndex(trackListStartMap, mediaPosition);
      if (trackList[currentIndex]) {
        let mainIndex = trackListStartMap[currentIndex].index;
        let subIndex = trackListStartMap[currentIndex].subIndex;

        setCurrentTrack({ mainIndex, subIndex, trackItem: trackList[mainIndex][subIndex] })
      }
    }
  }, [mediaPosition, trackList])

  useEffect(() => {
    let { title, start } = currentTrack.trackItem;
    if (title.length > 0 && start) {
      updateNotification(title, start);
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
          console.log(newNavState)
        }}
      />
    )
  } else {

    return (
      <>
        <ScrollView
          style={globalStyles.scrollView}
          contentInsetAdjustmentBehavior="automatic">
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

          {renderTrackList(trackList)}

        </ScrollView>
      </>
    );
  }
};

export default App;
