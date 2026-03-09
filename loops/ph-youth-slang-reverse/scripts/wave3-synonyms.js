#!/usr/bin/env node
/**
 * Wave 3: Synonym/Antonym linking
 * Reads output/dictionary.json, adds synonyms/antonyms fields to each entry,
 * then writes categories.json.
 */

const fs = require('fs');
const path = require('path');

const DICT_PATH = path.join(__dirname, '../output/dictionary.json');
const CAT_PATH = path.join(__dirname, '../output/categories.json');

// ─── Synonym Mapping ──────────────────────────────────────────────────────────
// Only reference terms that exist in the 158-term dictionary.
// Keys are term names exactly as they appear in dictionary.json.

const SYNONYMS = {
  // "Let's go!" / call to action
  "arat":           ["salang na", "bounce", "gege"],
  "salang na":      ["arat", "bounce", "gege"],
  "bounce":         ["arat", "salang na", "gege"],
  "gege":           ["arat", "salang na", "bounce"],
  "slide (sa gig)": ["arat", "bounce"],

  // Unbothered / dismissal cluster
  "patola":                ["dedma", "shushhh", "hindi ako epektado", "ala me pakels", "pakels"],
  "hindi ako epektado":    ["patola", "dedma", "shushhh", "ala me pakels"],
  "dedma":                 ["patola", "shushhh", "hindi ako epektado", "laylow", "ala me pakels"],
  "shushhh":               ["patola", "dedma", "hindi ako epektado", "pahinga na"],
  "ala me pakels":         ["patola", "dedma", "pakels", "hindi ako epektado"],
  "pakels":                ["ala me pakels", "dedma", "patola"],
  "laylow":                ["dedma", "patola"],

  // Truth / no-lies cluster
  "no cap":       ["walang ebas", "rekta"],
  "walang ebas":  ["no cap", "rekta"],
  "rekta":        ["no cap", "walang ebas"],

  // Agreement / affirmation
  "omsim":        ["alam na this"],
  "alam na this": ["omsim"],

  // Just-kidding markers
  "char":   ["chariz", "chos", "echoz", "eme"],
  "chariz": ["char", "chos", "echoz"],
  "chos":   ["char", "chariz", "echoz"],
  "echoz":  ["char", "chos", "chariz"],
  "eme":    ["char", "chos"],

  // Stale / irrelevant / washed-up
  "panis": ["deds"],
  "deds":  ["panis"],

  // Fake / cheap / posing
  "tsepay":   ["balagbag", "cappin"],
  "balagbag": ["tsepay", "cappin"],
  "cappin":   ["tsepay", "balagbag"],

  // Fashion / style / swag
  "drip":    ["awra", "angas"],
  "awra":    ["drip", "angas", "bongga"],
  "angas":   ["drip", "awra"],

  // Fierce / excellent / impressive
  "bongga":     ["pak ganern", "lagabog", "werpa", "awra"],
  "pak ganern": ["bongga", "lagabog", "werpa"],
  "lagabog":    ["bongga", "pak ganern", "werpa"],
  "werpa":      ["bongga", "pak ganern", "lagabog"],

  // Paranoid / unhinged
  "praning": ["topak"],
  "topak":   ["praning"],

  // Hustle / grind
  "go getta": ["247"],
  "247":      ["go getta"],

  // Jealous / triggered / bothered
  "agit":      ["epektado", "nadikit"],
  "epektado":  ["agit", "nadikit"],
  "nadikit":   ["agit", "epektado"],

  // Breakup / moving on / finality
  "kalimutan ka": ["bnk", "ayoko na", "laya", "huli na"],
  "bnk":          ["kalimutan ka", "ayoko na", "laya"],
  "ayoko na":     ["kalimutan ka", "bnk", "pahinga na", "huli na"],
  "laya":         ["kalimutan ka", "bnk", "huli na"],
  "huli na":      ["kalimutan ka", "laya", "ayoko na"],
  "pahinga na":   ["shushhh", "ayoko na"],

  // Close-friend address
  "beshie": ["beh", "bes"],
  "beh":    ["beshie", "bes"],
  "bes":    ["beshie", "beh"],

  // Male-peer address
  "mane": ["lodi"],
  "lodi": ["mane"],

  // Romantic partner / endearment
  "jowa":  ["bb", "pangga"],
  "bb":    ["jowa", "pangga"],
  "pangga":["bb", "jowa"],

  // Crew / squad
  "tropa":    ["gng", "day ones"],
  "gng":      ["tropa", "day ones"],
  "day ones": ["tropa", "gng"],

  // Lazy
  "batugan": ["petiks"],
  "petiks":  ["batugan"],

  // Aura / charisma
  "rizz":         ["aura farming", "awra"],
  "aura farming": ["rizz", "awra"],

  // Sympathy
  "awit":      ["awit sayo", "aray mo"],
  "awit sayo": ["awit", "aray mo"],
  "aray mo":   ["awit sayo", "awit"],
  "aray ko":   ["awit"],

  // Gossip
  "chismis": ["chika"],
  "chika":   ["chismis"],

  // Romantic feeling
  "kilig":   ["lambing", "gigil"],
  "lambing": ["kilig", "gigil"],
  "gigil":   ["kilig", "lambing"],

  // LGBTQ+ beki identity
  "badesh":  ["vaklush"],
  "vaklush": ["badesh"],

  // Backslang pairs (related but not synonymous — skip, they're inverses)
};

