const fs = require('fs');
const simheader = 'ZCB Zebak + 2 spec @ 300 rlvl';
const iterations = 50000;
const rubytoggle = true;
const zcbspecs = 0;
const vwrspecs = 3;
//salt = 26 ovl = 21 rangepot = 13
const boost = 26;

//ToA vars
const raidlvl = 400;
const drollmult = 1 + (0.4 * (raidlvl / 100));
const weapons = {
    zcbmasori: {
        acc:251,
        str:149,
        aspd:5,
        setbonus:[1,1],
        ruby:true,
        info: 'ZCB + Masori',
    },
    zcbdhides: {
        acc:217,
        str:139,
        aspd:5,
        setbonus:[1,1],
        ruby:true,
        info: 'ZCB + Dhides',
    },
    bofa: {
        acc:221,
        str:113,
        aspd:4,
        setbonus:[1.15,1.3],
        ruby:false,
        info: 'Bofa + Crystal',
    }
};

const target = {
    zebak: {
        hp:580,
        bdef:70,
        rdef:110,
        toamult:true,
        info: 'Zebak',
    },
    wardenp3: {
        hp:880,
        bdef:150,
        rdef:20,
        toamult:true,
        info: 'Warden P3',
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

var out = [];

calc(target.wardenp3, weapons.bofa);
function calc(trg, wpn, header) {
    const estr = Math.floor(((99 + boost) * 1.23) + 8);
    const max = Math.floor(((0.5 + estr * ((wpn.str) + 64)) / 640) * wpn.setbonus[0]);
    const eatk = Math.floor(((99 + boost) * 1.23) + 5);
    const aroll = Math.floor((eatk * (wpn.acc + 64)) * wpn.setbonus[1]);
    var droll = 0;
    if (trg.toamult) {
        droll = Math.floor(((trg.bdef + 9) * (trg.rdef + 64) * drollmult));
    } else {
        droll = Math.floor((trg.bdef + 9) * (trg.rdef + 64));
    }
    const acc = 1 - ((droll + 2) / (2 * aroll + 1));
    const dph = (max * acc) / 2;
    const dps = dph / (0.6 * wpn.aspd);
    var chp = 0;
    if (trg.toamult) {
        chp = (trg.hp * drollmult);
    } else {
        chp = trg.hp;
    }
    const ettk = (chp / dps);

    var specscount = '';
    if (zcbspecs > 0) {
        specscount += 'ZCB: ' + zcbspecs + ' ';
    }
    if (vwrspecs > 0) {
        specscount += 'Voidwaker: ' + vwrspecs;
    }

    const calcoutput = [
        [wpn.info + ' v ' + trg.info + ' @ ' + raidlvl + ' rlvl'],
        [''],
        ['Max Hit: ' + max],
        ['Accuracy: ' + acc],
        ['DPH: ' + dph],
        ['DPS: ' + dps + ' [excl. rubies]'],
        ['Max Attack Roll: ' + aroll],
        ['NPC Max Def Roll: ' + droll],
        ['Estimated TTK: ' + ettk + ' [excl. specs]'],
        [''],
        ['Sim Specs: ' + specscount]
    ]

    var calcoutdata = "export const calcvalues = " + JSON.stringify(calcoutput) + '\n';
    try {
        const file = fs.writeFileSync('calcoutput.mjs', calcoutdata, { flag: 'w+'})
    } catch (err) {
        console.error(err)
    }
    console.log('max:' + max + '\nattackroll:' + aroll + '\ndefroll:' + droll + '\nacc:' + acc + '\ndph:' + dph + '\ndps:' + dps);
    sim(trg, wpn, aroll, max, wpn.aspd, 10000, simheader);
}

//sim(target.zebak, weapons.zcbmasori, 48822, 53, 5, 10000, "ZCB Zebak + 2 spec @ 300 rlvl");

function sim(trg, wpn, maroll, max, aspd, its, header) {
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
        if (vwrspecs > 0) {
            for (v = 0; v < vwrspecs; v++) {
                var vwhit = Math.floor(Math.random() * 75);
                chp -= vwhit;
                attackcount += 1;
            }
        }

        while (chp > 0) {
            var cdmg = 0;


            if (wpn.ruby) {
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
    printout(header);
}

function printout(header) {
    out.sort(function(a, b){return a - b});
    var atotal = 0;
    for (let a = 0; a < out.length; a++) {
        atotal += out[a];
    }
    const simresult = 'Simulated TTK avg @ [' + iterations + '] iterations: ' + atotal / out.length;
    dataexport(header, simresult);
}

function dataexport(header, res) {
    var data = []
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

    //var labels = [];
    //var values = [];
    //for (let d = 0; d < data.length; d++) {
    //    labels.push(data[d][0]);
    //    values.push(data[d][1]);
    //}

    var simoutdata = "export const dpsvalues = " + JSON.stringify(data) + '\n';
    simoutdata += "export const dpsheader = '" + header + "'\n";
    simoutdata += "export const dpsresult = '" + res + "'";
    //var labels = '';
    //var values = '';
    //for (let d = 0; d < data.length; d++) {
    //    labels += "'" + data[d][0] + "',";
    //    values += data[d][1] + ',';
    //    //console.log(data[d][0] + ' ' + data[d][1]);
    //}

    try {
        const file = fs.writeFileSync('simoutput.mjs', simoutdata, { flag: 'w+'})
    } catch (err) {
        console.error(err)
    }
}
