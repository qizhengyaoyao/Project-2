import pandas as pd
from sqlalchemy import create_engine
import config

CrimeTypes_file = "CrimeTypes.csv"
CrimeTypes_df = pd.read_csv(CrimeTypes_file)

CrimeSuburbs_file = "CrimeSuburbs.csv"
CrimeSuburbs_df = pd.read_csv(CrimeSuburbs_file)

connection_string = f"postgres:{config.sql_key}@localhost:5432/ETL_db"
engine = create_engine(f'postgresql://{connection_string}')

CrimeTypes_df.to_sql(name='CrimeTypes', con=engine, if_exists='replace', index=False)
CrimeSuburbs_df.to_sql(name='CrimeSuburbs', con=engine, if_exists='replace', index=False)
print("local sql done.")

heroku_connection_string = f"{config.heroku_para['user']}:{config.heroku_para['password']}@{config.heroku_para['host']}:{config.heroku_para['port']}/{config.heroku_para['database']}"
heroku_engine = create_engine(f'postgresql://{heroku_connection_string}')
print("remote sql connection created.")

CrimeTypes_df.to_sql(name='CrimeTypes', con=heroku_engine, if_exists='replace', index=False)
print("remote sql CrimeTypes_df done.")
CrimeSuburbs_df.to_sql(name='CrimeSuburbs', con=heroku_engine, if_exists='replace', index=False)
print("remote sql CrimeSuburbs_df done.")









