"""
OAuth2 device-code flow for Microsoft Graph.
Run this once to get a refresh token, then the triage script uses it automatically.
"""
import json
import os
import sys
import msal
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

CLIENT_ID = os.environ["OUTLOOK_CLIENT_ID"]
TENANT_ID = os.environ["OUTLOOK_TENANT_ID"]
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPES = ["Mail.Read", "Mail.ReadWrite", "Mail.Send"]
TOKEN_CACHE_FILE = os.path.join(os.path.dirname(__file__), ".token_cache.json")


def _build_app():
    cache = msal.SerializableTokenCache()
    if os.path.exists(TOKEN_CACHE_FILE):
        cache.deserialize(open(TOKEN_CACHE_FILE).read())
    app = msal.PublicClientApplication(
        CLIENT_ID, authority=AUTHORITY, token_cache=cache
    )
    return app, cache


def _save_cache(cache):
    if cache.has_state_changed:
        with open(TOKEN_CACHE_FILE, "w") as f:
            f.write(cache.serialize())


def get_token_interactive():
    """Device-code flow: prints a URL + code for the user to sign in."""
    app, cache = _build_app()

    flow = app.initiate_device_flow(scopes=SCOPES)
    if "user_code" not in flow:
        print("Failed to start device flow:", json.dumps(flow, indent=2))
        sys.exit(1)

    print("\n" + flow["message"] + "\n")
    result = app.acquire_token_by_device_flow(flow)

    if "access_token" in result:
        _save_cache(cache)
        print("Authenticated successfully. Token cached to .token_cache.json")
        return result["access_token"]
    else:
        print("Authentication failed:", result.get("error_description", result))
        sys.exit(1)


def get_token_silent():
    """Try to get a token silently from cache (using refresh token)."""
    app, cache = _build_app()
    accounts = app.get_accounts()
    if not accounts:
        return None
    result = app.acquire_token_silent(SCOPES, account=accounts[0])
    if result and "access_token" in result:
        _save_cache(cache)
        return result["access_token"]
    return None


def get_token():
    """Get a valid access token — silent first, interactive if needed."""
    token = get_token_silent()
    if token:
        return token
    return get_token_interactive()


if __name__ == "__main__":
    get_token_interactive()
