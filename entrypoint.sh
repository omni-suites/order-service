#!/bin/sh
set -e

if [ -n "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" ]; then
  export INFISICAL_TOKEN
  INFISICAL_TOKEN=$(infisical login \
    --method=universal-auth \
    --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
    --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
    --domain="$INFISICAL_API_URL" \
    --plain --silent)

  exec infisical run \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --domain="$INFISICAL_API_URL" \
    -- sh -c "npx prisma migrate deploy && npm run start:prod"
fi

exec sh -c "npx prisma migrate deploy && npm run start:prod"
