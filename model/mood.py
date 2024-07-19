from textblob import TextBlob
def detect_mood(text):
    analysis = TextBlob(text)
    if analysis.sentiment.polarity > 0:
        return "happy"
    elif analysis.sentiment.polarity < 0:
        return "sad"
    else:
        return "neutral"

if __name__ == "__main__":
    import sys
    mood = detect_mood(sys.argv[1])
    print(mood)
