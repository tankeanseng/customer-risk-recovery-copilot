from fastapi import APIRouter

router = APIRouter()


@router.post("/cases/{case_id}/simulate")
async def simulate_case(case_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement simulation endpoint for {case_id}"}


@router.get("/cases/{case_id}/simulations")
async def list_simulations(case_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement saved simulations endpoint for {case_id}"}


@router.get("/simulations/{simulation_id}")
async def get_simulation(simulation_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement simulation detail endpoint for {simulation_id}"}


@router.post("/simulations/{simulation_id}/save")
async def save_simulation(simulation_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement simulation save endpoint for {simulation_id}"}


@router.delete("/simulations/{simulation_id}")
async def delete_simulation(simulation_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement simulation delete endpoint for {simulation_id}"}

