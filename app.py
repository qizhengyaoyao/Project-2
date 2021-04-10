# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
import pymongo
from flask_cors import CORS

#################################################
# Database Setup
#################################################
url = "mongodb+srv://mahjong:mahjong@cluster0.pyqix.mongodb.net/vic_crime?retryWrites=true&w=majority"

client = pymongo.MongoClient(os.getenv("MONGODB_URI", url))

vic_db = client['vic_crime']

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
CORS(app)

#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"<h1>Available Routes:</h1>"
        #f"<h3><a href=api/v1.0/all>/api/v1.0/all</a><h3>"
        f"<h3><a href=api/v2.0/all>/api/v2.0/all</a><h3>"
        #f"<h3><a href=api/v1.0/all_type>/api/v1.0/all_type</a><h3>"
        f"<h3><a href=api/v2.0/all_type>/api/v2.0/all_type</a><h3>"
        #f"<h3>/api/v1.0/crime_data?&ltfilter_list&gt</h3>"
        f"<h3><a href=api/v2.0/lga/all>/api/v2.0/lga/all</a><h3>"
        f"<h3><a href=api/v2.0/region/all>/api/v2.0/region/all</a><h3>"
        f"<h3><a href=api/v2.0/vic/all>/api/v2.0/vic/all</a><h3>"
        f"<h3>/api/v2.0/crime_data?&ltfilter_list&gt</h3>"
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
        f"<a href=api/v2.0/crime_data?postcode=3000&suburb=melbourne&lga=melbourne&region=northern%20metropolitan&year=2011&year=2020>postcode=3000&suburb=melbourne&lga=melbourne&ampregion=northern metropolitan&year=2011&year=2020</a>"

    )

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

@app.route("/api/v1.0/all")
def all_crime():
    # Create our session (link) from Python to the DB
    test=vic_db.vic_crime_db.find({},{"_id":0})

    """Return a list of all crime"""
    # Query all passengers
    all_crime=[]

    for x in test:
        all_crime.append(x)

    return jsonify(all_crime)

@app.route("/api/v2.0/all")
def all_crime_json():
    # Create our session (link) from Python to the DB
    crime=vic_db.vic_crime_db.find({},{"_id":0})
    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})
    crimetp_dic=unwrap_crimetp(crimetp)

    """Return a list of all crime"""
    # Query all passengers
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
            all_crime[year][suburb]["crime"]["Div"]={}
            all_crime[year][suburb]["crime"]["Subdiv"]={}
            for code in crimetp_dic["Offence Division code"]:
                all_crime[year][suburb]["crime"]["Div"][code]=0
            for code in crimetp_dic["Offence Subdivision code"]:
                all_crime[year][suburb]["crime"]["Subdiv"][code]=0

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            all_crime[year][suburb]["crime"]["Subdiv"][sub_code]=x[sub_code]
            all_crime[year][suburb]["crime"]["Div"][div_code]+=x[sub_code]
            all_crime[year][suburb]["crime"]["Total"]+=x[sub_code]

    return jsonify(all_crime)

@app.route("/api/v2.0/lga/all")
def lga_all_crime_json():
    # Create our session (link) from Python to the DB
    crime=vic_db.vic_crime_db.find({},{"_id":0})
    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})

    crimetp_dic=unwrap_crimetp(crimetp)

    """Return a list of all crime sum by lga/year"""
    lga_crime={}

    for x in crime:
        year=x["Year"]
        if year not in lga_crime.keys():
            lga_crime[year]={}

        lga=x["Local Government Area"]
        if lga not in lga_crime[year].keys():
            lga_crime[year][lga]={}
            lga_crime[year][lga]["Year"]=year
            lga_crime[year][lga]["Local Government Area"]=lga
            lga_crime[year][lga]["Region"]=x["Region"]
            lga_crime[year][lga]["crime"]={}
            lga_crime[year][lga]["crime"]["Total"]=0
            lga_crime[year][lga]["crime"]["Div"]={}
            lga_crime[year][lga]["crime"]["Subdiv"]={}
            for code in crimetp_dic["Offence Division code"]:
                lga_crime[year][lga]["crime"]["Div"][code]=0
            for code in crimetp_dic["Offence Subdivision code"]:
                lga_crime[year][lga]["crime"]["Subdiv"][code]=0

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            lga_crime[year][lga]["crime"]["Subdiv"][sub_code]+=x[sub_code]
            lga_crime[year][lga]["crime"]["Div"][div_code]+=x[sub_code]
            lga_crime[year][lga]["crime"]["Total"]+=x[sub_code]

    return jsonify(lga_crime)

