# ETL-Project

This project seeks to enable exploratory data analysis of the relationship (if any) between crimes committed and the profile of the suburb based on types of places, within the Greater Melbourne area. The data explores types of crimes and the average frequency per year and the place types including liquor stores, police stations and parks. (The average is based on the frequency recorded for years ending from 2011 to 2020.)

The Extract-Transform-Load (ETL) process was utilised for its effectiveness in collating the raw datasets for analysis (extraction) from various sources, and applying numerous transformations on each dataset in order to be loaded into SQL as a relational database. The transformations “cleaned” the data into a normalised and consistent format to allow for importing into SQL and subsequently allow any user to perform various join analyses applicable to one’s needs.

Please see ETL Project report include in repository for full details on extraction, transformation and loading dataset.

## Project team 
* Tom Peddlesden https://github.com/tomjp90
* Heesu Ha https://github.com/Heesu-H
* Welan Chu https://github.com/welanc
* Jason Sutton https://github.com/jMacProd

## Status
* Project is finalised

## Run order for Jupyter Notebooks and pgadmin query file for establishing table schema

**Initial resources directory: 000_Resources** - no action required

**Directory: 001_Extract_Transform_Suburbs**
* 01_scraping_melbourne_suburbs_heesu.ipynb
* 02_Obtaining postcodes for final suburb list.ipynb
* 03_output_suburbs_postcodes_for_sql.ipynb

**Directory: 002_Extract_Transform_Google_Places**
* 01_melb_no_types.ipynb
* 02_check_api_data.ipynb
* 03_places_types_output_for_sql.ipynb
* 04_suburb_place_types_output_for_sql.ipynb

**Directory: 003_Extract_Transform_Crime_Data**
* Crime - Transformation 1 - filtering out irrelevant data.ipynb
* Crime - Transformation 2 - Data Clean.ipynb
* Crime - Transformation 3 - exploratory data analysis.ipynb

**Directoty: 004_Extract_Teansform_LGA_Suburb**
* 01_creating_tables_for_sql_heesu_2_times_Output.ipynb

**Directory: 005_Load_SQL**
* ETL_Schema.sql - pgadmin file establishing table schema & sample queries for analysis
* 01_load_SQL.ipynb - Jupyter Notebook used to push all database outputs (as CSVs) from folders 001 - 004 into ETL_Schema.sql PostgreSQL database.

### Final Output
* The final PostgreSQL table schema was defined in pgAdmin using the sql query file based on the below Entity Relationship Diagram.
* The final jupyter notebook push the data set into the PostgreSQL database in pgAdmin
![Entity Relationship Diagram](https://github.com/jMacProd/ETL-Project/blob/main/005_Load_SQL/02_Entity%20Relationship%20Digram/EntityRelationshipDiagram.png)

## Technologies:

* Python - version 3.6 Jupyter Notebok
* pgadmin - version 11
* Github pages - publish site

## Resources
* www.quickdatabaseddiagrams.com
* https://www.geeksforgeeks.org/detect-and-remove-the-outliers-using-python/)

## Notes

  
Please feel free to contact us!
