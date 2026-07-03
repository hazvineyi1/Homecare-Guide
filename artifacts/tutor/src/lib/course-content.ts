export interface KnowledgeCheckQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface TopicMeta {
  objectives: string[];
  estMinutes: number;
  takeaways: string[];
  check: KnowledgeCheckQuestion[];
}

export interface GlossaryTerm {
  term: string;
  def: string;
}

export interface Resource {
  title: string;
  detail: string;
}

// Keyed by topic id (1..12). Contains all 12 topics.
export const TOPIC_META: Record<number, TopicMeta> = {
  1: {
    objectives: [
      "Explain what home caregiving is and why many people prefer to be cared for at home",
      "Recognise the early warning signs that a person may need care",
      "Describe the main areas a caregiver should assess when care begins",
    ],
    estMinutes: 10,
    takeaways: [
      "Home caregiving supports a person physically, emotionally, socially and spiritually in their own home.",
      "People often recover better at home and keep more of their independence and control.",
      "Caregiving can start gradually with small tasks or suddenly after a stroke or accident.",
      "Warning signs like unpaid bills, poor hygiene and forgetfulness signal that care may be needed.",
    ],
    check: [
      {
        q: "Why do many people prefer to receive care in their own home?",
        options: [
          "It is always cheaper than any other option and needs no family help",
          "They tend to recover better and keep their independence and control",
          "It removes the need to assess their health or safety",
          "Home care only covers physical tasks, so it is simpler",
        ],
        answer: 1,
        why: "The kb states people recover better at home, stay in control and keep their independence, which is why home care is preferred.",
      },
      {
        q: "Which of these is a warning sign that a relative may need care?",
        options: [
          "A tidy home with all mail opened and sorted",
          "Attending every appointment on time",
          "Unpaid bills, poor hygiene and forgetfulness",
          "Steady weight and well-managed medication",
        ],
        answer: 2,
        why: "The kb lists unopened mail, poor hygiene and forgetfulness among the warning signs that a person may need care.",
      },
    ],
  },
  2: {
    objectives: [
      "Distinguish basic activities of daily living from instrumental activities of daily living",
      "Use observation to spot self-care deficits in a care recipient",
      "Support a person to stay as independent as possible while only assisting what is necessary",
    ],
    estMinutes: 9,
    takeaways: [
      "Basic ADLs cover hygiene, dressing, eating, continence, mobility, communication and transport.",
      "Instrumental ADLs include meal preparation, shopping, housework, medications and finances.",
      "Signs like body odour, poor skin, long nails or unexplained burns point to self-care problems.",
      "A caregiver should encourage maximum independence and assist only what is truly needed.",
    ],
    check: [
      {
        q: "Which of these is an instrumental activity of daily living (IADL)?",
        options: [
          "Bathing and personal hygiene",
          "Dressing oneself",
          "Managing medications and finances",
          "Moving from a bed to a chair",
        ],
        answer: 2,
        why: "The kb classifies managing medications and finances as instrumental ADLs, while hygiene, dressing and transferring are basic ADLs.",
      },
      {
        q: "How much help should a caregiver give with everyday tasks?",
        options: [
          "Take over every task to save time",
          "Encourage maximum independence and assist only what is necessary",
          "Refuse all assistance so the person learns",
          "Only help with finances, never with hygiene",
        ],
        answer: 1,
        why: "The kb says the caregiver should encourage maximum independence and only assist what is necessary.",
      },
    ],
  },
  3: {
    objectives: [
      "Identify the personal strengths linked with caregiver readiness",
      "Work through the practical steps of preparing to take on the caregiver role",
      "Judge your own health and capacity before becoming a primary caregiver",
    ],
    estMinutes: 10,
    takeaways: [
      "Readiness is linked to self-confidence, self-esteem, coping skills and wellbeing.",
      "Preparing means deciding the level of care needed and exploring your options.",
      "A trial period and arranged respite care can make the role more sustainable.",
      "Being prepared reduces caregiver burden and improves the quality of care.",
    ],
    check: [
      {
        q: "Which step helps a person prepare for the caregiver role?",
        options: [
          "Avoid discussing preferences with the recipient",
          "Determine the level and hours of care needed and explore options",
          "Take on the role without assessing your own health",
          "Refuse any support from family or community",
        ],
        answer: 1,
        why: "The kb lists determining the level and hours of care needed and exploring options among the steps to prepare.",
      },
      {
        q: "What is one benefit of being well prepared for caregiving?",
        options: [
          "It guarantees the recipient will never fall ill",
          "It removes the need for any professional help",
          "It reduces caregiver burden and improves care quality",
          "It means legal and financial arrangements can be ignored",
        ],
        answer: 2,
        why: "The kb states that preparedness reduces caregiver burden and improves care quality.",
      },
    ],
  },
  4: {
    objectives: [
      "Set up daily routines that give the care recipient security and independence",
      "Use calendars and lists to coordinate appointments, help and emergencies",
      "Run a safe medication system that records, stores and monitors every drug",
    ],
    estMinutes: 11,
    takeaways: [
      "Doing the same activity at the same time each day builds security and independence.",
      "Morning is usually the recipient's high-energy window for demanding tasks.",
      "A displayed emergency contact list keeps key numbers within reach.",
      "A good medication system records, labels, organises and monitors every drug.",
    ],
    check: [
      {
        q: "Why is keeping a daily routine helpful for the care recipient?",
        options: [
          "It lets the caregiver skip medication records",
          "The same activity at the same time builds security and independence",
          "It means appointments never need a calendar",
          "It replaces the need for balanced meals",
        ],
        answer: 1,
        why: "The kb explains that doing the same basic activity at the same time daily builds security and independence.",
      },
      {
        q: "What should a safe medication system include?",
        options: [
          "Storing all pills loosely in one unlabelled box",
          "Keeping expired drugs in case they are needed later",
          "Recording prescriber, purpose, dosage, frequency and pharmacy",
          "Ignoring possible supplement interactions",
        ],
        answer: 2,
        why: "The kb says the medication system should record the prescriber, purpose, dosage, frequency and pharmacy, and remove expired drugs.",
      },
    ],
  },
  5: {
    objectives: [
      "Explain how a caregiver's knowledge and skills shape the quality of care",
      "Build knowledge about a condition using health professionals and research",
      "Set healthy boundaries and say no appropriately without guilt",
    ],
    estMinutes: 10,
    takeaways: [
      "Quality of care depends on the knowledge and skills the caregiver acquires.",
      "Keen observation matters because patients may hide their problems.",
      "Building knowledge means talking to professionals and keeping an information folder.",
      "Caregivers should balance all their needs and learn to say no appropriately.",
    ],
    check: [
      {
        q: "Why is keen observation an important caregiver quality?",
        options: [
          "Because patients may hide their problems",
          "Because it replaces the need for any medical advice",
          "Because it lets the caregiver avoid all tasks",
          "Because it removes the need for a care plan",
        ],
        answer: 0,
        why: "The kb lists keen observation as a key quality precisely because patients may hide problems.",
      },
      {
        q: "How can a caregiver build the knowledge they need?",
        options: [
          "By avoiding contact with health professionals",
          "By talking to health professionals, researching and keeping an information folder",
          "By relying only on guesswork about the illness",
          "By refusing to learn the care plan or treatment protocol",
        ],
        answer: 1,
        why: "The kb says caregivers build knowledge by talking to health professionals, doing research and keeping an information folder.",
      },
    ],
  },
  6: {
    objectives: [
      "Describe what a home caregiving plan contains and why it is written down",
      "Assess the full range of needs, from personal care to legal documents",
      "Assemble a care team and appoint a coordinator to follow up",
    ],
    estMinutes: 11,
    takeaways: [
      "A caregiving plan schedules routine services around the person's pressing needs.",
      "The plan captures needs, the patient's views, resources, goals and who does what.",
      "Assessment covers personal care, safety, finances, legal documents and lifestyle.",
      "A care team should be assembled and a follow-up coordinator appointed.",
    ],
    check: [
      {
        q: "What should a home caregiving plan contain?",
        options: [
          "Only the caregiver's own preferences",
          "Needs and problems, patient preferences, resources, goals and who provides services",
          "Just a list of medications with no other details",
          "Nothing in writing, to stay flexible",
        ],
        answer: 1,
        why: "The kb states the plan contains needs and problems, patient views, available resources, goals and who provides services.",
      },
      {
        q: "After the plan is made, what helps keep the team on track?",
        options: [
          "Keeping the plan secret from the family",
          "Appointing a follow-up coordinator and using an online platform",
          "Never reassessing the situation",
          "Excluding neighbours and volunteers from any role",
        ],
        answer: 1,
        why: "The kb advises distributing the plan, appointing a follow-up coordinator and using an online communication platform.",
      },
    ],
  },
  7: {
    objectives: [
      "Explain why infection control matters most for elderly and immune-compromised people",
      "Recognise the warning symptoms of a possible infection or sepsis",
      "Apply everyday prevention measures such as handwashing, masks and vaccination",
    ],
    estMinutes: 11,
    takeaways: [
      "Home care clients often have weak immunity, so infection control is critical.",
      "Common infections in the elderly are skin, urinary, influenza and pneumonia.",
      "Sepsis is the body overreacting to infection and can become life-threatening quickly.",
      "Thorough frequent handwashing is a core way to prevent the spread of infection.",
    ],
    check: [
      {
        q: "Which symptoms may signal a possible infection needing attention?",
        options: [
          "Calm mood and a temperature below normal",
          "Confusion, rapid breathing and a temperature of 37.8C or more",
          "Improved appetite and steady breathing",
          "Slow, deep, relaxed breathing with no fever",
        ],
        answer: 1,
        why: "The kb lists confusion, rapid breathing and a temperature of 37.8C or more among the symptoms of a possible infection.",
      },
      {
        q: "What is sepsis, according to the guidance?",
        options: [
          "A mild skin rash that clears on its own",
          "A type of vaccine given to the elderly",
          "The body's overreaction to an infection that can be life-threatening",
          "A method of handwashing",
        ],
        answer: 2,
        why: "The kb defines sepsis as the body's overreaction to an infection that develops quickly and is life-threatening.",
      },
    ],
  },
  8: {
    objectives: [
      "Prepare the room and supplies for a safe, private bed bath",
      "Carry out perineal care and repositioning that protect the skin",
      "Recognise the levels of bed sore and the basic response to each",
    ],
    estMinutes: 12,
    takeaways: [
      "A bed bath needs a warm, private room and the right supplies gathered first.",
      "For women, perineal care is done front to back to help prevent infection.",
      "A person at risk of pressure sores should be repositioned about every two hours.",
      "Bed sore care ranges from cleaning with salty water to light dressings for deep sores.",
    ],
    check: [
      {
        q: "During perineal care for a woman, which direction should you wash?",
        options: [
          "Back to front",
          "Front to back to prevent infection",
          "Side to side only",
          "It does not matter which direction",
        ],
        answer: 1,
        why: "The kb states that for women perineal care is done front to back to prevent infection.",
      },
      {
        q: "How often should a partially dependent person be repositioned to protect the skin?",
        options: [
          "Once a day",
          "Every two hours",
          "Only when they ask",
          "Every ten minutes",
        ],
        answer: 1,
        why: "The kb advises repositioning every two hours and protecting the skin from urine and stool.",
      },
    ],
  },
  9: {
    objectives: [
      "Apply simple home measures for common problems like cough, nausea and dry mouth",
      "Support a confused person with a predictable, calm environment",
      "Recognise when a common problem such as diarrhoea needs a doctor",
    ],
    estMinutes: 11,
    takeaways: [
      "Sitting a patient up, steam, and honey and lemon can ease a cough or breathing.",
      "Sputum is highly infectious, so wear gloves and dispose of it safely.",
      "A confused person is helped by routine, a quiet space and clear communication.",
      "Diarrhoea needs a doctor if there is fever, vomiting, blood, or it lasts five days.",
    ],
    check: [
      {
        q: "When should you seek a doctor for a patient with diarrhoea?",
        options: [
          "Only if it lasts more than a month",
          "If there is fever, vomiting, blood, or it lasts five days",
          "Never, as it always clears on its own",
          "Only if the patient asks for one",
        ],
        answer: 1,
        why: "The kb says to see a doctor for diarrhoea if there is fever, vomiting, blood, or it continues for five days.",
      },
      {
        q: "What helps a confused patient most?",
        options: [
          "Frequent changes to their surroundings",
          "A constant, predictable environment with routines and clear communication",
          "A noisy, busy room",
          "Removing all routines",
        ],
        answer: 1,
        why: "The kb recommends a constant predictable environment, routines at a regular place and time, and clear communication for confusion.",
      },
    ],
  },
  10: {
    objectives: [
      "Explain the aim of palliative care for a person with a terminal illness",
      "Support a patient and family emotionally and spiritually as death approaches",
      "Talk honestly and age-appropriately with children about death",
    ],
    estMinutes: 12,
    takeaways: [
      "Palliative care improves quality of life and controls pain and other symptoms.",
      "Listening and showing understanding helps as the patient works toward acceptance.",
      "Comfort measures include moistening lips, mouth and eyes and turning every two hours.",
      "With children, honesty and age-appropriate language are very important.",
    ],
    check: [
      {
        q: "What is the aim of palliative care?",
        options: [
          "To cure the terminal illness completely",
          "To improve quality of life and control pain and other symptoms",
          "To avoid all contact with the family",
          "To stop caring for the patient at home",
        ],
        answer: 1,
        why: "The kb defines palliative care as total care that improves quality of life and controls pain and other symptoms.",
      },
      {
        q: "How should a caregiver approach talking to children about death?",
        options: [
          "Avoid the subject entirely",
          "Use honesty and age-appropriate language",
          "Give complex medical detail only",
          "Tell them nothing is happening",
        ],
        answer: 1,
        why: "The kb stresses that honesty is very important and that age-appropriate language should be used with children.",
      },
    ],
  },
  11: {
    objectives: [
      "Define caregiver role strain and recognise its warning signs",
      "Apply habits that protect the caregiver's own health and prevent burnout",
      "Use respite options and support groups to share the load",
    ],
    estMinutes: 10,
    takeaways: [
      "Role strain is feeling overwhelmed, followed by stress and anxiety, and is very common.",
      "Signs include poor sleep, irritability, withdrawal, appetite change and crying easily.",
      "Untreated role strain can turn into depression, so self-care matters.",
      "Respite care and support groups help ease the strain of caregiving.",
    ],
    check: [
      {
        q: "Which of these is a warning sign of caregiver role strain?",
        options: [
          "Sleeping well and feeling calm",
          "Sleep problems, irritability, social withdrawal and crying easily",
          "Increased energy and a wide social life",
          "A steady, healthy appetite with no fatigue",
        ],
        answer: 1,
        why: "The kb lists sleep problems, irritability, social withdrawal, appetite change, tiredness and crying easily as signs of role strain.",
      },
      {
        q: "What can help prevent caregiver role strain?",
        options: [
          "Ignoring your own health to do more for the recipient",
          "Getting enough sleep, eating well, exercising and keeping friends",
          "Giving up all exercise and social contact",
          "Never asking anyone for help",
        ],
        answer: 1,
        why: "The kb lists staying in good health, sleep, a balanced diet, daily exercise and keeping friends among ways to prevent role strain.",
      },
    ],
  },
  12: {
    objectives: [
      "Identify community and professional resources that support caregivers",
      "Explain how support groups reduce stress and improve coping",
      "Build a support network across emotional, technical and hands-on help",
    ],
    estMinutes: 10,
    takeaways: [
      "Community services include respite programmes, adult day-care, hospices and nutrition programmes.",
      "Nurses, occupational therapists and social workers can advise on equipment and respite.",
      "Support groups ease life and reduce stress, anxiety and depression.",
      "A caregiver needs a team and cannot do the work alone.",
    ],
    check: [
      {
        q: "What benefit do support groups offer caregivers?",
        options: [
          "They guarantee a cure for the recipient",
          "They ease life and reduce stress, anxiety and depression",
          "They remove the need for any professional help",
          "They replace the whole care team",
        ],
        answer: 1,
        why: "The kb states that support groups ease life and reduce stress, anxiety and depression while improving coping.",
      },
      {
        q: "Which professionals can recommend home modifications and arrange respite?",
        options: [
          "Only the primary caregiver",
          "Community nurses, occupational therapists and social workers",
          "Only long-distance family members",
          "Nobody, as this is not available",
        ],
        answer: 1,
        why: "The kb says community nurses, occupational therapists and social workers recommend home modifications and arrange respite.",
      },
    ],
  },
};

