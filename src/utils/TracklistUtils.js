import AsyncStorage from '@react-native-community/async-storage';
const cheerio = require('cheerio-without-node-native');

export async function checkBlocked() {
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

export async function getLocalTracklist(mediaTitle) {
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

export async function getTracklist(mediaTitle) {
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

export const getTracklistStartMap = (trackList) => {
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
                if (index === 0 && subIndex === 0) {
                    trackListStartMap.push({
                        startSeconds: 0,
                        index,
                        subIndex
                    })
                } else {
                    if (subElement.startSeconds === 10000.1) {
                        trackListStartMap.push({
                            startSeconds: trackList[index][0].startSeconds + 100,
                            index,
                            subIndex
                        });
                    } else if (!subElement.startSeconds) {
                        console.log('no start seconds')
                        trackListStartMap.push({
                            startSeconds: trackList[index - 1][trackList[index - 1].length - 1].startSeconds + 60,
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
                }
            });
        } else {
            if (index === 0) {
                trackListStartMap.push({
                    startSeconds: 0,
                    index,
                    subIndex: 0
                })
            } else {

                if (element[0].startSeconds) {
                    trackListStartMap.push({
                        startSeconds: element[0].startSeconds,
                        index,
                        subIndex: 0
                    });
                } else {
                    console.log('no start seconds')
                    trackListStartMap.push({
                        startSeconds: Math.random() * 10000,
                        index,
                        subIndex: 0
                    });
                }
            }
        }
    });

    trackListStartMap.sort((a, b) => a.startSeconds - b.startSeconds);
    return trackListStartMap;
}

export const getCurrentIndex = (trackListMap, position) => {
    if (trackListMap && trackListMap.length > 0 && position) {
        let x = -1;
        for (let b = trackListMap.length; b >= 1;) {
            while (trackListMap[x + b] && trackListMap[x + b].startSeconds && position > trackListMap[x + b].startSeconds) {
                x += b;
            }
            b = Math.floor(b / 2);
        }
        if (x === -1) {
            return x + 1;
        } else {
            return x;
        }
    } else {
        return 0;
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
        return 10000.1;
    }
}