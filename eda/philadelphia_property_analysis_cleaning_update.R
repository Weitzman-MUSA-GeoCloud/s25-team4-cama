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

write.csv(model_data, "model_data_philadelphia_properties.csv", row.names = FALSE) 
library(dplyr)
library(lubridate)
input_data <- read.csv("model_data_philadelphia_properties.csv")
str(input_data)

### Run quick model to predict price as a function of the selected features ###
# train and test split, trying 10,000 and 20,000 observations will upscale again to 40,000 or 50,000 observations
set.seed(123)
subset_data <- input_data %>% 
  mutate(sale_date = as.numeric(as.Date(sale_date))) %>%  # Convert date to numeric
  sample_n(20000)
train_data <- subset_data %>% sample_frac(0.8)
test_data <- subset_data %>% sample_frac(0.2)

# linear regression model, also remove market_value from the model
model <- lm(sale_price ~ . - market_value, data = train_data)
# model <- lm(sale_price ~ ., data = train_data)
summary(model)
# predictions for lm
predictions_lm <- predict(model, test_data)
# RMSE lm
rmse_lm <- sqrt(mean((predictions_lm - test_data$sale_price)^2))
rmse_lm # 209856.8

# R-squared lm
r_squared_lm <- cor(predictions_lm, test_data$sale_price)^2
r_squared_lm # 0.4016537

# MAE lm
mae_lm <- mean(abs(predictions_lm - test_data$sale_price))
mae_lm # 111835.3

# predictions vs actual lm
library(ggplot2)
ggplot(test_data, aes(x = sale_price, y = predictions_lm)) +
  geom_point() +
  geom_abline(intercept = 0, slope = 1, color = "red") +
  labs(x = "Actual Sale Price", y = "Predicted Sale Price", title = "Predictions vs Actual Sale Price (Linear Regression)") +
  theme_minimal()
  
# random forest model
library(randomForest)
modelrf <- randomForest(sale_price ~ . - market_value, data = train_data)
plot(modelrf)
# predictions rf
predictionsrf <- predict(modelrf, test_data)
summary(predictionsrf)

# RMSE rf
rmse <- sqrt(mean((predictionsrf - test_data$sale_price)^2))
rmse # 103535.7

# R-squared rf
r_squared <- cor(predictionsrf, test_data$sale_price)^2
r_squared # 0.871143 (10,000 obs), 0.892098 (20,000 obs)

# MAE rf
mae <- mean(abs(predictionsrf - test_data$sale_price))
mae # 46453.52 (10,000 obs), 45902.12 (20,000 obs)

# rf predictions vs actual 
ggplot(test_data, aes(x = sale_price, y = predictionsrf)) +
  geom_point() +
  geom_abline(intercept = 0, slope = 1, color = "red") +
  labs(x = "Actual Sale Price", y = "Predicted Sale Price", title = "Predictions vs Actual Sale Price (Random Forest)") +
  theme_minimal()

# kableextra table comparison of models lm and rf
library(kableExtra)

model_comparison <- data.frame(
  Metric = c("RMSE", "R-squared", "MAE"),
  Linear_Regression = c(rmse_lm, r_squared_lm, mae_lm),
  Random_Forest = c(rmse, r_squared, mae)
)
model_comparison %>%
  kbl(caption = "Model Performance Comparison") %>%
  kable_styling(bootstrap_options = c("striped", "hover", "condensed")) %>%
  add_header_above(c(" " = 1, "Linear Regression" = 1, "Random Forest" = 1)) %>%
  column_spec(1, bold = TRUE) %>%
  row_spec(0, bold = TRUE) %>%
  kable_classic(full_width = FALSE)


  ### Additional Model Analysis ###

# 1. Feature Importance Analysis
# For Random Forest
importance_rf <- importance(modelrf)
varImpPlot(modelrf, main = "Random Forest - Variable Importance")

# For Linear Regression
importance_lm <- data.frame(
  Variable = names(coef(model)),
  Coefficient = coef(model),
  Absolute_Importance = abs(coef(model))
) %>%
  filter(Variable != "(Intercept)") %>%
  arrange(desc(Absolute_Importance))

# 2. Residual Analysis
# For Linear Regression
residuals_lm <- residuals(model)
par(mfrow = c(2, 2))
plot(model)  # Standard diagnostic plots
par(mfrow = c(1, 1))

# For Random Forest
residuals_rf <- test_data$sale_price - predictionsrf
hist(residuals_rf, main = "Random Forest Residuals Distribution", xlab = "Residuals")

