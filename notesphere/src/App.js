import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/pages/Navbar";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import NoteState from "./context/notes/noteState";
import SignUp from "./components/authentication/SignUp";
import Login from "./components/authentication/Login";
import ForgotPassword from "./components/authentication/ForgotPassword";
import ResetPassword from "./components/authentication/ResetPassword";
import VerifyEmail from "./components/authentication/VerifyEmail";
import Profile from "./components/pages/Profile";
import NotFound from "./components/pages/NotFound";
import AlertState from "./context/alert/alertState";
import Alert from "./components/pages/Alert";
import Footer from "./components/pages/Footer";
import VerifyBanner from "./components/pages/VerifyBanner";
function App() {
  return (
    <AlertState>
      <NoteState>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Router>
            <Navbar />
            <VerifyBanner />
            <main style={{ flex: 1 }}>
              <Alert />
              <Routes>
                <Route exact path="/" element={<Home />}></Route>
                <Route exact path="/about" element={<About />}></Route>
                <Route exact path="/login" element={<Login />}></Route>
                <Route exact path="/signup" element={<SignUp />}></Route>
                <Route exact path="/forgot-password" element={<ForgotPassword />}></Route>
                <Route exact path="/reset-password/:token" element={<ResetPassword />}></Route>
                <Route exact path="/verify-email/:token" element={<VerifyEmail />}></Route>
                <Route exact path="/profile" element={<Profile />}></Route>
                <Route path="*" element={<NotFound />}></Route>
              </Routes>
            </main>
          </Router>
          <Footer />
        </div>
      </NoteState>
    </AlertState>
  );
}
export default App;