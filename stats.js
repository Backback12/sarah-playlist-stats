"use strict"

let SPOTIFY_CLIENT_ID = "b742686757294000933a05c841f12ae6";
let SPOTIFY_CLIENT_SECRET = "27430425d91b4080a5cca5bc31881183";
var access_token = null;
var playlist_data = [];
var displayNames = {};

function getAccessToken() {
    var http = new XMLHttpRequest();
    var url = "https://accounts.spotify.com/api/token";
    http.open('POST', url, true);
    http.setRequestHeader('Authorization', `Basic ${new buffer.Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`);
    http.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
    //http.onreadystatechange = function() {
    http.onload = function() {
        if (http.readyState == 4) {
            //console.log(http.responseText);
            //return http.responseText;
            access_token = JSON.parse(http.responseText).access_token;
            parseData(1);
        }
    }
    http.send('grant_type=client_credentials');
}

function getPlaylist(offset) {
    let url = "/playlists/67eTfqlaZ1oBtuS2SYdBM9/tracks";
    let query = `?limit=50&market=CA&offset=${offset}`;
    fetch("https://api.spotify.com/v1" + url + query, {
        method: 'GET',
        headers: {
            Authorization: "Bearer " + access_token,
        }
    })
    .then(function(response) {
        // check if valid response
        if (response.status == 200) {
            return response.json();
        }
        else {
            console.log("Error " + response.status + ": " + response.json());
            return null;
        }
    })
    .then(function(jsonResponse) {
        // update album
        if (jsonResponse != null) {
            //album.src = jsonResponse['item']['album']['images'][0]['url'];
            // return jsonResponse;
            //playlistData = playlistData.concat(jsonResponse['items']);
            for (let i = 0; i < jsonResponse['items'].length; i++) {

                let owner = jsonResponse['items'][i]['added_by']['id'];
                if (!(owner in displayNames)) {
                    // new name
                    displayNames[owner] = null;
                    getDisplayName(owner);
                }

                playlist_data.push({
                    track_name: jsonResponse['items'][i]['track']['name'],
                    owner_name: owner,
                    display_name: null,
                    track_data: jsonResponse['items'][i],
                    audio_features: null,
                })
            }
            

            if (jsonResponse['items'].length >= 50) {
                // call again
                getPlaylist(offset + 50);
            }
            else {
                // console.log("done");
                // console.log(playlistData.length);
                parseData(2);
            }
        }
    });
}

async function parseDisplayNames() {
    // for (let i = 0; i < playlist_data.length; i++) {
    //     if (!(playlist_data[i]['owner_name'] in displayNames)) {
    //         // new name
    //         displayNames[playlist_data[i]['owner_name']] = null;
    //         getDisplayName(playlist_data[i]['owner_name']);

            
    //     }
    //     else {
            
    //     }
    // }
    // await new Promise(resolve => setTimeout(resolve, 500));

    for (let i = 0; i < playlist_data.length; i++) {
        playlist_data[i]['display_name'] = displayNames[playlist_data[i]['owner_name']];
    }

    parseData(3);
}
function getDisplayName(userId) {
    let url = "/users/" + userId;
    fetch("https://api.spotify.com/v1" + url, {
        method: 'GET',
        headers: {
            Authorization: "Bearer " + access_token,
        }
    })
    .then(function(response) {
        // check if valid response
        if (response.status == 200) {
            return response.json();
        }
        else {
            console.log("Error " + response.status + ": " + response.json());
            return null;
        }
    })
    .then(function(jsonResponse) {
        // update album
        //console.log(jsonResponse['display_name']);
        let name = jsonResponse['display_name']
        displayNames[userId] = name;
        //console.log(name);
        //return name;
    });
}

function parseAudioFeatures() {

    var anal_ids = [];   // groups of 50 songs to get audio analysis

    for (let i = 0; i < playlist_data.length; i++) {
        anal_ids.push(playlist_data[i]['track_data']['track']['id']);
        if (anal_ids.length == 50 || i == playlist_data.length - 1) {
            //console.log(i+1 - anal_ids.length);
            getAudioFeatures(anal_ids, i+1- anal_ids.length);
            anal_ids = [];
        }
    }
}
function getAudioFeatures(anal_ids, index) {
    let url = "/audio-features";
    let query = "?ids=" + anal_ids.join();
    fetch("https://api.spotify.com/v1" + url + query, {
        method: 'GET',
        headers: {
            Authorization: "Bearer " + access_token,
        }
    })
    .then(function(response) {
        // check if valid response
        if (response.status == 200) {
            return response.json();
        }
        else {
            console.log("Error " + response.status + ": " + response.json());
            return null;
        }
    })
    .then(function(jsonResponse) {
        // update album
        //console.log(jsonResponse['display_name']);
        //console.log(jsonResponse);
        //console.log(jsonResponse['audio_features'][0]['id']);
        //console.log(name);
        //return name;
        for (let i = 0; i < jsonResponse['audio_features'].length; i++) {
            playlist_data[index + i]['audio_features'] = jsonResponse['audio_features'][i];
            //console.log(index + i);
        }
    });
}

/* 
 * playlist_data: 
 * {
 *  track_name   
 *  owner_name
 *  track_data
 *  audio_features
 * }
 * 
 */
async function parseData(step) {
    switch (step) {
        case 0:
            console.log("Getting Access Token...");
            getAccessToken();
            break;
        case 1:
            console.log("Getting Playlist Data...");
            getPlaylist(0);
            break;
        case 2:
            console.log("Parsing Display Names...");
            parseDisplayNames();
            break;
        case 3:
            console.log("Getting Audio Features...");
            parseAudioFeatures();
            
            await new Promise(resolve => setTimeout(resolve, 400));

            var check = true;
            for (let i = 0; i < playlist_data.length; i++) {
                if (playlist_data[i]['audio_features'] == null) {
                    check = false;
                    break;
                }
            }
            //console.log(check);
            console.log("DONE")
            break;
    }
}

function sortBy(key) {
    let reverse = document.getElementById('songReverse').checked;
    playlist_data.sort(
        function(b, a){
            return (a['audio_features'][key] - b['audio_features'][key]) * (reverse ? -1 : 1);
        }
    )
    //return playlist_data;
    let output = "";
    for (let i = 0; i < playlist_data.length; i++) {
        let track = playlist_data[i];
        output += (
            (i+1).toString().padStart(4) + ". " + 
            (track['audio_features'][key] + "\t" +
            track['track_data']['track']['name'] + " - " + 
            track['track_data']['track']['artists'][0]['name']).padEnd(50) + 
            "\t> " + track['display_name'] + "\n");
    }

    document.getElementById('output').value = output;
}
// returns nicely formatted
// [index]. \t[song_name] - [artist] \t[owner]\n
function printSongs() {
    let output = "";
    for (let i = 0; i < playlist_data.length; i++) {
        let track = playlist_data[i];
        output += i.toString().padStart(4) + ". " + track['track_data']['track']['name'] + " - " + "\n";
    }
    return output;
}



$(document).ready(
    function() {
        parseData(0);
        // getAccessToken()
        // .then (
        //     function() {getPlaylist(0)}
        // )
        // .then (
        //     function() {parseDisplayNames()}
        // )
        // .then (
        //     function() {parseAudioFeatures()}
        // )
        document.getElementById('output').value = "*All this data is given by some jank spotify algorithms*";
    }
);
