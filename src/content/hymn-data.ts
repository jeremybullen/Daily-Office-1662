export interface Hymn {
    imageUrl: string | string[];
    extraVerses?: string[][];
}

export const hymns: Record<string, Hymn> = {
    lordsPrayer: {
        imageUrl: ['/hymns/lords-prayer-1.jpg', '/hymns/lords-prayer-2.jpg'],
        extraVerses: []
    },
    venite: {
        imageUrl: '',
        extraVerses: [
            ["2. The depths of earth are in his hand,", "Her secret wealth at his command;", "The strength of hills that reach the sky,", "Subjected to his empire lie."],
            ["3. The rolling ocean's vast abyss", "By the same sovereign right is his;", "'Tis moved by his almighty hand,", "That formed and fixed the solid land."],
            ["4. O let us to his courts repair,", "And bow with adoration there;", "Down on our knees devoutly all", "Before the Lord our Maker fall."]
        ]
    },
    teDeum: {
        imageUrl: '/hymns/te-deum.png',
        extraVerses: []
    },
    benedicite: {
        imageUrl: '/hymns/benedicte.jpg',
        extraVerses: []
    },
    jubilate: {
        imageUrl: '/hymns/psalm-100.png',
        extraVerses: []
    },
    benedictus: {
        imageUrl: '/hymns/Benedictus.jpg',
        extraVerses: []
    },
    magnificat: {
        imageUrl: '/hymns/song-of-mary.png',
        extraVerses: []
    },
    cantate: {
        imageUrl: '/hymns/psalm-98.png',
        extraVerses: []
    },
    nuncDimittis: {
        imageUrl: '/hymns/nunc-dimittis.png',
        extraVerses: []
    },
    deusMisereatur: {
        imageUrl: '/hymns/psalm-67.jpg',
        extraVerses: []
    }
};
