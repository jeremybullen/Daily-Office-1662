export interface Hymn {
    abc: string;
    extraVerses: string[][];
}

export const hymns: Record<string, Hymn> = {
    venite: {
        abc: `X: 1
T: O Come, Loud Anthems (Venite)
M: 4/4
L: 1/4
K: G
"G"G2 | "G"G2 "C"E2 | "D"D2 "G"G2 | "G"B2 "C"c2 | "G"B3
w: 1.~O come, loud an-thems let us sing,
"G"B2 | "Em"B2 "D"A2 | "G"G2 "C"c2 | "A"B2 "A"A2 | "D"A3
w: Loud thanks to our al-migh-ty King;
"D"A2 | "G"d2 "D"A2 | "Em"B2 "D"d2 | "A"^c2 "A"c2 | "D"d3
w: For we our voi-ces high should raise,
"G"d2 | "C"G2 "D"A2 | "Em"B2 "C"e2 | "D"d2 "D"F2 | "G"G4 |]
w: When our sal-va-tion's rock we praise.`,
        extraVerses: [
            ["2. The depths of earth are in his hand,", "Her secret wealth at his command;", "The strength of hills that reach the sky,", "Subjected to his empire lie."],
            ["3. The rolling ocean's vast abyss", "By the same sovereign right is his;", "'Tis moved by his almighty hand,", "That formed and fixed the solid land."],
            ["4. O let us to his courts repair,", "And bow with adoration there;", "Down on our knees devoutly all", "Before the Lord our Maker fall."]
        ]
    },
    teDeum: {
        abc: `X: 2
T: Holy God We Praise Thy Name (Te Deum)
M: 3/4
L: 1/4
K: F
"F"F2 F | "C"E2 F | "F"G A B | A2 G | "F"F2 F | "C"E2 F | "F"G A B | A2 G |
w: 1.~Ho-ly God, we praise thy name; Lord of all, we bow be-fore thee;
"F"c2 c | "C"c B A | "Gm"B2 B | "C"B A G | "F"A2 A | "C"A G F | "Gm"G2 c | "F"F3 |]
w: All on earth thy scep-ter claim, All in heav'n a-bove a-dore thee.`,
        extraVerses: [
            ["2. Hark! the loud celestial hymn", "Angel choirs above are raising;", "Cherubim and Seraphim", "In unceasing chorus praising,", "Fill the heavens with sweet accord:", "Holy, holy, holy Lord."],
            ["3. Holy Father, Holy Son,", "Holy Spirit, Three we name thee;", "While in essence only One,", "Undivided God we claim thee,", "And adoring bend the knee,", "While we own the mystery."]
        ]
    },
    benedicite: {
        abc: `X: 3
T: All Creatures of Our God and King (Benedicite)
M: 3/4
L: 1/4
K: Eb
"Eb"E2 E | "Eb"E B A | "Eb"G2 F | "Eb"E3 | "Eb"E2 E | "Eb"E B A | "Eb"G2 F | "Eb"E3 |
w: 1.~All crea-tures of our God and King, Lift up your voice and with us sing,
"Ab"c2 c | "Ab"c d e | "Eb"B2 A | "Eb"G3 | "Ab"c2 c | "Ab"c d e | "Eb"B2 A | "Eb"G3 |
w: Al-le-lu-ia! Al-le-lu-ia! Thou burn-ing sun with gol-den beam,
"Cm"E2 F | "Ab"G2 A | "Bb"F3 | "Eb"E3 | "Cm"E2 F | "Ab"G2 A | "Bb"F3 | "Eb"E3 |]
w: O praise him! O praise him! Al-le-lu-ia! Al-le-lu-ia!`,
        extraVerses: [
            ["2. Thou rushing wind that art so strong,", "Ye clouds that sail in heaven along,", "O praise him! Alleluia!", "Thou rising morn, in praise rejoice,", "Ye lights of evening, find a voice!", "O praise him, O praise him!", "Alleluia! Alleluia! Alleluia!"],
            ["3. Let all things their Creator bless,", "And worship him in humbleness,", "O praise him! Alleluia!", "Praise, praise the Father, praise the Son,", "And praise the Spirit, Three in One!", "O praise him, O praise him!", "Alleluia! Alleluia! Alleluia!"]
        ]
    },
    jubilate: {
        abc: `X: 4
T: All People That On Earth Do Dwell (Jubilate Deo)
M: 4/4
L: 1/4
K: G
"G"G2 | "G"G2 "D"F2 | "Em"E2 "D"D2 | "G"G2 "C"A2 | "D"B3
w: 1.~All peo-ple that on earth do dwell,
"G"B2 | "G"B2 "Em"B2 | "A"A2 "D"G2 | "C"c2 "G"B2 | "D"A3
w: Sing to the Lord with cheer-ful voice;
"D"A2 | "Em"G2 "C"E2 | "D"F2 "G"G2 | "C"A2 "G"G2 | "D"F3
w: Him serve with fear, his praise forth tell,
"D"d2 | "G"B2 "Em"G2 | "C"A2 "C"c2 | "G"B2 "D"A2 | "G"G4 |]
w: Come ye be-fore him and re-joice.`,
        extraVerses: [
            ["2. The Lord, ye know, is God indeed;", "Without our aid he did us make;", "We are his folk, he doth us feed,", "And for his sheep he doth us take."],
            ["3. O enter then his gates with praise,", "Approach with joy his courts unto;", "Praise, laud, and bless his Name always,", "For it is seemly so to do."],
            ["4. For why? The Lord our God is good:", "His mercy is for ever sure;", "His truth at all times firmly stood,", "And shall from age to age endure."]
        ]
    },
    benedictus: {
        abc: `X: 5
T: Blest Be The God of Israel (Benedictus)
M: 4/4
L: 1/4
K: F
"F"F2 | "F"F2 "C"E2 | "F"F2 "Bb"B2 | "F"A2 "C"G2 | "F"F3
w: 1.~Blest be the God of Is-ra-el,
"F"A2 | "Bb"B2 "F"A2 | "C"G2 "F"c2 | "C"c2 "G"B2 | "C"c3
w: Who comes to set us free;
"C"c2 | "Bb"d2 "C"c2 | "F"A2 "Gm"G2 | "F"A2 "C"E2 | "F"F3
w: He vi-sits and re-deems us now,
"F"A2 | "Gm"G2 "F"F2 | "Bb"B2 "F"A2 | "C"G2 "C"G2 | "F"F4 |]
w: And grants us li-ber-ty.`,
        extraVerses: [
            ["2. He raised up a victorious host", "From David's royal line;", "And promised by his holy seers", "A Savior all divine."],
            ["3. From all our foes he sets us free,", "He saves us from their hands;", "That we may worship without fear,", "And keep his just commands."],
            ["4. And thou, O child, shalt go before", "To make his pathway plain;", "To show his people they are saved", "From ev'ry sinful stain."]
        ]
    },
    magnificat: {
        abc: `X: 6
T: My Soul Doth Magnify the Lord (Magnificat)
M: 4/4
L: 1/4
K: C
"C"G2 | "C"E2 "F"A2 | "C"G2 "C"c2 | "F"c2 "G"B2 | "C"c3
w: 1.~My soul doth mag-ni-fy the Lord,
"C"c2 | "G"d2 "C"c2 | "F"A2 "C"G2 | "F"A2 "D"F2 | "G"G3
w: My spi-rit doth re-joice
"G"G2 | "C"c2 "G"B2 | "F"A2 "C"G2 | "F"F2 "C"E2 | "G"D3
w: In God, my Sa-viour and my God,
"G"D2 | "C"E2 "F"F2 | "C"G2 "F"A2 | "G"d2 "G"B2 | "C"c4 |]
w: Who hears his hand-maid's voice.`,
        extraVerses: [
            ["2. For he has looked with favor on", "His humble servant's state;", "And from this day all ages now", "Shall call me truly blest."],
            ["3. For he that is almighty God", "Has done great things for me;", "And holy is his sacred Name", "Through all eternity."],
            ["4. His mercy is on them that fear,", "And seek his holy face;", "Throughout all generations still", "He shows his saving grace."]
        ]
    },
    cantate: {
        abc: `X: 7
T: O Sing a New Song to the Lord (Cantate Domino)
M: 4/4
L: 1/4
K: Eb
"Eb"E2 | "Eb"G2 "Bb"F2 | "Eb"E2 "Ab"c2 | "Eb"B2 "Bb"F2 | "Eb"G3
w: 1.~O sing a new song to the Lord,
"Eb"G2 | "Ab"c2 "Eb"B2 | "Ab"A2 "Eb"G2 | "F"F2 "F"F2 | "Bb"B3
w: For won-ders he hath done;
"Eb"B2 | "Eb"G2 "Eb"B2 | "Ab"c2 "Eb"B2 | "Fm"A2 "Eb"G2 | "Bb"F3
w: His right hand and his ho-ly arm
"Bb"F2 | "Eb"G2 "Cm"c2 | "Gm"B2 "Ab"A2 | "Eb"G2 "Bb"F2 | "Eb"E4 |]
w: The vic-to-ry have won.`,
        extraVerses: [
            ["2. The Lord declared his saving power,", "His righteousness he showed;", "In sight of all the heathen lands", "His truth and justice flowed."],
            ["3. He has remembered all his grace", "And truth to Israel's race;", "And all the ends of earth have seen", "The saving of his face."],
            ["4. Let all the earth make joyful noise,", "And sing to God the King;", "With harp and trumpet, sea and land,", "Let all creation sing."]
        ]
    },
    nuncDimittis: {
        abc: `X: 8
T: O Lord, Now Let Your Servant (Nunc Dimittis)
M: 4/4
L: 1/4
K: G
"G"D2 | "G"G2 "D"F2 | "G"G2 "D"A2 | "G"B2 "C"c2 | "G"B3
w: 1.~O Lord, now let your ser-vant go,
"G"B2 | "C"c2 "G"B2 | "D"A2 "G"G2 | "A"F2 "A"E2 | "D"D3
w: In peace, as you have said;
"G"D2 | "C"E2 "D"F2 | "G"G2 "D"A2 | "G"B2 "C"c2 | "G"B3
w: For I have seen your sav-ing grace,
"G"B2 | "C"c2 "G"B2 | "D"A2 "G"G2 | "D"F2 "D"F2 | "G"G4 |]
w: On all the na-tions shed.`,
        extraVerses: [
            ["2. This is the Savior you prepared", "For all the world to see;", "A light to lead the Gentile lands,", "And Israel's glory be."],
            ["3. To Father, Son, and Holy Ghost,", "The God whom we adore;", "Be glory, as it was, is now,", "And shall be evermore."]
        ]
    },
    deusMisereatur: {
        abc: `X: 9
T: God Be Merciful and Bless Us (Deus Misereatur)
M: 4/4
L: 1/4
K: G
"G"D2 D E | "G"G2 "D"A2 | "Em"B2 "C"G2 | "C"E2 "D"D2 |
w: 1.~God be mer-ci-ful and bless us,
"G"D2 D E | "G"G2 "D"A2 | "Em"B2 "A"^c2 | "D"d4 |
w: Shine u-pon us with your face;
"D"d2 d "G"B | "C"c2 "G"B2 | "Am"A2 "G"G2 | "D"F2 "Em"E2 |
w: That the earth may know your ac-tions,
"C"E2 "D"F G | "C"E2 "D"D2 | "G"B2 "D"A2 | "G"G4 |]
w: And all na-tions know your grace.`,
        extraVerses: [
            ["2. Let the nations sing and triumph,", "Let the people praise your Name;", "You will judge the world with justice,", "And your sovereign rule proclaim."],
            ["3. Then the earth will yield its harvest,", "God will bless us from above;", "All the ends of earth will fear him,", "And will know his saving love."]
        ]
    }
};
