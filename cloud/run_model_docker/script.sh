#!/usr/bin/env bash
set -ex

# Download from bq
bq query --format=csv --max_rows=300000 'SELECT * FROM derived.current_assessments_model_training_data' > opa_properties_public.csv

# Install packages
Rscript install_packages.R

# Run the R script
Rscript philadelphia_property_analysis_cleaning.R

# Copy back to bq
bq --location="us-east4" load --source_format=CSV --skip_leading_rows=1 musa5090s25-team4:derived.model_assessment_output cleaned_philadelphia_properties.csv property_id:STRING,price:NUMERIC
