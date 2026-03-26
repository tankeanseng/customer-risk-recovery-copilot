# Data Model And Demo Cases

## Demo realism target

Each customer case should feel real but remain readable in a demo.

Recommended scale per customer:

- 1 customer profile
- 10-14 invoices
- 8-12 orders
- 5-7 notes
- 0-2 disputes

Recommended scale for the whole portfolio:

- 12 customers
- roughly 135-150 invoices
- roughly 110-130 orders
- roughly 70-80 notes
- roughly 10-14 disputes

## Product categories sold by Straits Supply Partners

- Cleaning and hygiene supplies
- Tissue and paper products
- Pantry and breakroom supplies
- Packaging and takeaway supplies
- Facility and washroom consumables
- Retail and warehouse operating consumables

## Main entities

### Customer

- `customer_id`
- `name`
- `industry`
- `region`
- `segment`
- `relationship_start_date`
- `payment_terms_days`
- `credit_limit`
- `account_owner`
- `strategic_flag`
- `customer_tier`

### Invoice

- `invoice_id`
- `customer_id`
- `invoice_date`
- `due_date`
- `amount`
- `status`
- `paid_date`
- `outstanding_amount`
- `days_overdue`

### PaymentEvent

- `payment_id`
- `customer_id`
- `invoice_id`
- `payment_date`
- `payment_amount`
- `payment_type`
- `partial_payment_flag`

### Order

- `order_id`
- `customer_id`
- `order_date`
- `order_amount`
- `product_category`
- `status`

### InteractionNote

- `note_id`
- `customer_id`
- `note_date`
- `note_type`
- `author_role`
- `summary`
- `sentiment`
- `promise_to_pay_flag`

### Dispute

- `dispute_id`
- `customer_id`
- `invoice_id`
- `opened_date`
- `dispute_type`
- `dispute_amount`
- `status`
- `resolution_notes`

### CreditPolicyRule

- `rule_id`
- `rule_name`
- `description`
- `condition_type`
- `threshold`
- `action_required`
- `approval_required`

### RecoveryCase

- `case_id`
- `customer_id`
- `trigger_reason`
- `status`
- `created_at`
- `priority`
- `latest_run_id`

### ApprovalDecision

- `approval_id`
- `case_id`
- `requested_action`
- `approver_role`
- `decision`
- `comment`
- `decided_at`

## Main action taxonomy

Low intensity:

- send reminder
- schedule follow-up call
- request payment update
- monitor for 7 days

Medium intensity:

- escalate to account owner review
- propose structured payment plan
- tighten payment monitoring
- shorten review cycle

High intensity:

- reduce credit limit
- require manager approval for new supply
- pause new orders on credit
- escalate to finance manager

## Example policy triggers

- invoice overdue > 45 days
- total overdue exposure > account threshold
- repeated broken promise count >= 2
- new customer with fast delinquency trend
- strategic customer exception requires approval
- active dispute should soften collections action
- 2 invoices > 60 days overdue triggers escalation

## Built-in customer portfolio

## Demo portfolio risk-band distribution

The built-in dataset must not cluster too heavily in one band. Interviewers should be able to see that the system handles the full portfolio, not only obviously bad accounts.

Recommended distribution for 14 demo customers:

- `Low`: 3 customers
- `Monitor`: 2 customers
- `Watchlist`: 3 customers
- `High`: 3 customers
- `Critical`: 3 customers

This gives:

- enough healthy accounts so the product does not look staged
- enough borderline accounts for simulation and nuanced review
- enough severe accounts for approval and escalation demos

### 1. Apex Facilities & Office Care Pte Ltd

- segment: Office & Corporate Facilities
- products: tissue, washroom consumables, pantry supplies
- storyline: strategic customer under temporary cashflow stress
- target risk band: `Watchlist`
- likely triage pattern: moderate aging + strategic account with worsening payment trend

### 2. Meridian Retail Mart Sdn Bhd

- segment: Retail Chains
- products: packaging, labels, cleaning supplies
- storyline: repeated late payer with broken promises
- target risk band: `High`
- likely triage pattern: repeated broken promises + late-payment streak + growing overdue

### 3. Urban Harvest Kitchens Pte Ltd

