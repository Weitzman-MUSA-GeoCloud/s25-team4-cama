from dotenv import load_dotenv
load_dotenv()

import os
import pathlib
import functions_framework
from google.cloud import bigquery

DIR_NAME = pathlib.Path(__file__).parent


# Main function to generate external table in bigquery backed by properties data in prepared data bucket
# This is accomplished by executing phl_opa_properties.sql
@functions_framework.http
def generate_current_assessments_model_training_data(request):
    # Read the SQL file specified in the request
    get_sql('vars_to_use.sql')

    return 'Ran the SQL file vars_to_use.sql'


# Generic function to run sql file
def get_sql(sql_filename):
    # Read the SQL file specified in the request
    sql_path = DIR_NAME / 'sql' / sql_filename

    # Check that the file exists
    if (not sql_path.exists()) or (not sql_path.is_file()):
        # Return a 404 (not found) response if not
        return f'File {sql_path} not found', 404

    # Read the SQL file
    with open(sql_path, 'r', encoding='utf-8') as sql_file:
        sql_query = sql_file.read()

    # Run the SQL query
    bigquery_client = bigquery.Client()
    bigquery_client.query_and_wait(sql_query)

    print(f'Ran the SQL file {sql_path}')
    return
