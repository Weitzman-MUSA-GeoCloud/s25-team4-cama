CREATE OR REPLACE TABLE musa5090s25-team4.core.phl_pwd_parcels
AS (
    SELECT
        brt_id AS property_id,
        *
    FROM musa5090s25-team4.source.phl_pwd_parcels
)