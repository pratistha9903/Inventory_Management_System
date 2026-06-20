ORDER_STATUSES = ("pending", "processing", "delivered", "cancelled")

VALID_TRANSITIONS = {
    "pending": {"processing", "cancelled"},
    "processing": {"delivered", "cancelled"},
    "delivered": set(),
    "cancelled": set(),
}

LOW_STOCK_THRESHOLD = 10
