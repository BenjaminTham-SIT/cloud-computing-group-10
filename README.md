# Big Data Project


---

## 1. Descriptive Analytics & Trend Tracking

### (a) Sentiment Trends Over Time (ben checkpoint: trying this now)

#### MapReduce Phase (Data Cleaning & Preparation)
- **Mapper**  
  1. Parse each record (similar to your example code).  
  2. Filter out malformed lines, duplicates, or lines with missing critical fields (e.g., invalid date or sentiment).  
  3. Extract key fields: date (or date+hour) and sentiment.  
  4. **Output Key**: A composite key representing a time bucket (e.g., `YYYY-MM-DD`).  
  5. **Output Value**: The numeric sentiment value (e.g., a float or double in string form). You may need a custom Writable or store it as `Text`/`FloatWritable`.  

- **Reducer**  
  1. Receives all sentiment values for a given date.  
  2. Sums them up, counts how many records there are, and computes the average.  
  3. **Output**: Key = date, Value = average sentiment for that date.  

- **Result**  
  - You get (date, average_sentiment) pairs, stored in HDFS as the cleaned and aggregated dataset.

#### Spark Phase (Analysis & Visualization)
1. **Load** the output from HDFS (the date → average_sentiment results).  
2. Create a Spark DataFrame or RDD, then plot or further analyze the trend.  
3. **(Optional)** If you want hour-by-hour analysis, store date+hour in MapReduce, then do groupBy on `(date, hour)` in Spark, and compute or refine the average.  
4. Finally, export to your visualization layer (Matplotlib, etc.).

---

### (b) Theme or Topic Frequency Tracking

#### MapReduce Phase
- **Mapper**  
  1. Parse each line to extract `primary_theme` or the list of `secondary_themes`.  
  2. Filter out any rows lacking valid theme info.  
  3. **Output Key**: `primary_theme` (or each secondary theme in the list).  
  4. **Output Value**: `1` (IntWritable).  

- **Reducer**  
  1. Sum up all the counts for each theme.  
  2. **Output**: Key = theme, Value = total occurrences over the entire dataset.  

- **Result**  
  - Produces a cleaned/aggregated file of (theme, count).

#### Spark Phase
1. **Load** the aggregated theme counts into Spark.  
2. Possibly join with date/time dimension if you also want daily breakdowns:
   - Alternatively, in the mapper, you could output `(date, theme)` as the key to get daily counts.  
3. Create frequency visuals (e.g., bar charts) or track how certain themes spike over time.

---

### (c) Multilingual Insights

#### MapReduce Phase
- **Mapper**  
  1. Extract the language field.  
  2. Validate: if the language is blank, skip.  
  3. **Output Key**: language.  
  4. **Output Value**: `1`.  

- **Reducer**  
  1. Sum the 1’s for each language.  
  2. **Output**: (language, total_count).  

- **Optional**: If you want day-by-day breakdowns, make the key `(date, language)`.

#### Spark Phase
1. **Load** (language, total_count) or (date, language, count).  
2. Rank languages by usage volume, produce distribution plots, track changes over time, etc.

---

## 2. Machine Learning & Predictive Modeling

### (a) Predicting Emotion from Text/Keywords

#### MapReduce Phase (Preprocessing)
- **Mapper**  
  1. Filter out short or low-quality posts.  
  2. Keep only the necessary columns: `english_keywords` (or entire `original_text`), `main_emotion`, `sentiment`.  
  3. **Output**: Write out a cleaned line with only the fields needed for modeling. For instance, a tab-separated format:  
     ```
     english_keywords  main_emotion  sentiment
     ```
- **Reducer**  
  - Typically not needed for a simple “cleaning and pass-through” job. You could use the **Reducer** as an identity reducer (or set `mapreduce.job.reduces=0`) to pass the data directly to output.

#### Spark Phase (Model Training)
1. **Load** the cleaned data from HDFS.  
2. **Feature Engineering**:
   - Convert `english_keywords` to TF-IDF vectors.  
   - Possibly add `sentiment` as an additional numeric feature.  
3. **Train Classifier**:
   - Use Spark MLlib’s classification algorithm (Logistic Regression, RandomForest, etc.) to predict `main_emotion`.  
4. **Evaluate** using accuracy, F1, confusion matrix, etc.

---

### (b) Predicting Which Posts Will Have High Positive Sentiment

#### MapReduce Phase
- **Mapper**  
  1. Filter data to, for example, only English posts (if that’s your focus).  
  2. Remove duplicates, short posts, or spam.  
  3. Create a binary label: sentiment > 0.5 (or some threshold) => 1, else 0.  
  4. Output a cleaned format with `(text, label)` or `(english_keywords, label)`.  

- **Reducer**  
  - May not be strictly necessary if you’re just filtering and passing data. Use an identity reducer or skip it entirely.

