import logging

from .security import get_client_ip


security_logger = logging.getLogger("security.audit")


def log_auth_event(request, event, outcome="success", **details):
    payload = {
        "event": event,
        "outcome": outcome,
        "ip": get_client_ip(request),
        "path": request.path,
        "method": request.method,
    }

    user_agent = request.META.get("HTTP_USER_AGENT", "")
    if user_agent:
        payload["user_agent"] = user_agent[:200]

    safe_details = {key: value for key, value in details.items() if value not in (None, "")}
    payload.update(safe_details)

    security_logger.info(payload)
