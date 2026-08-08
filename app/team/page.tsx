"use client";

import {
  useEffect,
  useState
} from "react";

import {
  supabase
} from "../../lib/supabase";
type Team = {
  id: number;
  name: string;
  budget: number;
};
type DraftPick = {
  id: number;
  player_id: number;
  team_id: number;
  cost: number;
};
type Player = {
  id: number;
  player_name: string;
  position: string;
  nfl_team: string;
};
export default function TeamPage() {
    const [teams, setTeams] =
  useState<Team[]>([]);

const [draftPicks, setDraftPicks] =
  useState<DraftPick[]>([]);

const [players, setPlayers] =
  useState<Player[]>([]);
  useEffect(() => {
  loadData();
}, []);
async function loadData() {

  const teamResult =
    await supabase
      .from("teams")
      .select("*");

  const draftResult =
    await supabase
      .from("draft_picks")
      .select("*");

  const playerResult =
    await supabase
      .from("players")
      .select("*");

  setTeams(
    teamResult.data || []
  );

  setDraftPicks(
    draftResult.data || []
  );

  setPlayers(
    playerResult.data || []
  );
}
return (
  <main className="p-8">

    <h1 className="text-4xl font-bold mb-6">
      Teams
    </h1>

    {teams.map((team) => (

      <div
        key={team.id}
        className="border rounded-lg p-4 mb-6"
      >

        <h2 className="text-2xl font-bold mb-4">
          {team.name}
        </h2>

        {(() => {

  const totalSpent =
    draftPicks
      .filter(
        (pick) =>
          pick.team_id === team.id
      )
      .reduce(
        (sum, pick) =>
          sum + pick.cost,
        0
      );

  const remainingBudget =
  team.budget - totalSpent;

return (
  <div className="mb-4 border-b pb-3">

    <div>
      Budget: ${team.budget}
    </div>

    <div className="text-red-400">
  Spent: ${totalSpent}
</div>

    <div className="text-green-400 font-bold">
  Remaining: ${remainingBudget}
</div>

  </div>
);

})()}

        {draftPicks
  .filter(
    (pick) =>
      pick.team_id === team.id
  )
  .map((pick) => {

    const player =
      players.find(
        (p) =>
          p.id === pick.player_id
      );

    return (

      <div key={pick.id}>
        {player?.player_name}
        {" - $"}
        {pick.cost}
      </div>

    );
  })}

      </div>

    ))}

  </main>
);
}