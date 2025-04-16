CREATE OR REPLACE TABLE musa5090s25-team4.derived.current_assessments_model_training_data
AS (
  WITH cleaned_data AS (
      SELECT
          property_id,
          SAFE_CAST(sale_price AS NUMERIC) AS sale_price,
          SAFE_CAST(market_value AS NUMERIC) AS market_value,
          SAFE_CAST(total_livable_area AS NUMERIC) AS total_livable_area,
          SAFE_CAST(number_of_bathrooms AS NUMERIC) AS number_of_bathrooms,
          SAFE_CAST(number_of_bedrooms AS NUMERIC) AS number_of_bedrooms,
          SAFE_CAST(year_built AS NUMERIC) AS year_built,
          SAFE_CAST(interior_condition AS NUMERIC) AS interior_condition,
          quality_grade,
          zip_code,
          census_tract,
          SAFE_CAST(sale_date AS TIMESTAMP) AS sale_date
      FROM
          `core.phl_opa_properties`
      WHERE 
          property_id IS NOT NULL
          AND SAFE_CAST(sale_price AS NUMERIC)  IS NOT NULL
          AND SAFE_CAST(market_value AS NUMERIC)  IS NOT NULL
          AND SAFE_CAST(total_livable_area AS NUMERIC)  IS NOT NULL
          AND SAFE_CAST(number_of_bathrooms AS NUMERIC)  IS NOT NULL
          AND SAFE_CAST(number_of_bedrooms AS NUMERIC)  IS NOT NULL
          AND SAFE_CAST(year_built AS NUMERIC)  IS NOT NULL
          AND SAFE_CAST(interior_condition AS NUMERIC)  IS NOT NULL
          AND quality_grade  IS NOT NULL
          AND zip_code  IS NOT NULL
          AND SAFE_CAST(census_tract AS NUMERIC) IS NOT NULL
          AND SAFE_CAST(sale_date AS TIMESTAMP) IS NOT NULL
  )
  SELECT
      property_id,
      sale_price,
      market_value,
      total_livable_area,
      number_of_bathrooms,
      number_of_bedrooms,
      year_built,
      interior_condition,
      quality_grade,
      zip_code,
      census_tract,
      sale_date
  FROM
      cleaned_data
  WHERE
      sale_date >= CAST('1900-01-01' AS TIMESTAMP)
      AND sale_date <= CURRENT_TIMESTAMP
      AND interior_condition BETWEEN 1 AND 7
      AND total_livable_area >= 300 
      AND total_livable_area <= 6000
      AND number_of_bathrooms > 0 
      AND number_of_bathrooms <= 7
      AND number_of_bedrooms > 0 
      AND number_of_bedrooms <= 10
      AND year_built >= 1700 
      AND year_built <= 2023
      AND sale_price >= 10000 
      AND sale_price <= 5000000
      AND market_value >= 10000 
      AND market_value <= 5000000
)