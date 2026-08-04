"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    const { data, error } = await supabase
      .from("test")
      .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      console.log(error);
    } else {
      setData(data || []);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-4">
        Supabase Test
      </h1>

      {data.map((row) => (
        <p key={row.id}>{row.name}</p>
      ))}
    </main>
  );
}