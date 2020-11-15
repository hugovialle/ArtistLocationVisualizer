# ArtistLocationVisualizer

This project retrieve [MusicBrainz](https://musicbrainz.org/)'s data from the name of the artists. Because of this, there are some cases where the data returned is not matching the right artist (if there is a more famous artist with the same name for example) or simply if the artist does not exist in MusicBrainz's database. 
The location are displayed with [MapBox](https://www.mapbox.com/). If the city is unknow the artist will be displayed on the country name. If two artists have the same location, they will be displayed on the same pop-up. 

MusicBrainz is limiting the request at 1 per second, so it can take some time to load a playlist and for that reason only the 100 first tracks of a playlists will be proccessed. 

As mentioned on the page, you can simply drag and drop a playlist on the page ! 
