// src/app/profile/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  IconButton,
  Input,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

export default function ProfilePage() {
  const { fetchCartCount } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [newPic, setNewPic] = useState(null);
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const avatarObjectUrl = useRef(null);

  // Load profile + avatar on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) throw new Error("Failed to load profile");
        setProfile(await res.json());
      } catch (e) {
        setError(e.message);
      }
      try {
        const res2 = await fetch("/api/user/me/avatar");
        if (res2.ok) {
          const blob = await res2.blob();
          if (avatarObjectUrl.current)
            URL.revokeObjectURL(avatarObjectUrl.current);
          avatarObjectUrl.current = URL.createObjectURL(blob);
          setAvatarUrl(avatarObjectUrl.current);
        }
      } catch {
        // no avatar
      }
    }
    load();
    return () => {
      if (avatarObjectUrl.current) URL.revokeObjectURL(avatarObjectUrl.current);
    };
  }, []);

  const uploadPic = async () => {
    setMsg("");
    setError("");
    if (!newPic) {
      setError("Select an image first.");
      return;
    }
    if (newPic.size > 2 * 1024 * 1024) {
      setError("Max size 2 MB.");
      return;
    }
    const form = new FormData();
    form.append("file", newPic);
    try {
      const res = await fetch("/api/user/me/avatar", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      // refresh avatar
      const res2 = await fetch("/api/user/me/avatar");
      if (res2.ok) {
        const blob = await res2.blob();
        if (avatarObjectUrl.current)
          URL.revokeObjectURL(avatarObjectUrl.current);
        avatarObjectUrl.current = URL.createObjectURL(blob);
        setAvatarUrl(avatarObjectUrl.current);
      }
      setMsg("Avatar updated!");
      setNewPic(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const changePwd = async () => {
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/user/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) throw new Error("Password change failed");
      setMsg("Password changed!");
      setOld("");
      setNew("");
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !profile) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (!profile) {
    return (
      <Container sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6">Loading profile…</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack spacing={3}>
        {msg && <Alert severity="success">{msg}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Profile Card */}
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  src={avatarUrl || "/avatarSrc.png"}
                  sx={{ width: 80, height: 80 }}
                />
              </Grid>
              <Grid item xs>
                <Typography variant="h5">
                  {profile.firstname} {profile.lastname}
                </Typography>
                <Typography color="text.secondary">
                  {profile.username} • {profile.email}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <label htmlFor="avatar-upload">
              <Input
                accept="image/*"
                id="avatar-upload"
                type="file"
                sx={{ display: "none" }}
                onChange={(e) => setNewPic(e.target.files?.[0] || null)}
              />
              <IconButton color="primary" component="span">
                <PhotoCamera />
              </IconButton>
            </label>
            <Button variant="contained" onClick={uploadPic} disabled={!newPic}>
              Upload New Avatar
            </Button>
          </CardActions>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                value={oldPassword}
                onChange={(e) => setOld(e.target.value)}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNew(e.target.value)}
              />
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              color="secondary"
              onClick={changePwd}
              disabled={!oldPassword || !newPassword}
            >
              Update Password
            </Button>
          </CardActions>
        </Card>
      </Stack>
    </Container>
  );
}
