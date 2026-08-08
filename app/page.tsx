"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Player = {
  id: number;
  player_name: string;
  position: string;
  nfl_team: string;
  drafted: boolean;
};

type Team = {
  id: number;
  name: string;
  budget: number;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("ALL");
  const [selectedTeam, setSelectedTeam] = useState("ALL");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [draftCost, setDraftCost] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("player_name");

    if (error) {
      console.error(error);
    } else {
      setPlayers(data || []);
    }
  }
  async function fetchTeams() {
  const { data, error } =
    await supabase
      .from("teams")
      .select("*")
      .order("name");

  if (error) {
    console.error(error);
  } else {
    setTeams(data || []);
  }
}

async function saveDraftPick() {

  if (
    !selectedPlayer ||
    !selectedTeamId ||
    !draftCost
  ) {
    alert(
      "Please select a team and enter a cost."
    );
    return;
  }

  const { error } =
    await supabase
      .from("draft_picks")
      .insert([
        {
          player_id:
            selectedPlayer.id,

          team_id:
            Number(selectedTeamId),

          cost:
            Number(draftCost)
        }
      ]);

  if (error) {
    console.error("SAVE ERROR:",error);

    alert(
      "Unable to save draft pick." + error.message
    );

    return;
  }

  await markPlayerDrafted();

  await fetchPlayers();

  setSelectedPlayer(null);

  setDraftCost("");

  setSelectedTeamId("");

  alert(
    "Draft pick saved successfully!"
  );
}

async function markPlayerDrafted() {

  if (!selectedPlayer) return;

  const { error } =
    await supabase
      .from("players")
      .update({
        drafted: true
      })
      .eq(
        "id",
        selectedPlayer.id
      );

  if (error) {
    console.error(error);
  }
}
  const filteredPlayers = players.filter((player) => {

    const matchesSearch = player.player_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesPosition =
      selectedPosition === "ALL" ||
      player.position === selectedPosition;

    const matchesTeam =
      selectedTeam === "ALL" ||
      player.nfl_team === selectedTeam;
    
    const notDrafted = player.drafted !== true;  

    return matchesSearch && matchesPosition && matchesTeam && notDrafted;
  });

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">
        Available Players
      </h1>

      <p className="mb-6">
        Players Found: {filteredPlayers.length}
      </p>

      <input
        type="text"
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border border-gray-700 bg-gray-900 text-white p-2 rounded-lg w-full mb-4"
      />

      <select
        value={selectedPosition}
        onChange={(e) => setSelectedPosition(e.target.value)}
        className="border border-gray-700 bg-gray-900 text-white p-2 rounded-lg mb-6"
      >
        <option value="ALL">All Positions</option>
        <option value="QB">QB</option>
        <option value="RB">RB</option>
        <option value="WR">WR</option>
        <option value="TE">TE</option>
        <option value="DST">DST</option>
        <option value="K">K</option>
      </select>

      <select
  value={selectedTeam}
  onChange={(e) =>
    setSelectedTeam(e.target.value)
  }
  className="border border-gray-700 bg-gray-900 text-white p-2 rounded-lg mb-6"
>
  <option value="ALL">All Teams</option>

  <option value="ARI">ARI</option>
  <option value="ATL">ATL</option>
  <option value="BAL">BAL</option>
  <option value="BUF">BUF</option>
  <option value="CAR">CAR</option>
  <option value="CHI">CHI</option>
  <option value="CIN">CIN</option>
  <option value="CLE">CLE</option>
  <option value="DAL">DAL</option>
  <option value="DEN">DEN</option>
  <option value="DET">DET</option>
  <option value="GB">GB</option>
  <option value="HOU">HOU</option>
  <option value="IND">IND</option>
  <option value="JAX">JAX</option>
  <option value="KC">KC</option>
  <option value="LV">LV</option>
  <option value="LAC">LAC</option>
  <option value="LAR">LAR</option>
  <option value="MIA">MIA</option>
  <option value="MIN">MIN</option>
  <option value="NE">NE</option>
  <option value="NO">NO</option>
  <option value="NYG">NYG</option>
  <option value="NYJ">NYJ</option>
  <option value="PHI">PHI</option>
  <option value="PIT">PIT</option>
  <option value="SEA">SEA</option>
  <option value="SF">SF</option>
  <option value="TB">TB</option>
  <option value="TEN">TEN</option>
  <option value="WAS">WAS</option>
</select>


      <div className="space-y-2">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            className="border border-gray-700 rounded-lg p-3 bg-gray-900"
          >
            <div className="font-semibold">
              {player.player_name}
            </div>

            <button
  onClick={() => setSelectedPlayer(player)}
  className="mt-2 px-3 py-1 border rounded-lg"
>
  Draft Player
</button>

            

            <div>
              {player.position} • {player.nfl_team}
            </div>
          </div>
        ))}
      </div>
      {selectedPlayer && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
    <div className="bg-black text-white p-6 rounded-lg w-96 border border-gray-700">

      <h2 className="text-2xl mb-4">
        Draft {selectedPlayer.player_name}
      </h2>

      <select
        value={selectedTeamId}
        onChange={(e) =>
          setSelectedTeamId(e.target.value)
        }
        className="border border-gray-700 bg-gray-900 text-white p-2 w-full mb-4 rounded-lg"
      >
        <option value="">
          Select Team
        </option>

        {teams.map((team) => (
          <option
            key={team.id}
            value={team.id}
          >
            {team.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Auction Cost"
        value={draftCost}
        onChange={(e) =>
          setDraftCost(e.target.value)
        }
        className="border border-gray-700 bg-gray-900 text-white p-2 w-full mb-4 rounded-lg"
      />

      <button
      onClick={saveDraftPick}
        className="border px-4 py-2 mr-2"
      >
        Save Draft Pick
      </button>

      <button
        onClick={() =>
          setSelectedPlayer(null)
        }
        className="border px-4 py-2"
      >
        Cancel
      </button>

    </div>
  </div>
)}
    </main>
  );
}