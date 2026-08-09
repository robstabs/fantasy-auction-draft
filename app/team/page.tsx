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

  const [leagueSettings,
  setLeagueSettings] =
  useState<any>(null);

 useEffect(() => {

  loadData();

  const channel =
    supabase
      .channel(
        "team-updates"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "draft_picks",
        },
        () => {
          loadData();
        }
      )
      .subscribe();

  return () => {
    supabase.removeChannel(
      channel
    );
  };

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

  const settingsResult = 
    await supabase
      .from("league_settings")
      .select("*")
      .single();

  setTeams(
    teamResult.data || []
  );

  setDraftPicks(
    draftResult.data || []
  );

  setPlayers(
    playerResult.data || []
  );

  setLeagueSettings(
  settingsResult.data
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

  const playerCount =
  draftPicks.filter(
    (pick) =>
      pick.team_id === team.id
  ).length;

  const remainingRosterSpots =
  leagueSettings
    ? leagueSettings.roster_size -
      playerCount
    : 0;
   
    const maxBid =
  Math.max(
    1,
    remainingBudget -
      (remainingRosterSpots - 1)
  );

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


<div className="text-yellow-400 font-bold">
  Max Bid: ${maxBid}
</div>

  </div>
);

})()}

{(() => {

  const teamPlayers =
    draftPicks
      .filter(
        (pick) =>
          pick.team_id === team.id
      )
      .map((pick) =>
        players.find(
          (p) =>
            p.id === pick.player_id
        )
      )
      .filter(Boolean);

  const qbCount =
    teamPlayers.filter(
      (player) =>
        player?.position === "QB"
    ).length;

  const rbCount =
    teamPlayers.filter(
      (player) =>
        player?.position === "RB"
    ).length;

  const wrCount =
    teamPlayers.filter(
      (player) =>
        player?.position === "WR"
    ).length;

  const teCount =
    teamPlayers.filter(
      (player) =>
        player?.position === "TE"
    ).length;

  const dstCount =
    teamPlayers.filter(
      (player) =>
        player?.position === "DST"
    ).length;

  const kCount =
    teamPlayers.filter(
      (player) =>
        player?.position === "K"
    ).length;

  return (
    <div className="mb-4 grid grid-cols-3 gap-2">

      <div className="border rounded p-2">
        QB: {qbCount}
      </div>

      <div className="border rounded p-2">
        RB: {rbCount}
      </div>

      <div className="border rounded p-2">
        WR: {wrCount}
      </div>

      <div className="border rounded p-2">
        TE: {teCount}
      </div>

      <div className="border rounded p-2">
        DST: {dstCount}
      </div>

      <div className="border rounded p-2">
        K: {kCount}
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