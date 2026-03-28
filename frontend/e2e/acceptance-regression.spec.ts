import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("guided demo walkthrough progresses across all major pages", async ({ page }) => {
  await page.goto("/?walkthrough=demo&step=overview");

  await expect(page.getByText("Guided Demo", { exact: true })).toBeVisible();
  await expect(page.getByText("Step 1 of 10")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Customer Risk & Recovery Copilot" })).toBeVisible();

  const expectedSteps = [
    { url: /\/portfolio\?walkthrough=demo&step=portfolio$/, marker: "Portfolio", eyebrow: "Step 2 of 10" },
    {
      url: /\/cases\/case_012\?walkthrough=demo&step=case$/,
      marker: "Horizon Foodservice Trading Sdn Bhd",
      eyebrow: "Step 3 of 10",
    },
    { url: /\/traces\?caseId=case_012&walkthrough=demo&step=trace$/, marker: "AI Workflow Trace", eyebrow: "Step 4 of 10" },
    { url: /\/simulator\?walkthrough=demo&step=simulator$/, marker: "What-If Simulator", eyebrow: "Step 5 of 10" },
    { url: /\/approvals\?walkthrough=demo&step=approvals$/, marker: "Approvals", eyebrow: "Step 6 of 10" },
    { url: /\/evaluation\?walkthrough=demo&step=evaluation$/, marker: "Evaluation", eyebrow: "Step 7 of 10" },
    { url: /\/optimization\?walkthrough=demo&step=optimization$/, marker: "Baseline Vs Optimized", eyebrow: "Step 8 of 10" },
    { url: /\/data-explorer\?walkthrough=demo&step=data-explorer$/, marker: "Data Explorer", eyebrow: "Step 9 of 10" },
    { url: /\/architecture\?walkthrough=demo&step=architecture$/, marker: "Deployment Topology", eyebrow: "Step 10 of 10" },
    { url: /\/\?walkthrough=demo&step=overview$/, marker: "Customer Risk & Recovery Copilot", eyebrow: "Step 1 of 10" },
  ];

  for (const step of expectedSteps) {
    await page.getByRole("link", { name: /Open |Restart Walkthrough/ }).last().click();
    await expect(page).toHaveURL(step.url);
    await expect(page.getByText(step.marker, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(step.eyebrow)).toBeVisible();
  }

  await page.getByRole("link", { name: "Exit" }).click();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:3000\/$/);
  await expect(page.getByText("Guided Demo", { exact: true })).not.toBeVisible();
});

test("lower-frequency actions behave correctly across portfolio, approvals, traces, simulator, and data explorer", async ({ page }) => {
  await page.goto("/portfolio");
  await expect(page.getByRole("heading", { name: "Portfolio", exact: true })).toBeVisible();

  const refreshLabel = page.getByText(/Refreshed:/).first();
  await expect(refreshLabel).toContainText("Just now");
  await page.getByRole("button", { name: "High", exact: true }).click();
  await expect(page.getByRole("link", { name: "Meridian Retail Mart Sdn Bhd" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Horizon Foodservice Trading Sdn Bhd" })).not.toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByPlaceholder("Search customers...")).toHaveValue("");
  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(refreshLabel).not.toContainText("Just now");

  await page.goto("/approvals?approvalId=app_202");
  await expect(page.getByRole("heading", { name: "Approvals", exact: true })).toBeVisible();
  await page.getByPlaceholder("Add manager comment...").fill("Need a narrower recovery plan before approval.");
  await page.getByRole("button", { name: "Request Revision" }).click();
  await expect(page.getByText(/revision/i).first()).toBeVisible();
  await expect(page.getByText(/Approval revision requested|revision requested/i).first()).toBeVisible();

  await page.goto("/approvals?approvalId=app_201");
  await page.getByPlaceholder("Add manager comment...").fill("Rejecting for QA edge-case coverage.");
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByText(/rejected/i).first()).toBeVisible();

  await page.goto("/cases/case_012");
  await page.getByRole("button", { name: "Run AI Review" }).click();
  await expect(page.getByText("Live AI Result")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("link", { name: "View Full Trace" }).click();
  await expect(page.getByRole("heading", { name: "AI Workflow Trace", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Replay Run" }).click();
  await expect(page.getByText(/Replay started/i).first()).toBeVisible();

  await page.goto("/data-explorer");
  await page.getByPlaceholder("Search records").fill("Horizon");
  await page.getByText("cust_012").first().click();
  await expect(page.getByText("Record Detail")).toBeVisible();
  await page.getByRole("link", { name: "Open Trace" }).click();
  await expect(page).toHaveURL(/\/traces\?runId=/);
  await expect(page.getByRole("heading", { name: "AI Workflow Trace", exact: true })).toBeVisible();

  await page.goto("/simulator");
  await expect(page.getByRole("heading", { name: "What-If Simulator", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Customer Recovers" }).click();
  await expect(page.getByText(/Preset applied: Customer Recovers/i)).toBeVisible();
  await expect(page.getByLabel("Working scenario name")).toHaveValue("Customer Recovers");
  await page.getByRole("button", { name: "Reset Scenario" }).click();
  await expect(page.getByText(/Scenario reset to baseline demo inputs/i)).toBeVisible();
  await expect(page.getByLabel("Working scenario name")).toHaveValue("Miss Another Payment");
});
