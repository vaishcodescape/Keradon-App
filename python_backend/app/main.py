from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.routers import datashark, queryhammerhead, vizfin
from app.config import settings

# Create FastAPI app
app = FastAPI(
    title="Keradon Tools API",
    description="API for DataShark, QueryHammerhead, and VizFin tools",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(datashark.router, prefix="/api/tools/datashark", tags=["DataShark"])
app.include_router(queryhammerhead.router, prefix="/api/tools/queryhammerhead", tags=["QueryHammerhead"])
app.include_router(vizfin.router, prefix="/api/tools/vizfin", tags=["VizFin"])

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Keradon Tools API",
        "version": "1.0.0",
        "tools": ["DataShark", "QueryHammerhead", "VizFin"],
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "All tools operational"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": str(exc)}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    ) 