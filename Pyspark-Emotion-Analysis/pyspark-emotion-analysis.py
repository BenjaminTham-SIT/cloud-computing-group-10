from pyspark.sql import SparkSession
from pyspark.sql.functions import col, split, explode, trim, avg, stddev

# Initialize Spark session
spark = SparkSession.builder.appName('EmotionAnalysis').getOrCreate()

# Load the MapReduce output into a DataFrame
df = spark.read.text("/Users/victorkong/Programming/Cloud-Computing-Group-10/output/part-r-00000")

# Parse the data into timestamp and emotion columns
df = df.withColumn('timestamp', split(df['value'], '\t').getItem(0)) \
       .withColumn('emotions', split(df['value'], '\t').getItem(1))

# Exploding emotions into individual rows
emotion_df = df.select('timestamp', explode(split(df['emotions'], ',')).alias('emotion_count'))

# Split the emotion and count into separate columns
emotion_df = emotion_df.withColumn('emotion', split(emotion_df['emotion_count'], ':').getItem(0)) \
                       .withColumn('count', split(emotion_df['emotion_count'], ':').getItem(1))

# Trim the 'emotion' column and cast 'count' to integer
emotion_df = emotion_df.withColumn('emotion', trim(col('emotion'))) \
                       .withColumn('count', col('count').cast('int'))

# Calculate mean and standard deviation of the 'count'
mean_stddev = emotion_df.select(avg('count').alias('mean'), stddev('count').alias('stddev')).first()

mean = mean_stddev['mean']
stddev_value = mean_stddev['stddev']

# Add the Z-score column
emotion_df = emotion_df.withColumn('z_score', (col('count') - mean) / stddev_value)

# Show the updated DataFrame with Z-scores
emotion_df.show()

# Filter to identify outliers based on Z-score (threshold = 3)
outliers_df = emotion_df.filter((col('z_score') > 3) | (col('z_score') < -3))

outliers_df.show()
