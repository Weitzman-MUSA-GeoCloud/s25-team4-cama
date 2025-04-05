from dotenv import load_dotenv
load_dotenv()

import os
import pathlib
import requests
import functions_framework
from google.cloud import storage

DIRNAME = pathlib.Path(__file__).parent
BUCKET_NAME = os.getenv('DATA_LAKE_BUCKET')


# Generic script for downloading file from url into cloud storage
def extract_data(url, filename, blobname):
    response = requests.get(url)
    response.raise_for_status()

    with open(filename, 'wb') as f:
        f.write(response.content)

    print(f'Downloaded {filename}')

    # Upload the downloaded file to cloud storage
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(blobname)
    blob.upload_from_filename(filename)

    print(f'Uploaded {blobname} to {BUCKET_NAME}')


# Main function used to extract and download philadelphia opa property data
@functions_framework.http
def extract_phl_opa_properties(request):
    print('Extracting OPA Properties data...')
    extract_data(
        'https://opendata-downloads.s3.amazonaws.com/opa_properties_public.csv',
        DIRNAME / 'phl_opa_properties.csv',
        'raw/phl_opa_properties/phl_opa_properties.csv',
    )
    return f'Downloaded and uploaded to gs://{BUCKET_NAME}'


# Main function used to extract and download PWD parcel data
@functions_framework.http
def extract_phl_pwd_parcels(request):
    print('Extracting PWD Parcels data...')
    extract_data(
        'https://www.pasda.psu.edu/json/PhillyWater_PWD_PARCELS2025.geojson',
        DIRNAME / 'phl_pwd_parcels.geojson',
        'raw/phl_pwd_parcels/phl_pwd_parcels.geojson',
    )
    return f'Downloaded and uploaded to gs://{BUCKET_NAME}'


# Main function used to extract and download philadelphia opa assessment history data
@functions_framework.http
def extract_phl_opa_assessments(request):
    print('Extracting OPA assessment data...')
    extract_data(
        'https://opendata-downloads.s3.amazonaws.com/assessments.csv',
        DIRNAME / 'phl_opa_assessments.csv',
        'raw/phl_opa_assessments/phl_opa_assessments.csv',
    )
    return f'Downloaded and uploaded to gs://{BUCKET_NAME}'
