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
    accessToken: API_KEY
}).addTo(myMap);

// Use this link to get the geojson data.
var lgaAPI = "https://opendata.arcgis.com/datasets/0f6f122c3ad04cc9bb97b025661c31bd_0.geojson";
var suburbAPI = "https://data.gov.au/geoserver/vic-suburb-locality-boundaries-psma-administrative-boundaries/wfs?request=GetFeature&typeName=ckan_af33dd8c_0534_4e18_9245_fc64440f742e&outputFormat=json";

var crimeData = "https://vic-crime.herokuapp.com/api/v1.0/all";

var geojson;


var crimeData2 = "https://vic-crime.herokuapp.com/api/v2.0/lga/all";
var crimeData3 = "";




function getDataAddMarkers({ label, value, map }) {
    console.log(`Timeline slider is set to ${parseInt(label)}`);

    // Clear the choropleth layer at the start of every timeline slider
    map.eachLayer(function (layer) {
        if (geojson) {
            map.removeLayer(geojson);
        }
    })





    // Grabbing our GeoJSON data..
    d3.json(lgaAPI, function (data) {

        // Append crime data to the LGA GeoJSON
        d3.json(crimeData2, function (cData) {

            // console.log(cData[label]);

            var crimeJSON = cData[label];

            for (let i = 0; i < data.features.length; i++) {
                var lgaJSON = data.features[i].properties;
                //console.log(lgaName);
                for (let j in crimeJSON) {
                    if (lgaJSON.ABB_NAME == j.toUpperCase()) {
                        console.log(lgaJSON.CRIME_TOTAL);
                        console.log(`${lgaJSON.ABB_NAME} is equal to ${j}`)
                        lgaJSON.CRIME_TOTAL = crimeJSON[j].crime.Total;
                        console.log(crimeJSON[j].crime.Total);
                        console.log(lgaJSON.CRIME_TOTAL);
                    } else {
                        continue;
                    }
                };
            };




            for (var j = 0; j < data.features.length; j++) {
                // console.log(data.features[j]);

                for (var i = 0; i < cData.length; i++) {

                    if (cData[i]["Year"] === parseInt(label)) {

                        // filter both JSON datasets by LGA name 
                        var geojsonLGA = data.features[j].properties.ABB_NAME;
                        var crimeDataLGA = cData[i]["Local Government Area"];
                        // console.log(`LGA.geojson: ${geojsonLGA}, all.json: ${crimeDataLGA}`)

                        if (geojsonLGA.toLowerCase() === crimeDataLGA.toLowerCase()) {

                            // If object key "VALUE" does not exist in GeoJSON data, add it in and assign it the value of i
                            // If it does exist, add 1 to the value in the object
                            if (!data.features[j].properties.VALUE) {

                                data.features[j].properties.VALUE = i;
                                console.log(data.features[j].properties.VALUE);
                            } else {
                                data.features[j].properties.VALUE = i++;
                            }

                            //             } else {
                            //                 continue;
                            //             }

                        } else {
                            break;
                        }

                    }

                    // }

                    // for (var j = 0; j < data.features.length; j++) {
                    //     // console.log(data.features[j]);

                    //     for (var i = 0; i < cData.length; i++) {

                    //         if (cData[i]["Year"] === parseInt(label)) {

                    //             // filter both JSON datasets by LGA name 
                    //             var geojsonLGA = data.features[j].properties.ABB_NAME;
                    //             var crimeDataLGA = cData[i]["Local Government Area"];
                    //             // console.log(`LGA.geojson: ${geojsonLGA}, all.json: ${crimeDataLGA}`)

                    //             if (geojsonLGA.toLowerCase() === crimeDataLGA.toLowerCase()) {

                    //                 // If object key "VALUE" does not exist in GeoJSON data, add it in and assign it the value of i
                    //                 // If it does exist, add 1 to the value in the object
                    //                 if (!data.features[j].properties.VALUE) {

                    //                     data.features[j].properties.VALUE = i;
                    //                     console.log(data.features[j].properties.VALUE);
                    //                 } else {
                    //                     data.features[j].properties.VALUE = i++;
                    //                 }

                    //             } else {
                    //                 continue;
                    //             }

                    //         } else {
                    //             break;
                    //         }

                    //     }

                    // }






                    // Create a new choropleth layer
                    geojson = L.choropleth(data, {

                        // Define what  property in the features to use
                        valueProperty: "CRIME_TOTAL",


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
                });
    });
};

//=====================================================================
//========================== Timeline Slider ==========================
//=====================================================================

// Custom function to change the map per our API calls


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



// data = {
//     "type": "FeatureCollection",
//     "features": [
//         {
//             "type": "Feature",
//             "properties": {
//                 "title": "Day 1",
//                 "content": "This is where some people moved to."
//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     -73.7949,
//                     40.7282,
//                     1
//                 ]
//             }
//         },
//         {
//             "type": "Feature",
//             "properties": {
//                 "title": "The Next Day",
//                 "content": "This is where some people grooved to."
//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     -74.3838,
//                     40.9148,
//                     1
//                 ]
//             }
//         },
//         {
//             "type": "Feature",
//             "properties": {
//                 "title": "Amazing Event",
//                 "content": "This is where they went to have fun."
//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     4.899431,
//                     52.379189,
//                     1
//                 ]
//             }
//         },
//         {
//             "type": "Feature",
//             "properties": {
//                 "title": "1776",
//                 "content": "This where they went when the revolution had begun."
//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     -71.3489484,
//                     42.4603719,
//                     1
//                 ]
//             }
//         },
//         {
//             "type": "Feature",
//             "properties": {
//                 "title": "1776",
//                 "content": "This where they went when the revolution had begun."

//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     -71.2272,
//                     42.4473,
//                     1
//                 ]
//             }
//         },
//         {
//             "type": "Feature",
//             "properties": {
//                 "title": "1984",
//                 "content": "So they all came here...and disappeared without a trace!"
//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     -0.118092,
//                     51.509865,
//                     1
//                 ]
//             }
//         },
//         {
//             "type": "Feature",
//             "properties": {
//                 "title": "12/22/63",
//                 "content": "Now, this can be quite the scary place."
//             },
//             "geometry": {
//                 "type": "Point",
//                 "coordinates": [
//                     -70.2553259,
//                     43.661471,
//                     1
//                 ]
//             }
//         },
//     ]
// }


// var mymap = L.map('map')

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(mymap);

// getDataAddMarkers = function ({ label, value, map, exclamation }) {
//     map.eachLayer(function (layer) {
//         if (layer instanceof L.Marker) {
//             map.removeLayer(layer);
//         }
//     });

//     filteredData = data.features.filter(function (i, n) {
//         return i.properties.title === label;
//     });

//     var markerArray = [];
//     L.geoJson(filteredData, {
//         onEachFeature: function onEachFeature(feature, layer) {
//             content = `${exclamation} <br> ${feature.properties.content} <br> (${Math.round(value / 6 * 100)}% done with story)`
//             var popup = L.popup().setContent(content);
//             layer.bindPopup(popup);
//             markerArray.push(layer);
//         }
//     }).addTo(map);

//     var markerGroup = L.featureGroup(markerArray);
//     map.fitBounds(markerGroup.getBounds()).setZoom(12);
// };

// L.control.timelineSlider({
//     timelineItems: ["Day 1", "The Next Day", "Amazing Event", "1776", "12/22/63", "1984"],
//     changeMap: getDataAddMarkers,
//     extraChangeMapParams: { exclamation: "Hello World!" }
// })
//     .addTo(mymap);
