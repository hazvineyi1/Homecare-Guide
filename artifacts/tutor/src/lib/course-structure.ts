// The three course modules and the topics each contains.
export interface CourseLevel {
  level: number;
  name: string;
  credential: string; // "Certificate of Completion" (honest, non-accredited framing)
  blurb: string;
  topicIds: number[];
}

export const LEVELS: CourseLevel[] = [
  {
    level: 1, name: "Foundations", credential: "Certificate of Completion",
    blurb: "Recognise when care is needed, understand everyday tasks, and prepare for the caregiver role.",
    topicIds: [1, 2, 3, 5],
  },
  {
    level: 2, name: "Core Care", credential: "Certificate of Completion",
    blurb: "Organise care, build a plan, and perform infection control and core procedures safely.",
    topicIds: [4, 6, 7, 8, 9],
  },
  {
    level: 3, name: "Complex & Compassionate Care", credential: "Certificate of Completion",
    blurb: "Provide palliative care, protect caregiver wellbeing, and mobilise support systems.",
    topicIds: [10, 11, 12],
  },
];

export const levelForTopicId = (id: number) => LEVELS.find((l) => l.topicIds.includes(id));
