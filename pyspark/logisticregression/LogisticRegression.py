from pyspark.sql import SparkSession
from pyspark.ml.classification import LogisticRegression
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from pyspark.conf import SparkConf
from pyspark.sql import SparkSession

conf = SparkConf()
conf.set("spark.driver.memory", "15g")   
conf.set("spark.executor.memory", "15g")  


spark = SparkSession.builder.appName("MainEmotionClassification").getOrCreate()

training = spark.read.format("libsvm").load("./output_libsvm")
training = training.sample(fraction=0.01, seed=42)


lr = LogisticRegression(maxIter=10, regParam=0.01, elasticNetParam=0.8)

# Fit the model
lrModel = lr.fit(training)

# Print the coefficients and intercept for logistic regression
print("Coefficient Matrix:\n", lrModel.coefficientMatrix)
print("Intercept Vector:\n", lrModel.interceptVector)


predictions = lrModel.transform(training)

# Evaluate accuracy
accuracy_evaluator = MulticlassClassificationEvaluator(
    labelCol="label", predictionCol="prediction", metricName="accuracy"
)
accuracy = accuracy_evaluator.evaluate(predictions)
print("Accuracy =", accuracy)

# Evaluate F1 score
f1_evaluator = MulticlassClassificationEvaluator(
    labelCol="label", predictionCol="prediction", metricName="f1"
)
f1_score = f1_evaluator.evaluate(predictions)
print("F1-score =", f1_score)


pdf = predictions.select("label", "prediction").toPandas()

# Build confusion matrix with pandas crosstab
conf_mat = pd.crosstab(pdf["label"], pdf["prediction"])
print(conf_mat)


sns.heatmap(conf_mat, annot=True, cmap="Blues", fmt="g")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()