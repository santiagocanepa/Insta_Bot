
# Instagram Bot with Gender Classification

This repository contains an advanced Instagram bot script designed to automate following and unfollowing users based on their gender. It utilizes an XGBoost classification model and OpenAI ADA embeddings to determine user genders, with a cost of $0.001 cents per 1000 gender queries.

## Features

- **User Following (Follow):**
  - Based on gender determined by the classification model.
  - Execute follow action on:
    - A user's followers list.
    - A user's following list.
    - The likers of a specific post.

- **User Unfollowing (Unfollow):**
  - Checks if users do not follow back before unfollowing.
  - Execution options:
    - `all`: Scrapes in real time all followed users in your list and unfollows those who do not follow back.
    - `usernamesonlyfollow.json`: Observes and unfollows only the recently followed users listed in the generated file from the follow function.

## Cost and Efficiency

- The gender query cost is $0.001 cents per 1000 queries, ensuring a balance between efficiency and cost in bot usage.

## Requirements

- Python 3.x
- Libraries specified in `requirements.txt`
- Valid Instagram credentials

## Installation

To install and configure the bot, follow the detailed instructions below:

```bash
# Clone the repository
git clone https://github.com/your-username/instagram-bot.git

# Navigate to the project directory
cd instagram-bot

# Install dependencies
pip install -r requirements.txt
```

## Environment Setup

Before running the bot, it is necessary to set up the environment data. For this, create a file named `.env` in the root of the project with the following content:

```env
USERNAME= (your username)
PASSWORD= (your login password)
USER_TO_FOLLOW= (user whose list to copy)
PHOTO= (photo whose likers to follow)

USERAGENT= (default is provided, configure if desired)
WIDTH= (default is provided, configure if desired)
HEIGHT= (default is provided, configure if desired)

OPENAI_API_KEY= (your OpenAI key)
Gender= M or F
```

## Deployment of the Local Predictive Model API

To proceed, first deploy the local predictive model API. Follow these steps:

1.Open a console and navigate to the `Embeddings` folder located at the root of the project.
2.Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3.Install the necessary dependencies:
   ```bash
   pip install flask pandas numpy openai==0.28.0 python-dotenv xgboost
   ```
4.Once all dependencies are installed, start the API with the following command:
   ```bash
   python3 app.py
   ```
   This should create an API on the localhost using Flask.

## Dependencies Installation and Bot Execution

Once the API is up, open another console and follow these steps:

1.Navigate to the root folder of the project.
2.Install the necessary dependencies using pnpm:
   ```bash
   pnpm install
   ```
3.Start the bot with the following command:
   ```bash
   pnpm run init
   ```

## Usage of the Bot

When starting the bot, you will be presented with the following options:

- **Follow:**
  - The bot will ask if you want to follow users from a follower list, a following list, or from a list of likers of a photo.

- **Unfollow:**
  - The bot will ask if you want to review the unfollows from your entire followed list, scraping it in real time (`all`), or if you prefer just to review unfollows from the `recent` list.

- **Exit:**
  - This option allows exiting the bot.

Here is how the console interaction might look:

```bash
$ pnpm run init
What action would you like to perform?
1. Follow
2. Unfollow
3. Exit

Enter the number of the desired option: 1

Would you like to follow from?
1. A user's follower list
2. A user's following list
3. A photo's likers list

Enter the number of the desired option: 2
```
