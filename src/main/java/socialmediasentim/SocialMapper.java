package socialmediasentim;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Hashtable;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class SocialMapper extends Mapper<LongWritable, Text, Text, Text> {

    @Override

    public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
        DateTimeFormatter fmt = DateTimeFormatter.ISO_DATE_TIME;

        // Use a regex to split on commas that are not inside quotes.
        String[] parts = value.toString().split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

        // If this is the header line or there aren't enough columns, skip the record.
        if (parts.length < 10) {
            return;
        }

        // Extract the URL (assuming it's the third column) and clean it.
        String url = parts[2].trim();
        if (url.startsWith("\"") && url.endsWith("\"")) {
            url = url.substring(1, url.length() - 1);
        }
        String domain = url.replaceAll("https?://([^/]+).*", "$1");

        // Get the second last column for the sentiment.
        String mainEmotion = parts[parts.length - 2].trim();

        String isoDatetime = parts[0].trim();
        String minute;
        try {
            ZonedDateTime dt = ZonedDateTime.parse(isoDatetime, fmt);
            int intMinute = dt.getMinute(); // e.g., 28
            minute = Integer.toString(intMinute);
        } catch (DateTimeParseException e) {
            System.err.println("Bad datetime format: " + isoDatetime);
            return;
        }

        if (domain != null) {
            System.out.println("Minute: " + minute);

            context.write(new Text(minute), new Text("url"));
            context.write(new Text(minute), new Text(mainEmotion));
        }

    }
}