import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  addLeaderboardEntry,
  getLeaderboard,
} from "./api/leaderboardApi";
import type { LeaderboardEntry } from "./types/leaderboard";
import "./App.css";

interface FormState {
  playerName: string;
  score: string;
  roundsPlayed: string;
}

const initialFormState: FormState = {
  playerName: "",
  score: "",
  roundsPlayed: "1",
};

function App() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(
    []
  );
  const [form, setForm] =
    useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getLeaderboard();
      setEntries(result);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);

    const playerName = form.playerName.trim();
    const score = Number(form.score);
    const roundsPlayed = Number(form.roundsPlayed);

    if (!playerName) {
      setError("Player name is required.");
      return;
    }

    if (!Number.isInteger(score) || score < 40 || score > 200) {
      setError("Score must be a whole number from 40 to 200.");
      return;
    }

    if (
      !Number.isInteger(roundsPlayed) ||
      roundsPlayed < 1
    ) {
      setError("Rounds played must be a positive whole number.");
      return;
    }

    setSaving(true);

    try {
      await addLeaderboardEntry({
        player_name: playerName,
        score,
      });

      setForm(initialFormState);
      await loadLeaderboard();
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <section className="content">
        <header>
          <p className="eyebrow">Golf application</p>
          <h1>Leaderboard</h1>
          <p className="description">
            A minimal React application backed by Supabase
            PostgreSQL.
          </p>
        </header>

        <form className="entry-form" onSubmit={handleSubmit}>
          <label>
            Player
            <input
              type="text"
              value={form.playerName}
              maxLength={100}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  playerName: event.target.value,
                }))
              }
              placeholder="Player name"
              required
            />
          </label>

          <label>
            Score
            <input
              type="number"
              min={40}
              max={200}
              value={form.score}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  score: event.target.value,
                }))
              }
              placeholder="72"
              required
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Adding..." : "Add score"}
          </button>
        </form>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading leaderboard...</p>
        ) : entries.length === 0 ? (
          <p>No scores have been entered.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id}>
                    <td>{index + 1}</td>
                    <td>{entry.player_name}</td>
                    <td>{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export default App;