### Free-tier Limitations across all Third-party APIs in use
The 7 social media platforms supported by this mvp are Facebook Pages, Instagram, Threads, X, TikTok, LinkedIn and WhatsApp.

The purpose of this readme is to highlight the hindrances posed by utilising the free tiers of the third-party apis which impose several dev restrictions which are to be coded into the build to prevent failed calls and aid the provider-agnostic infrastructure build.

## Social-ai API Free/Hobby
- Max of 2 social profiles or brands connected. A social profile in social-api ai API groups all the social accounts of the bsuiness. If a business connects thier accounts across all social media platforms, it still count as one.
- max of 10 posts/month per brand/social profile.
- max of 50 interactions/month per brand/social profile. An interaction is any action that writes to a platform: replying to a comment or review, sending a DM, or reacting to a message. Reading is never an interaction. Fetching comments, DMs, mentions, and reviews is free and unlimited on every plan, including free/Hobby.
- max of 100MB storage for uploaded images and videos awaiting publication.
- webhook eevnt retention is capped at 1 day. Delivered events stay listable and retryable for only 1 day.
- Calling any GET endpoint in unlimited without third-party restrictions except those placed by the very social media platform the client is connecting to through the third-party api.
- Post metrics across all platforms is unlimited.
- What happens when the free/Hobby plan limit is reached? The API returns HTTP 429 until the next billing period, with the code billing.post_limit for posts and validation.interaction_limit_exhausted for interactions. Only posts and interactions are capped on Hobby, at 10 and 50 per month, so reads keep working. Post and interaction endpoints return X-Posts-Remaining and X-Interactions-Remaining headers so you can track usage before hitting the limit.

## Postproxy API Free
- Max of 2 social profiles or brands connected. A social profile in social-api ai API groups all the social accounts of the bsuiness. If a business connects thier accounts across all social media platforms, it still count as one.
- max of 10 posts/month per brand/social profile.
- no webhooks on free tier.
- no free reading requests.
- no post metrics or analytics.
- What happens when the limits on the free plan is reached? [check here](social_studio/docs/postproxy-docs.md)

## Zernio API Free
- max of 2 connected social accounts. A connected accopunt is a single connection to one social media platform, thus if a single brand has 5 social accopunts, they can only 2 of the 5 and no other new brand can be onboarded.
- Every feature included, nothing gated behind a plan
- [check the docs for more]()

## PlanVortex API Free
- max of 2 connected accounts. A connected accopunt is a single connection to one social media platform, thus if a single brand has 5 social accopunts, they can only 2 of the 5 and no other new brand can be onboarded.
- Unlimited publications.
- Unlimited users all sharing 1 GB of storage



## Erronous Assumptions:
- We will also be using planvortex API service, increasing the total no of third-party apis to 4.
- SocialAPI and Postproxy are our major API utilities to be used. Priroroty level is: The first clinets will be assigned in this order, first 2 to social-api then next x to postproxy, then zernio and planvortex are used as backup, for any new clinets that wants to try the app but can only connect a max of 4 accounts (2 of the accounts via zernio and the other 2 via planvortex). Show this in the build plan.
- Fix: There are four tiers. Free, Basic, Pro and Enterprise. The #20,000 paymnet actually allows our clients to move from Free to Basic after the 7-day free trial.
-
