-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- Link to schema: https://app.quickdatabasediagrams.com/#/d/hPcTGE
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.

-- Modify this code to update the DB schema diagram.
-- To reset the sample schema, replace everything with
-- two dots ('..' - without quotes).

SET XACT_ABORT ON

BEGIN TRANSACTION QUICKDBD

CREATE TABLE [local_govt_areas] (
    [lga_id] INT  NOT NULL ,
    [lga_name] VARCHAR(30)  NOT NULL ,
    CONSTRAINT [PK_local_govt_areas] PRIMARY KEY CLUSTERED (
        [lga_id] ASC
    )
)

CREATE TABLE [lga_suburbs] (
    [lga_id] INT  NOT NULL ,
    [suburb] INT  NOT NULL ,
    CONSTRAINT [PK_lga_suburbs] PRIMARY KEY CLUSTERED (
        [lga_id] ASC,[suburb] ASC
    )
)

CREATE TABLE [suburbs] (
    [postcode] INT  NOT NULL ,
    [suburb] VARCHAR(30)  NOT NULL ,
    [lat] FLOAT  NOT NULL ,
    [long] FLOAT  NOT NULL ,
    CONSTRAINT [PK_suburbs] PRIMARY KEY CLUSTERED (
        [suburb] ASC
    )
)

CREATE TABLE [place_types] (
    [place_id] INT  NOT NULL ,
    [place_type] VARCHAR(30)  NOT NULL ,
    CONSTRAINT [PK_place_types] PRIMARY KEY CLUSTERED (
        [place_id] ASC
    )
)

CREATE TABLE [crime_types] (
    [crime_id] VARCHAR(5)  NOT NULL ,
    [crime_name] VARCHAR(30)  NOT NULL ,
    CONSTRAINT [PK_crime_types] PRIMARY KEY CLUSTERED (
        [crime_id] ASC
    )
)

CREATE TABLE [suburb_vs_crime] (
    [suburb] INT  NOT NULL ,
    [crime_id] VARCHAR(5)  NOT NULL ,
    [average_incident] INT  NOT NULL 
)

CREATE TABLE [place_type_vs_crime] (
    [place_id] INT  NOT NULL ,
    [crime_id] VARCHAR(5)  NOT NULL ,
    [average_incident] INT  NOT NULL 
)

CREATE TABLE [suburb_vs_place_type] (
    [suburb] INT  NOT NULL ,
    [place_id] INT  NOT NULL ,
    [place_type_count] INT  NOT NULL 
)

ALTER TABLE [lga_suburbs] WITH CHECK ADD CONSTRAINT [FK_lga_suburbs_lga_id] FOREIGN KEY([lga_id])
REFERENCES [local_govt_areas] ([lga_id])

ALTER TABLE [lga_suburbs] CHECK CONSTRAINT [FK_lga_suburbs_lga_id]

ALTER TABLE [lga_suburbs] WITH CHECK ADD CONSTRAINT [FK_lga_suburbs_suburb] FOREIGN KEY([suburb])
REFERENCES [suburbs] ([suburb])

ALTER TABLE [lga_suburbs] CHECK CONSTRAINT [FK_lga_suburbs_suburb]

ALTER TABLE [suburb_vs_crime] WITH CHECK ADD CONSTRAINT [FK_suburb_vs_crime_suburb] FOREIGN KEY([suburb])
REFERENCES [suburbs] ([suburb])

ALTER TABLE [suburb_vs_crime] CHECK CONSTRAINT [FK_suburb_vs_crime_suburb]

ALTER TABLE [suburb_vs_crime] WITH CHECK ADD CONSTRAINT [FK_suburb_vs_crime_crime_id] FOREIGN KEY([crime_id])
REFERENCES [crime_types] ([crime_id])

ALTER TABLE [suburb_vs_crime] CHECK CONSTRAINT [FK_suburb_vs_crime_crime_id]

ALTER TABLE [place_type_vs_crime] WITH CHECK ADD CONSTRAINT [FK_place_type_vs_crime_place_id] FOREIGN KEY([place_id])
REFERENCES [place_types] ([place_id])

ALTER TABLE [place_type_vs_crime] CHECK CONSTRAINT [FK_place_type_vs_crime_place_id]

ALTER TABLE [place_type_vs_crime] WITH CHECK ADD CONSTRAINT [FK_place_type_vs_crime_crime_id] FOREIGN KEY([crime_id])
REFERENCES [crime_types] ([crime_name])

ALTER TABLE [place_type_vs_crime] CHECK CONSTRAINT [FK_place_type_vs_crime_crime_id]

ALTER TABLE [suburb_vs_place_type] WITH CHECK ADD CONSTRAINT [FK_suburb_vs_place_type_suburb] FOREIGN KEY([suburb])
REFERENCES [suburbs] ([suburb])

ALTER TABLE [suburb_vs_place_type] CHECK CONSTRAINT [FK_suburb_vs_place_type_suburb]

ALTER TABLE [suburb_vs_place_type] WITH CHECK ADD CONSTRAINT [FK_suburb_vs_place_type_place_id] FOREIGN KEY([place_id])
REFERENCES [place_types] ([place_id])

ALTER TABLE [suburb_vs_place_type] CHECK CONSTRAINT [FK_suburb_vs_place_type_place_id]

COMMIT TRANSACTION QUICKDBD