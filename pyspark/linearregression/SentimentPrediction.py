from pyspark.sql import SparkSession
from pyspark.ml.regression import LinearRegression
import matplotlib.pyplot as plt


# Read the entire output_libsvm folder (which contains multiple part files)
spark = SparkSession.builder.appName("SentimentPrediction").getOrCreate()

training = spark.read.format("libsvm").load("./output_libsvm")

lr = LinearRegression(maxIter=10, regParam=0.01, elasticNetParam=0.8)

# Fit the model
lrModel = lr.fit(training)

# Print the coefficients and intercept for linear regression
print("Coefficients: %s" % str(lrModel.coefficients))
print("Intercept: %s" % str(lrModel.intercept))

# Summarize the model over the training set and print out some metrics
trainingSummary = lrModel.summary
print("numIterations: %d" % trainingSummary.totalIterations)
print("objectiveHistory: %s" % str(trainingSummary.objectiveHistory))
trainingSummary.residuals.show()
print("RMSE: %f" % trainingSummary.rootMeanSquaredError)
print("r2: %f" % trainingSummary.r2)


predictions = lrModel.transform(training)  # produce a DF with a "prediction" column

# Show some sample predictions (label vs. prediction)
predictions.select("label", "prediction").show(20, truncate=False)


# Convert to Pandas
pdf = predictions.select("label", "prediction").toPandas()

plt.scatter(pdf["label"], pdf["prediction"], alpha=0.5)
plt.xlabel("Actual Sentiment")
plt.ylabel("Predicted Sentiment")
plt.title("Predicted vs. Actual Sentiment")

# Optionally draw a diagonal line y=x for reference
min_val = min(pdf["label"].min(), pdf["prediction"].min())
max_val = max(pdf["label"].max(), pdf["prediction"].max())
plt.plot([min_val, max_val], [min_val, max_val], color="red", linestyle="--")

plt.show()