export const COURSE_OUTCOMES: string[] = [
  "By the end of this course you can recognise the warning signs that a person may need care and assess their needs across physical, emotional, social and practical areas.",
  "By the end of this course you can organise routines, calendars and a safe medication system that give the care recipient security and independence.",
  "By the end of this course you can carry out basic care procedures safely, protect the skin, and apply simple remedies for common problems.",
  "By the end of this course you can apply infection-control measures and recognise red-flag symptoms such as signs of sepsis or blood in sputum that need urgent help.",
  "By the end of this course you can protect your own wellbeing, recognise caregiver role strain, and draw on community, professional and support-group resources.",
];

export const GLOSSARY: GlossaryTerm[] = [
  { term: "Home caregiving", def: "Providing care in a person's own home to someone who cannot fully care for themselves physically, emotionally, socially or spiritually." },
  { term: "Activities of daily living (ADLs)", def: "The fundamental routine skills a person needs for independent function, such as hygiene, dressing, eating, continence and mobility." },
  { term: "Instrumental activities of daily living (IADLs)", def: "More complex everyday tasks such as meal preparation, shopping, housework, managing medications and managing finances." },
  { term: "Self-care", def: "The daily behaviours a person uses to promote and maintain health, prevent disease and cope with illness." },
  { term: "Assistive devices", def: "Aids such as bath chairs, pill organisers and walkers that reduce a person's dependence on others." },
  { term: "Caregiver readiness", def: "A caregiver's preparedness for the role, linked to self-confidence, self-esteem, coping skills and wellbeing." },
  { term: "Home caregiving plan", def: "A written plan that schedules routine services around a person's pressing needs and sets out goals, resources and who provides care." },
  { term: "Infection control", def: "The measures, such as handwashing, masks and vaccination, used to prevent the spread of infection to vulnerable people." },
  { term: "Sepsis", def: "The body's overreaction to an infection that develops quickly and can be life-threatening, especially in the elderly." },
  { term: "Bed bath", def: "Washing a person who cannot get out of bed, done in a warm, private room with the right supplies prepared first." },
  { term: "Perineal care", def: "Cleaning the genital and buttock area, done front to back for women to help prevent infection." },
  { term: "Bed sores", def: "Pressure sores on the skin, ranging from mild to deep, that are prevented by repositioning and protecting the skin." },
  { term: "Palliative care", def: "Total care of a person with a terminal illness that improves quality of life and controls pain and other symptoms." },
  { term: "Role strain", def: "The very common state in which a caregiver feels overwhelmed and cannot perform at their best, followed by stress and anxiety." },
];

