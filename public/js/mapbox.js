export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FicmllbGdhdXJhdiIsImEiOiJja3Y5ZndtcXUxb3ZoMzNva2tpOXR4eWljIn0.CeyZVXUOIVhm-EcPNrUgxg';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/gabrielgaurav/ckv9gci6n38v315t5m592m6si',
        scrollZoom: false
        // center: [],
        // zoom: 10,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds(); // area that will be displayed in the map

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker'; // specifying class in element 
        // .marker {
        //     background-image: url('../img/pin.png');
        //     background-size: cover;
        //     width: 32px;
        //     height: 40px;
        //     cursor: pointer;
        // }

        // Add marker
        new mapboxgl.Marker({
            element: el, 
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        // Add pop up
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

        // extend map bounds to include current location - zooming effect - fitBounds zooms the map to fit our marker
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds);
}

