const iterations = 200000;
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
    }
};

const target = {
    zebak: {
        hp:580,
        bdef:70,
        rdef:110,
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

var out = [];

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
    console.log('\nrunning ' + iterations + ' iterations...');
    for (let it = 0; it < iterations; it ++) {
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
                var caroll = Math.floor(Math.random() * aroll);
                var cdroll = Math.floor(Math.random() * droll);
                if (caroll > cdroll) {
                    cdmg = Math.floor(Math.random() * max);
                } else {
                    cdmg = 0;
                }
            }

            chp -= Math.floor(cdmg);
            attackcount += 1;
        }

        out.push(attackcount * 3);
    }

    var atotal = 0;
    for (let a = 0; a < out.length; a++) {
        atotal += out[a];
    }
    console.log('ttk average after ' + iterations + ' iterations: ' + atotal / out.length);
}