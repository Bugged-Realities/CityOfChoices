import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CharacterPage() {
  const [character, setCharacter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("JWT token:", token);
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("/api/character/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch character");
        return res.json();
      })
      .then((data) => setCharacter(data))
      .catch((err) => setError(err.message));
  }, [navigate]);

  return (
    <div>
      <h1>Character Info</h1>
      {error && <div>Error: {error}</div>}
      {character && (
        <ul>
          <li>ID: {character.id}</li>
          <li>Name: {character.name}</li>
          <li>Fear: {character.fear}</li>
          <li>Sanity: {character.sanity}</li>
          <li>Created At: {character.created_at}</li>
        </ul>
      )}
    </div>
  );
}

export default CharacterPage;
