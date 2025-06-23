# FastAPI Backend for Keradon Tools

This is the FastAPI backend that powers the three main tools:
- DataShark (Web Scraping)
- QueryHammerhead (Data Analysis)
- VizFin (Data Visualization)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy env.example to .env and configure your environment variables

3. Run the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Backend Architecture
backend/
├── requirements.txt          # Python dependencies
├── env.example              # Environment variables template
├── README.md               # Setup instructions
└── app/
    ├── main.py             # FastAPI application
    ├── config.py           # Configuration settings
    ├── models/
    │   ├── __init__.py
    │   ├── requests.py     # Request models
    │   └── responses.py    # Response models
    ├── routers/
    │   ├── __init__.py
    │   ├── datashark.py    # Web scraping endpoints
    │   ├── queryhammerhead.py # Data analysis endpoints
    │   └── vizfin.py       # Data visualization endpoints
    ├── services/
    │   ├── __init__.py
    │   ├── datashark_service.py
    │   ├── queryhammerhead_service.py
    │   └── vizfin_service.py
    └── utils/
        ├── __init__.py
        ├── file_handlers.py
        └── validators.py