"use client";

import { useRef, useState, type MouseEvent } from "react";

import { PEOPLE } from "@/app/data";
import { MONTHS } from "@/app/static-date-data";

type Person = {
  name: string;
  birthday: string;
};

function parseCSV(data: string): Person[] {
  return data.split("\n").map((line) => {
    const [name, birthday] = line.replace("\r", "").split(";");
    return { name, birthday };
  });
}

function parseVCARD(data: string): Person[] {
  return data
    .split("BEGIN:VCARD")
    .slice(1)
    .map((vcard) => {
      const name = vcard.match(/FN:(.*)/)?.[1];
      const birthday = vcard.match(/BDAY:(.*)/)?.[1];
      return name && birthday ? { name, birthday } : null;
    })
    .filter((item) => item !== null);
}

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileData, setFileData] = useState<Person[] | null>(null);

  function handleReset(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setFileData(null);

    if (fileRef.current) {
      fileRef.current.value;
    }
  }

  function handleExampleData(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setFileData(PEOPLE);
  }

  let daysOfMonth = MONTHS.map((month) => {
    return [...Array(month.days)].map(() => 0);
  });

  fileData?.forEach((item) => {
    const [_, month, day] = item.birthday.split("-");
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    daysOfMonth[m - 1][d - 1] += 1;
  });

  const monthWeightList = MONTHS.map((_, month) =>
    daysOfMonth[month].reduce((acc, curr) => acc + curr, 0),
  );
  const maxMonthWeight = Math.max(...monthWeightList);

  return (
    <main className="flex flex-col gap-12">
      <h1 className="text-3xl underline">Birthday Heatmap for Friends</h1>
      <div className="flex flex-col gap-12">
        <form className="flex gap-4">
          <label
            htmlFor="file_input"
            className="cursor-pointer px-4 py-2 leading-tight font-medium rounded-md text-black hover:bg-white bg-neutral-300 active:bg-neutral-500 select-none"
          >
            Upload csv/vCard File
          </label>
          <input
            className="hidden"
            ref={fileRef}
            type="file"
            id="file_input"
            accept=".csv,.vcf"
            onChange={async (e) => {
              if (e?.target?.files?.length !== 0 && e?.target?.files?.[0]) {
                const type = e?.target?.files?.[0].type;
                const reader = new FileReader();

                reader.onload = async (file) => {
                  if (typeof file.target?.result === "string") {
                    if (type === "text/vcard") {
                      setFileData(parseVCARD(file.target?.result));
                    } else if (type === "text/csv") {
                      setFileData(parseCSV(file.target?.result));
                    }
                  }
                };
                reader.readAsText(e?.target?.files?.[0]);
              }
            }}
          />
          <button
            className="cursor-pointer px-4 py-2 leading-tight font-medium rounded-md text-black hover:bg-white bg-neutral-300 active:bg-neutral-500 select-none"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="cursor-pointer px-4 py-2 leading-tight font-medium rounded-md text-black hover:bg-white bg-neutral-300 active:bg-neutral-500 select-none"
            onClick={handleExampleData}
          >
            Use example data
          </button>
        </form>
        <div className="flex gap-8 sm:gap-4 flex-wrap">
          {MONTHS.map((monthData, month) => {
            let monthWeight = Math.min(
              Math.round((monthWeightList[month] / maxMonthWeight) * 100) - 20,
            );
            monthWeight = Math.round(monthWeight / 10) * 10 || 0;

            return (
              <div
                key={monthData.name}
                className="w-auto sm:w-48 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{
                      backgroundColor: `hsl(73, 60%, ${monthWeight}%)`,
                      border: `1px solid hsl(73, 10%, 20%)`,
                    }}
                  ></div>
                  <h2 className="w-24 pr-2 opacity-80 text-xl">
                    {monthData.name}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1">
                  {daysOfMonth[month].map((dayWeight, day) => {
                    const weight = dayWeight === 0 ? 0 : dayWeight + 1.5;
                    const light = weight * 10;
                    const lightValue = light > 80 ? 80 : light;
                    return (
                      <div
                        key={day}
                        className={`w-6 h-6 flex items-center justify-center rounded`}
                        style={{
                          backgroundColor:
                            dayWeight === 0
                              ? "hsl(73, 15%, 10%)"
                              : `hsl(73, 60%, ${lightValue}%)`,
                          border: `1px solid hsl(73, 10%, 20%)`,
                        }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
