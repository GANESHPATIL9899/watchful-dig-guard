import type { Worker } from "@/types";

const ROLES = ["Excavator Helper", "Site Engineer", "Ground Worker", "Foreman", "Surveyor", "Welder", "Electrician"];
const CONTRACTORS = ["Apex Constructions", "Metro Infra", "BuildRight Ltd.", "Sterling Civil"];
const ZONES = ["Zone A — North", "Zone B — Pit", "Zone C — South", "Zone D — Loading"];
const SHIFTS = ["06:00 – 14:00", "14:00 – 22:00", "22:00 – 06:00"];

const FIRST = ["Ravi", "Amit", "Suresh", "Karan", "Vikram", "Anil", "Rajesh", "Mohan", "Sanjay", "Deepak", "Arjun", "Naveen", "Pradeep", "Manoj", "Ramesh", "Sunil", "Vinod", "Ashok", "Praveen", "Harish"];
const LAST = ["Kumar", "Sharma", "Singh", "Verma", "Patel", "Reddy", "Yadav", "Mehta", "Joshi", "Iyer", "Nair", "Gupta"];

function avatarSvg(initials: string, hue: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='hsl(${hue} 40% 30%)'/><text x='50%' y='54%' text-anchor='middle' font-family='Inter,sans-serif' font-size='24' font-weight='600' fill='white'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const workers: Worker[] = Array.from({ length: 24 }, (_, i) => {
  const fn = FIRST[i % FIRST.length];
  const ln = LAST[(i * 3) % LAST.length];
  const id = `WRK-${String(1001 + i)}`;
  return {
    id,
    name: `${fn} ${ln}`,
    photoUrl: avatarSvg(fn[0] + ln[0], (i * 37) % 360),
    age: 24 + ((i * 7) % 30),
    role: ROLES[i % ROLES.length],
    contractor: CONTRACTORS[i % CONTRACTORS.length],
    phone: `+91 9${String(800000000 + i * 13579).slice(0, 9)}`,
    assignedZone: ZONES[i % ZONES.length],
    shift: SHIFTS[i % SHIFTS.length],
    trainingStatus: i % 7 === 0 ? "pending" : i % 11 === 0 ? "expired" : "completed",
    ppeCompliant: i % 9 !== 0,
    emergencyContact: `+91 9${String(700000000 + i * 24681).slice(0, 9)}`,
    medicalNotes: i % 8 === 0 ? "Mild asthma — keep inhaler nearby" : undefined,
    certifications:
      i % 3 === 0
        ? ["Site Safety L1", "First Aid"]
        : i % 3 === 1
          ? ["Site Safety L2", "Heavy Equip Awareness"]
          : ["Site Safety L1"],
  };
});
