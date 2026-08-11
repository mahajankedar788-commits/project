import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './routes/ProtectedRoute';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminAllotment from './pages/admin/AdminAllotment';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminExams from './pages/admin/AdminExams';
import AdminReports from './pages/admin/AdminReports';

import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentExams from './pages/student/StudentExams';
import StudentResults from './pages/student/StudentResults';
import StudentProfile from './pages/student/StudentProfile';
import TakeExam from './pages/student/TakeExam';

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'ADMIN' ? '/admin' : '/student'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Either role can reach the forced password-reset step */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']} />}>
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      {/* Admin module */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="allotment" element={<AdminAllotment />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Full-screen exam-taking flow — deliberately outside StudentLayout so
          there's no sidebar/nav to distract from (or escape) an active exam. */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route path="/student/exams/:examId/take" element={<TakeExam />} />
      </Route>

      {/* Student module */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
