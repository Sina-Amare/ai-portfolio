# SakaiBot

## SakaiBot — overview
SakaiBot is an AI Telegram userbot with multi-LLM support, built by Sina in Python with Telethon. It brings summarization, translation, analysis, image generation, and voice (speech-to-text and text-to-speech) to any Telegram chat — both groups and direct messages.

## SakaiBot — resilience engineering
SakaiBot is engineered for resilience: automatic API-key rotation and provider/model failover keep it running through provider rate limits without restarts. This is the same multi-provider resilience pattern Sina applies across his LLM work. The repository is at github.com/Sina-Amare/SakaiBot.
