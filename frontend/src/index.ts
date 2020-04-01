import log from "shared/core/log";
import Vue from "vue";

type Letter = string;

interface Occurrence {
  result: number;
  times: number;
}

interface Multiplication {
  i: number;
  j: number;
}

type ReverseTable = Record<number, Multiplication[]>;
type DecodingTable = Record<number, Letter>;

const LETTER_DISTRIBUTION: Record<Letter, number> = {
  A: 8,  B: 1,
  C: 3,  D: 3,
  E: 9,  F: 2,
  G: 1,  H: 1,
  I: 7,  J: 1,
  K: 1,  L: 6,
  M: 3,  N: 7,
  O: 5,  P: 3,
  Q: 2,  R: 7,
  S: 8,  T: 7,
  U: 6,  V: 2,
  W: 1,  X: 1,
  Y: 1,  Z: 1,
  ' ': 5
};

let failedOnce = false;
Vue.config.errorHandler = (err, vm, info) => {
  if (localStorage && !failedOnce) {
    failedOnce = true;
    log.error("Initialization failed, resetting app. Cause:", info, err);
    localStorage.clear();
    launch();
  } else {
    throw err;
  }
}

launch();

function launch() {
  new Vue({
    el: '#app',
    data: {
      gridSize: loadNumber('gridSize', 12).toString(),
      seed: loadNumber('seed', 1).toString(),
      encodeInput: load('encodeInput'),
      decodeInput: load('decodeInput'),
      decodingTable: {},
      name: 'les gens'
    },
    created() {
      if (!isValidGridSize(this.gridSize)) {
        this.gridSize = 12;
      }
      this.refreshDecodingTable();
      log.info("App initialized");
    },
    methods: {
      refreshDecodingTable() {
        this.decodingTable = generateDecodingTable(this.gridSizeNumber, this.seedNumber);
      },
      encode(message: string) {
        return encodeMessage(message, this.decodingTable);
      },
      decode(message: string) {
        return decodeMessage(message, this.decodingTable);
      },
      decodeMultiplication(i: number, j: number) {
        return decodeResult(i * j, this.decodingTable);
      }
    },
    computed: {
      encodeOutput() {
        return this.encode(this.encodeInput);
      },
      decodeOutput() {
        return this.decode(this.decodeInput);
      },
      gridSizeNumber() {
        const gridSizeNumber = parseInt(this.gridSize, 10);
        return !isValidGridSize(gridSizeNumber) ? 12 : gridSizeNumber;
      },
      seedNumber() {
        const seedNumber = parseInt(this.seed, 10);
        return isNaN(seedNumber) ? 1 : seedNumber;
      }
    },
    watch: {
      encodeInput(value) {
        save('encodeInput', value);
      },
      decodeInput(value) {
        save('decodeInput', value);
      },
      gridSize(value) {
        save('gridSize', value);
        this.refreshDecodingTable();
      },
      seed(value) {
        save('seed', value);
        this.refreshDecodingTable();
      }
    }
  });
}

// ========= VALIDATION =========

function isValidGridSize(gridSize: number) {
  return !isNaN(gridSize) && gridSize >= 8 && gridSize <= 20;
}

// ========= SAVING / LOADING =========

function save(key: string, value: string) {
  if (localStorage) {
    localStorage.setItem(key, value);
  }
}

function loadNumber(key: string, defaultValue = 0): number {
  const value = parseInt(load(key), 10);
  return (typeof value !== "number" || isNaN(value)) ? defaultValue : value;
}

function load(key: string): string {
  if (localStorage) {
    return localStorage.getItem(key) || '';
  }
  return '';
}

// ========= ENCODING / DECODING =========

function encodeMessage(message: string, decodingTable: DecodingTable) {
  const localRandom = initializeRandom(hash(message));
  const sanitizedMessage = message.trim().toUpperCase().replace(/[^A-Z ]/g, ' ');
  return sanitizedMessage
    .split('')
    .map(letter => encodeLetter(letter, decodingTable, localRandom))
    .join(' ');
}

function encodeLetter(letter: string, decodingTable: DecodingTable, random: Function) {
  const matchingResults = Object.entries(decodingTable).filter((entry) => entry[1] === letter);
  const chosenResultIndex = Math.floor(random() * matchingResults.length);
  return matchingResults[chosenResultIndex][0];
}

