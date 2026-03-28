from __future__ import annotations

import json
import os
from pathlib import Path

from pydantic import BaseModel

from app.data.mock_store import (
    APPROVAL_DETAILS,
    APPROVAL_QUEUE,
    CASES_LIST,
    RUN_COMPARISONS,
    RUN_DETAILS,
    RUN_STATUSES,
    SAVED_SIMULATIONS,
    SIMULATION_DETAILS,
)
from app.schemas.approvals import ApprovalDetail, ApprovalQueueResponse
from app.schemas.cases import CasesListResponse
from app.schemas.runs import RunCompareResponse, RunDetailResponse, RunStatusResponse
from app.schemas.simulations import SimulationListResponse, SimulationResponse


class RuntimeStateSnapshot(BaseModel):
    cases_list: CasesListResponse
    approval_queue: ApprovalQueueResponse
    approval_details: dict[str, ApprovalDetail]
    run_details: dict[str, RunDetailResponse]
    run_statuses: dict[str, RunStatusResponse]
    run_comparisons: dict[str, RunCompareResponse]
    simulation_details: dict[str, SimulationResponse]
    saved_simulations: dict[str, SimulationListResponse]


class StateBlobStore:
    def read_text(self, key: str) -> str | None:
        raise NotImplementedError

    def write_text(self, key: str, value: str) -> None:
        raise NotImplementedError


class LocalFileStateBlobStore(StateBlobStore):
    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def read_text(self, key: str) -> str | None:
        path = self.root / key
        if not path.exists():
            return None
        return path.read_text(encoding="utf-8")

    def write_text(self, key: str, value: str) -> None:
        path = self.root / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value, encoding="utf-8")


def _default_snapshot() -> RuntimeStateSnapshot:
    return RuntimeStateSnapshot(
        cases_list=CASES_LIST.model_copy(deep=True),
        approval_queue=APPROVAL_QUEUE.model_copy(deep=True),
        approval_details={key: value.model_copy(deep=True) for key, value in APPROVAL_DETAILS.items()},
        run_details={key: value.model_copy(deep=True) for key, value in RUN_DETAILS.items()},
        run_statuses={key: value.model_copy(deep=True) for key, value in RUN_STATUSES.items()},
        run_comparisons={key: value.model_copy(deep=True) for key, value in RUN_COMPARISONS.items()},
        simulation_details={key: value.model_copy(deep=True) for key, value in SIMULATION_DETAILS.items()},
        saved_simulations={key: value.model_copy(deep=True) for key, value in SAVED_SIMULATIONS.items()},
    )


def _storage_root() -> Path:
    configured = os.getenv("APP_STATE_DIR")
    if configured:
        return Path(configured)
    return Path(__file__).resolve().parents[2] / "runtime_state"


def get_state_store() -> StateBlobStore:
    return LocalFileStateBlobStore(_storage_root())


def load_runtime_state() -> RuntimeStateSnapshot:
    store = get_state_store()
    raw = store.read_text("app_state.json")
    if raw is None:
        snapshot = _default_snapshot()
        save_runtime_state(snapshot)
        return snapshot
    return RuntimeStateSnapshot.model_validate(json.loads(raw))


def save_runtime_state(snapshot: RuntimeStateSnapshot) -> None:
    store = get_state_store()
    store.write_text("app_state.json", snapshot.model_dump_json(indent=2))


def reset_runtime_state() -> RuntimeStateSnapshot:
    snapshot = _default_snapshot()
    save_runtime_state(snapshot)
    return snapshot
