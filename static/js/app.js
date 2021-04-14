// YOUR CODE HERE!
// console.log(tableData);
var tbody = d3.select("tbody");

function addcrimedata(crimedata) {
    for ([year, suburbdata] of Object.entries(crimedata)) {
        console.log(year, suburbdata);
        for ([suburb, data] of Object.entries(suburbdata)) {
            var row = tbody.append("tr");
            row.append("td").text(year);
            row.append("td").text(suburb);
            row.append("td").text(data["postcode"]);
            row.append("td").text(data["Local Government Area"]);
            row.append("td").text(data["crime"]["Div"]["A"]);
            row.append("td").text(data["crime"]["Div"]["B"]);
            row.append("td").text(data["crime"]["Div"]["C"]);
            row.append("td").text(data["crime"]["Div"]["D"]);
            row.append("td").text(data["crime"]["Div"]["E"]);
            row.append("td").text(data["crime"]["Div"]["F"]);
            row.append("td").text(data["crime"]["Total"]);
        }
      }
};


var button = d3.select("#filter-btn");

button.on("click", runEnter);

function runEnter() {

    // Prevent the page from refreshing
    d3.event.preventDefault();
    
    // Select the input element and get the raw HTML node
    var inputpostcode = d3.select("#postcode").property("value");
    var inputsuburb = d3.select("#suburb").property("value");
    var inputlga = d3.select("#lga").property("value");
    var inputyear = d3.select("#year").property("value");
  
    // Get the value property of the input element
    // var inputValue = inputDate.property("value");
  
    // console.log(inputDate);

    crimedata_url= `/api/v3.0/crime_data?off_field=subdiv&`;
    if (inputpostcode!="") {crimedata_url=`${crimedata_url}postcode=${inputpostcode}&`}
    if (inputsuburb!="") {crimedata_url=`${crimedata_url}suburb=${inputsuburb}&`}
    if (inputlga!="") {crimedata_url=`${crimedata_url}lga=${inputlga}&`}
    if (inputyear!="") {crimedata_url=`${crimedata_url}year=${inputyear}&`}
  
    // console.log(filteredData);
    tbody.html("");

    d3.json(crimedata_url, function (data) {
        if(Object.keys(data).length != 0) {
            addcrimedata(data);
        }
        else {
            var cell = tbody.append("tr").append("td");
            cell.text("No Data matches the input value.");
            cell.attr("colspan", "7");
        }
    });

    
  };