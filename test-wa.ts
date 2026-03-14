const phone1 = "620000000";
const phone2 = "00224 620 00 00 00";
const phone3 = "+224620000000";

function format(phone: string) {
    let p = phone.replace(/\s/g, '');
    if (p.startsWith('00')) p = '+' + p.substring(2);
    if (!p.startsWith('+')) p = '+224' + p;
    return p;
}

console.log(format(phone1));
console.log(format(phone2));
console.log(format(phone3));
