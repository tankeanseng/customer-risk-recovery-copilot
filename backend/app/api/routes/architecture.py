from fastapi import APIRouter

router = APIRouter()


@router.get("/architecture")
async def get_architecture() -> dict[str, str]:
    return {"message": "TODO: implement architecture endpoint"}