# 3. Cross-validation
library(caret)
# Linear Regression CV
set.seed(123)
cv_lm <- train(sale_price ~ . - market_value, 
               data = train_data,
               method = "lm",
               trControl = trainControl(method = "cv", number = 5))
print("Linear Regression CV Results:")
print(cv_lm$results)
# intercept     RMSE  Rsquared      MAE   RMSESD RsquaredSD    MAESD
# 1      TRUE 239555.7 0.3253571 115661.3 11163.82 0.04418498 1634.201
# Random Forest CV
set.seed(123)
cv_rf <- train(sale_price ~ . - market_value, 
               data = train_data,
               method = "rf",
               trControl = trainControl(method = "cv", number = 5),
               ntree = 100)
print("Random Forest CV Results:")
print(cv_rf$results)
# print(cv_rf$results)
#     mtry     RMSE  Rsquared      MAE    RMSESD RsquaredSD     MAESD
# 1    2 183943.4 0.6133938 81405.28 11883.984 0.04376173 1345.1594
# 2    7 177994.4 0.6277760 76235.26 10506.309 0.03222818  639.7497
# 3   12 180043.6 0.6185827 76766.44  8655.356 0.02892336  761.8115

# 4. Prediction Intervals
# For Linear Regression
pred_intervals_lm <- predict(model, test_data, interval = "prediction")
pred_intervals_lm <- cbind(test_data$sale_price, pred_intervals_lm)
colnames(pred_intervals_lm) <- c("Actual", "Predicted", "Lower", "Upper")

# Plot prediction intervals for a subset of data
plot_data_lm <- pred_intervals_lm[1:100,]
plot(plot_data_lm[,1], type = "l", col = "black", 
     ylim = range(plot_data_lm), 
     main = "Linear Regression Prediction Intervals",
     xlab = "Observation", ylab = "Sale Price")
lines(plot_data_lm[,2], col = "blue")
lines(plot_data_lm[,3], col = "red", lty = 2)
lines(plot_data_lm[,4], col = "red", lty = 2)
legend("topright", 
       legend = c("Actual", "Predicted", "95% PI"),
       col = c("black", "blue", "red"),
       lty = c(1, 1, 2))

# 5. Model Stability Analysis
# Check how predictions change with different random seeds
set.seed(456)
modelrf2 <- randomForest(sale_price ~ . - market_value, data = train_data)
predictionsrf2 <- predict(modelrf2, test_data)
cor(predictionsrf, predictionsrf2)  # Should be high for stable model

# 6. Outlier Analysis
# For Linear Regression
cooks_dist <- cooks.distance(model)
outliers_lm <- which(cooks_dist > 4/mean(cooks_dist))
print(paste("Number of influential observations in Linear Regression:", length(outliers_lm)))

# For Random Forest
residuals_rf_std <- scale(residuals_rf)
outliers_rf <- which(abs(residuals_rf_std) > 3)
print(paste("Number of outliers in Random Forest:", length(outliers_rf)))

# 7. Model Comparison with Different Sample Sizes
sample_sizes <- c(10000, 20000, 30000)
results <- data.frame()

for (size in sample_sizes) {
  set.seed(123)
  subset_data <- input_data %>% 
    mutate(sale_date = as.numeric(as.Date(sale_date))) %>%
    sample_n(size)
  
  train_data <- subset_data %>% sample_frac(0.8)
  test_data <- subset_data %>% sample_frac(0.2)
  
  # Linear Regression
  model_lm <- lm(sale_price ~ . - market_value, data = train_data)
  pred_lm <- predict(model_lm, test_data)
  rmse_lm <- sqrt(mean((pred_lm - test_data$sale_price)^2))
  
  # Random Forest
  model_rf <- randomForest(sale_price ~ . - market_value, data = train_data)
  pred_rf <- predict(model_rf, test_data)
  rmse_rf <- sqrt(mean((pred_rf - test_data$sale_price)^2))
  
  results <- rbind(results, data.frame(
    Sample_Size = size,
    RMSE_LM = rmse_lm,
    RMSE_RF = rmse_rf
  ))
}

# sample size comparison
library(ggplot2)
ggplot(results, aes(x = Sample_Size)) +
  geom_line(aes(y = RMSE_LM, color = "Linear Regression")) +
  geom_line(aes(y = RMSE_RF, color = "Random Forest")) +
  labs(title = "Model Performance by Sample Size",
       x = "Sample Size",
       y = "RMSE",
       color = "Model") +
  theme_minimal()


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
