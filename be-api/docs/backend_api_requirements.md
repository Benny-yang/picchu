# Backend API & Logic Requirements
Based on the current Frontend implementation (`fe-web`), the following APIs and Logic are required for the Backend (`be-api`).

## 1. Authentication & User (Auth)
**Logic:**
- Handle registration with Email/Password.
- Handle Login (JWT expected).
- ~~SMS Verification flow~~ (**已移除** — 前端已移除此流程)
- Profile completion (Avatar, Roles, Bio).
- ~~Forgot Password flow~~ (**暫緩** — 等待通知信廠商串接後再實作)

**API Endpoints:**
- `POST /auth/register`: Register new user (email, password).
- `POST /auth/login`: Login (returns JWT + User Basic Info).
- ~~`POST /auth/verify-sms`~~: (**已移除**)
- ~~`POST /auth/send-sms`~~: (**已移除**)
- ~~`POST /auth/forgot-password`~~: (**暫緩** — 等待廠商串接)
- ~~`POST /auth/reset-password`~~: (**暫緩** — 等待廠商串接)
- `GET /users/me`: Get current user profile.
- `PUT /users/me`: Update profile (Avatar, Bio, Roles, Gender, Phone).

## 2. Public User Profile (User)
**Logic:**
- View other users' profiles.
- Follow/Unfollow logic.
- Statistics (Fans, Following, Rating).

**API Endpoints:**
- `GET /users/:id`: Get public profile by ID (or username).
- `POST /users/:id/follow`: Follow a user.
- `DELETE /users/:id/follow`: Unfollow a user.
- `GET /users/:id/works`: Get user's portfolio/works.
- `GET /users/:id/activities`: Get user's involved activities (Hosted & Joined).

## 3. Activities (Activity)
**Logic:**
- CRUD for Activities.
- Application Flow: Apply -> Pending -> Host Review -> Accept/Reject.
- Status Management: Open -> Full/Ended.
- Permissions: Only Host can manage applicants.

**API Endpoints:**
- `GET /activities`: List activities (Filter by: Location, Date, Tags).
- `GET /activities/:id`: Get activity details (Includes: Host info, Participants count, Status).
- `POST /activities`: Create a new activity.
- `PUT /activities/:id`: Update activity details.
- `DELETE /activities/:id`: Cancel/Delete activity.

### Activity Participation (Applicant Flow)
- `POST /activities/:id/apply`: Apply to join an activity.
- `DELETE /activities/:id/apply`: Cancel application.
- `GET /activities/:id/status`: Check current user's status (Idle / Applied / Joined / Host).

### Peer Rating (Post-Activity)
**Logic:**
- Only available when Status is "Ended".
- Participants (and Host) can rate each other.
- One rating per pair per activity.

**API Endpoints:**
- `GET /activities/:id/participants`: List all confirmed participants (for rating selection).
- `POST /activities/:id/rate`: Submit a rating for a user.
  - *Body*: `{ targetUserId: string, rating: number, comment: string }`
- `GET /activities/:id/ratings`: Get my ratings given/received for this activity.

### Host Management (New Feature)
- `GET /activities/:id/applicants`: List all applicants (for Host only).
  - *Response*: List of { userId, username, avatar, role, rating, message, status }.
- `PUT /activities/:id/applicants/:userId/status`: Update applicant status.
  - *Body*: `{ status: 'accepted' | 'rejected' }`.

## 4. Works / Portfolio (Work)
**Logic:**
- Upload functionality (Images).
- Display grid of works.
- **Hot Works**: Displayed in random order (no specific ranking rule).
- **Interactions**: Users can Like and Comment on works.

**API Endpoints:**
- `GET /works`: Global list of works (Works Wall). For "Hot" tab, return random results.
- `POST /works`: Upload a new work (Image + Description).
- `GET /works/:id`: Get work details.
- `POST /works/:id/like`: Like a work.
- `DELETE /works/:id/like`: Unlike a work.
- `GET /works/:id/comments`: Get comments for a work.
- `POST /works/:id/comments`: Post a comment on a work.
- `PUT /works/:id`: Update work description.
- `DELETE /works/:id`: Delete a work.
- `DELETE /comments/:id`: Delete a comment.

## 5. Comments / Messaging (Optional/Mocked)
**Logic:**
- Comments on Activities.

**API Endpoints:**
- `GET /activities/:id/comments`: Get comments.
- `POST /activities/:id/comments`: Post a comment.



## 6. Notifications
**Logic:**
- Simple polling (e.g., client requests every 60 seconds).
- No WebSocket used to keep infrastructure simple.
- Reserve AWS SNS for future Mobile Push Notifications.
- Types: New Applicant, Application Status Change, New Comment, Activity Cancelled.

