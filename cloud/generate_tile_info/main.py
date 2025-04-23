from dotenv import load_dotenv
load_dotenv()

import csv
import json
import os
import pathlib

import functions_framework
from google.cloud import storage
from google.cloud import bigquery

DIR_NAME = pathlib.Path(__file__).parent


# Main function used to prepare opa property data
# Reads phl_opa_properties.csv from raw data bucket
# Reprojects geometry from epsg:2272 to epsg:4326
# Writes phl_opa_properties.jsonl into the prepared data bucket
@functions_framework.http
def generate_tile_info(request):
    print('Generating Property Tile Info...')

    # Read the SQL file specified in the request
    sql_path = DIR_NAME / 'sql' / 'get_tile_info.sql'

    # Check that the file exists
    if (not sql_path.exists()) or (not sql_path.is_file()):
        # Return a 404 (not found) response if not
        return f'File {sql_path} not found', 404

    # Read the SQL file
    with open(sql_path, 'r', encoding='utf-8') as sql_file:
        sql_query = sql_file.read()

    # Run the SQL query
    bigquery_client = bigquery.Client()

    rows = bigquery_client.query_and_wait(sql_query)  # Make an API request.

    tile_features = [{
          "type": "Feature",
          "geometry": json.loads(row["geometry"]),
          "properties": {
            "address": row["address"],
            "current_assessed_value": round(row["current_assessed_value"]),
            "tax_year_assessed_value": round(row["tax_year_assessed_value"])
          }
        } for row in rows]
    
    property_tiles = {
        "type": "FeatureCollection",
        "name": "PropertyTiles",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": tile_features
    }

    property_tiles_json = json.dumps(property_tiles)

    property_tile_info_filename = DIR_NAME / 'property_tile_info.geojson'

    output_bucket_name = 'musa5090s25-team4-temp_data'

    with open(property_tile_info_filename, 'w') as f:
        f.write(property_tiles_json)

    storage_client = storage.Client()
    output_data_bucket = storage_client.bucket(output_bucket_name)

    print(f'Processed data into {property_tile_info_filename}')

    # Upload the tile info data to the bucket
    output_blobname = 'property_tile_info.geojson'
    blob = output_data_bucket.blob(output_blobname)

    blob.upload_from_filename(property_tile_info_filename)
    print(f'Uploaded to {property_tile_info_filename}')

    return f'Processed data into {property_tile_info_filename} and uploaded to gs://{output_bucket_name}/{property_tile_info_filename}'
