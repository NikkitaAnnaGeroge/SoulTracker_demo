import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../services/mockApi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { HeartPulse } from 'lucide-react';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signupUser(email, password);
      setIsModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate('/login');
  }

  return (
    <>
      <div className="min-h-screen bg-calm-blue-50 dark:bg-gray-900 flex flex-col">
        <main className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center items-center">
                <HeartPulse className="h-12 w-12 text-warm-purple-600" />
                <h2 className="ml-4 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">Create your account</h2>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 animate-fade-in">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input id="email" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                  <Button type="submit" isLoading={isLoading}>Sign up</Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-warm-purple-600 hover:text-warm-purple-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
        <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
          <p className="mb-1">
            <span className="font-semibold">About</span> &middot; Founded in Kerala, India
          </p>
          <p>&copy; {new Date().getFullYear()} SoulTracker. All Rights Reserved.</p>
        </footer>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Verification Email Sent">
          <p className="text-gray-600 dark:text-gray-300">Please check your inbox to verify your email address. Once verified, you can log in to your new account.</p>
          <div className="mt-6">
              <Button onClick={handleCloseModal}>
                  Got it!
              </Button>
          </div>
      </Modal>
    </>
  );
};

export default SignUpPage;