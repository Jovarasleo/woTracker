import { type ReactNode } from "react";
import { type Translations } from "./en";
import { rich } from "./rich";

/**
 * Lithuanian noun form for a count: 1, 21 → `one` ("pratimas"); 2–9, 22–29 →
 * `few` ("pratimai"); 0, 10–20, 30 → `many` ("pratimų").
 */
const nounForm = (count: number, one: string, few: string, many: string) => {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  const teen = lastTwo >= 11 && lastTwo <= 19;

  if (lastDigit === 1 && !teen) {
    return one;
  }

  return lastDigit >= 2 && !teen ? few : many;
};

const plural = (count: number, one: string, few: string, many: string) =>
  `${count} ${nounForm(count, one, few, many)}`;

export const lt: Translations = {
  common: {
    add: "Pridėti",
    addExercise: "Pridėti pratimą",
    back: "Atgal",
    cancel: "Atšaukti",
    cardio: "Kardio",
    custom: "Savas",
    delete: "Ištrinti",
    dismiss: "Uždaryti",
    done: "Baigta",
    edit: "Redaguoti",
    exercises: "Pratimai",
    goHome: "Į pradžią",
    ok: "Gerai",
    removeExercise: "Pašalinti pratimą",
    save: "Išsaugoti",
    strength: "Jėgos",
    undo: "Anuliuoti",
    workoutName: "Treniruotės pavadinimas",
    exerciseCount: (count: number) =>
      plural(count, "pratimas", "pratimai", "pratimų"),
    duration: (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;

      if (!hours) {
        return `${rest} min`;
      }

      return rest ? `${hours} val. ${rest} min` : `${hours} val.`;
    },
  },

  home: {
    newWorkout: "Nauja treniruotė",
    workoutInProgress: "Vyksta treniruotė",
    activeSessionSummary: (duration: string, exerciseCount: number) =>
      `${duration} · ${plural(exerciseCount, "pratimas", "pratimai", "pratimų")}`,
    greeting: {
      lateNight: "Vėlyva treniruotė?",
      morning: "Labas rytas",
      afternoon: "Laba diena",
      evening: "Labas vakaras",
    },
  },

  sidePanel: {
    title: "Meniu",
    open: "Atidaryti meniu",
    close: "Uždaryti meniu",
    language: "Kalba",
  },

  backup: {
    menuButton: "Atsarginė kopija ir atkūrimas",
    menuLabel: "Atsarginė kopija",
    export: "Eksportuoti duomenis",
    import: "Importuoti duomenis",
    feedbackTitle: "Atsarginė kopija",
    restoreTitle: "Atkurti atsarginę kopiją?",
    replaceData: "Pakeisti duomenis",
    unknownDate: "nežinomu laiku",
    restoreWarning: (all: (text: string) => ReactNode, date: string) =>
      rich(
        "Tai pakeis ",
        all("visas"),
        ` dabartines treniruotes, sesijas ir serijas atsargine kopija, sukurta ${date}. Prieš tai dabartiniai duomenys bus atsisiųsti kaip failas.`,
      ),
    tableCount: (table: string, count: number) => `${table}: ${count}`,
    exported: (counts: string) => `Atsarginė kopija atsisiųsta (${counts}).`,
    exportFailed: (error: string) => `Eksportuoti nepavyko: ${error}`,
    restored:
      "Atsarginė kopija atkurta. Ankstesni duomenys atsisiųsti kaip wotracker-before-import.",
    importFailed: (error: string) =>
      `Importuoti nepavyko, duomenys nepakeisti: ${error}`,
    errors: {
      invalidJson: "Šis failas nėra tinkamas JSON.",
      notABackup: "Šis failas nėra woTracker atsarginė kopija.",
      otherApp: "Šią atsarginę kopiją sukūrė kita programa.",
      newerVersion:
        "Šią atsarginę kopiją sukūrė naujesnė programos versija. Atnaujinkite programą ir bandykite dar kartą.",
      malformedTable: (table: string) =>
        `Lentelė „${table}“ šioje atsarginėje kopijoje yra sugadinta.`,
      noData: "Šioje atsarginėje kopijoje nėra woTracker duomenų.",
    },
  },

  stats: {
    sectionLabel: "Treniruočių statistika",
    thisWeek: "Ši savaitė",
    thisMonth: "Šis mėnuo",
    sessionsLogged: "užregistruota sesijų",
    weekStreak: "Savaičių serija",
    weeksInARow: (count: number) =>
      `${nounForm(count, "savaitė", "savaitės", "savaičių")} iš eilės`,
    allTime: "Iš viso",
    totalSessions: "visos sesijos",
    weekdayLetters: ["P", "A", "T", "K", "P", "Š", "S"],
    weekdayNames: [
      "Pirmadienis",
      "Antradienis",
      "Trečiadienis",
      "Ketvirtadienis",
      "Penktadienis",
      "Šeštadienis",
      "Sekmadienis",
    ],
  },

  relativeDay: {
    today: "Šiandien",
    yesterday: "Vakar",
    daysAgo: (days: number) => `Prieš ${days} d.`,
    lastWeek: "Praėjusią savaitę",
    weeksAgo: (weeks: number) => `Prieš ${weeks} sav.`,
  },

  templates: {
    heading: "Treniruotės",
    quickWorkout: "Greita treniruotė",
    emptyTitle: "Treniruočių dar nėra",
    emptyText:
      "Sukurkite treniruotės šabloną, kad galėtumėte registruoti sesijas, arba iškart pradėkite greitą treniruotę.",
    createWorkout: "Sukurti treniruotę",
    notDoneYet: "Dar neatlikta",
    openWorkout: "Atidaryti treniruotę",
    options: (name: string) => `${name}: parinktys`,
    deleteTitle: "Ištrinti treniruotės šabloną?",
    deleteWarning: (name: ReactNode) =>
      rich(
        name,
        " ir jos pratimų sąrašas bus pašalinti. Jau užregistruotos sesijos išliks.",
      ),
  },

  templateForm: {
    newTitle: "Nauja treniruotė",
    editTitle: "Redaguoti treniruotę",
    addExerciseTitle: "Pridėti pratimą į šį šabloną",
    indicatorColor: "Žymos spalva",
    indicatorColorDescription: "Rodoma kaip spalvota šios treniruotės žyma",
    noExercises: "Pratimų dar nėra.",
    exerciseNumber: (number: number) => `Pratimas ${number}`,
    needsOneExercise: "Treniruotėje turi būti bent vienas pratimas",
    errors: {
      noExercises: "Pridėkite bent vieną pratimą",
      exerciseNameRequired: "Įveskite pratimo pavadinimą",
      nameRequired: "Įveskite treniruotės pavadinimą",
      nameTooLong: (max: number) =>
        `Pavadinimas turi būti trumpesnis nei ${max} simbolių`,
      nameTaken: "Treniruotė tokiu pavadinimu jau yra",
    },
  },

  workout: {
    loading: "Įkeliama treniruotė",
    lastPerformed: (date: string) => `Paskutinį kartą atlikta ${date}`,
    notPerformedYet: "Dar neatlikta",
    sessionCount: (count: number) =>
      plural(count, "sesija", "sesijos", "sesijų"),
    startSession: "Pradėti sesiją",
  },

  session: {
    quickWorkoutName: "Greita treniruotė",
    loading: "Įkeliama sesija",
    notFoundTitle: "Sesija nerasta",
    notFound: "Šios sesijos nėra. Galbūt ji buvo ištrinta.",
    finishWorkout: "Baigti treniruotę",
    resumeWorkout: "Tęsti treniruotę",
    finishedAfter: (duration: string) => `Baigta · ${duration}`,
    editFinishTime: "Keisti pabaigos laiką",
    finishTime: "Pabaigos laikas",
    startedAt: (time: string) => `Pradėta ${time}`,
    errors: {
      finishTimeRequired: "Įveskite pabaigos laiką",
      finishTimeInFuture: "Pabaigos laikas negali būti ateityje",
    },
    saveAsTemplate: "Išsaugoti kaip šabloną",
    saveAsTemplateText: (exerciseCount: number) =>
      `Šios sesijos pratimai (${exerciseCount}) bus išsaugoti kaip treniruotė, kurią galėsite pradėti iš naujo.`,
    deleteSession: "Ištrinti sesiją",
    deleteTitle: "Ištrinti sesiją?",
    deleteWarning: (name: ReactNode, date: string) =>
      rich(
        name,
        ` (${date}) ir visos jos užregistruotos serijos bus pašalintos. To atšaukti nebus galima.`,
      ),
    noExercises: "Pratimų dar nėra. Pridėkite pirmąjį ir pradėkite registruoti.",
    addExerciseTitle: "Pridėti pratimą į šią sesiją",
    exerciseRemoved: (name: string) => `${name} pašalintas`,
    setRemoved: (name: string, position: number) =>
      position
        ? `${name} · ${position} serija pašalinta`
        : `${name} · serija pašalinta`,
  },

  sessionHistory: {
    sectionLabel: "Sesijų istorija",
    heading: "Istorija",
    emptyText: "Užregistruotos sesijos bus rodomos čia ir kalendoriuje.",
    recentSessions: "Naujausios sesijos",
  },

  sets: {
    weight: "Svoris",
    reps: "Kartojimai",
    addSet: "Serija",
    editSet: "Redaguoti seriją",
    confirmSet: "Patvirtinti seriją",
    removeSet: "Pašalinti seriją",
    cantRemoveOnlySet:
      "Vienintelės serijos pašalinti negalima; pašalinkite pratimą",
    lastTime: "Praėjusį kartą",
    lastTimeOn: (date: string) => `Praėjusį kartą: ${date}`,
  },

  cardio: {
    duration: "Trukmė (min)",
    distance: "Atstumas (km)",
    calories: "kcal",
    heartRate: "Pulsas (k./min)",
    rpe: "RPE (1–10)",
    edit: "Redaguoti kardio",
    confirm: "Patvirtinti kardio",
    pace: (pace: string) => `Tempas ${pace}`,
    paceValue: (minutes: number, seconds: string) => `${minutes}:${seconds}/km`,
    summary: {
      duration: (minutes: number) => `${minutes} min`,
      distance: (km: number) => `${km} km`,
      calories: (kcal: number) => `${kcal} kcal`,
      heartRate: (bpm: number) => `${bpm} k./min`,
      rpe: (rpe: number) => `RPE ${rpe}`,
    },
  },

  restTimer: {
    rest: "Poilsis",
    restOver: "Poilsis baigėsi",
    restFor: "Ilsėtis",
    stop: "Sustabdyti",
    addSeconds: (seconds: number) => `${seconds} s`,
    runningLabel: (remaining: string) => `Poilsio laikmatis, liko ${remaining}`,
    finishedLabel: "Poilsis baigėsi, pradėti naują poilsio laikmatį",
    startLabel: "Pradėti poilsio laikmatį",
    notificationBody: "Laikas kitai serijai.",
  },

  exercise: {
    library: "Biblioteka",
    search: "Ieškoti pratimų",
    allMuscles: "Visi raumenys",
    showingSome: (shown: number, total: number) =>
      `Rodoma ${shown} iš ${total} — patikslinkite paiešką, kad pamatytumėte daugiau`,
    noneFound: "Pratimų nerasta",
    createCustom: "Sukurti savą pratimą",
    showDetails: (name: string) => `${name} — rodyti pratimo informaciją`,
    muscles: "Raumenys:",
    imageAlt: (name: string, step: number) => `${name} — ${step} žingsnis`,
    form: {
      name: "Pratimo pavadinimas",
      nameTaken: "Pratimas tokiu pavadinimu jau yra bibliotekoje",
      type: "Tipas",
      strengthDescription: "Registruojama serijomis: svoris × kartojimai",
      cardioDescription: "Registruojama trukmė ir atstumas",
      primaryMuscle: "Pagrindinis raumuo",
      optional: "Neprivaloma",
      equipment: "Įranga",
      equipmentStrengthPlaceholder: "Neprivaloma, pvz., hantelis",
      equipmentCardioPlaceholder: "Neprivaloma, pvz., bėgimo takelis",
      description: "Aprašymas",
      descriptionPlaceholder: "Neprivalomos pastabos, kaip jį atlikti",
      submit: "Sukurti ir pridėti",
    },
  },
};
