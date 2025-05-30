from dotenv import load_dotenv
load_dotenv()


import pathlib
import json
import functions_framework
from google.cloud import bigquery

DIR_NAME = pathlib.Path(__file__).parent


# Main function to create histogram
@functions_framework.http
def get_quantiles(request):

    result_rows = get_sql(
        "quantiles.sql",
        {
            'quantiles': request.args.get('quantiles'),
        })

    # Convert BQ result set iterator to array of json objects
    quantile_data = [row["breaks"] for row in result_rows]

    print("Created and Output JSON for historical data")

    return quantile_data, 200, {'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': '*',
                                'Access-Control-Allow-Headers': '*'}


# Generic function to run sql file
def get_sql(sql_filename, arguments):
    # Read the SQL file specified in the request
    sql_path = DIR_NAME / 'sql' / sql_filename

    # Check that the file exists
    if (not sql_path.exists()) or (not sql_path.is_file()):
        # Return a 404 (not found) response if not
        return f'File {sql_path} not found', 404

    # Read the SQL file
    # Read the SQL file
    with open(sql_path, 'r', encoding='utf-8') as sql_file:
        sql_query_template = sql_file.read()
        sql_query = render_template(sql_query_template, arguments)

    # Run the SQL query
    bigquery_client = bigquery.Client()
    result = bigquery_client.query_and_wait(sql_query)

    print(f'Ran the SQL file {sql_path}')
    return result


# Generic function to fill in parameters into sql script
def render_template(sql_query_template, context):
    clean_template = sql_query_template.replace('${', '{')
    return clean_template.format(**context)
