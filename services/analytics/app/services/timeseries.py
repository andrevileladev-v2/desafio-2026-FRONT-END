import warnings
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

from app.domain.models import ObservationInput, TimeSeriesResult

warnings.filterwarnings("ignore")


def run_timeseries(observations: list[ObservationInput], steps: int, granularity: str) -> list[TimeSeriesResult]:
    df = pd.DataFrame([{"date": o.date} for o in observations])
    df["date"] = pd.to_datetime(df["date"])
    freq = "MS" if granularity == "month" else "YS"
    fmt = "%Y-%m" if granularity == "month" else "%Y"

    counts = df.groupby(df["date"].dt.to_period("M" if granularity == "month" else "Y")).size()
    counts.index = counts.index.to_timestamp()
    counts = counts.asfreq(freq, fill_value=0)

    history: list[TimeSeriesResult] = [
        TimeSeriesResult(date=d.strftime(fmt), count=int(v), is_forecast=False)
        for d, v in counts.items()
    ]

    forecast: list[TimeSeriesResult] = []
    if len(counts) >= 4:
        try:
            model = ARIMA(counts, order=(1, 1, 1))
            fit = model.fit()
            pred = fit.get_forecast(steps=steps)
            mean = pred.predicted_mean
            ci = pred.conf_int()

            for date, val in mean.items():
                lo = float(ci.loc[date].iloc[0])
                hi = float(ci.loc[date].iloc[1])
                forecast.append(TimeSeriesResult(
                    date=date.strftime(fmt),
                    count=max(0, int(round(val))),
                    is_forecast=True,
                    lower_ci=max(0, lo),
                    upper_ci=max(0, hi),
                ))
        except Exception:
            pass

    return history + forecast
