#!/usr/bin/env python3
"""
sync-firebase-auth.py
Sync Firestore users → Firebase Auth accounts.

For each user in Firestore that has a `salt` field, decrypts the password
and creates or updates the corresponding Firebase Auth account.

Usage:
  python3 scripts/sync-firebase-auth.py
  python3 scripts/sync-firebase-auth.py --dry-run   # preview without writing
"""

import argparse
import base64
import hashlib
import sys
from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials, firestore
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# ── Config ────────────────────────────────────────────────────────────────────

SA_FILE = Path(__file__).parent.parent / 'notifier' / 'service-account.json'
PASSPHRASE = 'v3lDCa1esgIToEPOxOc='
KEY = hashlib.sha256(PASSPHRASE.encode()).digest()

# ── Crypto ────────────────────────────────────────────────────────────────────

def decrypt_salt(encrypted_b64: str) -> str:
    data = base64.b64decode(encrypted_b64)
    nonce, ciphertext = data[:12], data[12:]
    return AESGCM(KEY).decrypt(nonce, ciphertext, None).decode()

# ── Firebase Auth helpers ─────────────────────────────────────────────────────

def to_auth_email(username: str) -> str:
    return f'{username.lower().strip()}@cashflow.app'

def sync_user(auth_client, username: str, password: str, dry_run: bool) -> str:
    email = to_auth_email(username)
    try:
        user = auth_client.get_user_by_email(email)
        if not dry_run:
            auth_client.update_user(user.uid, password=password)
        return 'updated'
    except auth.UserNotFoundError:
        if not dry_run:
            auth_client.create_user(email=email, password=password, email_verified=True)
        return 'created'

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Preview without writing to Firebase Auth')
    args = parser.parse_args()

    cred = credentials.Certificate(str(SA_FILE))
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    auth_client = auth.Client(firebase_admin.get_app())

    users = db.collection('users').stream()

    total = created = updated = skipped = errors = 0

    for doc in users:
        total += 1
        data = doc.to_dict()
        username = doc.id

        if not data.get('salt'):
            print(f'  SKIP  {username:20s} — no salt field')
            skipped += 1
            continue

        try:
            password = decrypt_salt(data['salt'])
            action = sync_user(auth_client, username, password, args.dry_run)
            tag = '[DRY]' if args.dry_run else '     '
            print(f'{tag} {action.upper():8s} {username}')
            if action == 'created':
                created += 1
            else:
                updated += 1
        except Exception as e:
            print(f'  ERROR {username:20s} — {e}', file=sys.stderr)
            errors += 1

    prefix = '[DRY RUN] ' if args.dry_run else ''
    print(f'\n{prefix}Done — total={total} created={created} updated={updated} skipped={skipped} errors={errors}')

if __name__ == '__main__':
    main()
