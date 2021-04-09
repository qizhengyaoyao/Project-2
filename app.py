# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
import pymongo


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


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"<h1>Available Routes:</h1>"
        f"<h3>/api/v1.0/all<h3>"
        f"<h3>/api/v1.0/all_type<h3>"
        f"<h3>/api/v1.0/crime_data?&ltfilter_list&gt</h3>"
        f"&ltfilter_list&gt: field1=condition1&field2=condition2&....</br>"
        f"field:</br>"
        f"<li>postcode</li>"
        f"<li>suburb</li>"
        f"<li>lga</li>"
        f"<li>region</li>"
        f"<li>year</li>"
        f"</br>"
        f"&ltfilter_list&gt exmaple</br>"
        f"postcode=3000&suburb=melbourne&lga=melbourne&ampregion=northern metropolitan&year=2011&year=2020</br>"

    )

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

if __name__ == '__main__':
    app.run(debug=True)

