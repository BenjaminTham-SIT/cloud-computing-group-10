package socialmediasentim;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class EmotionAnalysisReducer extends Reducer<Text, Text, Text, Text> {

    @Override
    public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
        Set<String> uniqueEmotions = new HashSet<>();  // To store unique emotions for each timestamp

		//Why HashSet?
			// Avoids duplicates (only unique emotions are stored).
			// Fast lookups (O(1) average time complexity). faster than HashTable 

        for (Text value : values) {
            uniqueEmotions.add(value.toString());
        }

        // Convert set to a comma-separated string
        String aggregatedEmotions = String.join(", ", uniqueEmotions);
        System.out.println("Timestamp: " + key + " -> Emotions: " + aggregatedEmotions);

        // Write final output (Timestamp, Emotions)
        context.write(key, new Text(aggregatedEmotions));
    }
}
