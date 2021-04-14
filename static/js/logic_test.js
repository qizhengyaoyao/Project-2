// Creating map object
var myMap = L.map("map", {
    center: [-37.814563, 144.97026699999998],
    zoom: 7
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/dark-v10",
    accessToken: API_KEY
}).addTo(myMap);

var time_list=[
    "2011", "2012", "2013",
    "2014", "2015", "2016",
    "2017", "2018", "2019",
    "2020"
]

var geojson_dict={}
var legend_dict={}


// Use this link to get the geojson data.
// const lgaAPI = "https://opendata.arcgis.com/datasets/0f6f122c3ad04cc9bb97b025661c31bd_0.geojson";
const lgaAPI = "/api/v3.0/lga/geojson?off_field=subdiv";
// const lgaAPI = "../static/data/LGA.geojson" // Only use this if the variable above does not work!
// const suburbAPI = "https://data.gov.au/geoserver/vic-suburb-locality-boundaries-psma-administrative-boundaries/wfs?request=GetFeature&typeName=ckan_af33dd8c_0534_4e18_9245_fc64440f742e&outputFormat=json";

var geojson; // empty variable to hold cloropleth
var legend;

// const lgaCrimeData = "/api/v3.0/lga/all?off_field=subdiv";
const crimeTypes = "/api/v3.0/all_type";

const suburbCrimeData = "";

var crimeDivisions = {};

// Store the offencecrime division code (e.g. A, B, C etc.)
// and the offence/crime division into the variable crimeDivisions
// for use in the function getLGACrime that will populate the popup
d3.json(crimeTypes, function (cTypes) {
    // console.log(cTypes)
    for (let i in cTypes) {
          // console.log(cTypes[i]["Offence Division code"]);
          if (!crimeDivisions[cTypes[i]["Offence Division code"]]) {
                crimeDivisions[cTypes[i]["Offence Division code"]] = cTypes[i]["Offence Division"];
          }
           else {
                continue;
          }
    };
});

function createlayer (label) {
    d3.json(lgaAPI, function (data) {
        var valueCrime = [];
        for (i = 0; i < data["features"].length; i++) {
            //   console.log(i);
            var lgaProperties = data["features"][i]["properties"];
            if (label in lgaProperties){
                valueCrime.push(parseInt(data["features"][i]["properties"][label]["crime"]["Total"]))
            }};
//=========================================== LEGEND ===================================================
        sortedCrimeValues = valueCrime.sort((a, b) => b - a);
        var maxCrime = sortedCrimeValues[0];
        var minCrime = sortedCrimeValues[sortedCrimeValues.length - 1]
        var steps = (maxCrime - minCrime)/10
        // console.log(maxCrime);
        // console.log(minCrime);
        //https://gka.github.io/palettes/
        var colours = ['#00ff66', '#62ed60', '#85da5a', '#9cc754', '#adb34f', '#bb9f49', '#c68944', '#cf723f', '#d6573a', '#dc3136']
        var legend = L.control({ position: "bottomright" });
        legend.onAdd = function () {
            // create div for legend and create buckets
            var div = L.DomUtil.create("div", "info legend");
            div.innerHTML += "<h4><b>Crime Scale</h4>"
            div.innerHTML += '<span><b>Year: ' + label + ' </b></span><br>'
            div.innerHTML += "<h9><b>Highest Crime</b></h9><br>";
            div.innerHTML += '<i style="background:' + colours[9] + '"></i><span><b>' + maxCrime + ' -</b></span><br>';
            div.innerHTML += '<i style="background:' + colours[8]  + '"></i><span></span><br>';
            div.innerHTML += '<i style="background:' + colours[7]  + '"></i><span></span><br>';
            div.innerHTML += '<i style="background:' + colours[6]  + '"></i><span></span><br>';
            div.innerHTML += '<i style="background:' + colours[5]  + '"></i><span></span><br>';
            div.innerHTML += '<i style="background:' + colours[4]  + '"></i><span></span><br>';
            div.innerHTML += '<i style="background:' + colours[3]  + '"></i><span></span><br>';
            div.innerHTML += '<i style="background:' + colours[2]  + '"></i><span></span><br>';
            div.innerHTML += '<i style="background:' + colours[1]  + '"></i><span></span><br>';
            div.innerHTML += '<i style="background:' + colours[0]  + '"></i><span><b>' + minCrime + ' -</b></span><br>';
            div.innerHTML += '<h8><b>Lowest Crime</b></h9>'

            return div;
      };
      legend.addTo(myMap);
      legend_dict[label]=legend;

//=================================================CLOROPLETH =============================================

        // Create a new choropleth layer
        geojson = L.choropleth(data, {
            // Define what  property in the features to use
            valueProperty: function (feature) {
                if (label in feature.properties){
                    return feature.properties[label]["crime"]["Total"];
                }
                else {
                    return 0;
                }
            },
            // Set color scale
            scale: [colours[0],colours[9]],
            // Number of breaks in step range
            steps: 10,
            // q for quartile, e for equidistant, k for k-means
            mode: "q",
            style: {
                // Border color
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
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
                            fillOpacity: 0.8
                        });
                    },
                    // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
                    click: function (event) {
                        myMap.fitBounds(event.target.getBounds());
                    }
                });
                // call getLGACrime function, parse LGA Name in capitalised format to match our lgaCrimeData json
                layer.bindPopup(`<h4><b> ${feature.properties.ABB_NAME} </b></h4>
                ${getLGACrime(feature,label)}`                        
                );
            }
        }).addTo(myMap);
        geojson_dict[label]=geojson;
    });
}

function getDataAddMarkers({ label, value, map }) {
    console.log(`Timeline slider is set to ${parseInt(label)}`);

//======================================= CLEARING CLOROPLETH / LEGEND ====================================

    // Clear the choropleth layer at the start of every timeline slider change (including init)
    map.eachLayer(function (layer) {
          if (geojson) {
                map.removeLayer(geojson);
          }
    })

    var legendRemove = d3.select(".legend");
    legendRemove.remove();

//=========================================== FILTERING ==================================================

    // Grabbing our GeoJSON data..
    if (!(label in geojson_dict)){
        createlayer(label);
    }
    else {
        legend=legend_dict[label].addTo(myMap);
        geojson=geojson_dict[label].addTo(myMap);
    }
    
};

//======================================= CRIME DIVISION VALUES PER LGA =======================================

// Populate the popup with relevant crime division data to each LGA
function getLGACrime(feature, label) {
    try { // in case our data is incomplete compared to the LGA geoJSON
        var output = [];
        Object.entries(feature["properties"][label]["crime"]["Div"]).forEach((key, value) => {
            output.push(`<div id = "bindPopup"><p><b>${crimeDivisions[key[0]]}: </b>:${key[1]}</p></div>`);
        })
        //   console.log(output)
    } catch (err) { // catch any errors from a lack of data, etc.
        console.log(`no data for ${feature["properties"]["ABB_NAME"]}`);
    }
    return output;
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
//====================================================================
//=====================================================================
//=====================================================================


