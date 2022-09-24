"use strict"

let CLIENT_ID = "b742686757294000933a05c841f12ae6";

function objectToBody(obj) {
    var formBody = [];
    for (var value in obj) {
        var encodedKey = encodeURIComponent(value);
        var encodedValue = encodeURIComponent(obj[value]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    return formBody.join("&");
}


// function getAccessToken() {
//     fetch("https://api.spotify.com/v1/api/token", {
//         method: 'POST',
//         headers: {
//             Authorization: "Basic " + btoa(CLIENT_ID).toString('base64'),
//         },
//         body: objectToBody({
//             "grant_type": "client_credentials",
//         }),
//     })
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(jsonResponse) {
//         return jsonResponse;
//     });
// }
function getAccessToken() {
    let url = "https://accounts.spotify.com/v1/api/token";
    let data = {
        grant_type: "client_credentials",
        //redirect_uri: SPOTIFY_REDIRECT_URI,
    };
    let config = {
        headers: {
            "Authorization": "Basic " + CLIENT_ID,
            "Content-Type": "application/x-www-form-urlencoded",
            "Access-Control-Allow-Origin": "*",
        },
    };

    axios.post(url, data, config) 
    .then(res => {
        console.log("Success:", res.message);
        accessToken = res['access_token'];
        refreshToken = res['refresh_token'];
    })
    .catch(err => {
        console.log("Error:", err.message);
    });
}

function getPlaylistStats() {
    fetch("https://api.spotify.com/v1" + url, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + accessToken
        }
    })
    .then(function(response) {
        // check if valid response
        if (response.status == 200) {
            return response.json();
        }
        else if (response.status == 204) {
            // request successful,
            // but no data returned
            return null;
        }
        else if (response.status == 401) {
            // bad or expired token
            // re-authenticate user
            refreshAccessToken();
            // try again
            updateAlbum();
        }
        else {
            console.log("Error " + response.status + ": " + response.json());
            return null;
        }
    })
    .then(function(jsonResponse) {
        // update album
        if (jsonResponse != null) {
            album.src = jsonResponse['item']['album']['images'][0]['url'];
        }
    });
}
