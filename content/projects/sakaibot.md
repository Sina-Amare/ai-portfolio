

# SakaiBot

## SakaiBot — overview
SakaiBot is an AI Telegram userbot with multi-LLM support, built by Sina in Python with Telethon. It brings summarization, translation, analysis, image generation, and voice (speech-to-text and text-to-speech) to any Telegram chat — both groups and direct messages.

## SakaiBot — what it can do
SakaiBot adds several AI capabilities to Telegram: it can summarize long conversations, translate messages, analyze content, generate images, and handle voice both ways with speech-to-text and text-to-speech. It works in both group chats and direct messages, which makes it a general-purpose AI assistant living inside Telegram.

## SakaiBot — resilience engineering
SakaiBot is engineered for resilience: automatic API-key rotation and provider/model failover keep it running through provider rate limits without restarts. When one key is exhausted or one provider is unavailable, it rotates to another and keeps responding. This is the same multi-provider resilience pattern Sina applies across his LLM work. The repository is at github.com/Sina-Amare/SakaiBot.
