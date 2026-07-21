// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';

// function Login() {
//   const navigate = useNavigate();

//   const [isSignUp, setIsSignUp] = useState(false);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       if (isSignUp) {
//         // ---- SIGN UP ----
//         const res = await fetch('http://127.0.0.1:8000/api/register', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ name, email, password }),
//         });
//         const data = await res.json();

//         if (!res.ok) {
//           setError(data.detail || 'Something went wrong. Please try again.');
//           setLoading(false);
//           return;
//         }

//         // Auto-switch to login after successful signup
//         setIsSignUp(false);
//         setError('Account created! Please log in below.');
//         setPassword('');
//       } else {
//         // ---- LOGIN ----
//         const res = await fetch('http://127.0.0.1:8000/api/login', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password }),
//         });
//         const data = await res.json();

//         if (!res.ok) {
//           setError(data.detail || 'Invalid email or password.');
//           setLoading(false);
//           return;
//         }

//         // Store token so the app remembers the user is logged in
//         localStorage.setItem('token', data.access_token);
//         localStorage.setItem('userName', data.name);

//         navigate('/dashboard');
//       }
//     } catch (err) {
//       setError('Could not reach the server. Is the backend running?');
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="login-wrapper">
//       <div className="decoration heart-top">❤️</div>
//       <div className="decoration cloud-1">☁️</div>
//       <div className="decoration cloud-2">☁️</div>
//       <div className="decoration plant-left">🪴</div>
//       <div className="decoration flower-right">🌸</div>

//       <div className="phone-mockup">
//         <div className="character-placeholder">🧑‍💻</div>
//         <div className="header-text">
//           <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
//           <p>{isSignUp ? 'Start your FrameGenius journey' : 'Login to continue your journey'}</p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           {isSignUp && (
//             <div className="input-group">
//               <label>Full Name</label>
//               <div className="input-wrapper">
//                 <input
//                   type="text"
//                   placeholder="Enter your name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                 />
//                 <span className="icon">🧑</span>
//               </div>
//             </div>
//           )}

//           <div className="input-group">
//             <label>Email or Username</label>
//             <div className="input-wrapper">
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <span className="icon">👤</span>
//             </div>
//           </div>

//           <div className="input-group">
//             <label>Password</label>
//             <div className="input-wrapper">
//               <input
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 minLength={6}
//               />
//               <span className="icon">🔒</span>
//             </div>
//           </div>

//           {!isSignUp && (
//             <div className="forgot-password">
//               <a href="#forgot">Forgot Password?</a>
//             </div>
//           )}

//           {error && <p className="auth-message">{error}</p>}

//           <button className="login-btn" type="submit" disabled={loading}>
//             {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
//           </button>
//         </form>

//         <div className="divider">or continue with</div>

//         <div className="social-login">
//           <div className="social-icon">G</div>
//           <div className="social-icon"></div>
//           <div className="social-icon">f</div>
//         </div>

//         <div className="sign-up">
//           {isSignUp ? (
//             <>
//               Already have an account?{' '}
//               <a href="#login" onClick={(e) => { e.preventDefault(); setIsSignUp(false); setError(''); }}>
//                 Login
//               </a>
//             </>
//           ) : (
//             <>
//               Don't have an account?{' '}
//               <a href="#signup" onClick={(e) => { e.preventDefault(); setIsSignUp(true); setError(''); }}>
//                 Sign Up
//               </a>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // ---- SIGN UP ----
        const res = await fetch('http://127.0.0.1:8000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || 'Something went wrong. Please try again.');
          setLoading(false);
          return;
        }

        // Auto-switch to login after successful signup
        setIsSignUp(false);
        setError('Account created! Please log in below.');
        setPassword('');
      } else {
        // ---- LOGIN ----
        const res = await fetch('http://127.0.0.1:8000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || 'Invalid email or password.');
          setLoading(false);
          return;
        }

        // Store token so the app remembers the user is logged in
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userName', data.name);

        navigate('/dashboard');
      }
    } catch (err) {
      setError('Could not reach the server. Is the backend running?');
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="decoration heart-top">❤️</div>
      <div className="decoration cloud-1">☁️</div>
      <div className="decoration cloud-2">☁️</div>
      <div className="decoration plant-left">🪴</div>
      <div className="decoration flower-right">🌸</div>

      <div className="phone-mockup">
        <div className="character-placeholder">🧑‍💻</div>
        <div className="header-text">
          <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isSignUp ? 'Start your FrameGenius journey' : 'Login to continue your journey'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <span className="icon">🧑</span>
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email or Username</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="icon">👤</span>
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <span className="icon">🔒</span>
            </div>
          </div>

          {!isSignUp && (
            <div className="forgot-password">
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setError('Password reset is coming soon. Please contact support for now.');
                }}
              >
                Forgot Password?
              </a>
            </div>
          )}

          {error && <p className="auth-message">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <div className="social-login">
          <div
            className="social-icon"
            onClick={() => setError('Google login is coming soon.')}
          >
            G
          </div>
          <div
            className="social-icon"
            onClick={() => setError('Apple login is coming soon.')}
          ></div>
          <div
            className="social-icon"
            onClick={() => setError('Facebook login is coming soon.')}
          >
            f
          </div>
        </div>

        <div className="sign-up">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <a href="#login" onClick={(e) => { e.preventDefault(); setIsSignUp(false); setError(''); }}>
                Login
              </a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a href="#signup" onClick={(e) => { e.preventDefault(); setIsSignUp(true); setError(''); }}>
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;