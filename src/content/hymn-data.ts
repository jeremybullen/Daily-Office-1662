export interface Hymn {
    title?: string;
    imageUrl: string | string[];
    audioUrl?: string;
    extraVerses?: string[][];
}

export const hymns: Record<string, Hymn> = {
    venite: {
        title: "Now with joyful exultation (Psalm 95)",
        imageUrl: '/hymns/Psalm%2095.png',
        audioUrl: '/audio/184. Now with joyful exultation (Psalm 95).mp3',
        extraVerses: [
            ["2. The depths of earth are in his hand,", "Her secret wealth at his command;", "The strength of hills that reach the sky,", "Subjected to his empire lie."],
            ["3. The rolling ocean's vast abyss", "By the same sovereign right is his;", "'Tis moved by his almighty hand,", "That formed and fixed the solid land."],
            ["4. O let us to his courts repair,", "And bow with adoration there;", "Down on our knees devoutly all", "Before the Lord our Maker fall."]
        ]
    },
    teDeum: {
        title: "Holy God, We Praise Your Name",
        imageUrl: '/hymns/te-deum.png',
        audioUrl: '/audio/Holy God, We Praise Your Name.mp3',
        extraVerses: [
            [
                "2. Hark! the glad celestial hymn",
                "Angel choirs above are raising;",
                "Cherubim and seraphim,",
                "In unceasing chorus praising,",
                "Fill the heav'ns with sweet accord:",
                "Holy, holy, holy Lord!"
            ],
            [
                "3. Lo! the apostolic train",
                "Join your sacred name to hallow;",
                "Prophets swell the glad refrain,",
                "And the white-robed martyrs follow;",
                "And from morn to set of sun,",
                "Through the church the song goes on."
            ],
            [
                "4. Holy Father, Holy Son,",
                "Holy Spirit, Three we name you;",
                "While in essence only One,",
                "Undivided God we claim you,",
                "And adoring bend the knee,",
                "While we sing this mystery."
            ]
        ]
    },
    benedicite: {
        title: "All Creatures of Our God and King (Benedicite)",
        imageUrl: '/hymns/benedicte.jpg',
        audioUrl: '/audio/All Creatures of Our God and King.mp3',
        extraVerses: []
    },
    jubilate: {
        title: "All People That on Earth Do Dwell (Psalm 100)",
        imageUrl: '/hymns/Psalm%20100.JPG',
        audioUrl: '/audio/All People That on Earth Do Dwell.mp3',
        extraVerses: [
            [
                "2. The Lord, ye know, is God indeed;",
                "Without our aid he did us make;",
                "We are his folk, he doth us feed,",
                "And for his sheep he doth us take."
            ],
            [
                "3. O enter then his gates with praise,",
                "Approach with joy his courts unto;",
                "Praise, laud, and bless his name always,",
                "For it is seemly so to do."
            ],
            [
                "4. For why? the Lord our God is good;",
                "His mercy is for ever sure;",
                "His truth at all times firmly stood,",
                "And shall from age to age endure."
            ],
            [
                "5. To Father, Son, and Holy Ghost,",
                "The God whom heav'n and earth adore,",
                "From men and from the angel host",
                "Be praise and glory evermore."
            ]
        ]
    },
    benedictus: {
        title: "Blest Be the God of Israel (Song of Zechariah)",
        imageUrl: '/hymns/Benedictus.jpg',
        audioUrl: '/audio/Blest Be the God of Israel; First Methodist Houston, 11 27 22.mp3',
        extraVerses: [
            [
                "2. With promised mercy will God still",
                "The covenant recall,",
                "The oath once sworn to Abraham,",
                "From foes to save us all,",
                "That we might worship without fear",
                "And offer lives of praise,",
                "In holiness and righteousness,",
                "To serve God all our days."
            ],
            [
                "3. My child, as prophet of the Lord",
                "You will prepare the way,",
                "To tell God's people they are saved",
                "From sin's dark power today.",
                "The dawn from on high will break upon",
                "The shadows of the night,",
                "To guide our feet in paths of peace",
                "With everlasting light."
            ]
        ]
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
