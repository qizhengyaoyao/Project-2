# import necessary libraries
import os
from dotenv import load_dotenv
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
import pymongo
from flask_cors import CORS
import requests

#################################################
# Database Setup
#################################################

# Load the environments
load_dotenv()
client = pymongo.MongoClient(os.getenv("MONGODB_URI"))
API_KEY=os.getenv("API_KEY")
vic_db = client['vic_crime']
lgaAPI = "https://opendata.arcgis.com/datasets/0f6f122c3ad04cc9bb97b025661c31bd_0.geojson"

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
CORS(app)

#################################################
# Flask Routes
#################################################

# Render the html pages
@app.route("/")
@app.route("/index")
def Welcome():
    return render_template("index.html")

@app.route("/data")
def data():
    return render_template("data.html")

@app.route("/visualisation")
def visualisation():
    return render_template("visualisation.html", API_KEY=API_KEY)

@app.route("/table")
def table():
    return render_template("table.html")

@app.route("/api_doc")
def welcome():
    """List all available api routes."""
    return (
        f"<h1>Available Routes:</h1>"
        f"<h3><a href=api/v3.0/all>/api/v3.0/all</a><h3>"
        f"<h3><a href=api/v3.0/all_type>/api/v3.0/all_type</a><h3>"
        f"<h3><a href=api/v3.0/lga/all>/api/v3.0/lga/all</a><h3>"
        f"<h3><a href=api/v3.0/region/all>/api/v3.0/region/all</a><h3>"
        f"<h3><a href=api/v3.0/vic/all>/api/v3.0/vic/all</a><h3>"
        f"<h3>/api/v3.0/crime_data?&ltfilter_list&gt</h3>"
        f"&ltfilter_list&gt: field1=condition1&field2=condition2&....</br>"
        f"field:</br>"
        f"<li>postcode</li>"
        f"<li>suburb</li>"
        f"<li>lga</li>"
        f"<li>region</li>"
        f"<li>year</li>"
        f"</br>"
        f"&ltfilter_list&gt exmaple</br>"
        #f"<a href=api/v1.0/crime_data?postcode=3000&suburb=melbourne&lga=melbourne&region=northern%20metropolitan&year=2011&year=2020>postcode=3000&suburb=melbourne&lga=melbourne&ampregion=northern metropolitan&year=2011&year=2020</a>"
        f"<a href=api/v3.0/crime_data?postcode=3000&suburb=melbourne&lga=melbourne&region=northern%20metropolitan&year=2011&year=2020>postcode=3000&suburb=melbourne&lga=melbourne&ampregion=northern metropolitan&year=2011&year=2020</a>"
    )

# Unpack the crime type database to dictionary
def unwrap_crimetp(db):
    dic={}
    dic["Offence Subdivision code"]=[]
    dic["Offence Subdivision"]=[]
    dic["Offence Division code"]=[]
    dic["Offence Division"]=[]

    for x in db:
        dic["Offence Subdivision code"].append(x["Offence Subdivision code"])
        dic["Offence Subdivision"].append(x["Offence Subdivision"])
        dic["Offence Division code"].append(x["Offence Division code"])
        dic["Offence Division"].append(x["Offence Division"])
    
    return dic

# return all the crime data for each suburb/year.
@app.route("/api/v3.0/all")
def all_crime_json():
    off_field=request.args.getlist('off_field')
    off_field=[x.lower() for x in off_field]
    
    # Create our session (link) from Python to the DB
    crime=vic_db.vic_crime_db.find({},{"_id":0})
    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})
    crimetp_dic=unwrap_crimetp(crimetp)

    """Return a list of all crime of each suburb/year"""
    all_crime={}

    for x in crime:
        year=x["Year"]
        if year not in all_crime.keys():
            all_crime[year]={}
        
        suburb=x["suburb"]
        if suburb not in all_crime[year].keys():
            all_crime[year][suburb]={}
            all_crime[year][suburb]["Year"]=year
            all_crime[year][suburb]["suburb"]=suburb
            all_crime[year][suburb]["postcode"]=x["postcode"]
            all_crime[year][suburb]["Local Government Area"]=x["Local Government Area"]
            all_crime[year][suburb]["Region"]=x["Region"]

            all_crime[year][suburb]["crime"]={}
            all_crime[year][suburb]["crime"]["Total"]=0
            if "div" not in off_field: 
                all_crime[year][suburb]["crime"]["Div"]={}
                for code in crimetp_dic["Offence Division code"]:
                    all_crime[year][suburb]["crime"]["Div"][code]=0
            
            if "subdiv" not in off_field: 
                all_crime[year][suburb]["crime"]["Subdiv"]={}
                for code in crimetp_dic["Offence Subdivision code"]:
                    all_crime[year][suburb]["crime"]["Subdiv"][code]=0

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            all_crime[year][suburb]["crime"]["Total"]=x["Total"]
            if "div" not in off_field: 
                all_crime[year][suburb]["crime"]["Div"][div_code]=x[div_code]
            if "subdiv" not in off_field: 
                all_crime[year][suburb]["crime"]["Subdiv"][sub_code]=x[sub_code]

    return jsonify(all_crime)

