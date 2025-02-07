import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bot, MessageSquare, DollarSign, LineChart } from "lucide-react";
import "../styles/LoginPage.scss";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate("/chat");
    } catch (error: any) {
      console.error("Auth error:", error.code, error.message);
      setError(
        error.code === "auth/email-already-in-use"
          ? "Email already exists. Please try logging in instead."
          : error.code === "auth/weak-password"
          ? "Password should be at least 6 characters long."
          : error.code === "auth/invalid-email"
          ? "Invalid email address."
          : error.code === "auth/user-not-found" ||
            error.code === "auth/wrong-password"
          ? "Invalid email or password."
          : `Failed to sign in: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="chatbot-info">
          <div className="logo-section">
            <Bot size={48} className="bot-icon" />
            <h1>Kevin AI</h1>
            <p>Your Personal Finance Advisor</p>
          </div>

          <div className="features">
            <div className="feature-item">
              <MessageSquare className="feature-icon" />
              <div className="feature-text">
                <h3>Smart Conversations</h3>
                <p>
                  Engage in natural conversations about your financial queries
                </p>
              </div>
            </div>

            <div className="feature-item">
              <DollarSign className="feature-icon" />
              <div className="feature-text">
                <h3>Financial Insights</h3>
                <p>Get personalized financial advice and recommendations</p>
              </div>
            </div>

            <div className="feature-item">
              <LineChart className="feature-icon" />
              <div className="feature-text">
                <h3>Market Analysis</h3>
                <p>
                  Stay updated with market trends and investment opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="login-box">
            <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
            <p className="subtitle">
              {isRegistering
                ? "Sign up to start using Kevin AI"
                : "Sign in to continue to Kevin AI"}
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading
                  ? isRegistering
                    ? "Creating Account..."
                    : "Signing in..."
                  : isRegistering
                  ? "Create Account"
                  : "Sign In"}
              </button>

              <div className="auth-switch">
                <button
                  type="button"
                  className="switch-button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError("");
                  }}
                >
                  {isRegistering
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