**API Endpoints:**
- `GET /notifications`: List notifications (unread/read).
- `POST /notifications/:id/read`: Mark notification as read.
- `GET /notifications/unread-count`: Lightweight check for unread count (for polling).

## Data Models (Implied)

### User
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "avatar": "string (url)",
  "roles": ["model", "photographer"],
  "bio": "string",
  "stats": {
    "fans": 100,
    "following": 50,
    "rating": 4.8
  }
}
```

### Activity
```json
{
  "id": "string",
  "hostId": "string",
  "title": "string",
  "description": "string",
  "location": "string",
  "date": "timestamp",
  "images": ["string"],
  "tags": ["string"],
  "requirements": ["string"],
  "status": "open/ended/cancelled",
  "participantCount": 5,
  "maxParticipants": 10
}
```

### Applicant
```json
{
  "activityId": "string",
  "userId": "string",
  "status": "pending/accepted/rejected",
  "message": "string",
  "appliedAt": "timestamp"
}
```

## 7. Database Schema (Proposed)

### 1. Users (Auth & Core)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `email` | String | Unique, Indexed |
| `password_hash` | String | |
| `username` | String | Unique, Indexed |
| `phone` | String | Verified phone number |
| `created_at` | Timestamp | |

### 2. UserProfiles
| Column | Type | Notes |
| :--- | :--- | :--- |
| `user_id` | UUID/String | PK & FK -> Users.id (1:1 Relationship) |
| `display_name` | String | |
| `avatar_url` | String | |
| `bio` | Text | |
| `roles` | JSON/Array | e.g. ["model", "photographer"] |
| `gender` | String | |
| `updated_at` | Timestamp | |

### 3. PasswordResetTokens
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `user_id` | UUID/String | FK -> Users.id |
| `token` | String | Unique, Indexed |
| `expires_at` | Timestamp | Token expiry time |
| `created_at` | Timestamp | |

### 4. Activities
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `host_id` | UUID/String | FK -> Users.id |
| `title` | String | |
| `description` | Text | |
| `location` | String | |
| `event_time` | Timestamp | |
| `max_participants` | Integer | |
| `status` | String | Open, Full, Ended, Cancelled |
| `images` | JSON/Array | List of image URLs |
| `tags` | JSON/Array | e.g. ["cosplay", "outdoor"] |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

### 5. ActivityParticipants
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `activity_id` | UUID/String | FK -> Activities.id |
| `user_id` | UUID/String | FK -> Users.id |
| `status` | String | Pending, Accepted, Rejected |
| `message` | Text | Application message |
| `applied_at` | Timestamp | |
| `updated_at` | Timestamp | |

### 6. Works
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `user_id` | UUID/String | FK -> Users.id |
| `image_url` | String | |
| `description` | Text | |
| `like_count` | Integer | Denormalized count (default 0) |
| `comment_count` | Integer | Denormalized count (default 0) |
| `created_at` | Timestamp | |

### 7. Follows
| Column | Type | Notes |
| :--- | :--- | :--- |
| `follower_id` | UUID/String | FK -> Users.id |
| `following_id` | UUID/String | FK -> Users.id |
| `created_at` | Timestamp | Composite PK or Unique Constraint on (follower, following) |

### 8. Comments
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `activity_id` | UUID/String | FK -> Activities.id (Nullable if work_id is present) |
| `work_id` | UUID/String | FK -> Works.id (Nullable if activity_id is present) |
| `user_id` | UUID/String | FK -> Users.id |
| `content` | Text | |
| `created_at` | Timestamp | |

### 9. Likes
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `user_id` | UUID/String | FK -> Users.id |
| `work_id` | UUID/String | FK -> Works.id |
| `created_at` | Timestamp | Unique (user_id, work_id) |

### 10. Notifications
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `user_id` | UUID/String | FK -> Users.id (Recipient) |
| `actor_id` | UUID/String | FK -> Users.id (Who triggered notification) |
| `type` | String | Applicant, StatusChange, Comment, Like, etc. |
| `reference_id` | String | ID of related entity (ActivityId, WorkId, etc.) |
| `is_read` | Boolean | Default false |
| `created_at` | Timestamp | |

### 11. Ratings
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID/String | Primary Key |
| `activity_id` | UUID/String | FK -> Activities.id |
| `rater_id` | UUID/String | FK -> Users.id |
| `target_id` | UUID/String | FK -> Users.id |
| `score` | Integer | 1-5 |
| `comment` | Text | |
| `created_at` | Timestamp | Unique Constraint on (activity, rater, target) |
