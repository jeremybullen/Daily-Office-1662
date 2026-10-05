export interface Hymn {
    title?: string;
    imageUrl: string | string[];
    audioUrl?: string;
    spokenAudioUrl?: string;
    extraVerses?: string[][];
}

export const hymns: Record<string, Hymn> = {
    venite: {
        title: "Now with joyful exultation (Psalm 95)",
        imageUrl: '/hymns/Psalm-95.png',
        audioUrl: '/audio/184. Now with joyful exultation (Psalm 95).mp3'
    },
    teDeum: {
        title: "Holy God, We Praise Your Name",
        imageUrl: '/hymns/te-deum.png',
        audioUrl: '/audio/Holy God, We Praise Your Name.mp3'
    },
    benedicite: {
        title: "All Creatures of Our God and King (Benedicite)",
        imageUrl: '/hymns/benedicte.jpg',
        audioUrl: '/audio/All Creatures of Our God and King.mp3'
    },
    jubilate: {
        title: "All People That on Earth Do Dwell (Psalm 100)",
        imageUrl: '/hymns/Psalm%20100.JPG',
        audioUrl: '/audio/All People That on Earth Do Dwell.mp3',
        spokenAudioUrl: '/audio/spoken Jubilate Deo.mp3'
    },
    benedictus: {
        title: "Blest Be the God of Israel (Song of Zechariah)",
        imageUrl: '/hymns/Benedictus.jpg',
        audioUrl: '/audio/Blest Be the God of Israel; First Methodist Houston, 11 27 22.mp3'
    },
    magnificat: {
        imageUrl: '/hymns/song-of-mary.png'
    },
    cantate: {
        imageUrl: '/hymns/psalm-98.png'
    },
    nuncDimittis: {
        imageUrl: '/hymns/nunc-dimittis.png'
    },
    deusMisereatur: {
        imageUrl: '/hymns/psalm-67.jpg'
    }
};
