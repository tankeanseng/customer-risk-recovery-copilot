from pydantic import BaseModel


class ArchitectureHero(BaseModel):
    title: str
    description: str
    highlights: list[str]


class ProductFlowStep(BaseModel):
    label: str
    summary: str


class TechnicalArchitectureBlock(BaseModel):
    layer: str
    components: list[str]
    status: str


class McpTopologyItem(BaseModel):
    name: str
    responsibility: str
    status: str


class SpecialistAgentItem(BaseModel):
    name: str
    purpose: str
    status: str


class DeploymentTopologyItem(BaseModel):
    area: str
    current_state: str
    target_state: str


class ArchitectureResponse(BaseModel):
    hero: ArchitectureHero
    product_flow: list[ProductFlowStep]
    technical_architecture: list[TechnicalArchitectureBlock]
    mcp_topology: list[McpTopologyItem]
    specialist_agents: list[SpecialistAgentItem]
    deployment_topology: list[DeploymentTopologyItem]
    notes: list[str]
