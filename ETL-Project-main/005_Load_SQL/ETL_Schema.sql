-- Consider adding drop "DROP TABLE IF EXISTS table_name;" if rqeuired
-- But then don't drop tables once csv data has been imported via jupyter notebook

--These are the basic tables that plot the keys for each item

-- Drop table if it already exists
DROP TABLE IF EXISTS local_govt_areas CASCADE;
DROP TABLE IF EXISTS suburbs CASCADE;
DROP TABLE IF EXISTS crime CASCADE;
DROP TABLE IF EXISTS place CASCADE;
DROP TABLE IF EXISTS lga_suburbs CASCADE;
DROP TABLE IF EXISTS suburb_vs_crime CASCADE;
DROP TABLE IF EXISTS place_vs_crime CASCADE;
DROP TABLE IF EXISTS suburb_vs_place CASCADE;


CREATE TABLE local_govt_areas (
	lga_id INT PRIMARY KEY,
	lga_name VARCHAR(60)
);


CREATE TABLE suburbs (
	postcode INT,
	suburb VARCHAR(30) PRIMARY KEY,
	lat DECIMAL,
	lon DECIMAL
);



CREATE TABLE crime (
	crime_id VARCHAR(5) PRIMARY KEY,
	crime_name VARCHAR
);




CREATE TABLE place (
	place_id INT PRIMARY KEY,
	place_type VARCHAR(30)
);


--Link LGA to suburb
CREATE TABLE lga_suburbs (
	lga_id INT,
	suburb VARCHAR(255),
	CONSTRAINT fk_lgaid
      FOREIGN KEY(lga_id)
	  REFERENCES local_govt_areas(lga_id)
	  ON DELETE SET NULL,
	CONSTRAINT fk_postcodelga
      FOREIGN KEY(suburb)  
	  REFERENCES suburbs(suburb)
	  ON DELETE SET NULL
);


-- Link Suburb to Crime
CREATE TABLE suburb_vs_crime (
	lga_name VARCHAR(255),
	postcode INT,
	suburb VARCHAR(255),
	crime_id VARCHAR(5),
	crime_name VARCHAR,
	average_incident INT,
	CONSTRAINT fk_postcodecrime
      FOREIGN KEY(suburb) 
	  REFERENCES suburbs(suburb)
	  ON DELETE SET NULL,
	CONSTRAINT fk_crimepostcode
      FOREIGN KEY(crime_id) 
	  REFERENCES crime(crime_id)
	  ON DELETE SET NULL
);


-- Link place type to Crime
CREATE TABLE place_vs_crime (
	place_id INT,
	crime_id VARCHAR(5),
	average_incident INT,
	CONSTRAINT fk_placecrime
      FOREIGN KEY(place_id) 
	  REFERENCES place(place_id)
	  ON DELETE SET NULL,
	CONSTRAINT fk_crimeplace
      FOREIGN KEY(crime_id) 
	  REFERENCES crime(crime_id)
	  ON DELETE SET NULL
);


-- Link suburb to Places type
CREATE TABLE suburb_vs_place (
	suburb VARCHAR,
	place_id INT,
	place_type_count INT,
	CONSTRAINT fk_postcodeplace
      FOREIGN KEY(suburb) 
	  REFERENCES suburbs(suburb)
	  ON DELETE SET NULL,
	CONSTRAINT fk_placepostcode
      FOREIGN KEY(place_id) 
	  REFERENCES place(place_id)
	  ON DELETE SET NULL
);


-- Select Tables



SELECT *
FROM local_govt_areas;

SELECT *
FROM suburbs;

SELECT *
FROM crime;

SELECT *
FROM place;

SELECT *
FROM lga_suburbs;

SELECT *
FROM suburb_vs_crime;

SELECT *
FROM place_vs_crime;

SELECT *
FROM suburb_vs_place;



-- Possible Queries for analysis:

-- Query total average incidents per local government area and crime type
-- Ordered by local government area in ascending order

SELECT
	sc.lga_name,
	sc.crime_name,
	SUM(sc.average_incident) AS total_average_incidents
FROM suburb_vs_crime as sc
GROUP BY 
	sc.lga_name,
	sc.crime_name
ORDER BY sc.lga_name ASC;


-- Query total average incidents per local government area and crime type
-- Ordered by total average incident in descending order

SELECT
	sc.lga_name,
	sc.crime_name,
	SUM(sc.average_incident) AS total_average_incidents
FROM suburb_vs_crime as sc
GROUP BY 
	sc.lga_name,
	sc.crime_name
ORDER BY total_average_incidents DESC;


-- Query average incidents per suburb and crime type vs. establishment types

SELECT
	l.lga_name,
	s.suburb,
	c.crime_name,
	c.average_incident,
	p.place_type,
	sp.place_type_count
FROM local_govt_areas AS l
INNER JOIN lga_suburbs AS s ON s.lga_id = l.lga_id
INNER JOIN suburb_vs_crime AS c ON c.suburb = s.suburb
INNER JOIN suburb_vs_place AS sp ON sp.suburb = s.suburb
INNER JOIN place AS p ON p.place_id = sp.place_id
ORDER BY c.average_incident DESC;


-- Query total incidents per suburb vs. number and types of establishment 

SELECT 
	sc.suburb,
	p.place_type,
	sp.place_type_count,
	SUM(sc.average_incident) AS total_average_incident
FROM suburb_vs_crime AS sc
INNER JOIN suburb_vs_place AS sp ON sp.suburb = sc.suburb
INNER JOIN place AS p ON p.place_id = sp.place_id
GROUP BY 
	sc.suburb,
	sp.place_type_count, 
	p.place_type
ORDER BY total_average_incident DESC;

