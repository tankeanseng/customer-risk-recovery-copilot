EVAL_CASES = [
    {
        "eval_id": "critical_hard_stop",
        "case_id": "case_011",
        "label": "Critical hard-threshold exposure",
        "expected_risk_bands": ["Critical"],
        "action_keywords_any": ["pause", "approval", "restrict"],
        "required_policy_keywords_any": ["approval", "threshold", "mandatory"],
    },
    {
        "eval_id": "critical_strategic_exception",
        "case_id": "case_007",
        "label": "Strategic account requiring exception review",
        "expected_risk_bands": ["Critical"],
        "action_keywords_any": ["exception", "approval", "manager", "escalate"],
        "required_policy_keywords_any": ["approval", "exception", "strategic"],
    },
    {
        "eval_id": "high_broken_promises",
        "case_id": "case_002",
        "label": "Repeated broken promises with no dispute support",
        "expected_risk_bands": ["High"],
        "action_keywords_any": ["escalate", "reduce", "collections"],
        "required_policy_keywords_any": ["manager", "review", "repeat", "default"],
    },
    {
        "eval_id": "watchlist_borderline",
        "case_id": "case_012",
        "label": "Borderline watchlist account with partial payments",
        "expected_risk_bands": ["Watchlist"],
        "action_keywords_any": ["monitor", "recovery", "call", "review"],
        "required_policy_keywords_any": ["threshold", "monitor", "compliant"],
    },
    {
        "eval_id": "low_healthy_baseline",
        "case_id": "case_013",
        "label": "Healthy low-risk baseline account",
        "expected_risk_bands": ["Low"],
        "action_keywords_any": ["no action", "monitor", "baseline"],
        "required_policy_keywords_any": ["no active", "monitor", "baseline"],
    },
    {
        "eval_id": "fallback_new_high_priority",
        "case_id": "case_005",
        "label": "Fallback detail for new high-priority case",
        "expected_risk_bands": ["High"],
        "action_keywords_any": ["review", "escalate", "monitor"],
        "required_policy_keywords_any": ["fallback", "queue", "policy", "review"],
    },
]


EVAL_SCENARIO_MUTATIONS = [
    {
        "eval_id": "watchlist_case_012_worsened",
        "base_case_id": "case_012",
        "label": "Watchlist account worsened with another missed payment",
        "mutations": {
            "case_brief": {
                "risk_summary": (
                    "Risk has worsened after another missed payment and larger overdue balance; "
                    "customer engagement is fading."
                ),
                "recommended_action": "Escalate monitored recovery to finance manager review",
                "policy_status": "Near hard threshold; escalation likely if pressure continues.",
                "why_now": "A fresh missed payment and higher overdue balance push the account closer to escalation.",
            },
            "triage": {
                "triage_score": 79,
                "risk_band": "High",
                "hard_trigger_hit": True,
                "trigger_reasons": [
                    {"label": "Missed another payment"},
                    {"label": "Overdue balance increased"},
                    {"label": "Order decline"},
                ],
            },
            "risk_band": "High",
            "risk_score": 79,
            "risk_drivers": [
                "Missed another payment",
                "Overdue balance increased",
                "Order decline accelerating",
            ],
            "notes": [
                "Customer failed to honor the latest promised payment date.",
                "Collections team noted slower response from the finance contact.",
                "Recent order demand remains soft.",
            ],
            "policy_summary": [
                "High exposure review trigger is now close to activation",
                "Manager review likely if payment does not arrive",
            ],
        },
        "expected_risk_bands": ["High"],
        "action_keywords_any": ["escalate", "manager", "review", "approval"],
        "required_policy_keywords_any": ["threshold", "review", "approval", "escalation"],
    },
    {
        "eval_id": "watchlist_case_012_improved",
        "base_case_id": "case_012",
        "label": "Watchlist account improved after meaningful partial payment",
        "mutations": {
            "case_brief": {
                "risk_summary": (
                    "Risk has eased after a meaningful partial payment and a clearer repayment commitment."
                ),
                "recommended_action": "Continue monitored recovery with softer follow-up cadence",
                "policy_status": "No approval needed; continue watchlist monitoring.",
                "why_now": "The latest payment improved short-term confidence without fully clearing risk.",
            },
            "triage": {
                "triage_score": 48,
                "risk_band": "Monitor",
                "hard_trigger_hit": False,
                "trigger_reasons": [
                    {"label": "Partial payment received"},
                    {"label": "Customer engagement improved"},
                ],
            },
            "risk_band": "Monitor",
            "risk_score": 48,
            "risk_drivers": [
                "Partial payment improved position",
                "Customer communication improved",
            ],
            "notes": [
                "Customer remitted a meaningful partial payment after follow-up.",
                "Account manager reports better responsiveness from finance contact.",
            ],
            "policy_summary": [
                "Remain under monitored review",
                "No approval threshold triggered",
            ],
        },
        "expected_risk_bands": ["Monitor"],
        "action_keywords_any": ["monitor", "follow-up", "recovery"],
        "required_policy_keywords_any": ["no approval", "monitor", "watchlist"],
    },
]
