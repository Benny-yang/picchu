# VibeCoding Project Goals & Guidelines

## 1. Project Vision
**VibeCoding** is a premium social platform designed to connect **Photographers** and **Models**. The platform focuses on high-quality visual presentation, seamless activity organization, and building a trusted community.

## 2. Core Value Proposition
- **For Models**: A safe, professional space to showcase portfolios ("Works"), find legitimate photography events, and build a reputation.
- **For Photographers**: A tool to organize shoots ("Activities"), find suitable models, and display their best work.

## 3. Design Principles (Critical)
Future development **MUST** adhere to these design pillars:
1.  **Premium Aesthetics**: The UI must feel high-end, using sophisticated color palettes, glassmorphism, and smooth animations. Avoid generic/bootstrap looks.
2.  **Visual First**: Images (Works/Avatars) are the core content. Layouts should prioritize visual impact.
3.  **Dynamic Interaction**: Interfaces should feel "alive" with hover effects, micro-interactions, and smooth transitions.
4.  **Mobile & Desktop Responsive**: Perfect rendering on all devices.

## 4. Key Features Roadmap
### Phase 1: Foundation (Current)
- [x] **Authentication**: Login, Register, SMS Verification, Forgot Password.
- [x] **User Profile**: Basic Info, Identity (Model/Photographer), Works Wall, Activity History.
- [x] **Activity System**: Create Activity (Host), Join Activity, Activity Details, Edit/Cancel.
- [ ] **Social Graph**: Follow/Unfollow, Public Profiles.

### Phase 2: Trust & Safety (Next)
- [ ] **Report/Block System**: Essential for user safety.
- [ ] **Review System**: Detailed ratings and comments for completed activities.
- [ ] **Identity Verification**: Real-name or portfolio verification.

### Phase 3: Engagement
- [ ] **Direct Messaging**: Chat between matched users.
- [ ] **Notifications**: Real-time alerts for applications, comments, and reminders.
- [ ] **Search & Explore**: Advanced filtering by location, style, and dates.

## 5. Technical Standards
- **Frontend**: React, TypeScript, Vite, TailwindCSS (Vanilla CSS for custom complex styles).
- **Backend**: Go (Gin framework).
- **Code Quality**:
    - Strict TypeScript typing.
    - Reusable components (e.g., `UserInfo`, `WorkCard`).
    - Clean separation of concerns.

---
*This document serves as the "North Star" for all future development. Any new feature request should be evaluated against these goals.*
