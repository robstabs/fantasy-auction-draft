"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
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

export default function DashboardPage() {

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

  setTeams(teamResult.data || []);
  setDraftPicks(draftResult.data || []);
  setPlayers(playerResult.data || []);
}

return (
  <main className="p-8">

    <h1 className="text-4xl font-bold mb-6">
      League Dashboard
    </h1>

    <div className="grid grid-cols-3 gap-4">

      {teams.map((team) => (

        <div
          key={team.id}
          className="border border-gray-700 rounded-lg p-4 bg-gray-900"
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
    <>
      <div>
        Spent: ${totalSpent}
      </div>

      <div>
        Remaining: ${remainingBudget}
      </div>
    </>
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
      (p) => p?.position === "QB"
    ).length;

  const rbCount =
    teamPlayers.filter(
      (p) => p?.position === "RB"
    ).length;

  const wrCount =
    teamPlayers.filter(
      (p) => p?.position === "WR"
    ).length;

  return (
    <>
      <div>QB: {qbCount}</div>
      <div>RB: {rbCount}</div>
      <div>WR: {wrCount}</div>
    </>
  );

})()}

<div className="mt-4 font-bold">
  Players:
  {
    draftPicks.filter(
      (pick) =>
        pick.team_id === team.id
    ).length
  }
</div>

        </div>

      ))}

    </div>

  </main>
);
}