#### Spark Phase
1. **Load** the filtered `(text, label)` data.  
2. Convert text to TF-IDF or other vector representation.  
3. Train a classification model (Logistic Regression, Decision Tree, etc.).  
4. Evaluate performance and analyze which features (words, hashtags, etc.) are strongly predictive.

---

### (c) Clustering Posts by Topic/Keyword Similarity

#### MapReduce Phase
- **Mapper**  
  1. Remove duplicates or unify text encodings.  
  2. Possibly filter by language if you only want one language for clustering.  
  3. Pass `(record_id, english_keywords/original_text)` forward.  

- **Reducer**  
  - Usually not needed except for summation or final pass-through. For clustering, you mainly need the text data in full.

#### Spark Phase
1. **Load** the text data.  
2. Convert to TF-IDF feature vectors.  
3. Apply clustering (K-Means or LDA if you want topic modeling).  
4. Inspect cluster centroids or top words per cluster to discover emergent themes.

---

### (d) Time-Series Forecasting of Discussion Volume

#### MapReduce Phase
- **Mapper**  
  1. Identify the theme or keyword(s) you want to forecast.  
  2. Extract `(date, theme)` and output a `1` for each post mentioning that theme.  

- **Reducer**  
  1. Aggregate counts of posts per `(date, theme)`.  
  2. Output `(date, theme, count)`.  

- **Result**  
  - A time series of how many posts per day (or hour) revolve around that theme.

#### Spark Phase
1. **Load** `(date, theme, count)`.  
2. Use Spark’s time-series library or regression approaches to forecast future volumes.  
3. Evaluate forecast error, e.g., MAPE or RMSE.

---

## 3. Deeper Social Insights & Correlations

### (a) Correlation Between Themes and Sentiment

#### MapReduce Phase
- **Mapper**  
  1. Extract `primary_theme`, `sentiment`.  
  2. Validate that both fields are present.  
  3. Output key = `primary_theme`, value = `(sentiment, 1)` (you can store two fields in a custom Text string or a secondary custom Writable).  

- **Reducer**  
  1. Sum all sentiment values for a theme, count how many posts.  
  2. Compute average sentiment per theme.  
  3. Output = (theme, average_sentiment).

#### Spark Phase
1. Load `(theme, average_sentiment)`.  
2. Further correlation analysis or advanced statistical tests.  
3. Plot a bar chart of average sentiment by theme.

---

### (b) Engagement Prediction (If Engagement Data Exists)

*(If your dataset doesn’t have likes/shares, skip this.)*

#### MapReduce Phase
- **Mapper**  
  1. Filter or remove duplicates.  
  2. For each valid record, extract `(text, sentiment, main_emotion, engagement_metric)`.  
  3. Possibly transform engagement metric into a numeric label (e.g., “low vs. high engagement” if you want classification).  

- **Reducer**  
  - Could be an identity pass or do minimal aggregation if needed (e.g., summing likes across duplicates from the same post).

#### Spark Phase
1. **Load** the cleaned output.  
2. Convert text or keywords into numeric vectors, add sentiment/emotion as features.  
3. Build a regression or classification model to predict engagement.  
4. Evaluate performance.

---

### (c) Language-Specific Sentiment Analysis

#### MapReduce Phase
- **Mapper**  
  1. Parse each record to get `(language, sentiment)`.  
  2. Filter out unknown languages.  
  3. Output `(language, sentiment_value)`.  

- **Reducer**  
  1. Aggregate all sentiment values for each language.  
  2. Compute the average or distribution.  
  3. Output `(language, average_sentiment)`.

#### Spark Phase
1. **Load** `(language, average_sentiment)`.  
2. Compare distributions of sentiment across languages.  
3. Optionally run statistical tests (e.g., T-tests or ANOVA) to see if differences are significant.

---

## Putting It All Together

1. **MapReduce**:  
   - Primarily used for data cleaning, filtering, and pre-aggregation (counting, summing, or computing averages).  
   - Output the results in an easily consumable format (e.g., CSV or text with simple key-value pairs) back to HDFS.

2. **Spark**:  
   - Loads the cleaned/aggregated data.  
   - Performs iterative or advanced analytics (machine learning, clustering, correlation studies, interactive queries).  
   - (Optional) Use Spark Streaming if near real-time ingestion is desired.

3. **Final Output**:  
   - Store your final aggregated, predicted, or modeled outputs in HDFS or a database.  
   - Visualize with Python libraries (e.g., Matplotlib, Plotly) or a BI tool.

These steps should give you a good roadmap to implement each idea with your existing MapReduce and Spark setup. Adapt the mapper/reducer code to extract the correct fields, apply filters, and generate the keys/values needed for each specific analysis.
