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
  position: string;
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

    const [
  showUndoModal,
  setShowUndoModal
] = useState(false);

const [
  selectedPick,
  setSelectedPick
] = useState<any>(null);

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

function exportLeague() {

  const rows: string[] = [];

  teams.forEach((team) => {

    rows.push(
      `TEAM: ${team.name}`
    );

    rows.push(
      "Position,Player,Cost"
    );

    let teamTotal = 0;

    draftPicks
      .filter(
        (pick) =>
          pick.team_id === team.id
      )
      .forEach((pick) => {

        const player =
          players.find(
            (p) =>
              p.id === pick.player_id
          );

        rows.push(
          [
            player?.position || "",
            player?.player_name || "",
            pick.cost
          ].join(",")
        );

        teamTotal += pick.cost;

      });

    rows.push(
      `TEAM TOTAL,,${teamTotal}`
    );

    rows.push("");

  });

  const csvContent =
    rows.join("\n");

  const blob =
    new Blob(
      [csvContent],
      {
        type: "text/csv"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "final-rosters.csv";

  link.click();

  URL.revokeObjectURL(
    url
  );

}
async function confirmUndo() {

  if (!selectedPick)
    return;

  await undoDraftPick(
    selectedPick.id,
    selectedPick.playerId
  );

  setShowUndoModal(false);

  setSelectedPick(null);

}

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
     <main className="min-h-screen p-8 bg-black text-white">

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

<button
  onClick={exportLeague}
  className="
    mb-6
    px-4
    py-2
    bg-emerald-800
    hover:bg-emerald-900
    text-white
    font-bold
    rounded-lg
  "
>
  Export Final Rosters
</button>
  

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

 setSelectedPick({
  id: pick.id,
  playerId: pick.player_id,
  playerName: player?.player_name,
  teamName: team?.name,
  cost: pick.cost
});

  setShowUndoModal(true);

}}

  className="
  mt-2
  px-3
  py-2
  bg-rose-800
  hover:bg-rose-900
  text-white
  font-bold
  rounded-lg
"
>
  Undo Draft Pick
</button>

            </div>

          );

        })}

      </div>

{showUndoModal && (

  <div className="fixed inset-0 bg-black/80 flex items-center justify-center">

    <div className="bg-black text-white p-6 rounded-lg w-96 border border-red-700">

      <h2 className="text-2xl font-bold text-red-400 mb-4">
        Undo Draft Pick
      </h2>

      <div className="space-y-2 mb-6">

        <div>
          Player:
          {" "}
          {selectedPick?.playerName}
        </div>

        <div>
          Team:
          {" "}
          {selectedPick?.teamName}
        </div>

        <div>
  Cost:
  {" "}
  ${selectedPick?.cost}
</div>

      </div>

      <p className="text-gray-300 mb-6">
        This will remove the draft pick and return the player to the available player pool.
      </p>

      <div className="flex gap-3">

        <button
          onClick={confirmUndo}
          className="
            px-4
            py-2
            bg-red-800
            hover:bg-red-900
            text-white
            font-bold
            rounded-lg
          "
        >
          Confirm Undo
        </button>

        <button
          onClick={() => {
            setShowUndoModal(false);
            setSelectedPick(null);
          }}
          className="
            px-4
            py-2
            bg-slate-700
            hover:bg-slate-800
            text-white
            font-bold
            rounded-lg
          "
        >
          Cancel
        </button>

      </div>

    </div>

  </div>

)}

    </main>
  );
}