// ─── Antonym Mapping ─────────────────────────────────────────────────────────

const ANTONYMS = {
  // Hustle vs lazy
  "go getta":  ["batugan", "petiks"],
  "247":       ["batugan", "petiks"],
  "batugan":   ["go getta", "247"],
  "petiks":    ["go getta", "247"],

  // Honest vs lying/bluffing
  "rekta":      ["cappin", "balagbag"],
  "walang ebas":["cappin"],
  "no cap":     ["cappin"],
  "cappin":     ["rekta", "walang ebas", "no cap"],
  "balagbag":   ["rekta"],

  // Unbothered vs easily baited
  "patola":    ["mapagpatol"],
  "mapagpatol":["patola"],

  // Not bothered vs bothered
  "hindi ako epektado": ["epektado", "mapagpatol"],
  "epektado":           ["hindi ako epektado"],

  // Loyal vs fair-weather
  "day ones":  ["lulutang"],
  "lulutang":  ["day ones"],

  // Excellent/fierce vs fake/washed
  "bongga":     ["tsepay", "panis"],
  "pak ganern": ["tsepay", "panis"],
  "werpa":      ["tsepay", "panis"],
  "tsepay":     ["bongga", "pak ganern", "werpa"],
  "panis":      ["bongga", "pak ganern"],
  "angas":      ["panis"],

  // Emotionally vulnerable vs liberated
  "marupok": ["laya", "hindi ako epektado"],
  "laya":    ["marupok"],

  // Romantic excitement vs heartbreak
  "kilig":  ["hugot"],
  "hugot":  ["kilig"],

  // Success vs failure
  "boss na":           ["batugan"],
  "bigla kang sumakses":["batugan"],

  // Authentic vs fake
  "rekta":    ["cappin", "balagbag"],
  "balagbag": ["rekta"],

  // Low key vs high key (high key not in dict, but noting it)
  // "low key": ["high key"],  // high key not in dictionary, skip

  // Jowa vs benchwarmer/kabet — kabet not in dict explicitly, skip
};

// ─── Category Taxonomy ───────────────────────────────────────────────────────

