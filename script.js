const getUrlParameter = (sParam) => {
    let sPageURL = window.location.search.substring(1),////substring will take everything after the https link and split the #/&
    sURLVariables = sPageURL.split('#'),
    sParameterName,
    i;
    let split_str = window.location.href.split('#');
    sURLVariables = split_str[1].split('&');
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

// add Playlist element into the window
function addPlaylistItem(item){
  var ul = document.getElementById("playlists");
  var li = document.createElement("li");
  var _img = document.createElement("img");
  var name = document.createElement("span");

  _img.src=item.images[0].url;
  li.appendChild(_img);
  name.appendChild(document.createTextNode(item.name));
  li.appendChild(name);
  li.setAttribute('id', 'playlist-item');
  li.setAttribute('data-value', item.id);
  ul.appendChild(li);
}

// Take playlist tracks and return arrays of artist present in the playlist without duplicates
function getArtists(tracks){
  var artists = [];
  for(var i=0; i < tracks.length; i++){
    // for(var j=0; j<tracks[i].track.artists.length; j++){
      if(artists.includes(tracks[i].track.artists[0].name) === false){
        artists.push(tracks[i].track.artists[0].name);
      }
    // }
  }
  return artists;
}

// Take artist and his data and return an object with his name, nationality and city where's from
function setArtistLocation(name,data){
  var artist = {
    name : name,
    country: '',
    city: '', 
  }
  if(data.count>0){ // if artist exist in database
    if(data.artists[0].country){
      artist.country = data.artists[0].country;
    }
    if(data.artists[0]["begin-area"]){
        artist.city = data.artists[0]["begin-area"].name;
    }
  }
  return artist;
}

const APIController = (function() {  

  // private methods - Spotify API
  const _getToken = async () => {
    var token = getUrlParameter('access_token');
    return token;
  }

  const _getPlaylists = async (token) => {
      
      const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
          method: 'GET',
          headers: { 'Authorization' : 'Bearer ' + token}
      });

      const data = await result.json();
      return data.items;
  }

  const _getTracks = async (token, playlist_id) => {
      const result = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
          method: 'GET',
          headers: { 'Authorization' : 'Bearer ' + token}
      });

      const data = await result.json();
      return data.items;
  }

  //MusicBrainz API
   const _getArtistLocation = async (artist_name) => {
    const result = await fetch(`https://musicbrainz.org/ws/2/artist/?query=artist:${artist_name}&fmt=json&limit=1`, {
      method: 'GET',
  });
    var data = await result.json();          
  return data;
  }

  const _getRandomCoordinates = async (country) => {
    const result = await fetch(`https://api.3geonames.org/?randomland=${country}&json=1`, {
      method: 'GET',
      headers:{ 'User-Agent' : 'ArtistLocationVizualiser, (vialle.hugo@gmail.com)'},
  });
    var data = await result.json();
    coordinates = [data.nearest.longt,data.nearest.latt];          
  return coordinates;
  }

  return {
      getToken() {
          return _getToken();
      },
      getPlaylists(token) {
          return _getPlaylists(token);
      },
      getTracks(token, playlist_id) {
        return _getTracks(token, playlist_id);
      },
      getArtistLocation(artist_name){
        return _getArtistLocation(artist_name);
      },
      getRandomCoordinates(country){
        return _getRandomCoordinates(country);
      }
  }
})();

const APPController = (function(APICtrl) {
  const start = async() => { 
    var artists = [];
    const token = await APICtrl.getToken();
    $("#token-hidden").val(token); // Store token value in input 
    const playlists = await APICtrl.getPlaylists(token);

    for(i=0; i<playlists.length; i++) {
      addPlaylistItem(playlists[i]);
    };
  }

  var progressNumber = 0;
  var artistsNumber = 0;
  function updateProgress() {
    progressNumber++;
    var width = progressNumber / artistsNumber * 100;
    $('#myLoadingBar').html(Math.round(width)+'%');
    $('#myLoadingBar').animate({'width':width + '%'});
  }

  // function to create a delay between each request API
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function processPlaylist(id){
  $("#myProgress").css("visibility", "visible");
  var tracks = await APICtrl.getTracks($("#token-hidden").val(),id);
    var artists = getArtists(tracks);
    artistsNumber = artists.length;      // take number of artists 
    progressNumber=0;                 // reset progress bar to O%
    var allArtistsInfo = [];
    var location;
    var artistInfo;
    for(var i = 0; i<artists.length; i++){
      location = await APICtrl.getArtistLocation(artists[i]);
      await delay(800);
      artistInfo = setArtistLocation(artists[i],location);
      allArtistsInfo.push(artistInfo);
      updateProgress();               
    }
    $('#playlistObjectItem').val(JSON.stringify(allArtistsInfo));
    $('#playlistObjectItem').val();
    $("#myProgress").css("visibility", "hidden");
    resetMarker();
}

  $(document).on('click', '#playlist-item', function()  {
    $('#currentPlaylist').val($(this).data().value);
    processPlaylist($('#currentPlaylist').val());
  });

var window = document.querySelector('body');

window.addEventListener('dragover', handleDropOver);
window.addEventListener('drop', handleDrop);

function handleDropOver(evt){
  evt.stopImmediatePropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

function handleDrop(evt){
  var isPlaylist = 0;
  evt.stopImmediatePropagation();
  evt.preventDefault();
  var playlistUrl = evt.dataTransfer.getData('text/plain');
  if(!playlistUrl) return;
  else{
    const splited = playlistUrl.split('/');
    for(i = 0; i<splited.length; i++){
      if(splited[i]=='playlist'){
        isPlaylist = 1;
      }
    }
    if(isPlaylist==0){
      $('#error').fadeIn('normal',function(){
        $('#error').delay(10000).fadeOut();
      });
    }
    else{
      var id = splited[splited.length-1];
      processPlaylist(id);
    }
  }
}

  return {
    init(){
      start();
    }
  }
})(APIController);

APPController.init();