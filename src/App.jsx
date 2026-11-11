
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import KanbanBoard from './pages/KanbanBoard';
import Sprints from './pages/Sprints';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Forms from './pages/Forms';
import ListPage from './pages/List';
import Summary from './pages/SummaryPage';
import Timeline from './pages/Timeline';
import Notes from './pages/Notes';
import Files from './pages/Files';
import PublicProject from './pages/PublicProject';
import PublicFeaturePage from './pages/PublicFeaturePage';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* Public dashboard and read-only previews */}
          <Route
            path="/public-dashboard"
            element={<Dashboard publicView={true} />}
          />
          <Route
            path="/public-projects"
            element={<Projects publicView />}
          />
          <Route path="/public-analytics" element={<PublicFeaturePage title="Analytics" />} />
          <Route path="/public-calendar" element={<Calendar publicView />} />
          <Route path="/public-forms" element={<Forms publicView />} />
          <Route path="/public-list" element={<ListPage publicView />} />
          <Route path="/public-summary" element={<Summary publicView />} />
          <Route path="/public-ai-assistant" element={<AIAssistant publicView />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/board"
            element={
              <ProtectedRoute>
                <KanbanBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban/:projectId"
            element={
              <ProtectedRoute>
                <KanbanBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/sprints"
            element={
              <ProtectedRoute>
                <Sprints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms"
            element={
              <ProtectedRoute>
                <Forms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <ListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <ProtectedRoute>
                <Summary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/timeline"
            element={
              <ProtectedRoute>
                <Timeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline/:projectId"
            element={
              <ProtectedRoute>
                <Timeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/files"
            element={
              <ProtectedRoute>
                <Files />
              </ProtectedRoute>
            }
          />

          <Route path="/share/projects/:id" element={<PublicProject />} />

          {/* Redirect root to public dashboard */}
          <Route
            path="/"
            element={<Navigate to="/public-dashboard" replace />}
          />

          {/* Catch all */}
          <Route
            path="*"
            element={<Navigate to="/public-dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