function decodeMessage(message: string, decodingTable: DecodingTable) {
  const sanitizedMessage = message.trim().toLowerCase().replace(/[^0-9 ]/g, '');
  return sanitizedMessage
    .split(/ +/)
    .map(resultString => {
      const result = parseInt(resultString, 10);
      return (Boolean(result)) ? result : undefined;
    })
    .filter(Boolean)
    .map(result => decodeResult(result, decodingTable))
    .join('');
}

function decodeResult(result: number, decodingTable: DecodingTable): string {
  return decodingTable[result];
}

// ========= TABLE GENERATION =========

function generateDecodingTable(gridSize: number, seed: number): DecodingTable {
  const random = initializeRandom(seed);

  // Count occurrences of each multiplication result
  const reverseTable = generateReverseTable(gridSize);
  const occurrences: Occurrence[] = [];
  for (const result of Object.keys(reverseTable) as any as number[]) {
    occurrences.push({
      result,
      times: reverseTable[result].length
    });
  }

  // Compute value of attributing a letter to an occurrence for good distribution
  const availablePoints = gridSize * gridSize;
  const pointValue = availablePoints / Object.values(LETTER_DISTRIBUTION).reduce((p, v) => p + v, 0);
  let remainingPointsPerLetter: Record<Letter, number> = {}
  for (const letter of Object.keys(LETTER_DISTRIBUTION)) {
    remainingPointsPerLetter[letter] = pointValue * LETTER_DISTRIBUTION[letter];
  }

  // First pass: make sure each letter has at least one occurrence
  const decodingTable: DecodingTable = {};
  const remainingOccurrences = [...occurrences];
  const shuffledLetters = shuffle(Object.keys(LETTER_DISTRIBUTION), random);
  for (const letter of shuffledLetters) {
    let matchingOccurrenceIndex = remainingOccurrences.findIndex(occurrence => 
        occurrence.times === 1 || occurrence.times * pointValue < remainingPointsPerLetter[letter]);
    if (matchingOccurrenceIndex === -1) matchingOccurrenceIndex = Math.floor(random() * remainingOccurrences.length);
    const matchingOccurrence = remainingOccurrences[matchingOccurrenceIndex];
  
    decodingTable[matchingOccurrence.result] = letter;
    remainingPointsPerLetter[letter] -= matchingOccurrence.times;
    if (remainingPointsPerLetter[letter] < pointValue) {
      delete remainingPointsPerLetter[letter];
    }

    remainingOccurrences.splice(matchingOccurrenceIndex, 1);
  }

  // Second pass: fill remaining occurrences
  for (const occurrence of remainingOccurrences) {
    const letters = Object.keys(remainingPointsPerLetter);
    if (letters.length > 0) {
      let attempts = 0;
      let chosenLetter;
      while (attempts++ < 3) {
        const chosenIndex = Math.floor(random() * letters.length);
        chosenLetter = letters[chosenIndex];
        if (remainingPointsPerLetter[chosenLetter] - occurrence.times >= 0) break;
      }

      decodingTable[occurrence.result] = chosenLetter;
      remainingPointsPerLetter[chosenLetter] -= occurrence.times;
      if (remainingPointsPerLetter[chosenLetter] < -pointValue) {
        delete remainingPointsPerLetter[chosenLetter];
      }
    } else {
      decodingTable[occurrence.result] = ' ';
    }
  }

  return decodingTable;
}

function generateReverseTable(gridSize: number): ReverseTable {
  const reverseTable: ReverseTable = {};
  for (let i = 1; i <= gridSize; i++) {
    for (let j = 1; j <= gridSize; j++) {
      if (!reverseTable[i * j]) reverseTable[i * j] = [];
      reverseTable[i * j].push({ i, j });
    }
  }
  return reverseTable;
}

// ========= UTILITIES =========

// https://stackoverflow.com/a/47593316

function hash(str: string): number {
  // MurmurHash3 (https://stackoverflow.com/a/47593316)
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return (function() {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
  })();
}

function initializeRandom(seed: number) {
  // Mulberry32 generator https://stackoverflow.com/a/47593316
  return function() {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function shuffle<T>(a: T[], random: Function): T[] {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}