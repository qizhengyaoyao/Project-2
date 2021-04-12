// Creating map object
var myMap = L.map("map", {
    center: [-37.840935, 144.946457],
    zoom: 6
});

// // Adding tile layer
// L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//     tileSize: 512,
//     maxZoom: 18,
//     zoomOffset: -1,
//     id: "mapbox/streets-v11",
//     accessToken: API_KEY
// }).addTo(myMap);

// Use this link to get the geojson data.
const lgaAPI = "https://opendata.arcgis.com/datasets/0f6f122c3ad04cc9bb97b025661c31bd_0.geojson";
// const lgaAPI = "../static/data/LGA.geojson" // Only use this if the variable above does not work!
const suburbAPI = "https://data.gov.au/geoserver/vic-suburb-locality-boundaries-psma-administrative-boundaries/wfs?request=GetFeature&typeName=ckan_af33dd8c_0534_4e18_9245_fc64440f742e&outputFormat=json";
var geojson;

const lgaCrimeData = "https://vic-crime.herokuapp.com/api/v2.0/lga/all?output=div";
const crimeTypes = "https://vic-crime.herokuapp.com/api/v2.0/all_type";
const suburbCrimeData = "";




function getDataAddMarkers({ label, value, map }) {
    console.log(`Timeline slider is set to ${parseInt(label)}`);

    // Clear the choropleth layer at the start of every timeline slider change (including init)
    map.eachLayer(function (layer) {
        if (geojson) {
            map.removeLayer(geojson);
        }
    })

    // Grabbing our GeoJSON data..
    d3.json(lgaAPI, function (data) {

        // Append crime data to the LGA GeoJSON
        d3.json(lgaCrimeData, function (cData) {

            // console.log(cData[label]);
            var crimeDivisions = {};
            var crimeJSON = cData[label];


            // Store the offence/crime division code (e.g. A, B, C etc.)
            // and the offence/crime division into the variable crimeDivisions
            // for use in the function getLGACrime that will populate the popup
            d3.json(crimeTypes, function (cTypes) {
                // console.log(cTypes)
                for (let i in cTypes) {
                    // console.log(cTypes[i]["Offence Division code"]);
                    if (!crimeDivisions[cTypes[i]["Offence Division code"]]) {
                        crimeDivisions[cTypes[i]["Offence Division code"]] = cTypes[i]["Offence Division"];
                    } else {
                        continue;
                    }
                }
                console.log(crimeDivisions);


                for (let i = 0; i < data.features.length; i++) {
                    let lgaProperties = data.features[i].properties;
                    //console.log(lgaName);
                    for (let j in crimeJSON) {
                        if (lgaProperties.ABB_NAME == j.toUpperCase()) {
                            // console.log(lgaJSON.CRIME_TOTAL);
                            // console.log(`${lgaJSON.ABB_NAME} is equal to ${j}`)
                            lgaProperties.CRIME_TOTAL = crimeJSON[j].crime.Total;
                            // console.log(crimeJSON[j].crime.Total);
                            // console.log(lgaJSON.CRIME_TOTAL);
                        } else {
                            continue;
                        }
                    };
                };


                // Populate the popup with relevant crime division data to each LGA
                function getLGACrime(lgaName) {
                    try { // in case our data is incomplete compared to the LGA geoJSON
                        var filteredLGA = Object.entries(cData[label][lgaName]).filter((result, i) => result);
                        var output = [];
                        Object.entries(filteredLGA[3][1].Div).forEach((key, value) => {
                            output.push(`${crimeDivisions[key[0]]}: ${key[1]}`);
                        })
                    } catch (err) { // catch any errors from a lack of data, etc.
                        console.log("no data for this LGA!");
                    }
                    return output;
                };

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
                        // call getLGACrime function, parse LGA Name in capitalised format to match our lgaCrimeData json
                        layer.bindPopup(
                            `<h1> ${feature.properties.ABB_NAME}</h1>
                    <hr>
                        <h3>${getLGACrime(feature.properties.ABB_NAME.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase()))))}</h3>
                        `
                        );

                    }
                }).addTo(myMap)
            });
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
    // extraChangeMapParams: {exclamation: "Hello World!" }       // extra parameters that can be read by the function in changeMap
}).addTo(myMap);

//=====================================================================
//=====================================================================
//=====================================================================

