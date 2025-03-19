package socialmediasentim;

import java.io.IOException;
import java.util.regex.Pattern;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class EmotionAnalysisMapper extends Mapper<LongWritable, Text, Text, Text> {

    // Regular expression to match correct timestamp format (ISO 8601 with milliseconds)
    private static final Pattern TIMESTAMP_PATTERN = Pattern.compile("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z");

    @Override
    public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
        String line = value.toString();
        System.out.println("Raw Line: " + line);  // Debugging: Print the raw input line

        // Split on commas (outside quotes)
        String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

        // Ensure there are enough columns
        if (parts.length < 10) {
            System.err.println("Skipping row: Not enough columns.");
            return;
        }

        // Extract the first column (timestamp)
        String isoDatetime = parts[0].trim();

        // Validate timestamp format
        if (!TIMESTAMP_PATTERN.matcher(isoDatetime).matches()) {
            System.err.println("Skipping invalid timestamp: " + isoDatetime);
            return;
        }

        System.out.println("Extracted Valid Timestamp: " + isoDatetime);

        // Extract only the date (yyyy-MM-dd)
        String date = isoDatetime.split("T")[0];

        // Extract the second-last column (emotion)
        String mainEmotion = parts[parts.length - 2].trim();
        System.out.println("Extracted Emotion: " + mainEmotion);

        // Write the (date, emotion) pair to context
        context.write(new Text(date), new Text(mainEmotion));
    }
}
