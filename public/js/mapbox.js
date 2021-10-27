const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FicmllbGdhdXJhdiIsImEiOiJja3Y5NWx2bjgwOGk2MnZ0MmZicWs4cGY3In0.ZZqFlu_meAwdH0eoyPAhpQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});