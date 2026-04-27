import { useEffect, useState } from "react";
import API from "../services/api";
import { AuthContext } from "./context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    API.defaults.headers.common.Authorization = `Bearer ${token}`;

    API.get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        delete API.defaults.headers.common.Authorization;
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);
    API.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    setAuthLoading(false);
  };

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", {
      name,
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    API.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    setAuthLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete API.defaults.headers.common.Authorization;
    setUser(null);
    setAuthLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, authLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};