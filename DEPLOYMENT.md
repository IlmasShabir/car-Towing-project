# Deployment — Copy & Paste Steps

Do these in order. Each block is copy-paste. Where you must type your own value,
it looks like `YOUR_SERVER_IP`.

**You keep logging in with your Contabo password.** Nothing here changes that.
The one SSH key created in Step 8 is used only by GitHub, not by you.

---

## Before you start, have these ready

- Your server IP (from the Contabo email)
- Your root password (from the Contabo email)
- Your domain name
- Your Gmail address + a Gmail **App Password** (optional — for booking emails)

---

## Step 1 — Log in

On your laptop:

```bash
ssh root@YOUR_SERVER_IP
```

Type your Contabo password when asked. Everything from here runs **on the server**
until Step 9.

---

## Step 2 — Update the system

```bash
apt update && apt upgrade -y
```

If a purple screen appears, press Enter to accept the default.

---

## Step 3 — Firewall

```bash
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
```

---

## Step 4 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
```

Check it worked:

```bash
docker compose version
```

You should see a version number.

---

## Step 5 — Point your domain at the server

In your domain registrar's DNS panel, add two records:

| Type | Name  | Value            |
|------|-------|------------------|
| A    | `@`   | `YOUR_SERVER_IP` |
| A    | `www` | `YOUR_SERVER_IP` |

Then wait a few minutes and check (run this **on the server**):

```bash
dig +short dubaicartowingservice.com
```

**It must print your server IP.** If it prints nothing, wait longer and run it again.
Do not continue until it prints the IP — Step 10 will fail otherwise.

---

## Step 6 — Get the code

```bash
cd /root
git clone https://github.com/IlmasShabir/car-Towing-project.git app
cd app
```

---

## Step 7 — Create the settings file

Generate three passwords:

```bash
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "MONGO_ROOT_PASSWORD=$(openssl rand -hex 24)"
echo "ADMIN_PASSWORD=$(openssl rand -hex 12)"
```

Copy that output somewhere safe — the `ADMIN_PASSWORD` is how you log into your
admin dashboard.

Now create the file:

```bash
nano .env
```

Paste this in, replacing the `PASTE_...` values:

```
MONGO_ROOT_USER=towing
MONGO_ROOT_PASSWORD=PASTE_MONGO_PASSWORD_HERE

PORT=5000
JWT_SECRET=PASTE_JWT_SECRET_HERE
CLIENT_URL=https://dubaicartowingservice.com

ADMIN_USERNAME=admin
ADMIN_PASSWORD=PASTE_ADMIN_PASSWORD_HERE

EMAIL_USER=youremail@gmail.com
EMAIL_PASS="abcd efgh ijkl mnop"
NOTIFY_EMAIL=youremail@gmail.com
```

Save and exit: **Ctrl+O**, **Enter**, **Ctrl+X**.

> Keep the quotes around `EMAIL_PASS`. Google gives you the App Password with
> spaces in it, and without quotes the backup script errors out.

> Leave `EMAIL_USER` and `EMAIL_PASS` blank if you don't want booking emails yet.
> The site works fine without them.

---

## Step 8 — Create the key for GitHub

This is only for GitHub. Your password login is unaffected.

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -q
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo "=== COPY EVERYTHING BELOW THIS LINE ==="
cat ~/.ssh/github_deploy
```

Copy the whole output including the `-----BEGIN` and `-----END` lines.

---

## Step 9 — Add the GitHub secrets

In your browser: your repo → **Settings** → **Secrets and variables** → **Actions**
→ **New repository secret**. Add three:

| Name       | Value                              |
|------------|------------------------------------|
| `SSH_HOST` | your server IP                     |
| `SSH_USER` | `root`                             |
| `SSH_KEY`  | the key you copied in Step 8       |

---

## Step 10 — Set your domain and start the site

Back on the server:

```bash
cd /root/app
sed -i 's/yourdomain\.com/dubaicartowingservice.com/g' nginx/default.conf
```

Start everything:

```bash
docker compose up -d --build
```