const CATEGORIES = {
  "let's-go-expressions": {
    description: "Calls to action, invitations to move or start something",
    terms: ["arat", "salang na", "bounce", "gege", "slide (sa gig)", "forda", "forda ferson"]
  },
  "unbothered-culture": {
    description: "Expressions of being unaffected, dismissive, or emotionally detached from drama",
    terms: ["patola", "hindi ako epektado", "dedma", "shushhh", "ala me pakels", "pakels", "laylow"]
  },
  "truth-and-authenticity": {
    description: "Slang asserting honesty, directness, or genuine expression",
    terms: ["no cap", "walang ebas", "rekta", "omsim", "fr", "alam na this"]
  },
  "humor-and-softeners": {
    description: "Markers of jest, sarcasm, or joke signals",
    terms: ["char", "chariz", "chos", "echoz", "eme", "naks"]
  },
  "insults-and-diss-culture": {
    description: "Terms used to insult, dismiss, or put down rivals and posers",
    terms: ["panis", "deds", "tsepay", "balagbag", "kengkoy", "tae", "babatain", "banat", "dogshow", "tolongges (ref)"]
  },
  "fashion-and-style": {
    description: "Slang about personal style, fashion, and looking good",
    terms: ["drip", "drip ko mala-gripo", "drip set", "awra", "angas", "estetik", "big boy whip"]
  },
  "hustle-culture": {
    description: "Slang about grinding, ambition, and relentless pursuit of success",
    terms: ["go getta", "247", "naka-focus sa cake", "boss na", "galing sa wala (ref)", "diskarte", "beterano"]
  },
  "conflict-and-beef": {
    description: "Terms for disputes, rivalries, and rap confrontations",
    terms: ["gera", "lagabog", "tagilid", "banat", "babatain", "dogshow", "galing kalye"]
  },
  "hype-and-excellence": {
    description: "Exclamations and terms for something impressive, fierce, or outstanding",
    terms: ["bongga", "pak ganern", "werpa", "lagabog", "salang na", "kabog (ref)", "angas"]
  },
  "breakup-and-heartbreak": {
    description: "Slang about endings, moving on, and emotional exits from relationships",
    terms: ["kalimutan ka", "bnk", "ayoko na", "laya", "huli na", "pahinga na", "wasak (ref)", "hugot", "marupok"]
  },
  "romance-and-attraction": {
    description: "Terms for romantic feelings, attraction, and coupling",
    terms: ["jowa", "bb", "pangga", "kilig", "lambing", "gigil", "bagay", "dyosa", "ebeb (ref)", "beh", "MU (ref)"]
  },
  "relationship-dynamics": {
    description: "Terms describing relationship behaviors and patterns",
    terms: ["lulutang", "nadikit", "mapagpatol", "babaero", "benchwarmer", "marupok", "topak", "praning", "seenzone"]
  },
  "forms-of-address": {
    description: "Terms used to address or refer to peers, friends, and intimates",
    terms: ["mane", "lodi", "bish", "beshie", "beh", "bes", "teh (ref)", "mudra", "pudra", "unc", "ghorl (ref)", "cuh (ref)", "sah (ref)"]
  },
  "loyalty-and-crew": {
    description: "Terms for loyal friends, squads, and chosen family",
    terms: ["day ones", "tropa", "gng", "beshie", "bumaba 'yung gang"]
  },
  "emotional-states": {
    description: "Slang describing emotional and mental states",
    terms: ["agit", "epektado", "nadikit", "praning", "topak", "kilig", "gigil", "hugot", "lutang", "marupok", "laya", "ayoko na"]
  },
  "sympathy-and-commiseration": {
    description: "Expressions of shared pain, empathy, or ironic consolation",
    terms: ["awit", "awit sayo", "aray ko", "aray mo", "dasurv"]
  },
  "social-media-culture": {
    description: "Slang originating from or primarily used on social media platforms",
    terms: ["kunan mong pic", "bumaba 'yung gang", "aura farming", "estetik", "for today's videyow", "mukbang", "FYP (ref)", "dogshow", "aura farming", "budol", "cancel"]
  },
  "internet-slang-and-memes": {
    description: "Viral internet phrases, meme formats, and imported online trends",
    terms: ["brain rot", "IJBOL", "naur", "ratio", "touch grass", "6-7", "oomf", "alam na this", "baha ka lang, pinoy kami", "bigla kang sumakses", "forda", "forda ferson", "periodt", "JOMO"]
  },
  "street-slang": {
    description: "Terms rooted in Manila street culture and OPM rap's street register",
    terms: ["galing kalye", "lagabog", "diskarte", "amats", "walwal", "sabog", "bato", "babain", "laylow", "gera", "lodi", "beterano"]
  },
  "drug-and-substance-culture": {
    description: "Terms related to drug use and intoxication in street/rap contexts",
    terms: ["bato", "amats", "walwal", "sabog", "bisyo"]
  },
  "beki-swardspeak-lgbtq": {
    description: "Terms from Filipino LGBTQ+ language (swardspeak/beki lingo) that have entered broader youth use",
    terms: ["pak ganern", "awra", "bongga", "beshie", "badesh", "vaklush", "achoo", "shontis", "petmalu", "kalurkey", "mudra", "lavarn", "amaccana accla", "ammacana"]
  },
  "wordplay-and-backslang": {
    description: "Terms formed through syllable reversal, respelling, or linguistic play",
    terms: ["omsim", "arat", "amats", "petmalu", "amaccana accla", "ammacana", "drip ko mala-gripo", "boogsh", "eabab", "epip"]
  },
  "borrowed-slang": {
    description: "Terms adopted from English, AAVE, or other languages into Filipino youth speech",
    terms: ["drip", "go getta", "no cap", "day ones", "low key", "rizz", "aura farming", "brain rot", "benchwarmer", "dasurv", "budol (evolved)", "slide (sa gig)", "bounce"]
  },
  "identity-and-credibility": {
    description: "Slang asserting authentic identity, origins, or credibility",
    terms: ["galing kalye", "beterano", "boss na", "go getta", "diskarte", "baha ka lang, pinoy kami"]
  },
  "gossip-and-drama-culture": {
    description: "Terms about gossiping, drama, and social information sharing",
    terms: ["chismis", "chika", "SKL", "marites", "mapagpatol", "nadikit"]
  },
  "attitude-and-swagger": {
    description: "Terms for how someone carries themselves — confidence, arrogance, or effortless cool",
    terms: ["angas", "asta", "ere (ref)", "swabe (ref)", "hindi ako epektado", "main character energy"]
  },
  "consumer-and-flex-culture": {
    description: "Slang about spending, flexing wealth, or social media-driven purchasing",
    terms: ["budol", "burgis", "big boy whip", "kunan mong pic", "boss na", "naka-focus sa cake"]
  },
  "character-traits": {
    description: "Adjectives and nouns describing personality types",
    terms: ["bibo", "batugan", "petiks", "praning", "topak", "marupok", "beterano", "mapagpatol", "lulutang", "babaero", "diskarte", "bisyo"]
  },
  "disaster-resilience-humor": {
    description: "Dark-comedy slang expressing Filipino resilience in the face of adversity",
    terms: ["baha ka lang, pinoy kami", "diskarte", "bahala na (ref)"]
  },
  "gaming-and-online-culture": {
    description: "Slang originating in online gaming communities and esports culture",
    terms: ["boogsh", "booking", "ratio", "touch grass", "brain rot", "JOMO", "gng"]
  },
  "taglish-constructions": {
    description: "Novel compounds and phrases that blend Tagalog and English syntax",
    terms: ["drip ko mala-gripo", "naka-focus sa cake", "ala me pakels", "alam na this", "bumaba 'yung gang", "kunan mong pic", "bigla kang sumakses", "forda ferson", "for today's videyow"]
  }
};