@app.route("/api/v2.0/region/all")
def region_all_crime_json():
    # Create our session (link) from Python to the DB
    crime=vic_db.vic_crime_db.find({},{"_id":0})
    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})

    crimetp_dic=unwrap_crimetp(crimetp)

    """Return a list of all crime sum by lga/year"""
    region_crime={}

    for x in crime:
        year=x["Year"]
        if year not in region_crime.keys():
            region_crime[year]={}

        region=x["Region"]
        if region not in region_crime[year].keys():
            region_crime[year][region]={}
            region_crime[year][region]["Year"]=year
            region_crime[year][region]["Region"]=region
            region_crime[year][region]["crime"]={}
            region_crime[year][region]["crime"]["Total"]=0
            region_crime[year][region]["crime"]["Div"]={}
            region_crime[year][region]["crime"]["Subdiv"]={}
            for code in crimetp_dic["Offence Division code"]:
                region_crime[year][region]["crime"]["Div"][code]=0
            for code in crimetp_dic["Offence Subdivision code"]:
                region_crime[year][region]["crime"]["Subdiv"][code]=0

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            region_crime[year][region]["crime"]["Subdiv"][sub_code]+=x[sub_code]
            region_crime[year][region]["crime"]["Div"][div_code]+=x[sub_code]
            region_crime[year][region]["crime"]["Total"]+=x[sub_code]

    return jsonify(region_crime)

@app.route("/api/v2.0/vic/all")
def vic_all_crime_json():
    # Create our session (link) from Python to the DB
    crime=vic_db.vic_crime_db.find({},{"_id":0})
    crimetp=vic_db.vic_crimetype_db.find({},{"_id":0})

    crimetp_dic=unwrap_crimetp(crimetp)

    """Return a list of all crime sum by lga/year"""
    region_crime={}

    for x in crime:
        year=x["Year"]
        if year not in region_crime.keys():
            region_crime[year]={}
            region_crime[year]={}
            region_crime[year]["Year"]=year
            region_crime[year]["crime"]={}
            region_crime[year]["crime"]["Total"]=0
            region_crime[year]["crime"]["Div"]={}
            region_crime[year]["crime"]["Subdiv"]={}
            for code in crimetp_dic["Offence Division code"]:
                region_crime[year]["crime"]["Div"][code]=0
            for code in crimetp_dic["Offence Subdivision code"]:
                region_crime[year]["crime"]["Subdiv"][code]=0

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            region_crime[year]["crime"]["Subdiv"][sub_code]+=x[sub_code]
            region_crime[year]["crime"]["Div"][div_code]+=x[sub_code]
            region_crime[year]["crime"]["Total"]+=x[sub_code]

    return jsonify(region_crime)

@app.route("/api/v1.0/all_type")
def all_crimetype():
    # Create our session (link) from Python to the DB
    test=vic_db.vic_crimetype_db.find({},{"_id":0})

    """Return a list of all types"""
    # Query all passengers
    all_crimetype=[]

    for x in test:
        all_crimetype.append(x)

    return jsonify(all_crimetype)

@app.route("/api/v2.0/all_type")
def all_crimetype_json():
    # Create our session (link) from Python to the DB
    test=vic_db.vic_crimetype_db.find({},{"_id":0})

    """Return a list of all types"""
    # Query all passengers
    all_crimetype=[]

    for x in test:
        all_crimetype.append(x)

    return jsonify(all_crimetype)

@app.route('/api/v1.0/crime_data')
def crime_data():
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

    query={}

    if (len(postcode)): query["postcode"]={"$in": postcode}
    if (len(suburb)): query["suburb"]={"$in": suburb}
    if (len(lga)): query["Local Government Area"]={"$in": lga}
    if (len(region)): query["Region"]={"$in": region}
    if (len(year)): query["Year"]={"$in": year}

    test=vic_db.vic_crime_db.find(query,{"_id":0})

    """Return a list of all crime"""
    # Query all passengers
    all_crime=[]

    for x in test:
        all_crime.append(x)

    return jsonify(all_crime)


@app.route('/api/v2.0/crime_data')
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
    
    """Return a list of all crime"""
    # Query all passengers
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
            all_crime[year][suburb]["crime"]["Div"]={}
            all_crime[year][suburb]["crime"]["Subdiv"]={}
            for code in crimetp_dic["Offence Division code"]:
                all_crime[year][suburb]["crime"]["Div"][code]=0
            for code in crimetp_dic["Offence Subdivision code"]:
                all_crime[year][suburb]["crime"]["Subdiv"][code]=0

        for idx in range(len(crimetp_dic["Offence Subdivision code"])):
            sub_code=crimetp_dic["Offence Subdivision code"][idx]
            div_code=crimetp_dic["Offence Division code"][idx]
            all_crime[year][suburb]["crime"]["Subdiv"][sub_code]=x[sub_code]
            all_crime[year][suburb]["crime"]["Div"][div_code]+=x[sub_code]
            all_crime[year][suburb]["crime"]["Total"]+=x[sub_code]

    return jsonify(all_crime)

if __name__ == '__main__':
    app.run(debug=True)