First build takes a few minutes. Then check:

```bash
curl localhost/health
```

You should see `{"ok":true}`.

Open `http://dubaicartowingservice.com` in your browser — the site should load (no padlock yet).

---

## Step 11 — Turn on HTTPS

Replace both domains and your email, then run:

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d dubaicartowingservice.com -d www.dubaicartowingservice.com \
  --email kami302716@gmail.com --agree-tos --no-eff-email
```

Wait for `Successfully received certificate`.

Now switch nginx over to HTTPS:

```bash
nano nginx/default.conf
```

Two edits in this file:

1. Find the block with `# location / {` and `# return 301 https://...` near the top.
   Delete the `# ` at the start of those 3 lines.
2. Everything below `# --- STEP 2: uncomment this whole block` at the bottom:
   delete the `# ` from the start of every line.

Save (**Ctrl+O**, **Enter**, **Ctrl+X**), then:

```bash
docker compose restart nginx
```

Visit `https://dubaicartowingservice.com` — you should now see a padlock.

Certificates renew automatically. Nothing more to do.

---

## Step 12 — Test the pipeline

On your laptop, push any small change to `main`:

```bash
git commit --allow-empty -m "test deploy" && git push origin main
```

Go to your repo → **Actions** tab. The run should go green in about a minute, and
your change is live.

**From now on: push to `main` and the site updates itself.**

---

# Everyday commands

Run these on the server after `cd /root/app`:

```bash
docker compose ps                 # is everything running?
docker compose logs -f server     # see API errors (Ctrl+C to exit)
docker compose restart server     # restart the API
docker compose up -d --build      # manual redeploy
```

---

# Backups

Set up a nightly database backup:

```bash
mkdir -p /root/backups
cat > /root/backup.sh <<'EOF'
#!/bin/bash
cd /root/app
set -a; . ./.env; set +a
docker compose exec -T mongo mongodump \
  --username="$MONGO_ROOT_USER" --password="$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase=admin --archive --gzip \
  > "/root/backups/towing-$(date +%Y%m%d).gz"
find /root/backups -name '*.gz' -mtime +14 -delete
EOF
chmod +x /root/backup.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /root/backup.sh") | crontab -
```

Test it right now:

```bash
/root/backup.sh && ls -lh /root/backups/
```

The file should be more than a few hundred bytes. If it's 0 bytes, the database
credentials are wrong.

Copy backups to your laptop occasionally:

```bash
scp root@YOUR_SERVER_IP:/root/backups/*.gz ~/Desktop/
```

---

# If something breaks

**502 Bad Gateway**

```bash
docker compose logs server
```

Usually a wrong value in `.env`. Fix it, then `docker compose up -d`.

---

**Certbot failed**

Your DNS isn't ready. Check:

```bash
dig +short dubaicartowingservice.com
```

If it doesn't print your server IP, wait and retry. Let's Encrypt blocks you after
5 failed tries per hour, so don't loop it.

---

**nginx won't start after Step 11**

```bash
docker compose logs nginx
```

You probably missed a `# ` when uncommenting, or the domain in the file doesn't match
the certificate. Confirm the certificate name:

```bash
docker compose run --rm certbot certificates
```

---

**Site loads but nothing works / no services show**

The frontend needs rebuilding:

```bash
docker compose up -d --build client
```

---

**Pushed to GitHub but the site didn't change**

Check the **Actions** tab for a red run. Then on the server:

```bash
cd /root/app && git log -1 && docker compose up -d --build
```

---

**Forgot your admin password**

```bash
cd /root/app && grep ADMIN .env
```

---

# Before going live

- [ ] Replace `dubaicartowingservice.com` in `client/index.html` (5 places) — link previews on
      WhatsApp/Facebook stay broken until you do
- [ ] Log into the admin dashboard and change the default admin username
- [ ] Run `/root/backup.sh` once to confirm backups work
- [ ] Compress `client/src/assets/images/logo.png` and `tow-truck-dubai.jpg` —
      they're ~2MB each and slow down mobile visitors
