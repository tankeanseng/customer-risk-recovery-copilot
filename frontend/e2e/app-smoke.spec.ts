import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("core navigation and data-heavy pages render and react to input", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Customer Risk & Recovery Copilot" })).toBeVisible();

  await page.getByRole("link", { name: "View Portfolio" }).click();
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect(page.getByRole("heading", { name: "Portfolio", exact: true })).toBeVisible();

  await page.getByPlaceholder("Search customers...").fill("Horizon");
  await expect(page.getByText("Horizon Foodservice Trading Sdn Bhd").first()).toBeVisible();

  await page.goto("/cases");
  await expect(page.getByRole("heading", { name: "Cases", exact: true })).toBeVisible();
  await page.getByPlaceholder("Search case id or customer...").fill("Silverline");
  await expect(page.getByRole("link", { name: "Silverline Engineering Supplies Pte Ltd" })).toBeVisible();
  await page.getByRole("button", { name: "Run Review" }).first().click();
  await expect(page.getByText(/review/i).first()).toBeVisible();

  await page.goto("/evaluation");
  await expect(page.getByRole("heading", { name: "Evaluation", exact: true })).toBeVisible();
  await expect(page.getByText("Scenario Table")).toBeVisible();
  await page.getByRole("button", { name: "Run Evaluation Suite" }).click();
  await expect(page.getByText(/snapshot/i).first()).toBeVisible();

  await page.goto("/data-explorer");
  await expect(page.getByRole("heading", { name: "Data Explorer" })).toBeVisible();
  await page.getByPlaceholder("Search records").fill("Horizon");
  await page.getByText("cust_012").first().click();
  await expect(page.getByText("Record Detail")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Case" })).toBeVisible();

  await page.goto("/optimization");
  await expect(page.getByRole("heading", { name: "Optimization", exact: true })).toBeVisible();
  await expect(page.getByText("Baseline Vs Optimized")).toBeVisible();
  await page.getByRole("cell", { name: "opt_20260325_01", exact: true }).click();
  await expect(page.getByText("Sample Output Comparison")).toBeVisible();

  await page.goto("/architecture");
  await expect(page.getByRole("heading", { name: "Architecture", exact: true })).toBeVisible();
  await expect(page.getByText("deployment", { exact: false }).first()).toBeVisible();
});

test("case review, approval decision, and trace flow works across pages", async ({ page }) => {
  await page.goto("/cases/case_012");
  await expect(page.getByRole("heading", { name: "Horizon Foodservice Trading Sdn Bhd", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Run AI Review" }).click();
  await expect(page.getByText("Live AI Result")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Schedule monitored recovery call|Pause new credit orders|Escalate|monitor/i).first()).toBeVisible();

  await page.getByRole("button", { name: "Submit For Approval" }).click();
  await expect(page.getByText("Approval Request Created")).toBeVisible();

  const approvalLink = page.getByRole("link", { name: "Open approval detail" });
  await approvalLink.click();
  await expect(page).toHaveURL(/\/approvals\?approvalId=/);
  await expect(page.getByRole("heading", { name: "Approvals", exact: true })).toBeVisible();

  await page.getByPlaceholder("Add manager comment...").fill("QA approval pass to confirm resume flow.");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText(/Approval completed|Approval approved|workflow resumed|Case approved/i).first()).toBeVisible({
    timeout: 30_000,
  });

  await page.getByRole("link", { name: /View Trace|Open latest run trace/ }).first().click();
  await expect(page.getByRole("heading", { name: "AI Workflow Trace", exact: true })).toBeVisible();
  await expect(page.getByText(/Approval Resume Context|Live LangSmith Trace/).first()).toBeVisible();

  await page.getByRole("button", { name: "Compare Baseline" }).click();
  await expect(page.getByText(/Approval Resume Summary|Baseline Comparison/).first()).toBeVisible();

  await page.getByRole("link", { name: "Open Case" }).first().click();
  await expect(page).toHaveURL(/\/cases\/case_012/);
  await expect(page.getByText(/Approval Pending|Approval Approved|Approval Revision Requested/i).first()).toBeVisible();
});

test("simulator supports editing inputs, running, saving, comparing, loading, and deleting scenarios", async ({ page }) => {
  await page.goto("/simulator");
  await expect(page.getByRole("heading", { name: "What-If Simulator", exact: true })).toBeVisible();

  await page.getByLabel("Working scenario name").fill("QA Scenario");
  await page.getByLabel("Days overdue delta").fill("9");
  await page.getByLabel("Outstanding balance delta").fill("4500");
  await page.getByLabel("Partial payment amount").fill("3000");
  await page.getByLabel("Broken promises delta").fill("0");
  await page.getByLabel("Order trend").selectOption("stable");
  await page.getByLabel("Dispute status").selectOption("open");
  await page.getByLabel("Strategic account").check();
  await page.getByLabel("Credit limit").fill("95000");
  await page.getByLabel("Payment terms").selectOption("21");

  await page.getByRole("button", { name: "Run Simulation" }).click();
  await expect(page.getByText(/simulator reran|simulation fell back/i).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Scenario Result")).toBeVisible();

  await page.getByRole("button", { name: "Save Scenario" }).click();
  await expect(page.getByText(/saved/i).first()).toBeVisible();

  const savedSection = page.locator("section").filter({ hasText: "Saved Scenarios" });
  await expect(savedSection.getByText("QA Scenario", { exact: true })).toBeVisible();
  await savedSection.getByRole("button", { name: "Compare" }).first().click();
  await expect(page.getByText("Saved Scenario Comparison")).toBeVisible();

  await savedSection.getByRole("button", { name: "Load" }).first().click();
  await expect(page.getByText(/Loaded saved scenario/i)).toBeVisible();

  await page.getByRole("link", { name: "Open Simulation Trace" }).click();
  await expect(page.getByRole("heading", { name: "AI Workflow Trace", exact: true })).toBeVisible();

  await page.goto("/simulator");
  const refreshedSavedSection = page.locator("section").filter({ hasText: "Saved Scenarios" });
  await expect(refreshedSavedSection.getByText("QA Scenario", { exact: true })).toBeVisible();
  await refreshedSavedSection.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByText(/removed/i).first()).toBeVisible();
});
