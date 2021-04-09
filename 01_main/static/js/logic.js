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
var geojson;
var crimeData = "../static/data/all.json";
var choroplethValue = {};
// var choroplethJSON = {};

// Object.values(choroplethValue).forEach(result => {
//     choroplethJSON = tempJSON(result);
// });

// function tempJSON(result) {
//     return {
//         "type": "Feature",
//         "features": [{
//             "properties": {
//                 "LGA": result,
//             },
//             "geometry": {}
//         }]
//     }
// };

// function getColor(d) {
//     console.log(d);
//     return d > 5000 ? '#800026' :
//         d > 3000 ? '#BD0026' :
//             d > 2000 ? '#E31A1C' :
//                 d > 1000 ? '#FC4E2A' :
//                     d > 500 ? '#FD8D3C' :
//                         d > 200 ? '#FEB24C' :
//                             d > 100 ? '#FED976' :
//                                 '#FFEDA0';
// }

// Grabbing our GeoJSON data..
d3.json(link, function (data) {

    // Append crime data to the LGA GeoJSON
    d3.json(crimeData, function (cData) {

        for (var j = 0; j < data.features.length; j++) {
            // console.log(data.features[j]);

            for (var i = 0; i < cData.length; i++) {

                if (cData[i]["Year"] === 2011) {
                    // filter both JSON datasets by LGA name 
                    var geojsonLGA = data.features[j].properties.ABB_NAME;
                    var crimeDataLGA = cData[i]["Local Government Area"];
                    // console.log(`LGA.geojson: ${geojsonLGA}, all.json: ${crimeDataLGA}`)

                    if (geojsonLGA.toLowerCase() == crimeDataLGA.toLowerCase()) {

                        // If object key "VALUE" does not exist in GeoJSON data, add it in and assign it the value of i
                        // If it does exist, add 1 to the value in the object
                        if (!data.features[j].properties.VALUE) {

                            data.features[j].properties.VALUE = i;
                        } else {
                            data.features[j].properties.VALUE = i++;
                        }

                    } else {
                        continue
                    }

                } else {
                    break;
                }

            }
        }

        // Create a new choropleth layer
        geojson = L.choropleth(data, {

            // Define what  property in the features to use
            valueProperty: "VALUE",

            // Set color scale
            scale: ["#ffffb2", "#b10026"],

            // Number of breaks in step range
            steps: 10,

            // q for quartile, e for equidistant, k for k-means
            mode: "q",
            style: {
                // Border color
                color: "#fff",
                weight: 1,
                fillOpacity: 0.5
            },

            // Binding a pop-up to each layer
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

                layer.bindPopup("<h1>" + feature.properties.ABB_NAME + "</h1>");

            }
        }).addTo(myMap)

        // console.log(choroplethValue);
    });


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
    position: "bottomright"      // default is "bottomright" if this is preferred
    // extraChangeMapParams: { exclamation: "Hello World!" }       // extra parameters that can be read by the function in changeMap
}).addTo(myMap);

//=====================================================================
//=====================================================================
//=====================================================================
