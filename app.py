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
        f"Available Routes:<br/>"
        f"/api/v1.0/all<br/>"
        f"/api/v1.0/all_type<br/>"
    )

@app.route("/api/v1.0/all")
def all_crime():
    # Create our session (link) from Python to the DB
    test=vic_db.vic_crime_db.find({},{"_id":0})

    """Return a list of all passenger names"""
    # Query all passengers
    all_crime=[]

    for x in test:
        all_crime.append(x)

    return jsonify(all_crime)

@app.route("/api/v1.0/all_type")
def all_crimetype():
    # Create our session (link) from Python to the DB
    test=vic_db.vic_crimetype_db.find({},{"_id":0})

    """Return a list of all passenger names"""
    # Query all passengers
    all_crimetype=[]

    for x in test:
        all_crimetype.append(x)

    return jsonify(all_crimetype)

if __name__ == '__main__':
    app.run(debug=True)