# return all  the crime for each local government area/year.
@app.route("/api/v3.0/lga/all")
def lga_all_crime_3():
    off_field=request.args.getlist('off_field')
    off_field=[x.lower() for x in off_field]

    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})
    crimetp_dic=unwrap_crimetp(crimetp)

    groupby = ["Year","Local Government Area","Region"]
    group = {
        '_id': ["$%s" % (x if x else None) for x in groupby],
        'Total': {'$sum': "$Total"}
        }
    if "div" not in off_field:
        for code in crimetp_dic["Offence Division code"]:
            group[code]={'$sum': "$%s"%code}
    if "subdiv" not in off_field: 
        for code in crimetp_dic["Offence Subdivision code"]:
            group[code]={'$sum': "$%s"%code}

    crime=vic_db.vic_crime_db.aggregate([{"$group":group}])

    """Return a list of all crime sum by lga/year"""
    lga_crime={}

    for x in crime:
        year=x["_id"][0]
        if year not in lga_crime.keys():
            lga_crime[year]={}

        lga=x["_id"][1]
        if "Greater" in lga:
             lga=lga.split(" ")[1]
        region=x["_id"][2]
        if lga not in lga_crime[year].keys():
            lga_crime[year][lga]={}
            lga_crime[year][lga]["Year"]=year
            lga_crime[year][lga]["Local Government Area"]=lga
            lga_crime[year][lga]["Region"]=region
            lga_crime[year][lga]["crime"]={}
            lga_crime[year][lga]["crime"]["Total"]=0
            if "div" not in off_field: 
                lga_crime[year][lga]["crime"]["Div"]={}
            if "subdiv" not in off_field: 
                lga_crime[year][lga]["crime"]["Subdiv"]={}

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            lga_crime[year][lga]["crime"]["Total"]=x["Total"]
            if "div" not in off_field: 
                lga_crime[year][lga]["crime"]["Div"][div_code]=x[div_code]
            if "subdiv" not in off_field: 
                lga_crime[year][lga]["crime"]["Subdiv"][sub_code]=x[sub_code]

    return jsonify(lga_crime)

# return all  the crime for each region/year.
@app.route("/api/v3.0/region/all")
def region_all_crime_3():
    off_field=request.args.getlist('off_field')
    off_field=[x.lower() for x in off_field]

    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})
    crimetp_dic=unwrap_crimetp(crimetp)

    groupby = ["Year","Region"]
    group = {
        '_id': ["$%s" % (x if x else None) for x in groupby],
        'Total': {'$sum': "$Total"}
        }
    if "div" not in off_field:
        for code in crimetp_dic["Offence Division code"]:
            group[code]={'$sum': "$%s"%code}
    if "subdiv" not in off_field: 
        for code in crimetp_dic["Offence Subdivision code"]:
            group[code]={'$sum': "$%s"%code}

    crime=vic_db.vic_crime_db.aggregate([{"$group":group}])

    """Return a list of all crime sum by region/year"""
    region_crime={}

    for x in crime:
        year=x["_id"][0]
        if year not in region_crime.keys():
            region_crime[year]={}

        region=x["_id"][1]
        if region not in region_crime[year].keys():
            region_crime[year][region]={}
            region_crime[year][region]["Year"]=year
            region_crime[year][region]["Region"]=region
            region_crime[year][region]["crime"]={}
            region_crime[year][region]["crime"]["Total"]=0
            if "div" not in off_field: 
                region_crime[year][region]["crime"]["Div"]={}
            if "subdiv" not in off_field: 
                region_crime[year][region]["crime"]["Subdiv"]={}

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            region_crime[year][region]["crime"]["Total"]=x["Total"]
            if "div" not in off_field: 
                region_crime[year][region]["crime"]["Div"][div_code]=x[div_code]
            if "subdiv" not in off_field: 
                region_crime[year][region]["crime"]["Subdiv"][sub_code]=x[sub_code]

    return jsonify(region_crime)

# return all  the crime for each year in victoria.
@app.route("/api/v3.0/vic/all")
def vic_all_crime_3():
    off_field=request.args.getlist('off_field')
    off_field=[x.lower() for x in off_field]

    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})
    crimetp_dic=unwrap_crimetp(crimetp)

    groupby = ["Year"]
    group = {
        '_id': ["$%s" % (x if x else None) for x in groupby],
        'Total': {'$sum': "$Total"}
        }
    if "div" not in off_field:
        for code in crimetp_dic["Offence Division code"]:
            group[code]={'$sum': "$%s"%code}
    if "subdiv" not in off_field: 
        for code in crimetp_dic["Offence Subdivision code"]:
            group[code]={'$sum': "$%s"%code}

    crime=vic_db.vic_crime_db.aggregate([{"$group":group}])

    """Return a list of all crime sum by year"""
    vic_crime={}

    for x in crime:
        year=x["_id"][0]
        if year not in vic_crime.keys():
            vic_crime[year]={}

        vic_crime[year]={}
        vic_crime[year]["Year"]=year
        vic_crime[year]["crime"]={}
        vic_crime[year]["crime"]["Total"]=0
        if "div" not in off_field: 
            vic_crime[year]["crime"]["Div"]={}
        if "subdiv" not in off_field: 
            vic_crime[year]["crime"]["Subdiv"]={}

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            vic_crime[year]["crime"]["Total"]=x["Total"]
            if "div" not in off_field: 
                vic_crime[year]["crime"]["Div"][div_code]=x[div_code]
            if "subdiv" not in off_field: 
                vic_crime[year]["crime"]["Subdiv"][sub_code]=x[sub_code]

    return jsonify(vic_crime)

