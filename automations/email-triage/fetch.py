"""
Fetch emails from Microsoft Graph API and output as JSON for triage.
"""
import argparse
import json
import sys
import requests
from auth import get_token

GRAPH_BASE = "https://graph.microsoft.com/v1.0/me"


def fetch_emails(folder="inbox", top=25, unread_only=True, include_body=True):
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    select_fields = "id,subject,from,receivedDateTime,isRead,importance,flag,categories,bodyPreview"
    if include_body:
        select_fields += ",body"

    params = {
        "$top": top,
        "$select": select_fields,
        "$orderby": "receivedDateTime desc",
    }
    if unread_only:
        params["$filter"] = "isRead eq false"

    url = f"{GRAPH_BASE}/mailFolders/{folder}/messages"
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json().get("value", [])


def mark_read(message_id):
    token = get_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = f"{GRAPH_BASE}/messages/{message_id}"
    resp = requests.patch(url, headers=headers, json={"isRead": True})
    resp.raise_for_status()


def flag_message(message_id, flag_status="flagged"):
    token = get_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = f"{GRAPH_BASE}/messages/{message_id}"
    resp = requests.patch(
        url, headers=headers, json={"flag": {"flagStatus": flag_status}}
    )
    resp.raise_for_status()


def categorize_message(message_id, categories):
    token = get_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = f"{GRAPH_BASE}/messages/{message_id}"
    resp = requests.patch(url, headers=headers, json={"categories": categories})
    resp.raise_for_status()


def create_draft_reply(message_id, reply_body):
    token = get_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = f"{GRAPH_BASE}/messages/{message_id}/createReply"
    resp = requests.post(url, headers=headers)
    resp.raise_for_status()
    draft = resp.json()

    # Update the draft body
    draft_id = draft["id"]
    url = f"{GRAPH_BASE}/messages/{draft_id}"
    resp = requests.patch(
        url,
        headers=headers,
        json={"body": {"contentType": "html", "content": reply_body}},
    )
    resp.raise_for_status()
    return draft_id


def move_message(message_id, destination_folder):
    token = get_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = f"{GRAPH_BASE}/messages/{message_id}/move"
    resp = requests.post(
        url, headers=headers, json={"destinationId": destination_folder}
    )
    resp.raise_for_status()


def list_folders():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{GRAPH_BASE}/mailFolders"
    params = {"$top": 50, "$select": "id,displayName,unreadItemCount,totalItemCount"}
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json().get("value", [])


def format_email_summary(email):
    """Format a single email into a readable summary."""
    sender = email.get("from", {}).get("emailAddress", {})
    return {
        "id": email["id"],
        "subject": email.get("subject", "(no subject)"),
        "from": f"{sender.get('name', '?')} <{sender.get('address', '?')}>",
        "received": email.get("receivedDateTime", ""),
        "importance": email.get("importance", "normal"),
        "flagged": email.get("flag", {}).get("flagStatus", "notFlagged"),
        "categories": email.get("categories", []),
        "preview": email.get("bodyPreview", "")[:200],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder", default="inbox")
    parser.add_argument("--top", type=int, default=25)
    parser.add_argument("--all", action="store_true", help="Include read emails")
    parser.add_argument("--folders", action="store_true", help="List mail folders")
    parser.add_argument("--full", action="store_true", help="Include full body")
    parser.add_argument("--summary", action="store_true", help="Compact output")
    args = parser.parse_args()

    if args.folders:
        folders = list_folders()
        for f in folders:
            print(f"{f['displayName']:30s}  unread={f['unreadItemCount']}  total={f['totalItemCount']}  id={f['id']}")
        sys.exit(0)

    emails = fetch_emails(
        folder=args.folder,
        top=args.top,
        unread_only=not args.all,
        include_body=args.full,
    )

    if args.summary:
        summaries = [format_email_summary(e) for e in emails]
        print(json.dumps(summaries, indent=2, default=str))
    else:
        print(json.dumps(emails, indent=2, default=str))
