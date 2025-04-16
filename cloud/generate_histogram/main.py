from dotenv import load_dotenv
load_dotenv()


import pathlib
import json
import functions_framework
from google.cloud import bigquery

DIR_NAME = pathlib.Path(__file__).parent


# Main function to create histogram
@functions_framework.http
def get_tax_year_assessment_bins_log(request):
    result_rows = get_sql('tax_year_assessment_bins_log.sql')

    # Convert BQ result set iterator to array of json objects
    hist_data = [{
          "tax_year": row["tax_year"],
          "lower_bound": row["lower_bound"],
          "upper_bound": row["upper_bound"],
          "quantity": row["quantity"]
        } for row in result_rows]

    print("Created and Output JSON for historical data")

    return hist_data, 200, {'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': '*',
                            'Access-Control-Allow-Headers': '*'}


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
    result = bigquery_client.query_and_wait(sql_query)

    print(f'Ran the SQL file {sql_path}')
    return result
