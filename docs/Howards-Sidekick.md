# Howard's Sidekick: The Loyal Electrician's Companion - Technical Specification

> "A good boy never lets you down."

---

## 1. System Overview

Howard's Sidekick is a **personal utility Micro-App** designed as a tribute to loyalty, companionship, and quiet support. Inspired by an electrician's faithful dog, Howard, this app serves as a practical, non-intrusive companion for tradespeople and anyone who needs a reliable digital partner for their daily grind.

It is not a complex project manager; it is a simple, heartfelt tool built to provide reminders, store notes, and offer quick access to essential information, embodying the spirit of a loyal friend who always has your back.

---

## 2. Core Components & Implementation

### 2.1. The `HowardsSidekick` Micro-App (`micro-apps/howards-sidekick.tsx`)
The UI is a warm, minimalist, tab-based interface designed for at-a-glance utility.
- **Reminder Beacon**: A static, hardcoded list of daily reminders for an electrician, including safety checks, breaks, and cleanup. Each reminder is presented with a touch of heartfelt flavor text.
- **Legacy Logger**: A client-side journal for private notes. It uses React state (`useState`) to manage a list of timestamped notes, allowing for quick, ephemeral logging without database persistence for maximum privacy.
- **Tools of the Trade**: A simple, static `Accordion` component containing helpful cheat sheets and reference materials for electricians.
- **Quiet Motivation**: A small, rotating display of motivational quotes inspired by loyalty and resilience.

### 2.2. Theming & Styling (`globals.css`)
- **Warm & Earthy Palette**: The app introduces a unique color scheme (`sidekick-brown`, `sidekick-gold`) to create a distinct, comforting visual identity that sets it apart from the OS's default cool tones.

---

## 3. Integration with ΛΞVON OS

- **Invocation**: Howard's Sidekick is a standard Micro-App that can be launched from the Canvas. It is listed as an "included" app in the Armory.
- **Architectural Role**: This app serves as a prime example of a high-affinity, personality-driven utility that solves real-world problems (the need for simple, reliable reminders and notes) while strengthening the user's emotional connection to the OS. It is a testament to the principle that software can be both functional and full of heart.
