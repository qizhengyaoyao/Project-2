// Creating map object
var myMap = L.map("map", {
    center: [-37.840935, 144.946457],
    zoom: 6
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: "pk.eyJ1IjoidG9tcG8iLCJhIjoiY2ttb3BhcHNrMDljdTJvcXB4Y3J6MnRkbCJ9.TEJneXaFNBW1OoWETwQ5rQ"
}).addTo(myMap);

// Use this link to get the geojson data.
var link = "../static/data/LGA.geojson";

// Grabbing our GeoJSON data..
d3.json(link, function (data) {
    // Creating a geoJSON layer with the retrieved data
    L.geoJson(data, {
        // Style each feature (in this case a neighborhood)
        style: function (feature) {
            return {
                color: "blue",
                // Call the chooseColor function to decide which color to color our neighborhood (color based on borough)

                fillOpacity: 0.5,
                weight: 1.5
            };
        },
        // Called on each feature
        onEachFeature: function (feature, layer) {
            // Set mouse events to change map styling
            layer.on({
                // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
                mouseover: function (event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 1
                    });
                },
                // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
                mouseout: function (event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.5
                    });
                },
                // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
                click: function (event) {
                    myMap.fitBounds(event.target.getBounds());
                }
            });
            // Giving each feature a pop-up with information pertinent to it
            layer.bindPopup("<h1>" + feature.properties.ABB_NAME + "</h1>");

        }
    }).addTo(myMap);
});

//=====================================================================
//========================== Timeline Slider ==========================
//=====================================================================

// Custom function to change the map per our API calls
function getDataAddMarkers(test) {
    console.log("this is working!")
};

// Timeline slider plugin for leaflet, can be placed within a function
// Refer to docs: https://github.com/svitkin/leaflet-timeline-slider
L.control.timelineSlider({
    timelineItems: [
        "2011", "2012", "2013",
        "2014", "2015", "2016",
        "2017", "2018", "2019",
        "2020"
    ],      // timeline dates are created using an array of strings
    changeMap: getDataAddMarkers,       // custom function to update the map based on the timeline items
    position: "bottomleft"      // default is "bottomright" if this is preferred
    // extraChangeMapParams: { exclamation: "Hello World!" }       // extra parameters that can be read by the function in changeMap
}).addTo(myMap);

//=====================================================================
//=====================================================================
//=====================================================================
