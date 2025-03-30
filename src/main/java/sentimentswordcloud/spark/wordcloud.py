# Read all output files from the MapReduce output directory
lines = spark.read.text("s3://sg.edu.sit.inf2006.aaronlam/word_cloud_output").rdd.map(lambda line: line.value)

# Split each line by tab (expecting 3 fields: word, sentiment, count)
parts = lines.map(lambda line: line.split("\t"))

# Filter out any malformed lines (only keep lines with exactly 3 fields)
validParts = parts.filter(lambda arr: len(arr) == 3)

# Convert count to integer and form a tuple: (word, sentiment, count)
wordCounts = validParts.map(lambda arr: (arr[0], arr[1], int(arr[2])))

# Separate the records by sentiment
positiveCounts = wordCounts.filter(lambda record: record[1].strip().lower() == "positive")
negativeCounts = wordCounts.filter(lambda record: record[1].strip().lower() == "negative")

# Sort each group by count in descending order
sortedPos = positiveCounts.sortBy(lambda record: record[2], ascending=False).collect()
sortedNeg = negativeCounts.sortBy(lambda record: record[2], ascending=False).collect()

# Print the top 20 positive words
print("Top Positive Words:")
for i, (word, sentiment, count) in enumerate(sortedPos[:20], start=1):
    print(f"{i}: {word} ({sentiment}): {count}")

# Print the top 20 negative words
print("Top Negative Words:")
for i, (word, sentiment, count) in enumerate(sortedNeg[:20], start=1):
    print(f"{i}: {word} ({sentiment}): {count}")