// ─── Main Processing ──────────────────────────────────────────────────────────

const dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf8'));

// Build a set of all terms for fast lookup
const termSet = new Set(dict.map(e => e.term));

let updatedCount = 0;

for (const entry of dict) {
  const syn = SYNONYMS[entry.term] || [];
  const ant = ANTONYMS[entry.term] || [];

  // Filter to only terms actually in the dictionary
  const validSyn = syn.filter(t => termSet.has(t));
  const validAnt = ant.filter(t => termSet.has(t));

  // Only add the fields if we have data (or if they don't exist yet)
  const hadSyn = 'synonyms' in entry;
  const hadAnt = 'antonyms' in entry;

  entry.synonyms = validSyn;
  entry.antonyms = validAnt;

  if (!hadSyn || !hadAnt) updatedCount++;
}

fs.writeFileSync(DICT_PATH, JSON.stringify(dict, null, 2));
console.log(`✓ Updated ${updatedCount} entries with synonyms/antonyms (${dict.length} total)`);

// ─── Write categories.json ────────────────────────────────────────────────────

// Enrich each category with count of terms actually in dictionary
const catOutput = {};
for (const [catName, catData] of Object.entries(CATEGORIES)) {
  const confirmedTerms = catData.terms.filter(t => {
    // Strip "(ref)" annotations
    const clean = t.replace(/\s*\(ref\)$/, '').trim();
    return termSet.has(clean);
  });
  catOutput[catName] = {
    description: catData.description,
    term_count: confirmedTerms.length,
    terms: catData.terms
  };
}

fs.writeFileSync(CAT_PATH, JSON.stringify(catOutput, null, 2));
console.log(`✓ Wrote categories.json with ${Object.keys(catOutput).length} categories`);

// Print summary
const totalWithSyn = dict.filter(e => e.synonyms && e.synonyms.length > 0).length;
const totalWithAnt = dict.filter(e => e.antonyms && e.antonyms.length > 0).length;
console.log(`  Terms with synonyms: ${totalWithSyn}`);
console.log(`  Terms with antonyms: ${totalWithAnt}`);
