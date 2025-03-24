package sentimentswordcloud;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Partitioner;

public class SentimentWordCloudPartitioner extends Partitioner<Text, IntWritable> {
    @Override
    public int getPartition(Text key, IntWritable value, int numPartitions) {
        // Key format is "word<TAB>sentiment"
        String[] parts = key.toString().split("\t");
        if (parts.length < 2) {
            return 0; // Default partition.
        }
        String sentiment = parts[1].trim().toLowerCase();
        // With 2 reducers: partition 0 for "positive", partition 1 for any other (i.e., "negative")
        if (sentiment.equals("positive")) {
            return 0;
        } else {
            return 1;
        }
    }
}
