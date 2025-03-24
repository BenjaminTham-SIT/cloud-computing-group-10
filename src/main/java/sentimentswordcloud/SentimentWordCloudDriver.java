package sentimentswordcloud;

import java.io.IOException;
import java.net.URISyntaxException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.chain.ChainMapper;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.GenericOptionsParser;

public class SentimentWordCloudDriver {
    public static void main(String[] args)
            throws IOException, URISyntaxException, ClassNotFoundException, InterruptedException {
        Configuration conf = new Configuration();
        String[] otherArgs = new GenericOptionsParser(conf, args).getRemainingArgs();
        if (otherArgs.length < 2) {
            System.err.println("Usage: SentimentWordCloudDriver <input> <output>");
            System.exit(2);
        }
        Job job = Job.getInstance(conf, "Word Count By Sentiment");
        job.setJarByClass(SentimentWordCloudDriver.class);

        Path inPath = new Path(otherArgs[0]);
        Path outPath = new Path(otherArgs[1]);
        // Delete output path if it exists.
        outPath.getFileSystem(conf).delete(outPath, true);

        // Chain the validation mapper and then the word count mapper.
        Configuration validationConf = new Configuration(false);
        ChainMapper.addMapper(job, ValidationMapper.class, LongWritable.class,
                Text.class, LongWritable.class, Text.class, validationConf);

        Configuration wordCountConf = new Configuration(false);
        ChainMapper.addMapper(job, SentimentWordCloudMapper.class, LongWritable.class, Text.class,
                Text.class, IntWritable.class, wordCountConf);

        // Set ChainMapper as the job's mapper.
        job.setMapperClass(ChainMapper.class);

        // Set custom partitioner to send "positive" keys to reducer 0 and "negative" to reducer 1.
        job.setPartitionerClass(SentimentWordCloudPartitioner.class);
        // Use 2 reducers for separate outputs.
        job.setNumReduceTasks(2);

        job.setReducerClass(SentimentWordCloudReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);

        FileInputFormat.addInputPath(job, inPath);
        FileOutputFormat.setOutputPath(job, outPath);

        boolean status = job.waitForCompletion(true);
        System.exit(status ? 0 : 1);
    }
}

