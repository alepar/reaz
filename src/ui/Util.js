export function formatSizeInBytes(value) {
    let factor = 1;
    value = Number(value);
    while (value > 1024) {
        factor *= 1024;
        value /= 1024;
    }
    value = value.toFixed(2);
    let suffix;
    switch (factor) {
        case 1: suffix = "B"; break;
        case 1024: suffix = "KB"; break;
        case 1024*1024: suffix = "MB"; break;
        case 1024*1024*1024: suffix = "GB"; break;
        case 1024*1024*1024*1024: suffix = "TB"; break;
        case 1024*1024*1024*1024*1024: suffix = "PB"; break;
        default: suffix = "0.oB"; break;
    }
    return `${value} ${suffix}`;
}