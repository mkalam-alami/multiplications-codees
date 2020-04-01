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

const random = randomGenerator(Date.now());

new Vue({
  el: '#app',
  data: {
    gridSize: loadNumber('gridSize', 12),
    seed: loadNumber('seed', 1),
    encodeInput: load('encodeInput'),
    decodeInput: load('decodeInput'),
    decodingTable: {},
    name: 'les gens'
  },
  created() {
    this.applySeed();
    log.info("App initialized");
  },
  methods: {
    applySeed() {
      this.reverseTable = generateReverseTable(parseInt(this.gridSize, 10));
      this.decodingTable = generateDecodingTable(parseInt(this.seed, 10), this.reverseTable);
    },
    encode(message: string) {
      return encodeMessage(message, this.decodingTable, this.reverseTable);
    },
    decode(message: string) {
      return decodeMessage(message, this.decodingTable);
    },
    decodeMultiplication(i: number, j: number) {
      return decodeMultiplication({ i, j }, this.decodingTable);
    }
  },
  computed: {
    encodeOutput() {
      return this.encode(this.encodeInput);
    },
    decodeOutput() {
      return this.decode(this.decodeInput);
    }
  },
  watch: {
    encodeInput(value) {
      save('encodeInput', value);
    },
    decodeInput(value) {
      save('decodeInput', value);
    },
    seed(value) {
      save('seed', value);
      this.applySeed();
    }
  }
})


// ========= SAVING / LOADING =========

function save(key: string, value: string) {
  if (localStorage) {
    localStorage.setItem(key, value);
  }
}

function loadNumber(key: string, defaultValue = 0): number {
  try {
    const value = parseInt(load(key), 10);
    if (isNaN(value)) throw new Error();
  } catch (e) {
    return defaultValue;
  }
}

function load(key: string): string {
  if (localStorage) {
    return localStorage.getItem(key) || '';
  }
  return '';
}

// ========= ENCODING / DECODING =========

function encodeMessage(message: string, decodingTable: DecodingTable, reverseTable: ReverseTable) {
  const sanitizedMessage = message.trim().toUpperCase().replace(/[^A-Z ]/g, ' ');
  return sanitizedMessage
    .split('')
    .map(letter => encodeLetter(letter, decodingTable, reverseTable))
    .join(' ');
}

function encodeLetter(letter: string, decodingTable: DecodingTable, reverseTable: ReverseTable) {
  const matchingResults = Object.entries(decodingTable).filter((entry) => entry[1] === letter);
  const matchingMultiplications = matchingResults
    .map(entry => entry[0])
    .map<Multiplication[]>(result => reverseTable[result])
    .reduce((prev, value) => prev.concat(value), []);
  const chosenIndex = Math.floor(random() * matchingMultiplications.length);
  const multiplication = matchingMultiplications[chosenIndex];
  if (multiplication) {
    return `${multiplication.i}x${multiplication.j}`;
  } else {
    log.error(`No multiplication found for letter "${letter}"`);
    return '???';
  }
}

function decodeMessage(message: string, decodingTable: DecodingTable) {
  const sanitizedMessage = message.trim().toLowerCase().replace(/[^0-9 x]/g, '');
  return sanitizedMessage
    .split(/ +/)
    .map(multiplicationString => {
      const multiplicationElements = multiplicationString.split('x');
      if (multiplicationElements.length === 2) {
        return {
          i: parseInt(multiplicationElements[0], 10),
          j: parseInt(multiplicationElements[1], 10)
        };
      } else {
        return undefined;
      }
    })
    .filter(Boolean)
    .map(multiplication => decodeMultiplication(multiplication, decodingTable))
    .join('');
}

function decodeMultiplication(multiplication: Multiplication, decodingTable: DecodingTable): string {
  return decodingTable[multiplication.i * multiplication.j];
}

// ========= TABLE GENERATION =========

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

function generateDecodingTable(seed: number, reverseTable: ReverseTable): DecodingTable {
  const occurrences: Occurrence[] = [];
  for (const result of Object.keys(reverseTable) as any as number[]) {
    occurrences.push({
      result,
      times: reverseTable[result].length
    });
  }
  const sortedOccurrences = occurrences.sort((a, b) => b.times - a.times);

  const availablePoints = sortedOccurrences.reduce((previous: number, current: Occurrence) => {
    return previous + current.times
  }, 0.);
  const pointValue = availablePoints / Object.values(LETTER_DISTRIBUTION).reduce((p, v) => p + v, 0);
  let remainingPointsPerLetter: Record<Letter, number> = {}
  for (const letter of Object.keys(LETTER_DISTRIBUTION)) {
    remainingPointsPerLetter[letter] = pointValue * LETTER_DISTRIBUTION[letter];
  }

  const decodingTable: DecodingTable = {};
  const localRandom = randomGenerator(seed);
  for (const occurrence of occurrences) {

    let attempts = 0;
    let chosenLetter;
    while (attempts++ < 3) {
      const letters = Object.keys(remainingPointsPerLetter);
      const chosenIndex = Math.floor(localRandom() * letters.length);
      chosenLetter = letters[chosenIndex];
      if (remainingPointsPerLetter[chosenLetter] - occurrence.times > -2) break;
    }

    decodingTable[occurrence.result] = chosenLetter;
    remainingPointsPerLetter[chosenLetter] -= occurrence.times;
    if (remainingPointsPerLetter[chosenLetter] < 0) {
      delete remainingPointsPerLetter[chosenLetter];
    }
  }
  return decodingTable;
}

// ========= UTILITIES =========

// https://stackoverflow.com/a/47593316
function randomGenerator(seed) {
  return function() {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}