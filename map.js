mapboxgl.accessToken = 'pk.eyJ1IjoiaHVnb3YyIiwiYSI6ImNraDZzbWd2YjAxdDMyc2xsOXQwaXc1cHAifQ.6oPEMuK5K9J8jyIDHyGijA';
var map = new mapboxgl.Map({
    container: 'mapContainer',
    style: 'mapbox://styles/hugov2/ckh6u3b701lfd19l7dld9hyo6', // stylesheet location
    center: [43.6378, 1.4209], // starting position [lng, lat]
    zoom: 1 // starting zoom
});
var mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });

var geojson = {
    type: 'FeatureCollection',
    features: [
  ]
  };

var currentMarkers = [];

// set all markers on the map 
function setMarkers(){
  geojson.features.forEach(function (marker) {
    // create a DOM element for the marker
    if(marker.properties.country){
        mapboxClient.geocoding
      .forwardGeocode({
          query: marker.properties.city+', '+marker.properties.country,
          autocomplete: false,
          limit: 1
      })
      .send()
      .then(function (response) {
      if (
      response &&
      response.body &&
      response.body.features &&
      response.body.features.length
      ) {
          if(marker.properties.city){
            var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              '<span style="font-weight:700; font-size:14px">'+marker.properties.name+'</span>'+"<br>"+"From : "+marker.properties.city+", "+marker.properties.country
            );
          }
          else{
            var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              '<span style="font-weight:700; font-size:14px">'+marker.properties.name+'</span>'+"<br>"+"From : "+marker.properties.country
            );
          }
          var feature = response.body.features[0];
          // check if there is already another marker at the same position
          // if so, add the current artist name to the popup's data. 
          for(i = 0; i<currentMarkers.length; i++){
            if(feature.center[0]==currentMarkers[i].getLngLat().lng && feature.center[1]==currentMarkers[i].getLngLat().lat){
              var markerPopup = currentMarkers[i].getPopup();
              currentMarkers[i].remove();
              currentMarkers.splice(i,1);
              var text = markerPopup._content.innerHTML;
              var splitText = text.split('</button>');
              var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                '<span style="font-weight:700; font-size:14px">'+marker.properties.name+'</span>'+'<br>'+splitText[1]
              );
            }
          }
          var pin = new mapboxgl.Marker({color: '#F9AA33', scale: 0.4})
                      .setLngLat(feature.center)
                      .setPopup(popup)
                      .addTo(map);
        }
        currentMarkers.push(pin);
        
      });
    }
});
};

 async function resetMarker() {
  $("#status").val(0);
  if (currentMarkers!==null) {
    for (var i = currentMarkers.length - 1; i >= 0; i--) {
      currentMarkers[i].remove();
    }
  currentMarkers = [];
    
  geojson.features = [];
  var data = JSON.parse($("#playlistObjectItem").val());
  data.forEach(function(artist){
    var marker = {
      type: 'Feature',
      geometry: {
        type: 'Point',
      },
      properties: {
      }
    };
    marker.properties = artist;
    geojson.features.push(marker);
  });
  } 
  setMarkers();
};