- segment: Hospitality & F&B
- products: takeaway packaging, tissue, hygiene supplies
- storyline: high overdue balance with partial repayments
- target risk band: `High`
- likely triage pattern: large overdue exposure + partial repayments + declining orders

### 4. NovaPack Print & Display Sdn Bhd

- segment: Retail / packaging operations
- products: labels, packaging, operating consumables
- storyline: delay driven by dispute
- target risk band: `Monitor`
- likely triage pattern: moderate overdue offset by dispute context

### 5. Silverline Engineering Supplies Pte Ltd

- segment: Light Industrial & Warehouse
- products: warehouse consumables, tape, gloves, cleaning products
- storyline: shrinking orders plus worsening payment behavior
- target risk band: `High`
- likely triage pattern: worsening lateness + shrinking orders + missed promise behavior

### 6. BluePeak Trading Sdn Bhd

- segment: Mixed operations buyer
- products: mixed operational supplies
- storyline: new customer deteriorating quickly
- target risk band: `Critical`
- likely triage pattern: new account + early delinquency hard trigger

### 7. GreenWave Hospitality Group

- segment: Hospitality & F&B
- products: hygiene, washroom, pantry, packaging supplies
- storyline: high-value customer needing policy exception judgment
- target risk band: `Critical`
- likely triage pattern: high overdue exposure + strategic exception + policy threshold breach

### 8. Delta Clinical Services Sdn Bhd

- segment: Clinics & Healthcare Services
- products: gloves, tissue, hygiene consumables
- storyline: chronic mild lateness but high long-term value
- target risk band: `Monitor`
- likely triage pattern: persistent mild lateness without severe exposure

### 9. Orion Workspace Solutions Pte Ltd

- segment: Office & Corporate Facilities
- products: pantry and office hygiene supplies
- storyline: recovering after prior stress
- target risk band: `Low`
- likely triage pattern: historical stress but improved recent behavior

### 10. Summit Lifestyle Retail Sdn Bhd

- segment: Retail Chains
- products: cleaning, packaging, labels
- storyline: negative qualitative signals despite moderate numeric risk
- target risk band: `Watchlist`
- likely triage pattern: qualitative warning indicators + moderate overdue trend

### 11. Titan Facility Management Pte Ltd

- segment: Facilities Management
- products: cleaning chemicals, tissue, washroom consumables
- storyline: large exposure crossing hard policy threshold
- target risk band: `Critical`
- likely triage pattern: exposure threshold breach + multiple invoices > 60 days + approval-sensitive action

### 12. Horizon Foodservice Trading Sdn Bhd

- segment: Hospitality & F&B
- products: packaging, tissue, hygiene consumables
- storyline: borderline case ideal for what-if simulation
- target risk band: `Watchlist`
- likely triage pattern: near-threshold overdue trend + partial payment behavior + mild order decline

## Add two clearly healthy accounts to avoid a staged-feeling portfolio

To keep the portfolio believable, two sample accounts should remain healthy/low-risk and appear in the full customer list but not in the urgent demo path.

### 13. HarborCare Corporate Services Pte Ltd

- segment: Office & Corporate Facilities
- products: pantry and washroom consumables
- storyline: healthy stable account
- target risk band: `Low`
- likely triage pattern: low overdue, stable orders, no broken promises

### 14. MetroMed Support Supplies Sdn Bhd

- segment: Clinics & Healthcare Services
- products: hygiene and tissue consumables
- storyline: stable medium-value account with clean payment behavior
- target risk band: `Low`
- likely triage pattern: no material overdue stress, normal order cadence

## Best demo cases by theme

- Best for simulation: Horizon Foodservice Trading Sdn Bhd
- Best for approval workflow: Titan Facility Management Pte Ltd
- Best for business tradeoff: GreenWave Hospitality Group
- Best for softer relationship handling: Apex Facilities & Office Care Pte Ltd
- Best for qualitative intelligence: Summit Lifestyle Retail Sdn Bhd

## Final recommended demo portfolio size

To support the risk-band distribution properly, increase the public demo portfolio from 12 to 14 customers.

Recommended final count:

- 14 customers
- roughly 155-175 invoices
- roughly 125-145 orders
- roughly 80-95 notes
- roughly 10-16 disputes

This is still manageable, but it makes the portfolio feel more like a real book of accounts instead of a tightly staged set piece.
