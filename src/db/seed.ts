import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const DEMO_SONGS = [
  { id: '1', title: 'Purple Haze', artist: 'Jimi Hendrix', genre: 'Rock', lyrics: 'Purple haze all in my brain\nLately things just don\'t seem the same\nActin\' funny, but I don\'t know why\nExcuse me while I kiss the sky\n\nPurple haze, oh yeah\nDon\'t know if I\'m comin\' up or down\nAm I happy or in misery?\nWhatever it is, that girl put a spell on me\n\nHelp me\nHelp me, yeah', chords: '[Verse]\nAm         D7        G        D7\nPurple haze all in my brain\n\n[Chorus]\nF            E7        Am\nExcuse me while I kiss the sky' },
  { id: '2', title: 'Wind Cries Mary', artist: 'Jimi Hendrix', genre: 'Rock', lyrics: 'After all the love is gone\nWhat can I do?\nAfter all the love is gone\nWhat can I say?\n\nThe wind cries Mary\nThe wind cries Mary', chords: '[Verse]\nAm        G        F        E\nAfter all the love is gone' },
  { id: '3', title: 'Hey Joe', artist: 'Jimi Hendrix', genre: 'Rock', lyrics: 'Hey Joe, where you goin\' with that gun in your hand?\nHey Joe, I said where you goin\' with that gun in your hand?\n\nI\'m goin\' down to shoot my old lady\nYou know I caught her messin\' \'round with another man', chords: '[Intro]\nAm  G  E  Am\n\n[Verse]\nAm               G\nHey Joe, where you goin\'\nE                Am\nwith that gun in your hand?' },
  { id: '4', title: 'Little Wing', artist: 'Jimi Hendrix', genre: 'Rock', lyrics: 'Well she\'s walking through the clouds\nWith a circus mind that\'s running round\nButterflies and rabbits\nThat\'s a lady\'s life\n\nBut the gypsy was a lady\nAnd the sea was the sky\nAnd her little wing\nSpread across the sea', chords: '[Verse]\nEm            G\nWell she\'s walking through the clouds\nC            G\nWith a circus mind that\'s running round' },
  { id: '5', title: 'Foxy Lady', artist: 'Jimi Hendrix', genre: 'Rock', lyrics: 'Foxy, foxy lady\nYeah, I\'m comin\' to get you\nYeah, I\'m comin\' to get you\n\nLook at me now\nHey, look at me now\nFoxy lady\nCan\'t you see me?', chords: '[Intro]\nA  A  A  A\n\n[Verse]\nA                D\nFoxy, foxy lady' },
  { id: '6', title: 'All Along the Watchtower', artist: 'Jimi Hendrix', genre: 'Rock', lyrics: 'There must be some way out of here\nSaid the joker to the thief\nThere\'s too much confusion\nI can\'t get no relief\n\nBusiness men, they drink my wine\nPlowmen dig my earth\nNone of them along the line\nKnow what any of it is worth', chords: '[Verse]\nG  D  Am  C\n\n[Chorus]\nG  D  Am  C' },
  { id: '7', title: 'Voodoo Child', artist: 'Jimi Hendrix', genre: 'Blues', lyrics: 'Well, I\'m a voodoo child\nLord knows I\'m a voodoo child\n\nI was raised up in the country\nI was raised up in the city\nI was raised up in the swampland\nI was raised up in the city', chords: '[Riff]\nEb|----------------|\nBb|----------------|\nGb|----------------|\nDb|-----2-0-2-3---|\nAb|-0-3-----------|\nEb|----------------|' },
  { id: '8', title: 'Red House', artist: 'Jimi Hendrix', genre: 'Blues', lyrics: 'There\'s a red house over yonder\nThat\'s where my baby stays\n\nThere\'s a red house over yonder\nLord, that\'s where my baby stays\n\nI haven\'t been home to see my baby\nIn ninety-nine and one half days', chords: '[Verse]\nA        D        E\nThere\'s a red house over yonder' },
];

async function main() {
  console.log('Seeding...');
  for (const song of DEMO_SONGS) {
    await db.insert(schema.songs).values({ ...song, userId: 'demo' }).onConflictDoNothing();
  }
  console.log('Done!');
}

main().catch(console.error);
