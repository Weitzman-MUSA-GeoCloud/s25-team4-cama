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
def generate_ext_table_phl_opa_properties(request):
    # Read the SQL file specified in the request
    sql_path = DIR_NAME / 'sql' / 'phl_opa_properties.sql'

    # Check that the file exists
    if (not sql_path.exists()) or (not sql_path.is_file()):
        # Return a 404 (not found) response if not
        return f'File {sql_path} not found', 404

    # Read the SQL file
    with open(sql_path, 'r', encoding='utf-8') as sql_file:
        sql_query_template = sql_file.read()
        sql_query = render_template(
            sql_query_template,
            {
                'bucket_name': 'musa5090s25-team4-prepared_data',
                'dataset_name': 'source',
            }
        )

    # Run the SQL query
    bigquery_client = bigquery.Client()
    bigquery_client.query_and_wait(sql_query)

    print(f'Ran the SQL file {sql_path}')
    return f'Ran the SQL file {sql_path}'


# Main function to generate external table in bigquery backed by pwd parcel data in prepared data bucket
# This is accomplished by executing phl_pwd_parcels.sql
@functions_framework.http
def generate_ext_table_phl_pwd_parcels(request):
    # Read the SQL file specified in the request
    sql_path = DIR_NAME / 'sql' / 'phl_pwd_parcels.sql'

    # Check that the file exists
    if (not sql_path.exists()) or (not sql_path.is_file()):
        # Return a 404 (not found) response if not
        return f'File {sql_path} not found', 404

    # Read the SQL file
    with open(sql_path, 'r', encoding='utf-8') as sql_file:
        sql_query_template = sql_file.read()
        sql_query = render_template(
            sql_query_template,
            {
                'bucket_name': 'musa5090s25-team4-prepared_data',
                'dataset_name': 'source',
            }
        )

    # Run the SQL query
    bigquery_client = bigquery.Client()
    bigquery_client.query_and_wait(sql_query)

    print(f'Ran the SQL file {sql_path}')
    return f'Ran the SQL file {sql_path}'


# Main function to generate external table in bigquery backed by assessments data in prepared data bucket
# This is accomplished by executing phl_opa_assessments.sql
@functions_framework.http
def generate_ext_table_phl_opa_assessments(request):
    # Read the SQL file specified in the request
    sql_path = DIR_NAME / 'sql' / 'phl_opa_assessments.sql'

    # Check that the file exists
    if (not sql_path.exists()) or (not sql_path.is_file()):
        # Return a 404 (not found) response if not
        return f'File {sql_path} not found', 404

    # Read the SQL file
    with open(sql_path, 'r', encoding='utf-8') as sql_file:
        sql_query_template = sql_file.read()
        sql_query = render_template(
            sql_query_template,
            {
                'bucket_name': 'musa5090s25-team4-prepared_data',
                'dataset_name': 'source',
            }
        )

    # Run the SQL query
    bigquery_client = bigquery.Client()
    bigquery_client.query_and_wait(sql_query)

    print(f'Ran the SQL file {sql_path}')
    return f'Ran the SQL file {sql_path}'


# Generic function to fill in parameters into sql script
def render_template(sql_query_template, context):
    clean_template = sql_query_template.replace('${', '{')
    return clean_template.format(**context)
