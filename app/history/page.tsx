"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type DraftPick = {
  id: number;
  player_id: number;
  team_id: number;
  cost: number;
  drafted_at: string;
};

type Player = {
  id: number;
  player_name: string;
};

type Team = {
  id: number;
  name: string;
};

export default function HistoryPage() {
  const [draftPicks, setDraftPicks] =
    useState<DraftPick[]>([]);

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [teams, setTeams] =
    useState<Team[]>([]);

  useEffect(() => {

  loadData();

  const channel =
    supabase
      .channel(
        "history-updates"
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
    const draftResult =
      await supabase
        .from("draft_picks")
        .select("*")
        .order(
          "drafted_at",
          { ascending: false }
        );

    const playerResult =
      await supabase
        .from("players")
        .select("*");

    const teamResult =
      await supabase
        .from("teams")
        .select("*");

    setDraftPicks(
      draftResult.data || []
    );

    setPlayers(
      playerResult.data || []
    );

    setTeams(
      teamResult.data || []
    );
  }

  return (
     <main className="p-8">

    <h1 className="text-4xl font-bold mb-6">
        Draft History
      </h1>

    <p className="text-gray-400 mb-8">
  AFS Drafted Players
</p>

      <div className="flex flex-wrap gap-3 mb-6">

  <Link
    href="/"
    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg"
  >
    Players
  </Link>

  <Link
    href="/dashboard"
    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg"
  >
    Dashboard
  </Link>

  <Link
    href="/team"
    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg"
  >
    Teams
  </Link>

  <Link
    href="/history"
    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg"
  >
    History
  </Link>

</div>

  

      <div className="space-y-3">

        {draftPicks.map((pick) => {

          const player =
            players.find(
              (p) =>
                p.id === pick.player_id
            );

          const team =
            teams.find(
              (t) =>
                t.id === pick.team_id
            );

            async function undoDraftPick(
  pickId: number,
  playerId: number
) {

    const playerUpdate =
  await supabase
    .from("players")
    .update({
      drafted: false
    })
    .eq(
      "id",
      playerId
    );

    if (playerUpdate.error) {

  console.error(
    playerUpdate.error
  );

  return;
}

const draftDelete =
  await supabase
    .from("draft_picks")
    .delete()
    .eq(
      "id",
      pickId
    );

    if (draftDelete.error) {

  console.error(
    draftDelete.error
  );

  return;
}

loadData();
}

          return (

            <div
              key={pick.id}
              className="
                border
                border-gray-700
                rounded-lg
                p-4
                bg-gray-900
              "
            >

              <div className="flex justify-between items-center">

                <div className="font-bold">
                  {player?.player_name}
                </div>

                <div className="text-green-400 font-bold">
                  ${pick.cost}
                </div>

              </div>

              <div className="text-gray-300">
                {team?.name}
              </div>

              <div className="text-gray-500 text-sm">
                {new Date(
                  pick.drafted_at
                ).toLocaleString()}
              </div>

              <button
  onClick={() => {

  const confirmed =
    confirm(
      "Undo this draft pick?"
    );

  if (!confirmed)
    return;

  undoDraftPick(
    pick.id,
    pick.player_id
  );

}}
  className="
    mt-2
    border
    border-red-500
    text-red-400
    px-2
    py-1
    rounded
  "
>
  Undo Draft Pick
</button>

            </div>

          );

        })}

      </div>

    </main>
  );
}