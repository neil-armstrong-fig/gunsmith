import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {statRowsOf} from "@src/react/components/dom/workshop/components/weapon-card/stat-rows/StatRowsOf";

it("lists the rifle's numbers in plain words", () => {
  expect(statRowsOf(RIFLE)).toEqual([
    {label: "Damage", value: "25"},
    {label: "Shots a second", value: "5"},
    {label: "Magazine", value: "12"},
    {label: "Reserve", value: "36"},
    {label: "Reload", value: "1.5 s"},
    {label: "Vision", value: "90° out to 12 tiles"},
  ]);
});

it("turns the time between shots into shots a second, to one place", () => {
  expect(statRowsOf({...RIFLE, fireIntervalSeconds: 0.3})[1]).toEqual({label: "Shots a second", value: "3.3"});
});
