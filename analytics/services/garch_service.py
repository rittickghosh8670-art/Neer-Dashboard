"""
GARCH-based market regime classification.

Given a series of closing prices (e.g. 5-minute bars covering a trading
session or IB window), this classifies the regime along two axes:

1. Volatility: high_vol / low_vol, via a GARCH(1,1) fit on log returns,
   comparing the average conditional volatility of the series against
   the long-run (unconditional) volatility implied by the fitted model.
2. Direction: trending / ranging, via linear regression of price against
   time index. A high R^2 means price moved consistently in one
   direction (trending); a low R^2 means price oscillated (ranging).

The two axes are combined into one of four regimes:
  trending_high_vol, trending_low_vol, ranging_high_vol, ranging_low_vol

This is intentionally a lightweight, session-level classifier -- it is
not a tick-by-tick regime filter. It is meant to tag each backtested
trade's session with a regime label so performance can be sliced by
regime afterward (e.g. "Bull180 in trending_high_vol wins X% vs Y% in
ranging_low_vol").
"""

import numpy as np
import pandas as pd
from arch import arch_model


MIN_OBSERVATIONS = 20
TREND_R2_THRESHOLD = 0.5


def classify_regime(prices: list[float]) -> dict:
    if len(prices) < MIN_OBSERVATIONS:
        raise ValueError(
            f"At least {MIN_OBSERVATIONS} price points are required for regime "
            f"classification, got {len(prices)}."
        )

    series = pd.Series(prices, dtype=float)
    log_returns = np.log(series / series.shift(1)).dropna()

    if log_returns.std() == 0 or log_returns.empty:
        raise ValueError("Price series has no variance; cannot fit GARCH model.")

    # Scale returns to percent for numerical stability in the optimizer.
    returns_pct = log_returns * 100

    model = arch_model(returns_pct, vol="Garch", p=1, q=1, dist="normal")
    fitted = model.fit(disp="off")

    conditional_vol = fitted.conditional_volatility
    avg_vol = float(conditional_vol.mean())

    omega = fitted.params.get("omega", 0.0)
    alpha = fitted.params.get("alpha[1]", 0.0)
    beta = fitted.params.get("beta[1]", 0.0)
    persistence = alpha + beta
    unconditional_vol = (
        float(np.sqrt(omega / (1 - persistence))) if persistence < 1 else avg_vol
    )

    vol_ratio = avg_vol / unconditional_vol if unconditional_vol > 0 else 1.0
    is_high_vol = vol_ratio > 1.1

    x = np.arange(len(series))
    y = series.values
    slope, intercept = np.polyfit(x, y, 1)
    y_pred = slope * x + intercept
    ss_res = float(np.sum((y - y_pred) ** 2))
    ss_tot = float(np.sum((y - np.mean(y)) ** 2))
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    is_trending = r_squared > TREND_R2_THRESHOLD
    direction = "up" if slope > 0 else "down"

    trend_label = "trending" if is_trending else "ranging"
    vol_label = "high_vol" if is_high_vol else "low_vol"
    regime = f"{trend_label}_{vol_label}"

    vol_confidence = min(abs(vol_ratio - 1.0), 1.0)
    trend_confidence = r_squared if is_trending else (1 - r_squared)
    confidence = round(float((vol_confidence + trend_confidence) / 2), 4)

    return {
        "regime": regime,
        "confidence": confidence,
        "direction": direction if is_trending else "sideways",
        "avgConditionalVolatility": round(avg_vol, 6),
        "unconditionalVolatility": round(unconditional_vol, 6),
        "volatilityRatio": round(vol_ratio, 4),
        "trendRSquared": round(r_squared, 4),
        "isHighVol": is_high_vol,
        "isTrending": is_trending,
    }
