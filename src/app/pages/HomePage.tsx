import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import Logo from '../components/Logo';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Mentor Management Portal
              </h1>
              <p className="text-xs text-gray-600">Academic Excellence Platform</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/login')} className="border-gray-300">
              Login
            </Button>
            <Button onClick={() => navigate('/signup')} className="bg-indigo-600 hover:bg-indigo-700">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          <h2 className="text-5xl font-bold mb-6 text-gray-900">
            Academic Mentorship Platform
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            A professional system connecting students and mentors for enhanced academic guidance,
            progress tracking, and collaborative learning.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-gray-300"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Simple Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">For Students</h3>
            <p className="text-gray-600">
              Track your academic progress, manage courses, communicate with mentors,
              and showcase your project work in one unified platform.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">For Mentors</h3>
            <p className="text-gray-600">
              Monitor student performance, provide guidance, review projects,
              and identify students who need additional support efficiently.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-6 py-6 text-center text-gray-600">
          <p>&copy; 2026 Mentor Management Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
