# threx-ai

A lightweight autonomous agent for automated Twitter posting, built with TypeScript.

## Features

- Schedule and publish tweets automatically
- Support for media attachments (images, videos)
- Queue management for post scheduling
- Rate limit handling
- Memorized post and saved the post into databases so we can analyze or recall
- Analytics tracking for post performance

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Twitter Developer Account with API keys

## Installation

To install dependencies:

```bash
pnpm install
```

## Configuration

```env
BITQUERY_API_KEY=""
MORALIS_APIKEY=""

PERPLEXITY_APIKEY=""
OPENAI_API_KEY=""
DEEPSEEK_APIKEY=""

TWITTER_ACCESS_SECRET=""
TWITTER_ACCESS_TOKEN=""
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
TWITTER_APP_ID=""
TWITTER_BEARER_TOKEN=""
TWITTER_2FA_SECRET=""

UPSTASH_REDIS_TOKEN=""
UPSTASH_REDIS_URL=""
AXIOM_AUTH_TOKEN=""
```

## How to run

```bash
pnpm run:agent
```


## Acknowledgments

This project was created using pnpm. And using MIT License