import { KnowledgeCheckQuestion } from "./course-content";

/**
 * Expanded assessment bank: 5 items per topic, including one case-based
 * scenario item each. Every item is grounded in "A Guide to Homecare".
 * Items marked `clinical: true` carry clinical content that must be
 * signed off by a qualified nurse (Dr Mooka) before public release.
 *
 * Pass bar is 70% (see ASSESSMENT_PASS_RATIO), applied in KnowledgeCheck.
 */
export const ASSESSMENT_PASS_RATIO = 0.7;

export const ASSESSMENT: Record<number, KnowledgeCheckQuestion[]> = {
  1: [
    {
      q: "Why do many people prefer to receive care in their own home?",
      options: [
        "It is always cheaper than any other option",
        "They often recover better, stay in control and keep their independence",
        "It removes the need for a medical diagnosis",
        "It means family no longer need to be involved",
      ],
      answer: 1,
      why: "The book explains the aged, disabled and chronically ill often recover better at home, where the care receiver stays in control and keeps a stronger sense of independence.",
    },
    {
      q: "Which of these is a warning sign that a relative may need care?",
      options: [
        "They cook their own meals",
        "They pay their bills on time",
        "Unopened mail, poor hygiene and forgetfulness",
        "They keep all their appointments",
      ],
      answer: 2,
      why: "Unopened mail, poor personal hygiene and forgetfulness are among the signs the book lists that a person may need care.",
    },
    {
      q: "Who most often receives home care?",
      options: [
        "Only new parents",
        "The aged, the disabled, and the acutely or chronically ill",
        "Only people recovering from surgery",
        "Anyone who prefers not to cook",
      ],
      answer: 1,
      why: "The book states those who most often receive home care are the aged, the disabled, and people who are acutely or chronically ill.",
    },
    {
      q: "Before care begins, what should you always obtain?",
      options: [
        "A power of attorney",
        "An accurate diagnosis from a medical doctor",
        "A new home",
        "A paid caregiver",
      ],
      answer: 1,
      why: "The book says to always get an accurate diagnosis from a medical doctor, the condition, its signs and symptoms, treatments, side effects and level of care needed.",
    },
    {
      type: "case",
      scenario:
        "You visit your aunt and notice unpaid bills, prescriptions that were never collected, and a house that has become unkempt.",
      q: "What is the best first step?",
      options: [
        "Immediately move her into a nursing home",
        "Take over all her affairs without discussion",
        "Assess the situation carefully, form a caregiving team and collect her history",
        "Wait until a crisis forces a decision",
      ],
      answer: 2,
      why: "The book's first steps are to assess the situation, form a caregiving team, talk to the care receiver and family, and collect personal and medical history, respecting her wishes throughout.",
    },
  ],
  2: [
    {
      q: "Which of these is an instrumental activity of daily living (IADL)?",
      options: [
        "Bathing",
        "Dressing",
        "Managing medications and finances",
        "Transferring from bed to chair",
      ],
      answer: 2,
      why: "The book classifies managing medications and finances as instrumental ADLs, while hygiene, dressing and transferring are basic ADLs.",
    },
    {
      q: "How much help should a caregiver give with everyday tasks?",
      options: [
        "Do everything for the person to save time",
        "Encourage maximum independence and assist only what is necessary",
        "Only help if asked twice",
        "Refuse to help with personal tasks",
      ],
      answer: 1,
      why: "The book says the caregiver should encourage maximum independence and only assist what is necessary.",
    },
    {
      q: "What does assessing everyday tasks help a caregiver identify?",
      options: [
        "The person's favourite foods",
        "Self-care deficits, what the person can and cannot do",
        "The cheapest care option",
        "Whether the person needs a will",
      ],
      answer: 1,
      why: "Caregivers assess everyday tasks to identify self-care deficits, distinguishing partial ability from total dependence, which then guides the care plan.",
    },
    {
      q: "Which is a sign of a self-care deficit in dressing?",
      options: [
        "Choosing a coat when it is cold",
        "Garments worn too long with a bad odour",
        "Preferring comfortable clothes",
        "Dressing more slowly than before",
      ],
      answer: 1,
      why: "The book lists trouble removing and putting on clothes, and garments worn too long with bad odour, as signs of a dressing self-care deficit.",
    },
    {
      type: "case",
      scenario:
        "Mr. K can wash and dress himself but struggles badly with the buttons and back zips on his shirts, so he sometimes wears the same shirt for days.",
      q: "What is the most appropriate solution?",
      options: [
        "Dress him completely each morning from now on",
        "A minor adjustment, clothes with zips at the front that are easy to fasten",
        "Tell him to stop worrying about clothes",
        "Buy him more shirts with back zips",
      ],
      answer: 1,
      why: "The book notes that often a minor adjustment solves the problem, for example dresses with zips at the front instead of the back, preserving his independence.",
    },
  ],
  3: [
    {
      q: "Who has the biggest say in how care is provided?",
      options: [
        "The primary caregiver",
        "The care recipient",
        "The doctor",
        "The person paying the bills",
      ],
      answer: 1,
      why: "The book states the care recipient has the biggest say in their own care.",
    },
    {
      q: "Caregiver readiness is linked with which of the following?",
      options: [
        "Higher income",
        "Positive emotions such as self-confidence, coping skills and well-being",
        "Living far from the care recipient",
        "Avoiding health professionals",
      ],
      answer: 1,
      why: "The book links caregiver readiness with positive emotions, self-confidence, self-esteem, coping skills and well-being.",
    },
    {
      q: "When should you take part in a discharge plan?",
      options: [
        "A month after the patient comes home",
        "Only if problems arise",
        "Before the patient leaves hospital",
        "Discharge plans are not the caregiver's concern",
      ],
      answer: 2,
      why: "The book advises taking part in a discharge plan before the patient leaves hospital, where the doctor gives the diagnosis and the social worker advises on community resources.",
    },
    {
      q: "If care happens in the same house, what makes a suitable room?",
      options: [
        "An upstairs room far from others",
        "A safe, accessible room, preferably on the ground floor near a kitchen and bathroom",
        "Any spare room, regardless of access",
        "A room without windows to keep it quiet",
      ],
      answer: 1,
      why: "The book recommends choosing a safe, accessible room, preferably on the ground floor near a kitchen and bathroom, and modifying the home with ramps, grab bars and good lighting.",
    },
    {
      type: "case",
      scenario:
        "Your father is reluctant to discuss who will care for him or how, and changes the subject whenever you raise it.",
      q: "What is the best approach?",
      options: [
        "Make all the decisions for him without his input",
        "Drop the subject permanently",
        "Introduce caregiving tactfully and pursue the topic gently until he agrees to plan his care",
        "Insist he decide everything in one conversation",
      ],
      answer: 2,
      why: "The book advises introducing caregiving tactfully and, if the person is reluctant at first, pursuing the topic gently until they agree to plan their care.",
    },
  ],
  4: [
    {
      q: "What is a routine, as described in the book?",
      options: [
        "Doing whatever is needed whenever there is time",
        "Doing the same basic activity at the same time each day",
        "A weekly deep-clean of the house",
        "A list of emergency contacts",
      ],
      answer: 1,
      why: "The book defines a routine as doing the same basic activity at the same time each day, which increases the feeling of security and independence.",
    },
    {
      q: "A helpful way to remember daily medication is to tie it to what?",
      options: [
        "The weather",
        "Breakfast",
        "Television programmes",
        "Visitors arriving",
      ],
      answer: 1,
      why: "The book gives the example that medication can be tied to breakfast as part of a daily routine.",
    },
    {
      q: "What is the purpose of a family caregiving calendar?",
      options: [
        "To record only the caregiver's own tasks",
        "To list every task, send it to the team and let members choose what they can do",
        "To replace the need for a care plan",
        "To track television schedules",
      ],
      answer: 1,
      why: "The book says to list every task on a family caregiving calendar, send it to the team, and let members choose what they can do, since caregiving cannot be done alone.",
    },
    {
      q: "Which is good practice for medication management?",
      options: [
        "Keep all drugs loose in one drawer",
        "Use a pill organiser, store drugs labelled and in order, remove expired drugs and set reminders",
        "Discard the labels to save space",
        "Only reorder once you have completely run out",
      ],
      answer: 1,
      why: "The book advises using a pill organiser, storing drugs well labelled and in order, removing expired drugs, setting reminders and keeping extra supplies.",
    },
    {
      type: "case",
      scenario:
        "Your sister lives in another city and wants to help with your mother's care but cannot be there in person.",
      q: "Which task is best suited to her?",
      options: [
        "Daily bathing and dressing",
        "Hands-off tasks such as managing finances and doing research",
        "Preparing and serving every meal",
        "Nothing, distant family cannot help",
      ],
      answer: 1,
      why: "The book notes long-distance family can manage hands-off tasks like finances and research.",
    },
  ],
  5: [
    {
      q: "According to the book, the quality of care provided depends mainly on what?",
      options: [
        "How much money is available",
        "What the caregiver has learnt",
        "The size of the house",
        "The number of relatives nearby",
      ],
      answer: 1,
      why: "The book states the quality of care provided depends on what the caregiver has learnt, knowledge of the disease, its prognosis, care plans and treatment.",
    },
    {
      q: "Communication in caregiving is described as?",
      options: [
        "Only about giving instructions",
        "Not only what you say but how you say it",
        "Unimportant if care is good",
        "Best kept to a minimum",
      ],
      answer: 1,
      why: "The book says communication is not only what you say but how you say it that determines how the message is received.",
    },
    {
      q: "What does the quality of 'keen observation' involve?",
      options: [
        "Watching television with the patient",
        "Spotting when something is not right and reporting it to health personnel",
        "Keeping detailed financial records",
        "Observing visiting hours",
      ],
      answer: 1,
      why: "The book describes keen observation as spotting when something is not right and reporting it to health personnel.",
    },
    {
      q: "Why is it important to set boundaries and learn to say no?",
      options: [
        "To avoid doing any personal care",
        "Because where there are no boundaries the caregiver falls into serious emotional burnout",
        "To reduce the care recipient's independence",
        "So the caregiver can stop learning",
      ],
      answer: 1,
      why: "The book warns that where there are no boundaries the caregiver falls into serious emotional burnout, so balance your needs, set boundaries and learn to say no.",
    },
    {
      type: "case",
      scenario:
        "The doctor asks you to give injections and change a wound dressing at home, procedures you have never done before.",
      q: "What should you do?",
      options: [
        "Attempt them from memory of watching once",
        "Get training from health professionals before performing these complex procedures",
        "Refuse to be involved in care at all",
        "Ask a neighbour to guess the method",
      ],
      answer: 1,
      why: "The book advises getting training from health professionals on complex procedures such as injections, dressings and checking blood pressure.",
    },
  ],
  6: [
    {
      q: "What is a home caregiving plan?",
      options: [
        "A list of the caregiver's personal goals",
        "A schedule of routine services organised at home to meet the care recipient's pressing needs",
        "A legal will",
        "A hospital discharge form",
      ],
      answer: 1,
      why: "The book defines a home caregiving plan as a schedule of routine services organised at home to meet pressing needs such as feeding, dressing, toileting and medication management.",
    },
    {
      q: "When grouping the caregiving team, 'hands-off' members are best suited to?",
      options: [
        "Direct personal care like bathing",
        "Finances or errands",
        "Medical procedures",
        "Nothing useful",
      ],
      answer: 1,
      why: "The book groups team members as hands-on (comfortable giving direct care) or hands-off (better suited to finances or errands).",
    },
    {
      q: "When you take the patient to the doctor, what should you do?",
      options: [
        "Wait outside and let them attend alone",
        "Introduce yourself as the primary caregiver and ask for a briefing on disease progress",
        "Speak only about your own concerns",
        "Avoid asking questions",
      ],
      answer: 1,
      why: "The book advises introducing yourself as the primary caregiver, asking for a briefing on disease progress, involving the patient and acting as their advocate.",
    },
    {
      q: "Why should the care plan be reviewed regularly?",
      options: [
        "Plans never need changing",
        "Because needs change and roles are clarified over time",
        "To make more paperwork",
        "Only to satisfy the doctor",
      ],
      answer: 1,
      why: "The book says to review the plan as needs change and roles are clarified, and to watch for signals that new care or support may be needed.",
    },
    {
      type: "case",
      scenario:
        "Your client is steadily losing weight because meals are being missed during the day.",
      q: "Which is a workable solution the book suggests?",
      options: [
        "Stop weighing the client",
        "A family member volunteers to bring meals at set times",
        "Reduce the number of meals",
        "Wait to see if weight returns on its own",
      ],
      answer: 1,
      why: "The book gives exactly this example: if the client is losing weight, a family member volunteers to bring meals at set times.",
    },
  ],
  7: [
    {
      clinical: true,
      q: "Which temperature is given as a sign of infection?",
      options: [
        "35.0 degrees Celsius or less",
        "36.5 degrees Celsius",
        "37.8 degrees Celsius or more",
        "Any temperature above 40 degrees only",
      ],
      answer: 2,
      why: "The book lists a temperature of 37.8 degrees Celsius or more, along with agitation, confusion, rapid breathing and shaking, as signs of infection.",
    },
    {
      clinical: true,
      q: "What are the main infection concerns among the elderly?",
      options: [
        "Broken bones and sprains",
        "Skin infections, urinary tract infections, influenza and pneumonia",
        "Only the common cold",
        "Dental cavities",
      ],
      answer: 1,
      why: "The book names skin infections, urinary tract infections, influenza and pneumonia as the main concerns among the elderly.",
    },
    {
      clinical: true,
      q: "What is sepsis?",
      options: [
        "A mild seasonal allergy",
        "An overreaction of the body to an infection that advances quickly and is life-threatening",
        "A type of vaccine",
        "A harmless skin rash",
      ],
      answer: 1,
      why: "The book describes sepsis as an overreaction of the body to an infection that advances quickly, is life-threatening, and which the elderly often do not survive.",
    },
    {
      clinical: true,
      q: "Hand sanitiser should contain at least how much alcohol?",
      options: ["20 percent", "40 percent", "60 percent", "90 percent minimum"],
      answer: 2,
      why: "The book advises washing hands often with soap and water, or sanitiser that is at least 60 percent alcohol.",
    },
    {
      type: "case",
      clinical: true,
      scenario:
        "A relative has tested positive for Covid-19 and you need to isolate and care for them safely at home.",
      q: "Which set of measures matches the book's guidance?",
      options: [
        "Share a bathroom and keep windows closed",
        "Prepare a room (preferably with its own toilet), keep one to two metres' distance, and keep the room well ventilated",
        "Stay in the same room continuously without a mask",
        "Move them straight into the caregiver's bed",
      ],
      answer: 1,
      why: "The book says to prepare an isolation room preferably with its own toilet, keep a distance of one to two metres, wear a mask, and keep the room well ventilated.",
    },
  ],
  8: [
    {
      clinical: true,
      q: "During perineal care, in which direction should a woman be washed?",
      options: ["Back to front", "Front to back", "Direction does not matter", "Only side to side"],
      answer: 1,
      why: "The book instructs washing women from front to back during perineal care (and men around the testicles and between the buttocks).",
    },
    {
      clinical: true,
      q: "To help prevent pressure sores, how often should a bedridden person's position be changed?",
      options: ["Once a day", "Every two hours", "Only when uncomfortable", "Every twelve hours"],
      answer: 1,
      why: "The book says to change position every two hours and to lift rather than drag to avoid breaking the skin, watching the back, hips and shoulders for colour change.",
    },
    {
      clinical: true,
      q: "During a bed bath, how should the eyes be cleaned?",
      options: [
        "With plenty of soap",
        "From the inner corner without soap",
        "From the outer corner with a rough cloth",
        "They should not be touched",
      ],
      answer: 1,
      why: "The book says to wipe each eyelid from the inner corner without soap before washing the face, neck and ears.",
    },
    {
      clinical: true,
      q: "To prevent dizziness and falls, what should a person do before standing?",
      options: [
        "Stand up as quickly as possible",
        "Sit and dangle their legs first",
        "Skip standing altogether",
        "Hold their breath",
      ],
      answer: 1,
      why: "The book advises encouraging the person to sit and dangle their legs before standing to prevent dizziness and falls.",
    },
    {
      type: "case",
      clinical: true,
      scenario:
        "You are changing the diaper of a bedridden adult who cannot move themselves.",
      q: "Which sequence follows the book's method?",
      options: [
        "Change it standing, without gloves, cleaning back to front",
        "Wear gloves, roll the patient to remove the soiled diaper, clean front to back, check for pressure sores and turn the patient every two hours",
        "Leave the diaper until the next scheduled bath",
        "Clean quickly without checking the skin",
      ],
      answer: 1,
      why: "The book says to wear gloves, roll the patient to remove the soiled diaper, clean front to back, check for pressure sores, and turn the patient every two hours.",
    },
  ],
  9: [
    {
      clinical: true,
      q: "For diarrhoea, when should the doctor be seen?",
      options: [
        "Never, it always passes on its own",
        "If there is fever, vomiting, blood in the stools, or diarrhoea lasting five days",
        "Only after two weeks",
        "Only if the person refuses fluids",
      ],
      answer: 1,
      why: "The book says to increase fluids and give oral rehydration solution, but to see the doctor if there is fever, vomiting, blood in the stools, or diarrhoea lasting five days.",
    },
    {
      clinical: true,
      q: "How can a simple cough be soothed at home?",
      options: [
        "With honey and lemon, and steam with menthol and eucalyptus",
        "By withholding all fluids",
        "By lying the person flat",
        "By keeping windows tightly shut",
      ],
      answer: 0,
      why: "The book suggests soothing a simple cough with honey and lemon, steaming with menthol and eucalyptus, and helping the patient sit up with extra pillows.",
    },
    {
      clinical: true,
      q: "Why should sputum be handled with gloves and disposed of safely?",
      options: [
        "It stains clothing",
        "It can be highly infectious",
        "It is required by law only",
        "To keep it for testing",
      ],
      answer: 1,
      why: "The book warns that sputum can be highly infectious, so handle it with gloves and dispose of it safely; refer if there is blood in the sputum.",
    },
    {
      clinical: true,
      q: "What helps most when caring for a confused patient?",
      options: [
        "Frequently changing their room and caregiver",
        "A constant, predictable environment with everyday items within reach and dangerous objects removed",
        "Leaving them to manage alone",
        "Speaking quickly and at length",
      ],
      answer: 1,
      why: "The book advises keeping a constant, predictable environment, everyday items within easy reach, removing dangerous objects, communicating clearly and avoiding changes of caregiver or surroundings.",
    },
    {
      type: "case",
      clinical: true,
      scenario:
        "A patient has painful mouth ulcers and finds swallowing difficult.",
      q: "What does the book recommend?",
      options: [
        "Offer hot, spicy foods to stimulate appetite",
        "Avoid extremes of hot, cold or spicy food, offer soft foods such as potatoes, milk, honey or porridge, and refer if there are persistent sores or difficulty swallowing",
        "Withhold all food until it heals",
        "Give only very cold, acidic drinks",
      ],
      answer: 1,
      why: "The book says to avoid extremes of hot, cold or spicy food, clean the mouth gently, offer soft foods such as potatoes, milk, honey or porridge, and refer if there are persistent sores, a smelly mouth or difficulty swallowing.",
    },
  ],
  10: [
    {
      q: "What is the focus of palliative care?",
      options: [
        "Curing the illness at any cost",
        "Comfort, dignity and quality of life rather than cure",
        "Reducing the cost of treatment",
        "Keeping the patient in hospital",
      ],
      answer: 1,
      why: "The book explains palliative care improves quality of life when someone is terminally ill; the focus is not on cure but on comfort, dignity and quality of life.",
    },
    {
      q: "Near the end of life, which emotional stages might the patient move through?",
      options: [
        "Only happiness",
        "Fear, anger, sadness and eventually acceptance",
        "No emotions at all",
        "Only confusion",
      ],
      answer: 1,
      why: "The book says to expect the patient to move through fear, anger, sadness and eventually acceptance, with the caregiver listening and showing understanding.",
    },
    {
      clinical: true,
      q: "In end-of-life comfort care, how often should the patient be turned?",
      options: ["Once a day", "Every two hours", "Only at night", "Only when awake"],
      answer: 1,
      why: "The book lists keeping the patient clean and turning them every two hours, and moistening the lips, mouth and eyes, as part of practical end-of-life care.",
    },
    {
      q: "How should death be discussed with children?",
      options: [
        "Avoid the subject entirely",
        "With honesty, using age-appropriate language and examples",
        "With complex medical detail",
        "By telling them nothing is wrong",
      ],
      answer: 1,
      why: "The book advises honesty and care, asking what children already know, using age-appropriate language and examples, and describing death as a normal stage of life.",
    },
    {
      type: "case",
      scenario:
        "After a bereavement, a caregiver is grieving and struggling with sleep and low mood.",
      q: "Which coping approach does the book recommend?",
      options: [
        "Rely on alcohol to cope",
        "Look for people who care such as relatives and support groups, express feelings, avoid drugs and alcohol, and aim to accept the loss",
        "Keep all feelings hidden",
        "Avoid everyone until it passes",
      ],
      answer: 1,
      why: "The book advises looking for people who care such as relatives and support groups, expressing feelings by talking to others, avoiding reliance on drugs and alcohol, and accepting what has happened as part of life.",
    },
  ],
  11: [
    {
      q: "What is caregiver strain?",
      options: [
        "A minor muscle injury",
        "Feeling overwhelmed and no longer able to perform to your best, followed by stress and anxiety",
        "A financial term",
        "A type of medication",
      ],
      answer: 1,
      why: "The book defines strain as being experienced when a caregiver feels overwhelmed and can no longer perform to the best of their ability, followed by stress and anxiety.",
    },
    {
      q: "Which are signs of caregiver role stress?",
      options: [
        "Improved sleep and energy",
        "Sleep problems, irritability, social withdrawal, appetite change, tiredness and crying easily",
        "Increased appetite only",
        "No noticeable signs",
      ],
      answer: 1,
      why: "The book lists sleep problems, irritability, social withdrawal, a change in appetite, tiredness and crying easily as signs of role stress.",
    },
    {
      q: "How much sleep does the book say is essential for the caregiver?",
      options: ["Four hours", "Six hours", "Eight hours", "As little as possible"],
      answer: 2,
      why: "The book states caregivers should get adequate sleep, eight hours is essential, to stay healthy enough to look after the care recipient.",
    },
    {
      q: "Who is at greater risk of caregiver stress?",
      options: [
        "Those who take regular breaks and socialise often",
        "Those who live with the care recipient, socialise little, are already depressed, face financial problems, or give care for long hours",
        "Only paid professional caregivers",
        "Those who share the work with a team",
      ],
      answer: 1,
      why: "The book says caregivers at greater risk are those who live with the care recipient, socialise little, are already depressed, face financial problems, give care for long hours, or lack coping skills.",
    },
    {
      type: "case",
      scenario:
        "The care recipient has been uncooperative all morning and you feel a surge of anger.",
      q: "What is a healthy way to respond?",
      options: [
        "Bottle it up and carry on",
        "Cool down, find a reasonable way to express what happened, and talk to someone",
        "Take it out on the care recipient",
        "Quit caregiving on the spot",
      ],
      answer: 1,
      why: "For anger and frustration when the care recipient is uncooperative, the book advises cooling down, finding a reasonable way to express what happened, and talking to someone.",
    },
  ],
  12: [
    {
      q: "Who can recommend modifications and help choose equipment for caregiving?",
      options: [
        "Only a lawyer",
        "A community nurse, occupational therapist or social worker",
        "Only the care recipient",
        "A grocery store",
      ],
      answer: 1,
      why: "The book says a community nurse, occupational therapist or social worker can recommend home modifications, help choose equipment and arrange respite care.",
    },
    {
      q: "Which is a benefit of caregiver support groups?",
      options: [
        "They replace the need for any care plan",
        "You do not suffer alone, and stress, anxiety and depression are reduced",
        "They provide free medication",
        "They remove all caregiving duties",
      ],
      answer: 1,
      why: "The book lists that in a support group you do not suffer alone, stress, anxiety and depression are reduced, and you gain a sense of empowerment and improved coping.",
    },
    {
      q: "Non-medical home care services include which of the following?",
      options: [
        "Surgery and injections",
        "Housekeeping, meal preparation, companionship, transport and home modifications",
        "Prescribing medication",
        "Diagnosing illness",
      ],
      answer: 1,
      why: "The book describes non-medical home care as housekeeping, meal preparation, companionship, transport to appointments, and home modifications like rails, ramps and bath fixtures.",
    },
    {
      q: "The book organises a caregiver's needs into which three groups?",
      options: [
        "Past, present and future",
        "Emotional, technical and physical needs",
        "Morning, afternoon and evening",
        "Legal, medical and financial",
      ],
      answer: 1,
      why: "The book organises needs into three groups: emotional needs, technical assistance, and physical needs.",
    },
    {
      type: "case",
      scenario:
        "A primary caregiver is exhausted and has had no time off for weeks.",
      q: "Which service is designed to give them a break?",
      options: [
        "A private medical laboratory",
        "Respite care or an adult day-care centre",
        "A grocery delivery only",
        "A financial advisor",
      ],
      answer: 1,
      why: "The book explains respite care and adult day-care centres give the primary caregiver the breaks every caregiver needs.",
    },
  ],
};
