from fastapi import APIRouter

router = APIRouter()


@router.get("/triage/rules")
async def get_triage_rules() -> dict[str, str]:
    return {"message": "TODO: implement triage rules endpoint"}

