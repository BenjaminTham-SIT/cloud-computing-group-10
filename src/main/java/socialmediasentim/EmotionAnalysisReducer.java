package socialmediasentim;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class EmotionAnalysisReducer extends Reducer<Text, Text, Text, Text> {

    @Override
    public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
        // Map to hold emotion counts for each date
        Map<String, Integer> emotionCountMap = new HashMap<>();

        // Iterate over all the emotions for the given date (key)
        for (Text value : values) {
            String emotion = value.toString().trim();

            // Update the count for each emotion
            emotionCountMap.put(emotion, emotionCountMap.getOrDefault(emotion, 0) + 1);
        }

        // Format the result as a comma-separated string of "emotion: count" pairs
        StringBuilder result = new StringBuilder();
        for (Map.Entry<String, Integer> entry : emotionCountMap.entrySet()) {
            result.append(entry.getKey()).append(": ").append(entry.getValue()).append(", ");
        }

        // Remove trailing comma and space
        if (result.length() > 0) {
            result.setLength(result.length() - 2);
        }

        // Write the final output: Date -> Emotion: Count
        context.write(key, new Text(result.toString()));
    }
}
