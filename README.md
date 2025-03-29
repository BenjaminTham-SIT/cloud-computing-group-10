Below is an overview of some models you can try—with minimal coding using Spark ML—and how you can set up each task by defining the dependent (target) and independent (feature) variables.

---

### 1. Sentiment Prediction (Regression)
**Goal:** Predict the continuous sentiment score (ranging from –1 to 1).

- **Model Options:**  
  - **Linear Regression**  

- **Dependent Variable:**  
  - **sentiment** (a numerical score computed from multiple models)

- **Independent Variables:**  
  - **Text features** extracted from `english_keywords` (or preprocessed `original_text`) using techniques like TF-IDF or Word2Vec  
  - You may also include additional features such as `language` (encoded), or even time-based features from the `date` column if trends are relevant

---

### 2. Main Emotion Classification (Classification)
**Goal:** Classify each post’s main emotion (e.g. Neutral, Happy, Angry, etc.).

- **Model Options:**  
  - **Logistic Regression** (supports multinomial classification)  

- **Dependent Variable:**  
  - **main_emotion** (a categorical label)

- **Independent Variables:**  
  - **Text features** from `english_keywords` or a cleaned version of `original_text` (converted into numeric vectors)  
  - Optionally, add `language` or even `primary_theme` as additional features if they help discriminate between emotions

---

### 3. Primary Theme Classification (Classification)
**Goal:** Determine the primary theme of each post (e.g. Economy, Technology, etc.).

- **Model Options:**  
  - **Naive Bayes** (good for text-based classification)

- **Dependent Variable:**  
  - **primary_theme** (a categorical variable representing one of the several themes)

- **Independent Variables:**  
  - **Text features** from `english_keywords` or processed `original_text` (vectorized)  
  - Additional context such as `language` may also be useful

