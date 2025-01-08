import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    display_name: "",
    profile_color: "",
    profile_photo_url: "",
  });
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: session } = await supabase.auth.getSession();

      if (!session || !session.session) {
        navigate("/");
        return;
      }

      const userId = session.session.user.id;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("display_name, profile_color, profile_photo_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else if (profile) {
        setProfileData(profile);
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setNewPhoto(file);
    } else {
      alert("Please upload a valid PNG or JPG file.");
    }
  };

  const isValidDisplayName = (name) => {
    return /^[a-zA-Z0-9_]+$/.test(name);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const sanitizedDisplayName = profileData.display_name;

    if (!sanitizedDisplayName.trim()) {
      alert("Display name cannot be empty.");
      setLoading(false);
      return
    }

    if (!isValidDisplayName(sanitizedDisplayName)) {
      alert("Display name can only contain letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session || !session.session) {
      navigate("/");
      return;
    }

    const userId = session.session.user.id;
    let photoUrl = profileData.profile_photo_url;

    if (newPhoto) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(`public/${userId}/${newPhoto.name}`, newPhoto, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading photo:", uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData, error: urlError } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(uploadData.path);

      if (urlError) {
        console.error("Error getting photo URL:", urlError.message);
        setLoading(false);
        return;
      }

      photoUrl = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: profileData.display_name,
        profile_color: profileData.profile_color,
        profile_photo_url: photoUrl,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError.message);
    } else {
      alert("Profile updated successfully!");
    }

    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  const navToChat = async (e) => {
    e.preventDefault();
    navigate("/chat");
  };

  return (
    <div>
      <h2>Profile Settings</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Display Name:</label>
          <input
            type="text"
            name="display_name"
            value={profileData.display_name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Profile Color:</label>
          <input
            type="color"
            name="profile_color"
            value={profileData.profile_color}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Profile Photo:</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handlePhotoChange}
          />
          {profileData.profile_photo_url && (
            <div>
              <img
                src={profileData.profile_photo_url}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
          )}
        </div>
        <Button
          action="submit"
          content="Save Changes"
          background="#FF00FF"
          color="black"
        />
      </form>
      <form onSubmit={navToChat}>
        <Button
          action="submit"
          content="Return to Chat"
          background="#FF00FF"
          color="black"
        />
      </form>
    </div>
  );
}
