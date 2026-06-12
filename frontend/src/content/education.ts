/** Education — compact and factual. */

export type Education = {
  school: string;
  degree: string;
  period: string;
  location: string;
  detail?: string;
};

export const education: Education[] = [
  {
    school: "Arizona State University",
    degree: "M.S. in Information Technology",
    period: "Jan 2024 — Dec 2025",
    location: "Tempe, AZ",
    detail: "Ira A. Fulton Schools of Engineering",
  },
];
