const q1 = "Ezekiel 3:15";
const singleVerseMatch = q1.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+):(\d+)$/);
console.log(singleVerseMatch);

const q2 = "1 Corinthians 9";
console.log(q2.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+):(\d+)$/));

const q3 = "Mark 2:23-28";
console.log(q3.match(/^(\d?\s*[a-zA-Z\s]+?)\s+(\d+):(\d+)$/));
