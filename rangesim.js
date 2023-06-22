const fs = require('fs');
const iterations = 10000;
const gearacc = 245;
const gearstr = 25;
const rubytoggle = true;
const zcbspecs = 2;
//salt = 26 ovl = 21 rangepot = 13
const boost = 26;

//ToA vars
const raidlvl = 400;
const drollmult = 1 + (0.4 * (raidlvl / 100));

const weapons = {
    zcb: {
        acc:110,
        str:122,
        spd:5,
        ruby:true,
    },
    bofa: {
        acc:221,
        str:113,
        spd:5,
        ruby:false,
    }
};

const armour = {
    masoribuckler: {
        acc:135,
        str:25,
    },
    masori: {
        acc:117,
        str:15,
    },
    dhides: {

    }
}

const target = {
    zebak: {
        hp:580,
        bdef:70,
        rdef:110,
        toamult:true,
    },
    wardenp3: {
        hp:880,
        bdef:150,
        rdef:20,
        toamult:true,
    },
    olm: {
        hp:800,
        bdef:150,
        rdef:50,
        toamult:false,
    },
    vasa: {
        hp:300,
        bdef:175,
        rdef:60,
        toamult:false,
    }
};

calc(target.zebak, weapons.zcb);
function calc(trg,wpn) {
    const estr = Math.floor(((99 + boost) * 1.23) + 8);
    const max = Math.floor((0.5 + estr * ((gearstr + wpn.str) + 64)) / 640);
    const eatk = Math.floor(((99 + boost) * 1.23) + 5);
    const aroll = Math.floor(eatk * (gearacc + 64));
    var droll = 0;
    if (trg.toamult) {
        droll = Math.floor(((trg.bdef + 9) * (trg.rdef + 64) * drollmult));
    } else {
        droll = Math.floor((trg.bdef + 9) * (trg.rdef + 64));
    }
    const acc = 1 - ((droll + 2) / (2 * aroll + 1));
    const dph = (max * acc) / 2;
    const dps = dph / 3;
    console.log('max:' + max + '\nattackroll:' + aroll + '\ndefroll:' + droll + '\nacc:' + acc + '\ndph:' + dph + '\ndps:' + dps);
}

var out = [];
sim(target.zebak, 48822, 53, 5, 10000);

function sim(trg, maroll, max, aspd, its) {
    //npc max def roll
    var mdroll = 0;
    if (trg.toamult) {
        mdroll = Math.floor(((trg.bdef + 9) * (trg.rdef + 64) * drollmult));
    } else {
        mdroll = Math.floor((trg.bdef + 9) * (trg.rdef + 64));
    }

    console.log('\nrunning ' + its + ' iterations...');
    for (let it = 0; it < its; it ++) {
        var chp = 0;
        if (trg.toamult) {
            chp = (trg.hp * drollmult);
        } else {
            chp = trg.hp;
        }
        chp -= (zcbspecs * 110);
        var attackcount = 0 + zcbspecs;
        while (chp > 0) {
            var cdmg = 0;


            if (rubytoggle) {
                var rubyroll = Math.floor(Math.random() * 1000);
            } else {
                var rubyroll = 10000;
            }

            if (rubyroll < 66) {
                cdmg = (chp * 0.22);
                if (cdmg > 110) {
                    cdmg = 110;
                }
            } else {
                var caroll = Math.floor(Math.random() * maroll);
                var cdroll = Math.floor(Math.random() * mdroll);
                if (caroll > cdroll) {
                    cdmg = Math.floor(Math.random() * max);
                } else {
                    cdmg = 0;
                }
            }

            chp -= Math.floor(cdmg);
            attackcount += 1;
        }

        out.push(Math.floor(attackcount * (0.6 * aspd)));
    }
    printout();
}

function printout() {
    out.sort(function(a, b){return a - b});
    var atotal = 0;
    for (let a = 0; a < out.length; a++) {
        atotal += out[a];
    }
    console.log('ttk average after ' + iterations + ' iterations: ' + atotal / out.length); 
    dataexport();
}

function dataexport() {
    let data = []
    for (let l = 0; l < out.length; l++) {
        if (l == 0) {
            data.push([out[0], 1]);
        } else {
            if (data[data.length - 1][0] == out[l]) {
                data[data.length - 1][1] += 1;
            } else {
                data.push([out[l], 1]);
            }
        }
    }

    var labels = '';
    var values = '';
    for (let d = 0; d < data.length; d++) {
        labels += "'" + data[d][0] + "',";
        values += data[d][1] + ',';
        //console.log(data[d][0] + ' ' + data[d][1]);
    }

    try {
        const file = fs.writeFileSync('labels.txt', labels, { flag: 'w+'})
    } catch (err) {
        console.error(err)
    }

    try {
        const file = fs.writeFileSync('values.txt', values, { flag: 'w+'})
    } catch (err) {
        console.error(err)
    }
}
