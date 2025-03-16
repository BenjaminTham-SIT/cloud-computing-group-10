package socialmediasentim;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Hashtable;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;


public class SocialMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
	
	@Override

	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
	
    // Use a regex to split on commas that are not inside quotes.
    String[] parts = value.toString().split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

    // If this is the header line or there aren't enough columns, skip the record.
    if (parts.length < 10 || parts[0].equals("date")) {
        return;
    }
    
    // Extract the URL (assuming it's the third column) and clean it.
    String url = parts[2].trim();
    if(url.startsWith("\"") && url.endsWith("\"")) {
        url = url.substring(1, url.length()-1);
    }
    String domain = url.replaceAll("https?://([^/]+).*", "$1");

    // Get the second last column for the sentiment.
    String sentiment = parts[parts.length - 2].trim();
    
    System.out.println("Domain: " + domain + " Sentiment: " + sentiment);
    
    if (domain != null && sentiment.equals("joy")) {
        context.write(new Text(domain), new IntWritable(1));
    }
	
}
}
