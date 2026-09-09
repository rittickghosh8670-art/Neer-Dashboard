"""
Claude-powered trade analysis. Feeds structured trade data (and optionally
a chart screenshot) to Claude as context and returns a natural-language
insight. No model training/fine-tuning is used -- this is in-context
analysis over your actual trade records (see project notes on why
fine-tuning is inappropriate for a dataset this size).
"""

import json
import os

import anthropic

MODEL_NAME = "claude-opus-4-1-20250805"
FALLBACK_MODEL_NAME = "claude-3-5-sonnet-20241022"

SYSTEM_PROMPT = """You are a trading performance analyst reviewing backtest and \
live trade data for the "LBS" (Levels + Bull180/Bear180/Torpedo/Power Bar Scalping) \
strategy traded on MNQ and MGC futures.

Strategy summary:
- Direction bias: 6pm EST anchored VWAP + 5-minute market structure (HH/HL vs LL/LH).
- Location: 5-minute Support/Resistance zones, Classic Levels (3-candle pattern magnets), \
and Initial Balance (IB) single/double break levels from Edgeful IB statistics.
- Entry trigger (2-minute chart, exactly one required): Bull180/Bear180 (engulfing candle \
at S/R), Torpedo (wick rejection at S/R), or Power Bar (large momentum candle at S/R).
- Trading windows: 01:30-02:30 EST (IB from 00:30-01:30, historically ~83% single break), \
03:00-04:30 EST (IB from 02:00-03:00, historically ~70% double break), and 14:00-16:00 EST.
- Risk model: fixed dollar risk per trade (~$100), position size adjusts to stop distance. \
Take profit set at Classic Level or next S/R zone, never moved. Max 1-2 trades/day.

You will be given structured trade records (JSON) with fields such as: pnl, side, \
sessionWindow, ibType, vwapSide, msDirection, signature, setupGrade, confluenceCount, \
regime (GARCH-classified: trending_high_vol / trending_low_vol / ranging_high_vol / \
ranging_low_vol), avgRiskReward, notes.

Analyze the data honestly and quantitatively. Reference actual numbers from the \
provided records (win rates, counts, average RR, PnL) rather than generic trading \
advice. Call out sample size limitations if a subgroup has too few trades to be \
statistically meaningful (fewer than ~15 trades). If a chart image is provided, \
comment on whether the marked S/R zone, entry signature, and level alignment appear \
valid per the strategy rules above. Be direct and concise. Do not pad with generic \
encouragement or disclaimers beyond noting genuine sample-size caveats."""


def _get_client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Add it to your .env file."
        )
    return anthropic.Anthropic(api_key=api_key)


def analyze_trades(
    trades: list[dict],
    question: str | None = None,
    image_base64: str | None = None,
    image_media_type: str = "image/png",
) -> dict:
    client = _get_client()

    user_content: list[dict] = []

    trades_json = json.dumps(trades, indent=2, default=str)
    prompt_text = (
        f"Here are {len(trades)} trade record(s) to analyze:\n\n```json\n{trades_json}\n```\n\n"
    )
    prompt_text += (
        f"Specific question: {question}\n\n" if question
        else "Provide a general performance analysis with actionable, specific observations.\n\n"
    )

    if image_base64:
        user_content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": image_media_type,
                "data": image_base64,
            },
        })
        prompt_text += "A trade chart screenshot is attached. Evaluate the setup shown against the strategy rules."

    user_content.append({"type": "text", "text": prompt_text})

    model_to_use = MODEL_NAME
    try:
        response = client.messages.create(
            model=model_to_use,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )
    except anthropic.NotFoundError:
        # Fallback if the pinned Opus model version is unavailable on the account.
        model_to_use = FALLBACK_MODEL_NAME
        response = client.messages.create(
            model=model_to_use,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )

    insight_text = "".join(
        block.text for block in response.content if block.type == "text"
    )

    return {"insight": insight_text, "model": model_to_use}
