from fastapi import APIRouter

router = APIRouter()


@router.get("/evals/summary")
async def get_eval_summary() -> dict[str, str]:
    return {"message": "TODO: implement eval summary endpoint"}


@router.get("/evals/scenarios")
async def get_eval_scenarios() -> dict[str, str]:
    return {"message": "TODO: implement eval scenarios endpoint"}


@router.post("/evals/run")
async def run_evals() -> dict[str, str]:
    return {"message": "TODO: implement eval run endpoint"}


@router.get("/evals/runs/{eval_run_id}")
async def get_eval_run(eval_run_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement eval run detail endpoint for {eval_run_id}"}

