package socialmediasentim;

import java.io.IOException;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class SocialReducer extends Reducer<Text, IntWritable, Text, IntWritable>{
	IntWritable totalIW = new IntWritable();
	@Override
	public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
		System.out.println("value: " + values);
		int total = 0;
		for (IntWritable value : values) {
			total += value.get();
		}
		totalIW.set(total);
		context.write(key, totalIW);
	}
}
