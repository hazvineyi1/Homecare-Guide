// The three stacked credentials (NCQF-aligned) and the topics each contains.
export interface CourseLevel {
  level: number;
  name: string;
  credential: string; // Certificate II / III / IV (NCQF levels 2/3/4)
  ncqf: number;
  blurb: string;
  topicIds: number[];
}

export const LEVELS: CourseLevel[] = [
  {
    level: 1, name: "Foundation", credential: "Certificate II", ncqf: 2,
    blurb: "Recognise when care is needed, understand everyday tasks, and prepare for the caregiver role.",
    topicIds: [1, 2, 3, 5],
  },
  {
    level: 2, name: "Core Caregiving", credential: "Certificate III", ncqf: 3,
    blurb: "Organise care, build a plan, and perform infection control and core procedures safely.",
    topicIds: [4, 6, 7, 8, 9],
  },
  {
    level: 3, name: "Complex & Compassionate Care", credential: "Certificate IV", ncqf: 4,
    blurb: "Provide palliative care, protect caregiver wellbeing, and mobilise support systems.",
    topicIds: [10, 11, 12],
  },
];

export const levelForTopicId = (id: number) => LEVELS.find((l) => l.topicIds.includes(id));
