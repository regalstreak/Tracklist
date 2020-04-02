import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Button,
  Text,
  DeviceEventEmitter
} from 'react-native';

import { startService, stopService } from "./src/modules/Tracklist";

const cheerio = require('cheerio-without-node-native');


async function getTracklistUrl(mediaTitle) {
  let formData = new FormData();
  formData.append('main_search', mediaTitle);
  formData.append('search_selection', '9');

  let search = await fetch('https://www.1001tracklists.com/search/result.php', {
    body: formData,
    method: 'POST'
  })

  let rawSearchHTML = await search.text();

  if (rawSearchHTML) {
    let $ = cheerio.load(rawSearchHTML);
    let tlLink = $('div.tlLink a').attr('href');
    getTracklist(`https://www.1001tracklists.com${tlLink}`)
  } else {
    console.log('No Search html')
  }
}

async function getTracklist(url) {
  const data = await fetch(url)
  let $ = cheerio.load(await data.text());

  //  trackList schema:
  //  [ // main array
  //    [ // Rows
  //      { // main track
  //        sub: false,
  //        title: '',
  //        start: ''
  //      },
  //      { // played with (if available)
  //        sub: true,
  //        title: '',
  //        start: ''
  //      }
  //    ]
  //  ]

  // TODO: Use itemprops
  let trackList = []

  // Iterate through all .tlpItem, separate .tlpTog and .tlpSubTog (/w tracks)
  $('.tlpItem').each(function (tlpItemIndex, tlpItem) {
    let title = $('span.trackFormat', tlpItem).text().trim()
    let start = $('.cueValueField', tlpItem).text().trim()

    if ($(tlpItem).hasClass('tlpSubTog')) {
      // sub

      // if (start == '') {
      //   start = trackList[trackList.length - 1][0].start
      // }

      trackList[trackList.length - 1].push({
        sub: true,
        title,
        start
      })
    } else {
      // main
      trackList.push([
        {
          sub: false,
          title,
          start
        }
      ])
    }
  })

  console.log(trackList)

}

const App = () => {

  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaPosition, setMediaPosition] = useState('')

  useEffect(() => {
    DeviceEventEmitter.addListener('MediaControllerService', (data) => {
      setMediaTitle(data.mediaTitle)
      setMediaPosition(data.mediaPosition)
    })
  })

  return (
    <>
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic">
          <Text>{mediaTitle}</Text>
          <Text>{mediaPosition}</Text>
          <Button
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
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default App;