export const RESOURCES: Resource[] = [
  { title: "Community nurses & home-care agencies", detail: "Community nurses, occupational therapists and social workers can assess needs, recommend home modifications, help choose equipment and arrange assistant caregivers; private home-care agencies can provide non-medical help like housekeeping, meal preparation, companionship and transport." },
  { title: "Respite care & adult day centres", detail: "Respite options include in-home respite, adult care or day-care centres and short-term nursing homes, giving the caregiver a break to rest and protect their own health." },
  { title: "Support groups", detail: "Support groups offer shared experience, problem-solving strategies and meaningful relationships, and can ease life while reducing stress, anxiety and depression." },
  { title: "Legal & financial advisors", detail: "Keep insurance, banking, wills and asset documents together and retrievable, and seek legal and financial help early so arrangements are in place before they are urgently needed." },
  { title: "Nutrition & meal programmes", detail: "Nutrition programmes and meal-delivery services can help ensure the care recipient eats balanced meals, which supports recovery and general wellbeing." },
  { title: "When to seek emergency help", detail: "Seek urgent medical help for red-flag signs such as blood in sputum or trouble breathing, and for possible sepsis shown by confusion, rapid breathing, shaking or a temperature of 37.8C or more; also call a doctor for diarrhoea with fever, vomiting or blood." },
];
