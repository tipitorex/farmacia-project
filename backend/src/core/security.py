import time
from django.core.cache import cache


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def consume_rate_limit(scope, identifier, limit, window_seconds):
    if limit <= 0:
        return True

    bucket = int(time.time() // window_seconds)
    key = f"rate:{scope}:{identifier}:{bucket}"

    if cache.add(key, 1, timeout=window_seconds + 1):
        return True

    try:
        current = cache.incr(key)
    except ValueError:
        cache.set(key, 1, timeout=window_seconds + 1)
        current = 1

    return current <= limit


def _failure_key(scope, identifier):
    return f"auth:fail:{scope}:{identifier}"


def _lock_key(scope, identifier):
    return f"auth:lock:{scope}:{identifier}"


def is_locked(scope, identifier):
    return bool(cache.get(_lock_key(scope, identifier)))


def register_failure(scope, identifier, threshold, base_lock_seconds, max_lock_seconds, failure_ttl_seconds):
    key = _failure_key(scope, identifier)

    if cache.add(key, 1, timeout=failure_ttl_seconds):
        failures = 1
    else:
        try:
            failures = cache.incr(key)
        except ValueError:
            cache.set(key, 1, timeout=failure_ttl_seconds)
            failures = 1

    if failures < threshold:
        return failures, 0

    exponent = failures - threshold
    lock_seconds = min(max_lock_seconds, base_lock_seconds * (2**exponent))
    cache.set(_lock_key(scope, identifier), 1, timeout=lock_seconds)
    return failures, lock_seconds


def clear_failures_and_lock(scope, identifier):
    cache.delete(_failure_key(scope, identifier))
    cache.delete(_lock_key(scope, identifier))
