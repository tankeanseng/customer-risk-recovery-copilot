from fastapi import APIRouter

from app.api.routes import approvals, architecture, cases, data, evals, optimization, overview, portfolio, runs, simulations, triage

api_router = APIRouter()
api_router.include_router(overview.router, tags=["overview"])
api_router.include_router(portfolio.router, tags=["portfolio"])
api_router.include_router(cases.router, tags=["cases"])
api_router.include_router(runs.router, tags=["runs"])
api_router.include_router(simulations.router, tags=["simulations"])
api_router.include_router(approvals.router, tags=["approvals"])
api_router.include_router(evals.router, tags=["evaluations"])
api_router.include_router(optimization.router, tags=["optimization"])
api_router.include_router(data.router, tags=["data"])
api_router.include_router(architecture.router, tags=["architecture"])
api_router.include_router(triage.router, tags=["triage"])

