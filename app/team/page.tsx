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

  const [selectedTeam,
  setSelectedTeam] =
  useState("ALL");

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
<select
  value={selectedTeam}
  onChange={(e) =>
    setSelectedTeam(
      e.target.value
    )
  }
  className="
    border
    border-gray-700
    bg-gray-900
    text-white
    p-2
    rounded-lg
    mb-6
  "
>

  <option value="ALL">
    All Teams
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


    {teams
  .filter((team) =>

    selectedTeam === "ALL"

      ? true

      : team.id ===
        Number(
          selectedTeam
        )

  )
  .map((team) => (

      <div
        key={team.id}
        className="border rounded-lg p-4 mb-6"
      >

        <h2 className="text-2xl font mb-4">
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

    <div className="text-rose-700">
  Spent: ${totalSpent}
</div>

    <div className="text-green-700 font">
  Remaining: ${remainingBudget}
</div>


<div className="text-yellow-600 font">
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
    .map((pick) => {
      const player = players.find(
        (p) => p.id === pick.player_id
      );

      return player
        ? {
            ...player,
            cost: pick.cost
          }
        : null;
    })
    .filter(Boolean);

      const qbs =
  teamPlayers.filter(
    (player) =>
      player?.position === "QB"
  );

const rbs =
  teamPlayers.filter(
    (player) =>
      player?.position === "RB"
  );

const wrs =
  teamPlayers.filter(
    (player) =>
      player?.position === "WR"
  );

const tes =
  teamPlayers.filter(
    (player) =>
      player?.position === "TE"
  );

const dsts =
  teamPlayers.filter(
    (player) =>
      player?.position === "DST"
  );

const ks =
  teamPlayers.filter(
    (player) =>
      player?.position === "K"
  );

  const starterQB =
  qbs[0];

const starterRB1 =
  rbs[0];

const starterRB2 =
  rbs[0];
  
const starterWR1 =
  wrs[0];

const starterWR2 =
  wrs[1];

const starterTE =
  tes[0];

const starterDST =
  dsts[0];

const starterK =
  ks[0];

  const flexPool = [
  ...rbs.slice(1),
  ...wrs.slice(2),
  ...tes.slice(1),
];

const starterFlex1 =
  flexPool[0];



  const benchPlayers =
  teamPlayers.filter(
    (player) =>
      ![
        starterQB,
        starterRB1,
        starterRB2,
        starterWR1,
        starterWR2,
        starterTE,
        starterFlex1,
        starterDST,
        starterK
      ].includes(player)
  );

 

  return (
  <>

    <div className="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-900">

      <h3 className="font-bold mb-2">
        Starting Lineup
      </h3>

      <div className="space-y-2">

  <div className="flex">
    <span className="w-16 font-bold">QB</span>
    <span>
      {starterQB
         ? `${starterQB.player_name} - $${starterQB.cost}`
         : ""}
     </span>
  </div>

  
  
  <div className="flex">
    <span className="w-16 font-bold">RB</span>
    <span>
  {starterRB
    ? `${starterRB1.player_name} - $${starterRB1.cost}`
    : ""}
</span>
  </div>

  <div className="flex">
    <span className="w-16 font-bold">RB</span>
    <span>
  {starterRB
    ? `${starterRB2.player_name} - $${starterRB2.cost}`
    : ""}
</span>
  </div>

  <div className="flex">
    <span className="w-16 font-bold">WR1</span>
    <span>
  {starterWR1
    ? `${starterWR1.player_name} - $${starterWR1.cost}`
    : ""}
</span>
  </div>

  <div className="flex">
    <span className="w-16 font-bold">WR2</span>
    <span>
  {starterWR2
    ? `${starterWR2.player_name} - $${starterWR2.cost}`
    : ""}
</span>
  </div>

  <div className="flex">
    <span className="w-16 font-bold">TE</span>
    <span>
  {starterTE
    ? `${starterTE.player_name} - $${starterTE.cost}`
    : ""}
</span>
  </div>

  <div className="flex">
    <span className="w-16 font-bold">Flex1</span>
    <span>
  {starterFlex1
    ? `${starterFlex1.player_name} - $${starterFlex1.cost}`
    : ""}
</span>
  </div>


  <div className="flex">
    <span className="w-16 font-bold">DST</span>
    <span>
  {starterDST
    ? `${starterDST.player_name} - $${starterDST.cost}`
    : ""}
</span>
  </div>

  <div className="flex">
    <span className="w-16 font-bold">K</span>
    <span>
  {starterK
    ? `${starterK.player_name} - $${starterK.cost}`
    : ""}
</span>
  </div>

</div>
           

    </div>

    <div className="mt-4 mb-4">

      <h3 className="font-bold">
        Bench
      </h3>

      <div className="space-y-1">

  {benchPlayers.map((player) => {

  const draftPick =
    draftPicks.find(
      (pick) =>
        pick.player_id === player?.id
    );

  return (

    <div key={player?.id}>

      {player?.position}

      {" - "}

      {player?.player_name}

      {" - $"}

      {draftPick?.cost}

    </div>

  );

})}

</div>

    </div>

    

  </>
);

   

})()}

       

      </div>

    ))}

  </main>
);
}