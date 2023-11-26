# Project 1
## AI Transcript generator

- fill .env file
```
OPEN_AI_API_KEY=your_api_key
```

- load the environment variables
```python
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("OPEN_AI_API_KEY")
```