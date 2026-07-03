// The three course modules and the topics each contains.
export interface CourseLevel {
  level: number;
  name: string;
  credential: string; // "Certificate of Completion" (honest, non-accredited framing)
  tag: string;        // short plain badge, e.g. "Getting started"
  blurb: string;
  topicIds: number[];
}

export const LEVELS: CourseLevel[] = [
  {
    level: 1, name: "Foundations", credential: "Certificate of Completion", tag: "Getting started",
    blurb: "Recognise when care is needed, understand everyday tasks, and prepare for the caregiver role.",
    topicIds: [1, 2, 3, 5],
  },
  {
    level: 2, name: "Core Care", credential: "Certificate of Completion", tag: "Everyday care",
    blurb: "Organise care, build a plan, and carry out infection control and core procedures safely.",
    topicIds: [4, 6, 7, 8, 9],
  },
  {
    level: 3, name: "Complex & Compassionate Care", credential: "Certificate of Completion", tag: "Advanced care",
    blurb: "Provide palliative care, protect your own wellbeing, and bring in support systems.",
    topicIds: [10, 11, 12],
  },
  {
    level: 4, name: "Care-home orientation", credential: "Certificate of Completion", tag: "In-service",
    blurb: "Care-home in-service topics: safe moving and handling, falls prevention, safeguarding, incident reporting, and record-keeping.",
    topicIds: [13, 14, 15, 16, 17],
  },
];

export const levelForTopicId = (id: number) => LEVELS.find((l) => l.topicIds.includes(id));
