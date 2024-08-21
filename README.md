
# 🚀 Model_Gender and Instagram Automation Bot

🔍 **Project Description**  
This repository contains two major components: a gender classifier and an Instagram automation bot. The gender classifier is trained with over 50,000 male and female names, using XGBoost and OpenAI embeddings to make predictions. The Instagram bot is developed in TypeScript using Node.js and Puppeteer, and can automate actions such as following and unfollowing users based on gender, along with random interactions to mimic human behavior.

---

## ⚙️ **Requirements**

### Gender Classifier

To run the gender classifier, you need to install the dependencies listed in `requirements.txt`. You can do this by running the following command:

```bash
pip install -r requirements.txt
```

### Instagram Bot

Navigate to the `InstaBot` directory and install the dependencies with:

```bash
pnpm install
```

Make sure to have Node.js and Puppeteer properly installed.

---

## 🚀 **Usage Instructions**

### Gender Classifier

1. **Install the requirements:**  
   Run the `requirements.txt` file in a Python virtual environment.

2. **Start the local API:**  
   Run `app.py` to launch a local API using Flask, where you can send requests with the words to be predicted:

```bash
python app.py
```

### Instagram Bot


1. **Configure environment variables:**  
   Complete the `.env` file with the following template:

```plaintext
USERNAME=''
PASSWORD=''
USER_TO_FOLLOW=''
FOLLOWERS_OR_FOLLOWING=''
PHOTO=''

USERAGENT=
WIDTH=
HEIGHT=

#OPENAI_API_KEY=

# Probability of performing interactions (Likes on Feed or Stories) during breaks.
# Value between 0 and 1: 0 = Never, 1 = Always. Example: 0.15 means 15% probability.
PROB_INTERACTIONS=

# Probability of going to Feed or Stories.
# Value between 0 and 1: 0 = Never, 1 = Always. Example: 0.15 means 15% probability.
PROB_FEED_OR_STORIES=
```

2. **Install dependencies:**  
   After navigating to the `InstaBot` directory, run:

```bash
pnpm install
```



3. **Start the bot:**  
   Run the following command to initialize the bot:

```bash
pnpm run init
```

4. **Select an action from the console:**  
   Upon starting, you will be prompted to choose an action:

```plaintext
Select an action:
 1. Follow
 2. Unfollow
 3. Exit
```

   - **Follow:** Selects users to follow based on gender from followers, following, or likes on a specific photo.
   - **Unfollow:** Unfollows users who do not follow you back or based on recent follows from the bot.
   - **Exit:** Exits the bot.

#### Follow Options:

```plaintext
Select follow type:
 1. Followers
 2. Following
 3. Photo
```

#### Follow Options:

```plaintext
Select gender: 
 0. Men 
 1. Women 
 2. All 
 3. Businesses 
```
   - **All:** It doesn't use the model, it follows all the users on the list.

#### Unfollow Options:

```plaintext
Select unfollow type:
 1. All followed
 2. Recent followers
```

   - **All followed:** Checks your entire follow list to unfollow users who do not follow you back.
   - **Recent followers:** Only checks users followed on a specific day via the bot.

   ```plaintext
   How many days back should we check the recent followers? (0 for today, 1 for yesterday, etc.):
   ```

---

## 📂 **Project Structure**

### Gender Classifier

- `app.py`: Launches the local API with Flask and calls `utils.py` to process each request.
- `utils.py`: Receives the words, generates embeddings, and classifies with the `modelWordsPredict.pkl` model to determine if the word is a proper noun or a common noun. If it is a proper noun, it classifies the gender using `modelGenerosPredict.pkl`.

### Instagram Bot

- `index.ts`: Initializes the bot, calls login, and launches the main function.
- `login.ts`: Handles logging in, including saving and loading cookies.
- `main.ts`: Main function that processes the user-selected action.

  - **Follow**
    - `clickFollowUser.ts`: Navigates to the user profile to follow them.
    - `embedding.ts`: Sends the text from the user description to the model for classification.
    - `follow.ts`: Core follow functionality.
    - `userUtils.ts`: Handles extraction of usernames, descriptions, buttons, and other elements.

  - **Unfollow**
    - `checkunfollow.ts`: Visits a profile to check if the user follows you back or to unfollow them.
    - `unfollow.ts`: Core unfollow functionality.
    - `userUtils.ts`: Handles extraction of usernames, descriptions, buttons, and other elements.

  - **Utils**
    - `interaction.ts`: Controls interactions, managing transitions to feed or story.
    - `jsonUtils.ts`: Module for saving and loading lists to be used.
    - `LikesFeedForInteraction.ts`: Handles likes on feed posts.
    - `LikesStoryForInteraction.ts`: Handles likes on story posts.
    - `scrollUtils.ts`: Manages various scroll actions.
    - `timeUtils.ts`: Manages human-like wait times.
    - `utils.ts`: Selects actions for the bot.

---

## 🗂️ **Included Files**

### Gender Classifier
- `modelWordsPredict.pkl`: Model to classify if the word is a proper noun or a common noun.
- `modelGenerosPredict.pkl`: Model to predict gender in proper nouns.
- `label_encoderWords.pkl`: Label encoder for the word model.
- `label_encoderGeneros.pkl`: Label encoder for the gender model.

To observe the training of the models visit the jupyter notebook on kaggle (https://www.kaggle.com/code/ivancanepa/model-gender-classifier)
### Instagram Bot
- `.env`: Environment variables for configuring the Instagram bot.
- `index.ts`: Main entry point for the bot.
- Various utility files for managing different aspects of the bot's functionality.

---

### 📧 **Contact**

If you have questions or suggestions, feel free to open an issue or contact the project maintainer.
