import { useState } from 'react';

interface PasswordProtectionProps {
  correctPassword: string;
  onSuccess: () => void;
}

export default function PasswordProtection({ correctPassword, onSuccess }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      onSuccess();
    } else {
      setAttempts(prev => prev + 1);
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto border-2 border-black">
      <h2 className="text-2xl font-bold mb-6 text-center">Password Required</h2>
      
      <p className="text-gray-600 mb-6 text-center">
        This page is password protected to prevent spam. Please enter the password to continue.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter password"
            required
            autoFocus
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          Submit
        </button>
      </form>
      
      {attempts >= 3 && (
        <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-md text-sm">
          <p><strong>Hint:</strong> The password is the name of a Shakespeare play...</p>
        </div>
      )}
    </div>
  );
}