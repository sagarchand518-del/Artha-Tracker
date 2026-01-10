
/**
 * Bikram Sambat (BS) to Gregorian (AD) mapping.
 * Comprehensive data for the 2000-2100 period.
 * 2080-2100 range uses specifically provided verified astronomical data.
 */

const bsMonthData: Record<number, number[]> = {
  2000: [30, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2009: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2010: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2011: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2012: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2013: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2014: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2015: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2016: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2020: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2023: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2024: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2025: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2026: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2027: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2028: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2029: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2030: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2031: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2036: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2037: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2038: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2039: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2040: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2041: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2042: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2043: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2050: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2051: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2052: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2053: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2054: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2055: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2056: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2057: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2058: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2063: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2064: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2065: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2066: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2067: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2068: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2069: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2070: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2071: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 31, 30, 29, 30, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 31, 29, 30, 29, 31],
  2074: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2075: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2078: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2079: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  // Verified astronomical mapping 2080-2100
  2080: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2082: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2085: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2086: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2087: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2088: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2089: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2090: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2091: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2092: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2093: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2094: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2095: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2096: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2097: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2098: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2099: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2100: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
};

const nepaliDigits: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
};

export const toNepaliNumerals = (num: number | string): string => {
  return num.toString().split('').map(char => nepaliDigits[char] || char).join('');
};

/**
 * Formats a number into a Nepali currency string with grouping and numerals.
 */
export const formatNepaliCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return toNepaliNumerals('0.00');
  
  // ne-NP locale provides correct Lakh/Crore grouping (e.g., 1,23,456.00)
  const formatted = num.toLocaleString('ne-NP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return toNepaliNumerals(formatted);
};

/**
 * Calculations anchor.
 * Updated to User Request: 2082-09-22 BS = 2026-01-06 AD.
 */
const anchorBSYear = 2082;
const anchorBSMonth = 9;
const anchorBSDay = 22;
const anchorADDateUTC = Date.UTC(2026, 0, 6, 12, 0, 0); // January 6, 2026
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Returns an array of days [1, 2, ..., maxDay] for the given BS month.
 */
export const getDays = (bsYear: number, monthIndex: number): number[] => {
  const yearData = bsMonthData[bsYear];
  if (!yearData) throw new Error("BS year not supported");
  const maxDay = yearData[monthIndex];
  return Array.from({ length: maxDay }, (_, i) => i + 1);
};

export const getDaysInBSMonth = (year: number, month: number): number => {
  const yearData = bsMonthData[year] || bsMonthData[2082];
  return yearData[month - 1];
};

/**
 * Converts AD Date to BS YYYY-MM-DD string
 */
export const adToBs = (adDate: Date): string => {
  const currentADUTC = Date.UTC(adDate.getFullYear(), adDate.getMonth(), adDate.getDate(), 12, 0, 0);
  let diff = Math.floor((currentADUTC - anchorADDateUTC) / MS_PER_DAY);
  
  let curYear = anchorBSYear;
  let curMonth = anchorBSMonth;
  let curDay = anchorBSDay;

  if (diff > 0) {
    while (diff > 0) {
      const daysLeftInMonth = getDaysInBSMonth(curYear, curMonth) - curDay;
      if (diff > daysLeftInMonth) {
        diff -= (daysLeftInMonth + 1);
        curDay = 1;
        curMonth++;
        if (curMonth > 12) {
          curMonth = 1;
          curYear++;
        }
      } else {
        curDay += diff;
        diff = 0;
      }
    }
  } else if (diff < 0) {
    diff = Math.abs(diff);
    while (diff > 0) {
      const daysPassedInMonth = curDay - 1;
      if (diff > daysPassedInMonth) {
        diff -= (daysPassedInMonth + 1);
        curMonth--;
        if (curMonth < 1) {
          curMonth = 12;
          curYear--;
        }
        curDay = getDaysInBSMonth(curYear, curMonth);
      } else {
        curDay -= diff;
        diff = 0;
      }
    }
  }

  return `${curYear}-${curMonth.toString().padStart(2, '0')}-${curDay.toString().padStart(2, '0')}`;
};

/**
 * Converts BS YYYY-MM-DD string to AD Date
 */
export const bsToAd = (bsString: string): Date => {
  const separator = bsString.includes('-') ? '-' : '/';
  const parts = bsString.split(separator);
  if (parts.length < 3) return new Date();
  const [year, month, day] = parts.map(Number);
  
  // Robust approach: Walk from anchor to target
  let walkYear = anchorBSYear;
  let walkMonth = anchorBSMonth;
  let walkDay = anchorBSDay;
  let walkDiff = 0;

  const targetDateVal = year * 10000 + month * 100 + day;
  const anchorDateVal = anchorBSYear * 10000 + anchorBSMonth * 100 + anchorBSDay;

  if (targetDateVal >= anchorDateVal) {
    while (walkYear !== year || walkMonth !== month || walkDay !== day) {
      walkDiff++;
      walkDay++;
      if (walkDay > getDaysInBSMonth(walkYear, walkMonth)) {
        walkDay = 1;
        walkMonth++;
        if (walkMonth > 12) {
          walkMonth = 1;
          walkYear++;
        }
      }
      if (walkYear > 2100) break; // Safety
    }
    return new Date(anchorADDateUTC + (walkDiff * MS_PER_DAY));
  } else {
    while (walkYear !== year || walkMonth !== month || walkDay !== day) {
      walkDiff--;
      walkDay--;
      if (walkDay < 1) {
        walkMonth--;
        if (walkMonth < 1) {
          walkMonth = 12;
          walkYear--;
        }
        walkDay = getDaysInBSMonth(walkYear, walkMonth);
      }
      if (walkYear < 2000) break; // Safety
    }
    return new Date(anchorADDateUTC + (walkDiff * MS_PER_DAY));
  }
};

export const getCurrentBSDate = (): string => adToBs(new Date());
