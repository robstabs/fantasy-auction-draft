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

  const channel =
    supabase
      .channel(
        "dashboard-updates"
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

  setTeams(teamResult.data || []);
  setDraftPicks(draftResult.data || []);
  setPlayers(playerResult.data || []);
}

return (
  <main className="min-h-screen bg-black text-white p-8">

    <h1 className="text-5xl font-bold mb-2">
  Draft Board
</h1>

<p className="text-gray-400 mb-8">
  Live Fantasy Football Auction Dashboard
</p>

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

      {teams.map((team) => (

        <div
          key={team.id}
          className="border border-gray-700 rounded-lg p-4 bg-gray-900"
        >

          <h2 className="text-2xl font-bold mb-4 text-blue-400">
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
      <div className="border border-gray-700 rounded-lg p-3 mb-4">

  <div>
    Budget: ${team.budget}
  </div>

  <div className="text-red-400">
    Spent: ${totalSpent}
  </div>

  <div
  className={
    remainingBudget < 25
      ? "text-red-500 font-bold"
      : "text-green-400 font-bold"
  }
>
    Remaining: ${remainingBudget}
  </div>

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

    const teCount =
  teamPlayers.filter(
    (p) => p?.position === "TE"
  ).length;

const dstCount =
  teamPlayers.filter(
    (p) => p?.position === "DST"
  ).length;

const kCount =
  teamPlayers.filter(
    (p) => p?.position === "K"
  ).length;

  return (
  <div className="grid grid-cols-3 gap-2 mb-4">

    <div className="border border-gray-700 rounded p-2 text-center">
  QB: {qbCount}
</div>

    <div className="border border-gray-700 rounded p-2 text-center">
  RB: {rbCount}
</div>

   <div className="border border-gray-700 rounded p-2 text-center">
  WR: {wrCount}
</div>

    <div className="border border-gray-700 rounded p-2 text-center">
  TE: {teCount}
</div>

   <div className="border border-gray-700 rounded p-2 text-center">
  DST: {dstCount}
</div>

   <div className="border border-gray-700 rounded p-2 text-center">
  K: {kCount}
</div>

<div className="font-bold mb-4">

  Total Players:

  {
    draftPicks.filter(
      (pick) =>
        pick.team_id === team.id
    ).length
  }

</div>
<div className="text-sm text-gray-400">

  Highest Purchase:

  ${
    Math.max(
      0,
      ...draftPicks
        .filter(
          (pick) =>
            pick.team_id === team.id
        )
        .map(
          (pick) =>
            pick.cost
        )
    )
  }

</div>
  </div>

  
);

})()}



        </div>

      ))}

    </div>

  </main>
);
}