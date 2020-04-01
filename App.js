import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Button
} from 'react-native';

import { getTitle } from './src/modules/MediaController'

async function getModuleTitle() {
  console.log(await getTitle());
}

// function getTracklist() {
//   let $ = cheerio.load('https://www.1001tracklists.com/tracklist/2ggdbkp9/zhu-hakuba-iwatake-mountain-resort-japan-cercle-2020-03-03.html');
//   $('span.trackFormat').each(function (index, element) {
//     console.log(index);
//   })
// }

const App = () => {
  return (
    <>
      <SafeAreaView style={{ backgroundColor: 'black' }}>
        <ScrollView
          style={{ backgroundColor: 'black' }}
          contentInsetAdjustmentBehavior="automatic">
          <Button
            onPress={() => {
              getModuleTitle();
            }}
            title='Get Title'
          />
          <Button
            onPress={() => {
              // getTracklist();
            }}
            title='Get Tracklist'
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default App;
