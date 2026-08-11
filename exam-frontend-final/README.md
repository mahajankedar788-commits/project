# Online Examination System — Frontend

React + Vite + Tailwind frontend with JWT authentication and role-based route
guards for the Admin and Student modules.

## What's included

- **Login flow** (`src/pages/Login.jsx`) — posts to `POST /api/auth/login`,
  expects `{ token, role, username, mustChangePassword }` back, and routes the
  user to `/admin` or `/student` based on `role`.
- **AuthContext** (`src/context/AuthContext.jsx`) — stores the JWT + user in
  `localStorage`, decodes/validates expiry client-side, exposes
  `login()` / `logout()` / `isAuthenticated` / `role`.
- **ProtectedRoute** (`src/routes/ProtectedRoute.jsx`) — a route guard that:
  1. Redirects to `/login` if not authenticated (remembering the intended URL).
  2. Redirects to `/unauthorized` if the logged-in role isn't allowed on that route.
  3. Forces a `/change-password` step if the account has `mustChangePassword: true`
     (used for the auto-generated first-login passwords from the Admin module).
- **Admin module shell** at `/admin/*` and **Student module shell** at
  `/student/*`, each with their own sidebar nav and placeholder pages for the
  features described in the project spec (students, subjects, allotment,
  question bank, exams, reports / results, profile).
- **Student exam flow** — `src/pages/student/StudentExams.jsx` lists a
  student's exams (available now / upcoming / completed) and
  `src/pages/student/TakeExam.jsx` is a distraction-free, timed exam-taking
  screen (question navigator, autosaved answers, auto-submit on timeout).
  Mounted at `/student/exams` and `/student/exams/:examId/take`; the latter
  sits outside `StudentLayout` on purpose, with no sidebar to navigate away
  from mid-exam.
- Axios instance (`src/api/axios.js`) that attaches the JWT to every request
  and force-logs-out on a `401`.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your Spring Boot backend
npm run dev
```

## Expected backend contract

- `POST /api/auth/login`
  Request: `{ username, password }`
  Response: `{ token, role: "ADMIN" | "STUDENT", username, mustChangePassword }`

- `POST /api/auth/change-password` (authenticated)
  Request: `{ currentPassword, newPassword }`

- `GET /api/student/exams`
  Response: `{ data: [{ id, examName, subjectName, durationMinutes,
  questionCount, totalMarks, status: "UPCOMING"|"ACTIVE"|"COMPLETED"|"EXPIRED",
  windowStart, windowEnd, score, submittedAt }] }`
  One row per exam this student is allotted to.

- `POST /api/student/exams/{examId}/start`
  Starts (or resumes) this student's attempt. Should be safe to call again on
  page refresh — return the same in-progress attempt rather than erroring.
  Response: `{ data: { attemptId, examName, subjectName, durationMinutes,
  endsAt, questions: [{ id, questionText, optionA, optionB, optionC, optionD,
  marks }] } }` — note `correctOption` must **not** be included here.

- `PUT /api/student/attempts/{attemptId}/answer`
  Best-effort autosave, fired on every option select.
  Request: `{ questionId, selectedOption }`

- `POST /api/student/attempts/{attemptId}/submit`
  Request: `{ answers: [{ questionId, selectedOption }] }`
  Response: `{ data: { score, maxScore, correctCount, totalQuestions,
  submittedAt } }`
  Also called automatically by the client when the timer reaches 0 — the
  backend should independently enforce `endsAt` and reject/ignore answers
  submitted after it, rather than trusting the client's timer.

- `GET /api/admin/exams`
  Response: `{ data: [{ id, examName, subjectId, subjectName, totalQuestions,
  durationMinutes, startTime, endTime }] }`

- `POST /api/admin/exams`
  Request: `{ examName, subjectId, totalQuestions, durationMinutes, startTime,
  endTime }` (`startTime`/`endTime` as ISO 8601)
  Response: `{ data: { id, examName, subjectId, subjectName, totalQuestions,
  durationMinutes, startTime, endTime } }`
  The backend should validate `totalQuestions` against how many questions
  actually exist in that subject's bank before scheduling.

- `DELETE /api/admin/exams/{examId}`
  Removes a scheduled exam. Should be rejected (409/400) once students have
  started attempts against it, rather than silently orphaning attempt data.

Everything else the Admin/Student pages will need (students, subjects,
allotment, questions, reports) is stubbed as a placeholder page ready to be
wired up to the corresponding backend endpoints.

## Notes on the route guard design

- Guards are applied at the route-group level in `App.jsx` via
  `<Route element={<ProtectedRoute allowedRoles={[...]} />}>` wrapping a set
  of child `<Route>`s — so adding a new admin page only means adding one
  `<Route>` line inside the existing guarded group, no new guard logic.
- Role checks happen client-side for UX (hiding pages you can't use); the
  backend must still enforce authorization on every endpoint independently.