# return the suburb list of each local government area.
@app.route("/api/v3.0/lga/all_suburb")
def lga_all_suburb():
    groupby = ["suburb","Local Government Area"]
    group = {
        '_id': ["$%s" % (x if x else None) for x in groupby]
        }

    crime=vic_db.vic_crime_db.aggregate([{"$group":group}])

    """Return a list of all suburb in each lga"""
    lga_suburb=[]

    for x in crime:
        suburb=x["_id"][0]
        lga=x["_id"][1]
        if "Greater" in lga:
             lga=lga.split(" ")[1]
        
        suburb=suburb.lower()
        lga=lga.lower()

        tmp_dict={"suburb":suburb,"lga_name":lga}

        lga_suburb.append(tmp_dict)

    return jsonify(lga_suburb)

# return the crime division/subdivision name and code.
@app.route("/api/v3.0/all_type")
def all_crimetype_3():
    # Create our session (link) from Python to the DB
    test=vic_db.vic_crimetype_db.find({},{"_id":0})

    """Return a list of all types"""
    all_crimetype=[]

    for x in test:
        all_crimetype.append(x)

    return jsonify(all_crimetype)

# return the filtered data depending on the input parameters. 
# For example, request https://vic-crime.herokuapp.com/api/v3.0/crime_data?suburb=melbourne&year=2011&year=2020&off_field=subdiv 
# will retrun the crime data (exclude the data of crime subdivisions) of melbourne suburb in year 2011 and year 2020.
@app.route('/api/v3.0/crime_data')
def crime_data_json():
    # Create our session (link) from Python to the DB
    postcode=request.args.getlist('postcode')
    postcode=[int(x) for x in postcode]

    suburb=request.args.getlist('suburb')
    suburb=[x.lower() for x in suburb]

    lga=request.args.getlist('lga')
    lga=[x.lower() for x in lga]
    lga=[x.title() for x in lga]

    region=request.args.getlist('region')
    region=[x.lower() for x in region]
    region=[x.title() for x in region]

    year=request.args.getlist('year')
    year=[int(x) for x in year]

    off_field=request.args.getlist('off_field')
    off_field=[x.lower() for x in off_field]

    query={}

    if (len(postcode)): query["postcode"]={"$in": postcode}
    if (len(suburb)): query["suburb"]={"$in": suburb}
    if (len(lga)): query["Local Government Area"]={"$in": lga}
    if (len(region)): query["Region"]={"$in": region}
    if (len(year)): query["Year"]={"$in": year}

    #crime=vic_db.vic_crime_db.find()
    crime=vic_db.vic_crime_db.find(query,{"_id":0})
    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})
    crimetp_dic=unwrap_crimetp(crimetp)
    
    """Return a list of all crime satisty the query list"""
    all_crime={}

    for x in crime:
        year=x["Year"]
        if year not in all_crime.keys():
            all_crime[year]={}
        
        suburb=x["suburb"]
        if suburb not in all_crime[year].keys():
            all_crime[year][suburb]={}
            all_crime[year][suburb]["Year"]=year
            all_crime[year][suburb]["suburb"]=suburb
            all_crime[year][suburb]["postcode"]=x["postcode"]
            all_crime[year][suburb]["Local Government Area"]=x["Local Government Area"]
            all_crime[year][suburb]["Region"]=x["Region"]

            all_crime[year][suburb]["crime"]={}
            all_crime[year][suburb]["crime"]["Total"]=0
            if "div" not in off_field: 
                all_crime[year][suburb]["crime"]["Div"]={}
                for code in crimetp_dic["Offence Division code"]:
                    all_crime[year][suburb]["crime"]["Div"][code]=0
            if "subdiv" not in off_field: 
                all_crime[year][suburb]["crime"]["Subdiv"]={}
                for code in crimetp_dic["Offence Subdivision code"]:
                    all_crime[year][suburb]["crime"]["Subdiv"][code]=0

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            all_crime[year][suburb]["crime"]["Total"]=x["Total"]
            if "div" not in off_field: 
                all_crime[year][suburb]["crime"]["Div"][div_code]=x[div_code]
            if "subdiv" not in off_field: 
                all_crime[year][suburb]["crime"]["Subdiv"][sub_code]=x[sub_code]

    return jsonify(all_crime)

if __name__ == '__main__':
    app.run(debug=True)

