WITH tax_year_assess AS (
    SELECT
        property_id,
        SAFE_CAST(market_value AS FLOAT64) AS market_value
    FROM
        core.phl_opa_assessments
    WHERE
        SAFE_CAST(market_value AS FLOAT64) IS NOT NULL
        AND year = '2024'
),

model_assess AS (
    SELECT
        property_id,
        SAFE_CAST(price AS FLOAT64) AS price
    FROM
        derived.model_assessment_output
    WHERE
        SAFE_CAST(price AS FLOAT64) IS NOT NULL
)

SELECT
    ROUND(AVG((price - market_value) / market_value) * 100, 2) AS stat
FROM tax_year_assess
INNER JOIN model_assess ON tax_year_assess.property_id = model_assess.property_id
WHERE
    market_value > 10000
    AND price > 0
