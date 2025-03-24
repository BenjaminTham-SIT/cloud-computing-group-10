package sentimentswordcloud;

import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class SentimentWordCloudMapper extends Mapper<LongWritable, Text, Text, IntWritable> {

    @Override
    protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {
        // Split the CSV line into fields.
        String[] parts = value.toString().split(",");
        if (parts.length != 10) {
            return; // Skip malformed rows.
        }

        // Extract relevant fields.
        String originalText = parts[1];
        String language = parts[4].trim();
        String sentimentString = parts[7].trim();

        // Process only English rows.
        if (!language.equalsIgnoreCase("en")) {
            return;
        }

        double sentimentValue;
        try {
            sentimentValue = Double.parseDouble(sentimentString);
        } catch(NumberFormatException e) {
            // Skip if sentiment is not a valid number.
            return;
        }

        // Classify sentiment: negative if < 0, otherwise positive.
        String sentimentCategory = sentimentValue < 0 ? "negative" : "positive";

        // Tokenize the original_text. Here we split on whitespace.
        String[] words = originalText.split("\\s+");
        for (String word : words) {
            if (word != null && !word.isEmpty()) {
                // Lower-case the word for uniformity.
                word = word.toLowerCase();
                // Emit composite key: "word<TAB>sentimentCategory" with count 1.
                context.write(new Text(word + "\t" + sentimentCategory), new IntWritable(1));
            }
        }
    }
}

