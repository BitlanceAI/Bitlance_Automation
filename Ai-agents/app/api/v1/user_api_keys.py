from fastapi import APIRouter, Request, HTTPException, Depends
from app.services.blog_storage_service import get_admin_supabase

router = APIRouter()

def require_auth(request: Request):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user_id

@router.get("/", summary="Get current user's API keys")
def get_user_api_keys(user_id: str = Depends(require_auth)):
    """
    Fetch API keys belonging to the authenticated user.
    """
    try:
        sb = get_admin_supabase()
        
        # Get the API keys for the current user
        result = sb.table("api_keys").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        return {"keys": result.data or []}
    except Exception as e:
        print(f"Error fetching user API keys: {e}")
        raise HTTPException(status_code=500, detail=str(e))
