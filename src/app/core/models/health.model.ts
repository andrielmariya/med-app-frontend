export interface HealthRecord {
    id: number;
    user_id: number;
    symptoms: string;
    details?: string;
    ai_summary?: string;
    ai_outcomes?: string;
    ai_severity: number;
    ai_frequency: number;
    created_at: string;
    metrics?: SymptomMetric[];
}

export interface SymptomMetric {
    id: number;
    user_id: number;
    health_record_id: number;
    metric_name: string;
    value: number;
    created_at: string;
}

export interface RedFlag {
    name: string;
    details: string;
    date: string;
}

export interface PossibleRisk {
    name: string;
    level: string;
    date: string;
}

export interface RisksResponse {
    counts: { label: string, count: number }[];
    unique_risks: PossibleRisk[];
}

export interface RedFlagsResponse {
    counts: { label: string, count: number }[];
    recent_flags: RedFlag[];
}

export interface DashboardResponse {
    records: HealthRecord[];
}

export interface MetricsResponse {
    [key: string]: {
        value: number;
        date: string;
    }[];
}
