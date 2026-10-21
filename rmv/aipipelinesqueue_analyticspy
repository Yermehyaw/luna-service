import pandas as pd
import numpy as np
from typing import List, Dict

class QueueAnalyticsEngine:
    @staticmethod
    def calculate_metrics(ticket_logs: List[Dict]) -> Dict:
        """
        Input format expected from DB:
        [{'check_in': '2026-10-16 09:00:00', 'served_at': '2026-10-16 09:15:00', 'completed_at': '2026-10-16 09:25:00'}]
        """
        df = pd.DataFrame(ticket_logs)
        if df.empty or 'check_in' not in df.columns:
            return {"avg_wait_mins": 0.0, "avg_service_mins": 0.0, "total_tickets": 0}

        df['check_in'] = pd.to_datetime(df['check_in'])
        df['served_at'] = pd.to_datetime(df['served_at'])
        df['completed_at'] = pd.to_datetime(df['completed_at'])

        wait_times = (df['served_at'] - df['check_in']).dt.total_seconds() / 60.0
        service_times = (df['completed_at'] - df['served_at']).dt.total_seconds() / 60.0

        return {
            "avg_wait_mins": round(float(np.mean(wait_times)), 2),
            "max_wait_mins": round(float(np.max(wait_times)), 2),
            "avg_service_mins": round(float(np.mean(service_times)), 2),
            "total_tickets": int(len(df))
        }