# 🔒 Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.x.x   | ✅ Yes    |

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public issue
2. Email the maintainer directly or use GitHub's private vulnerability reporting
3. Include as much information as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## ⏱️ Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity

## 🛡️ Security Best Practices

When using this starter kit:

1. **Environment Variables**
   - Never commit `.env` files
   - Use Cloudflare secrets for sensitive data
   - Rotate credentials regularly

2. **Dependencies**
   - Keep dependencies updated
   - Run `bun update` regularly
   - Review security advisories

3. **API Security**
   - Validate all inputs using Elysia schemas
   - Implement rate limiting for production
   - Use HTTPS in production

## 📜 Disclosure Policy

- We will acknowledge receipt of your report
- We will work with you to understand and resolve the issue
- We will credit you in the fix announcement (unless you prefer anonymity)

Thank you for helping keep Workerlysia secure! 💜
