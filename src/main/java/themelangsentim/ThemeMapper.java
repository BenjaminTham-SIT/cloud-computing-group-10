package themelangsentim;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class ThemeMapper extends Mapper<LongWritable, Text, Text, Text> {
    private final IntWritable one = new IntWritable(1);

    // Define the valid themes as a static set for fast lookup.
    private static final Set<String> VALID_THEMES = new HashSet<>(Arrays.asList(
        "Economy", "Technology", "Investing", "Business", "Cryptocurrency",
        "Social", "Politics", "Finance", "Entertainment", "Health",
        "Law", "Sports", "Science", "Environment", "People"
    ));

    @Override
    public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
//        System.out.println(value.toString());
    	String[] parts = value.toString().split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        if (parts.length >= 10) {
            // Get language from column 5 (index 4)
            String language = parts[4].trim().replaceAll("^\"|\"$", "");
            // Get theme from the assumed column index (parts.length - 5)
            String theme = parts[parts.length - 5].trim().replaceAll("^\"|\"$", "");
            
            // Check if theme is one of the valid themes
            if (!VALID_THEMES.contains(theme)) {
                // If not a valid theme, skip this record.
                return;
            }
            
            // Construct the composite key if needed.
            Text i_theme = new Text("c|" + theme);
//            context.write(outputKey, one);
            context.write(new Text(language), i_theme);
//            System.out.println(outputKey);
        }
    }
}