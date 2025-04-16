# Philadelphia Property Analysis - Data Cleaning and Feature Engineering
# This script contains only the data processing code, without visualizations

# Setup and Libraries
library(dplyr)
library(lubridate)

pud <- read.csv("opa_properties_public.csv")
options(scipen = 999)
str(pud)

# Date-related cleaning and feature engineering
pud <- pud %>%
  mutate(
    # Convert sale_date to Date type and filter out future dates
    sale_date = as.Date(sale_date, format="%Y-%m-%d"),
    sale_date = if_else(sale_date <= Sys.Date(),
                       sale_date,
                       NA_Date_)
  ) %>%
  filter(!is.na(sale_date))  # Remove rows with invalid dates

# Initial Feature Selection
useful_features <- pud %>%
  select(
    # Identifier
    property_id,
    # Target Variables
    market_value,
    # Physical Characteristics
    total_livable_area,
    number_of_bathrooms,
    number_of_bedrooms,
    year_built,
    # Condition and quality metrics
    interior_condition,
    quality_grade,
    # Location variables
    zip_code,
    census_tract,
    # Market indicators
    sale_price,
    sale_date
  )

cleaned_features <- useful_features %>%
  filter(
    # Physical Characteristics
    number_of_bathrooms > 0 & number_of_bathrooms <= 7,
    number_of_bedrooms > 0 & number_of_bedrooms <= 10,
    
    # Livable Area logical constraints
    total_livable_area >= 300 & total_livable_area <= 6000,
    
    # Condition Metrics
    interior_condition >= 1 & interior_condition <= 7,
    
    # Year Built
    year_built >= 1700 & year_built <= 2023,
    
    # Value Metrics
    sale_price >= 10000 & sale_price <= 5000000,
    market_value >= 10000 & market_value <= 5000000
  ) %>%
  # Reclassify quality grades into categories
  mutate(
    quality_grade = case_when(
      quality_grade == "X" ~ "Highest",
      quality_grade %in% c("X-", "A+", "A", "A-") ~ "High",
      quality_grade %in% c("C", "D", "D-", "D+", "6", "D-", "E", "C-", "E-", "E+") ~ "Lowest",
      TRUE ~ "Mid"
    )
  )

# Convert condition variables to numeric
cleaned_features <- cleaned_features %>%
  mutate(
    interior_condition = as.numeric(interior_condition)
  )

# Remove blank or empty strings
cleaned_features <- cleaned_features %>%
  mutate(across(where(is.character), ~na_if(., ""))) %>%
  filter(complete.cases(.))

# Final Data Quality Checks
model_data <- cleaned_features %>%
  filter(complete.cases(.)) %>%
  filter(if_all(where(is.numeric), ~!is.nan(.) & !is.infinite(.)))

str(model_data)


# Final Feature Selection
final_data <- cleaned_features %>%
  select(
    # Identifier and Target Variable only
    property_id,
    price = sale_price
  )

  # Final Data Quality Checks
final_data <- final_data %>%
  # Remove rows with any NA values
  filter(complete.cases(.)) %>%
  # Remove rows with any NaN or Inf values in numeric columns
  filter(if_all(where(is.numeric), ~!is.nan(.) & !is.infinite(.)))

# Save the final dataset
write.csv(final_data, "cleaned_philadelphia_properties.csv", row.names = FALSE, col.names = FALSE) 
