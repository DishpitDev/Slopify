import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const generateRandomHexColor = () => {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  };

  const isValidDisplayName = (name) => {
    return /^[a-zA-Z0-9_]+$/.test(name);
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name cannot be empty.");
      return;
    }

    if (!isValidDisplayName(displayName)) {
      setError("Display name can only contain letters, numbers, and underscores.");
      return;
    }

    try {
      const { data: user, error: displayNameError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("display_name", displayName)
        .single();

      if (user) {
        setError("Display name is already taken.");
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const randomColor = generateRandomHexColor();

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          display_name: displayName,
          profile_color: randomColor,
        },
      ]);

      if (profileError && profileError.code !== "406") {
        setError(profileError.message);
      } else {
        navigate("/chat");
      }
    } catch (err) {
      setError("An error occurred during registration.");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        required
      />
      <Button
        action="submit"
        content="Register"
        background="#458588"
        color="white"
      />
    </form>
  );
}
