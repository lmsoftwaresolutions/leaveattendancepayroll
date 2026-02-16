from datetime import date, timedelta

def get_all_dates_of_month(year: int, month: int):
    start = date(year, month, 1)
    dates = []

    current = start
    while current.month == month:
        dates.append(current)
        current += timedelta(days=1)

    return dates


def is_weekly_off(d: date):
    # Saturday = 5, Sunday = 6
    return d.weekday() in (5, 6)
