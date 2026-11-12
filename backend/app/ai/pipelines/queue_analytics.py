from datetime import datetime
from typing import Any


def _parse_dt(val: Any) -> datetime:
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        return datetime.fromisoformat(val)
    raise ValueError(f"Cannot parse datetime from {val}")


class QueueAnalyticsEngine:
    @staticmethod
    def calculate_metrics(ticket_logs: list[dict]) -> dict:
        if not ticket_logs:
            return {
                "avg_wait_mins": 0.0,
                "max_wait_mins": 0.0,
                "avg_service_mins": 0.0,
                "total_tickets": 0,
            }

        wait_times: list[float] = []
        service_times: list[float] = []

        for log in ticket_logs:
            if not isinstance(log, dict) or "check_in" not in log:
                continue
            try:
                ci = _parse_dt(log["check_in"])
                sa = _parse_dt(log["served_at"])
                ca = _parse_dt(log["completed_at"])
            except (KeyError, ValueError, TypeError):
                continue

            wait_times.append((sa - ci).total_seconds() / 60.0)
            service_times.append((ca - sa).total_seconds() / 60.0)

        if not wait_times:
            return {
                "avg_wait_mins": 0.0,
                "max_wait_mins": 0.0,
                "avg_service_mins": 0.0,
                "total_tickets": 0,
            }

        return {
            "avg_wait_mins": round(sum(wait_times) / len(wait_times), 2),
            "max_wait_mins": round(max(wait_times), 2),
            "avg_service_mins": round(sum(service_times) / len(service_times), 2),
            "total_tickets": len(wait_times),
        }
