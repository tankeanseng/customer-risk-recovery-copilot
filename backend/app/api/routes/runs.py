from fastapi import APIRouter

router = APIRouter()


@router.get("/runs/{run_id}")
async def get_run(run_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement run detail endpoint for {run_id}"}


@router.get("/runs/{run_id}/status")
async def get_run_status(run_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement run status endpoint for {run_id}"}


@router.post("/runs/{run_id}/replay")
async def replay_run(run_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement run replay endpoint for {run_id}"}


@router.get("/runs/{run_id}/compare")
async def compare_runs(run_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement run compare endpoint for {run_id}"}

