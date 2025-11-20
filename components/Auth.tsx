import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  AuthProvider 
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../services/firebase";
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle redirect result when the page reloads after a redirect sign-in
  useEffect(() => {
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            // User is signed in.
            console.log("Redirect sign-in successful", result.user);
          }
        })
        .catch((error) => {
          console.error("Redirect sign-in error", error);
          setError(parseFirebaseError(error));
        });
    }
  }, []);

  const parseFirebaseError = (err: any) => {
    let msg = err.message;
    if (err.code === 'auth/account-exists-with-different-credential') {
      msg = "An account already exists with the same email address but different sign-in credentials.";
    } else if (err.code === 'auth/popup-closed-by-user') {
      msg = "Sign-in cancelled.";
    } else if (err.code === 'auth/popup-blocked') {
      msg = "Popup blocked. We will try to redirect you instead.";
    } else if (err.code === 'auth/unauthorized-domain') {
      msg = `Domain not authorized. Add "${window.location.hostname}" to Firebase Console > Authentication > Settings > Authorized domains.`;
    } else if (err.code) {
       msg = err.code.replace('auth/', '').replace(/-/g, ' ');
       msg = msg.charAt(0).toUpperCase() + msg.slice(1);
    }
    return msg;
  };

  const handleSocialSignIn = async (provider: AuthProvider | undefined, providerName: string) => {
    if (!auth || !provider) {
        setError(`Firebase configuration for ${providerName} is missing.`);
        return;
    }
    try {
      setLoading(true);
      setError('');
      // Try popup first
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Popup error:", err);
      
      // If popup is blocked, closed (often happens in IDE previews automatically), or not supported, try redirect
      if (err.code === 'auth/popup-blocked' || 
          err.code === 'auth/operation-not-supported-in-this-environment' ||
          err.code === 'auth/popup-closed-by-user') {
          
          setError("Popup sign-in failed or was closed. Redirecting to sign in page...");
          try {
             await signInWithRedirect(auth, provider);
             return; // The page will redirect, so we don't need to unset loading immediately
          } catch (redirectErr: any) {
             setError(parseFirebaseError(redirectErr));
          }
      } else {
          setError(parseFirebaseError(err));
      }
    } finally {
      // Only unset loading if we didn't trigger a redirect (or if redirect failed immediately)
      // If we are redirecting, the page will unload, but unsetting loading here is fine too as it might take a moment
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        setError("Firebase configuration missing. Please update services/firebase.ts");
        return;
    }
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
        setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">W</div>
        <span className="text-3xl font-bold text-gray-900">WarrantyGuard</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-500 mb-6">{isLogin ? 'Sign in to access your warranties.' : 'Start tracking your appliances today.'}</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
                onClick={() => handleSocialSignIn(googleProvider, "Google")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors relative"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Continue with Google</span>
            </button>

            <button
                onClick={() => handleSocialSignIn(facebookProvider, "Facebook")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#1877F2] border border-transparent text-white font-medium py-3 px-4 rounded-xl hover:bg-[#166fe5] transition-colors"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Continue with Facebook</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;