from dotenv import load_dotenv
load_dotenv()

import csv
import json
import os
import pathlib

import pyproj
from shapely import wkt
import functions_framework
from google.cloud import storage

DIRNAME = pathlib.Path(__file__).parent


# Main function used to prepare opa property data
# Reads phl_opa_properties.csv from raw data bucket
# Reprojects geometry from epsg:2272 to epsg:4326
# Writes phl_opa_properties.jsonl into the prepared data bucket
@functions_framework.http
def prepare_phl_opa_properties(request):
    print('Preparing OPA Properties data...')

    raw_filename = DIRNAME / 'phl_opa_properties.csv'
    prepared_filename = DIRNAME / 'phl_opa_properties.jsonl'

    data_lake_bucket_name = os.getenv('DATA_LAKE_BUCKET')
    prepared_data_bucket_name = 'musa5090s25-team4-prepared_data'

    storage_client = storage.Client()
    data_lake_bucket = storage_client.bucket(data_lake_bucket_name)
    prepared_data_bucket = storage_client.bucket(prepared_data_bucket_name)

    # Download the data from the raw data bucket
    raw_blobname = 'raw/phl_opa_properties/phl_opa_properties.csv'
    blob = data_lake_bucket.blob(raw_blobname)
    blob.download_to_filename(raw_filename)
    print(f'Downloaded to {raw_filename}')

    # Load the data from the CSV file
    with open(raw_filename, 'r') as f:
        reader = csv.DictReader(f)
        data = list(reader)

    # Set up the projection
    transformer = pyproj.Transformer.from_proj('epsg:2272', 'epsg:4326')

    # Write the data to a JSONL file
    with open(prepared_filename, 'w') as f:
        for i, row in enumerate(data):
            geom_wkt = row.pop('shape').split(';')[1]
            if geom_wkt == 'POINT EMPTY':
                row['geog'] = None
            else:
                geom = wkt.loads(geom_wkt)
                x, y = transformer.transform(geom.x, geom.y)
                row['geog'] = f'POINT({x} {y})'
            f.write(json.dumps(row) + '\n')

    print(f'Processed data into {prepared_filename}')

    # Upload the prepared data to the bucket
    prepared_blobname = 'phl_opa_properties/data.jsonl'
    blob = prepared_data_bucket.blob(prepared_blobname)
    blob.upload_from_filename(prepared_filename)
    print(f'Uploaded to {prepared_blobname}')

    return f'Processed data into {prepared_filename} and uploaded to gs://{prepared_data_bucket_name}/{prepared_blobname}'


# Main function used to prepare pwd parcel
# Reads phl_pwd_parcels.geojson from raw data bucket
# Writes phl_pwd_parcels.jsonl into the prepared data bucket
@functions_framework.http
def prepare_phl_pwd_parcels(request):
    print('Preparing PWD parcel data...')
    raw_filename = DIRNAME / 'phl_pwd_parcels.geojson'
    prepared_filename = DIRNAME / 'phl_pwd_parcels.jsonl'

    data_lake_bucket_name = os.getenv('DATA_LAKE_BUCKET')
    prepared_data_bucket_name = 'musa5090s25-team4-prepared_data'

    storage_client = storage.Client()
    data_lake_bucket = storage_client.bucket(data_lake_bucket_name)
    prepared_data_bucket = storage_client.bucket(prepared_data_bucket_name)

    # Download the data from the bucket
    raw_blobname = 'raw/phl_pwd_parcels/phl_pwd_parcels.geojson'
    blob = data_lake_bucket.blob(raw_blobname)
    blob.download_to_filename(raw_filename)
    print(f'Downloaded to {raw_filename}')

    # Load the data from the CSV file
    with open(raw_filename, 'r') as f:
        data = json.load(f)

    # Write the data to a JSONL file
    with open(prepared_filename, 'w') as f:
        for row in data['features']:
            f.write(json.dumps(row) + '\n')

    print(f'Processed data into {prepared_filename}')

    # Upload the prepared data to the bucket
    prepared_blobname = 'phl_pwd_parcels/data.jsonl'
    blob = prepared_data_bucket.blob(prepared_blobname)
    blob.upload_from_filename(prepared_filename)
    print(f'Uploaded to {prepared_blobname}')

    return f'Processed data into {prepared_filename} and uploaded to gs://{prepared_data_bucket_name}/{prepared_blobname}'


# Main function used to prepare opa assessment history data
# Reads phl_opa_assessments.csv from raw data bucket
# Reprojects geometry from epsg:2272 to epsg:4326
# Writes phl_opa_assessments.jsonl into the prepared data bucket
@functions_framework.http
def prepare_phl_opa_assessments(request):
    print('Preparing OPA Assessments data...')

    raw_filename = DIRNAME / 'phl_opa_assessments.csv'
    prepared_filename = DIRNAME / 'phl_opa_assessments.jsonl'

    data_lake_bucket_name = os.getenv('DATA_LAKE_BUCKET')
    prepared_data_bucket_name = 'musa5090s25-team4-prepared_data'

    storage_client = storage.Client()
    data_lake_bucket = storage_client.bucket(data_lake_bucket_name)
    prepared_data_bucket = storage_client.bucket(prepared_data_bucket_name)

    # Download the data from the bucket
    raw_blobname = 'raw/phl_opa_assessments/phl_opa_assessments.csv'
    blob = data_lake_bucket.blob(raw_blobname)
    blob.download_to_filename(raw_filename)
    print(f'Downloaded to {raw_filename}')

    # Load the data from the CSV file
    with open(raw_filename, 'r') as f:
        reader = csv.DictReader(f)
        data = list(reader)

    # Set up the projection
    transformer = pyproj.Transformer.from_proj('epsg:2272', 'epsg:4326')

    # Write the data to a JSONL file
    with open(prepared_filename, 'w') as f:
        for i, row in enumerate(data):
            f.write(json.dumps(row) + '\n')

    print(f'Processed data into {prepared_filename}')

    # Upload the prepared data to the bucket
    prepared_blobname = 'phl_opa_assessments/data.jsonl'
    blob = prepared_data_bucket.blob(prepared_blobname)
    blob.upload_from_filename(prepared_filename)
    print(f'Uploaded to {prepared_blobname}')

    return f'Processed data into {prepared_filename} and uploaded to gs://{prepared_data_bucket_name}/{prepared_blobname}'


