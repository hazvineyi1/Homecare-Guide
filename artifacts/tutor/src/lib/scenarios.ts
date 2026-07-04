// Multiple selectable scenarios per topic. The learner picks one when they
// start a topic; the chosen `text` is passed to Nurse Mooka as the seed
// situation (she then localises names, places and details to the learner's
// country). `art` maps to a relatable illustration in ScenarioArt.

export type ArtKey =
  | "mail" | "meal" | "phone" | "medication" | "fall" | "hygiene" | "mobility"
  | "heart" | "family" | "calendar" | "bed" | "support" | "document" | "wound"
  | "alert" | "breathing" | "money" | "memory" | "lifting";

export interface Scenario {
  id: string;
  title: string;
  text: string;
  art: ArtKey;
}

export const SCENARIOS: Record<number, Scenario[]> = {
  1: [
    { id: "t1a", title: "The unopened mail", art: "mail", text: "a relative you visit weekly whose bills are unpaid, whose hygiene has slipped, and who insists nothing is wrong" },
    { id: "t1b", title: "The empty fridge", art: "meal", text: "your father, who has lost weight, whose fridge is nearly empty, and who cannot remember whether he ate today" },
    { id: "t1c", title: "The closed curtains", art: "phone", text: "a neighbour who lives alone, has stopped answering her phone, and keeps her curtains closed all day" },
    { id: "t1d", title: "The scattered pills", art: "medication", text: "your mother, who keeps missing her medicines, with pills you find scattered on the kitchen table" },
    { id: "t1e", title: "The small falls", art: "fall", text: "an uncle who has had two small falls this month but keeps brushing them off as clumsiness" },
  ],
  2: [
    { id: "t2a", title: "Ashamed to be bathed", art: "hygiene", text: "the person you care for, who now needs help bathing but feels ashamed and refuses your help" },
    { id: "t2b", title: "Dressing takes an hour", art: "mobility", text: "your grandmother, who can still dress herself but takes an hour and is left exhausted" },
    { id: "t2c", title: "Buttons and zips", art: "heart", text: "your husband, who can no longer manage the buttons and zips he used to, and is frustrated by it" },
    { id: "t2d", title: "Reaching the toilet", art: "hygiene", text: "a relative for whom getting to the toilet in time has become difficult, and who is too embarrassed to mention it" },
    { id: "t2e", title: "Still wants to cook", art: "meal", text: "your relative, who wants to keep cooking for themselves, while you worry about the stove being left on" },
  ],
  3: [
    { id: "t3a", title: "Where do I begin?", art: "heart", text: "yourself, having just agreed to care for your ailing mother, not knowing where to begin" },
    { id: "t3b", title: "Because you live closest", art: "family", text: "your siblings, who assume you will do everything because you live closest to your parent" },
    { id: "t3c", title: "Job and caring", art: "calendar", text: "yourself, balancing a full-time job with caring for your father, feeling stretched thin" },
    { id: "t3d", title: "Discharged next week", art: "bed", text: "a relative the hospital is discharging next week, expecting the home to be ready" },
    { id: "t3e", title: "What can I manage?", art: "support", text: "a friend you promised to care for, unsure what you can realistically take on" },
  ],
  4: [
    { id: "t4a", title: "All in your head", art: "calendar", text: "a caring routine where appointments, medicines and meals live only in your head, and things keep slipping" },
    { id: "t4b", title: "Three doctors, many pills", art: "medication", text: "a relative for whom three different doctors have prescribed medicines, and you are unsure how they fit together" },
    { id: "t4c", title: "Missed or double doses", art: "medication", text: "a person who takes several pills a day, where you worry about missed or double doses" },
    { id: "t4d", title: "Everyone wants updates", art: "phone", text: "family members who keep asking for updates, leaving you repeating yourself all day" },
    { id: "t4e", title: "Piles of paper", art: "document", text: "bills, prescriptions and letters piling up, so you can never find what you need" },
  ],
  5: [
    { id: "t5a", title: "Taking a temperature", art: "alert", text: "being asked to check the person's temperature and being unsure you are doing it correctly" },
    { id: "t5b", title: "Red skin where they sit", art: "wound", text: "a relative whose skin looks red where they sit all day, and you do not know what to watch for" },
    { id: "t5c", title: "Protecting your back", art: "lifting", text: "wanting to help the person move safely while fearing you will hurt your own back" },
    { id: "t5d", title: "What counts as serious?", art: "alert", text: "being told to watch for 'signs', but not being sure what counts as serious enough to act on" },
    { id: "t5e", title: "A sudden change", art: "heart", text: "feeling confident with daily tasks but unsure how you would handle a sudden change in the person" },
  ],
  6: [
    { id: "t6a", title: "A plan anyone can follow", art: "document", text: "wanting a simple plan so anyone helping knows what to do, but not knowing what to include" },
    { id: "t6b", title: "Different days, different carers", art: "family", text: "family who care on different days, where nobody knows what the others did" },
    { id: "t6c", title: "Needs are changing", art: "calendar", text: "a person whose needs are changing, so last month's routine no longer fits" },
    { id: "t6d", title: "Handing over for a weekend", art: "support", text: "arranging respite for a weekend and needing to hand over care clearly" },
    { id: "t6e", title: "Their wishes at the centre", art: "heart", text: "wanting the person's own wishes at the centre of the plan, not just a list of tasks" },
  ],
  7: [
    { id: "t7a", title: "Dressing a wound", art: "wound", text: "a person with a wound to dress, where you are worried about germs and infection" },
    { id: "t7b", title: "A stomach bug at home", art: "hygiene", text: "a stomach bug going round the family while you share one bathroom" },
    { id: "t7c", title: "When to wash your hands", art: "hygiene", text: "being about to help with personal care and being unsure when to wash your hands" },
    { id: "t7d", title: "Soiled laundry", art: "hygiene", text: "soiled laundry piling up, and you are not sure how to handle it safely" },
    { id: "t7e", title: "A visitor with a cough", art: "breathing", text: "a visitor who arrives with a cough while the person you care for is frail" },
  ],
  8: [
    { id: "t8a", title: "A first bed bath", art: "hygiene", text: "needing to give a bed bath for the first time to a person who is nervous about it" },
    { id: "t8b", title: "Helping with meals", art: "meal", text: "a person whom it takes a long time to help eat, and who leaves some of the food" },
    { id: "t8c", title: "Time to reposition", art: "bed", text: "a person who has been in one position for hours, whom you have been told to reposition" },
    { id: "t8d", title: "Mouth care", art: "hygiene", text: "being asked to help with mouth care and not being sure how to start" },
    { id: "t8e", title: "Trouble with tablets", art: "medication", text: "a person who struggles to swallow tablets, leaving you wondering if there is a safer way" },
  ],
  9: [
    { id: "t9a", title: "No bowel movement for days", art: "alert", text: "a person who has not opened their bowels for days and is uncomfortable" },
    { id: "t9b", title: "A reddened hip", art: "wound", text: "a reddened area of skin over the hip that is not fading, which worries you" },
    { id: "t9c", title: "Refusing fluids", art: "meal", text: "a person who keeps refusing fluids, whose mouth you notice is dry" },
    { id: "t9d", title: "A slow-healing cut", art: "wound", text: "a small cut that is slow to heal and looks a little angry" },
    { id: "t9e", title: "More confused today", art: "memory", text: "a person who seems more confused today than usual, and you are unsure why" },
  ],
  10: [
    { id: "t10a", title: "Comfort near the end", art: "heart", text: "a relative nearing the end of life, whom you want to keep comfortable" },
    { id: "t10b", title: "Judging their pain", art: "alert", text: "a person in pain, where you are unsure how to tell how bad it is" },
    { id: "t10c", title: "Family disagree", art: "family", text: "family who disagree about what the dying person would have wanted" },
    { id: "t10d", title: "No longer wants to eat", art: "meal", text: "a person who has stopped wanting to eat, which distresses the family" },
    { id: "t10e", title: "What do I say?", art: "heart", text: "wanting to support the person emotionally near the end, but not knowing what to say" },
  ],
  11: [
    { id: "t11a", title: "Weeks without sleep", art: "heart", text: "yourself, not having slept properly in weeks and snapping at people you love" },
    { id: "t11b", title: "Guilt over rest", art: "heart", text: "yourself, feeling guilty about taking any time for yourself" },
    { id: "t11c", title: "Resentment and shame", art: "heart", text: "yourself, having given up parts of your own life to care, feeling resentful and then ashamed of it" },
    { id: "t11d", title: "Alone with it", art: "support", text: "yourself, as the only one caring, feeling completely alone with it" },
    { id: "t11e", title: "Cannot admit it", art: "heart", text: "yourself, exhausted but unable to admit that you are struggling" },
  ],
  12: [
    { id: "t12a", title: "Who do I ask?", art: "support", text: "suspecting there is help available but not knowing who to ask" },
    { id: "t12b", title: "The hidden costs", art: "money", text: "money that is tight, with caring adding costs you did not expect" },
    { id: "t12c", title: "No one to step in", art: "support", text: "needing a break but having no one to step in" },
    { id: "t12d", title: "Is a group for me?", art: "family", text: "a support group that was suggested, which you are not sure is for you" },
    { id: "t12e", title: "Work keeps breaking", art: "calendar", text: "wanting to keep working while caring keeps interrupting your job" },
  ],
  13: [
    { id: "t13a", title: "Bed to chair", art: "lifting", text: "needing to help the person from bed to chair, fearing you will both fall" },
    { id: "t13b", title: "Slid down the bed", art: "bed", text: "a person who has slid down the bed, whom you are tempted to drag back up" },
    { id: "t13c", title: "Caring alone", art: "lifting", text: "caring alone and being unsure what you can move safely without help" },
    { id: "t13d", title: "A new hoist", art: "mobility", text: "a hoist that has been delivered, which you have never used before" },
    { id: "t13e", title: "Your aching back", art: "lifting", text: "your back already aching, with more lifting still to do today" },
  ],
  14: [
    { id: "t14a", title: "Afraid to walk", art: "fall", text: "a person who has fallen once and is now afraid to walk at all" },
    { id: "t14b", title: "Rugs and clutter", art: "fall", text: "loose rugs and clutter in the hallway where the person walks" },
    { id: "t14c", title: "The dark night trip", art: "fall", text: "a person who gets up at night to the toilet in the dark" },
    { id: "t14d", title: "Dizzy on standing", art: "medication", text: "new medication that seems to make the person dizzy when they stand" },
    { id: "t14e", title: "The stairs, alone", art: "mobility", text: "a person who insists on managing the stairs alone" },
  ],
  15: [
    { id: "t15a", title: "Unexplained bruises", art: "alert", text: "unexplained bruises on the person, and a carer who is quick to explain them away" },
    { id: "t15b", title: "Control of the money", art: "money", text: "a relative who controls all the person's money, while the person seems fearful" },
    { id: "t15c", title: "Withdrawn since a change", art: "heart", text: "a person who has become withdrawn since a new helper started" },
    { id: "t15d", title: "Harsh words overheard", art: "family", text: "overhearing someone speak harshly to the person you care for" },
    { id: "t15e", title: "'Don't tell anyone'", art: "phone", text: "a person who hints that something is wrong but asks you not to tell anyone" },
  ],
  16: [
    { id: "t16a", title: "A fall on your shift", art: "document", text: "a person who had a fall on your shift, where you are unsure what to write down" },
    { id: "t16b", title: "A late medicine", art: "medication", text: "a medication given late, where you wonder whether to report it" },
    { id: "t16c", title: "An injury, unseen", art: "document", text: "an injury you found but did not see happen" },
    { id: "t16d", title: "A near miss", art: "alert", text: "something that nearly went wrong, though no harm was done" },
    { id: "t16e", title: "Afraid to report", art: "document", text: "worrying that reporting an incident will get you into trouble" },
  ],
  17: [
    { id: "t17a", title: "Patchy notes", art: "document", text: "the next carer needing to know what happened today, while your notes are patchy" },
    { id: "t17b", title: "An error in the notes", art: "document", text: "an error you made in the notes, which you are tempted to scribble out" },
    { id: "t17c", title: "A family asks to see", art: "family", text: "a family member who asks to see the records you keep" },
    { id: "t17d", title: "What is worth writing?", art: "document", text: "being unsure what is important enough to write down" },
    { id: "t17e", title: "Facts vs opinions", art: "document", text: "notes that mix facts with opinions, which you want to make clearer" },
  ],
};

export function scenariosFor(topicId: number): Scenario[] {
  return SCENARIOS[topicId] ?? [];
}
