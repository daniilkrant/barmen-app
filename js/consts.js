const bottle1Name = 'whiskey';
const bottle2Name = 'cognac';
const bottle3Name = 'cola';

const bottle1Pin = 12;
const bottle2Pin = 16;
const bottle3Pin = 18;
const volume1Ml = 500;
const volume2Ml = 700;
const volume3Ml = 1000;
const volume4Ml = 1500;


let pinsMap = new Map([
    [bottle1Name, bottle1Pin],
    [bottle2Name, bottle2Pin],
    [bottle3Name, bottle3Pin]
  ]);

exports.bottle1Name = bottle1Name;
exports.bottle2Name = bottle2Name;
exports.bottle3Name = bottle3Name;
exports.volume1Ml = volume1Ml;
exports.volume2Ml = volume2Ml;
exports.volume3Ml = volume3Ml;
exports.volume4Ml = volume4Ml;
exports.pinsMap = pinsMap;