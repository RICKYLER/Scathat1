# Scathat

Your AI-powered shield that stops smart contract scams before they happen.
Fast. Real-time. Onchain security for everyone.


 The Problem

Billions lost yearly to hacks, rugpulls, and malicious approvals


Users can’t read or understand smart contracts


Builders move fast and skip security


Wallets warn users too late


Current auditing tools are slow, expensive, and reactive


People only realize they were hacked after pressing confirm.
Scathat fixes this.

The Solution
Scathat
AI that analyzes smart contracts in real time and protects users before they sign.
What it does:
Scans contracts instantly


Detects risky patterns, rugpull logic, and hidden exploits


Shows a simple “Safe / Warning / Dangerous” risk score


Uses AgentKit to:


Block unsafe transactions


Limit approvals


Auto-withdraw or pause interactions


Guide new users safely through onchain actions


Security you don’t have to understand  just trust.

Target Market
1. Everyday Web3 Users
Need protection from scams, phishing, and malicious contracts


2. Developers
Need fast AI security checks during development and deployment


3. Wallets & dApps
Want a plug-and-play safety layer to protect their users


4. Base Ecosystem
Onboarding millions  but needs trust to scale


Revenue Model
Freemium + SaaS + API
Free (Users)
Basic scanning


Contract safety verdict


Real-time warnings


Pro (Developers)
Deep contract analysis


Version-control security checks


Automated deployment audits


API (Wallets / dApps)
Real-time risk scoring


Approval-limit engine


Security overlays


Enterprise
Automated audit suite


Continuous monitoring


High-volume API usage


Long-term vision:
Become the security layer for every Base app and smart wallet.


Scathat: Because mass adoption needs protection  not permission.

User submits contract address → via web app or extension


Backend fetches bytecode + source from Basescan


Python AI engine sends contract to Venice.ai → gets risk score


Backend writes risk score to Base via a minimal smart contract


Dashboard shows results (safe{Green}, warning{Orange}, critical{Red})


AgentKit : auto-pause or block risky interactions

Language for MVP 

On-Chain

Backend / AI
Python


JavaScript / TypeScript


     Frontend
TypeScript (React / Next.js)
