CREATE OR REPLACE TABLE musa5090s25-team4.core.phl_opa_assessments
AS (
    SELECT
        parcel_number AS property_id,
        *
    FROM musa5090s25-team4.source.phl_opa_assessments
)