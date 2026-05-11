export interface CarModelInfo {
  versions: string[];
  yearStart: number;
  yearEnd: number;
}

export const carDatabase: Record<string, Record<string, CarModelInfo>> = {
  'Fiat': {
    'Uno': { versions: ['Vivace', 'Way', 'Sporting'], yearStart: 1984, yearEnd: 2021 },
    'Mobi': { versions: ['Like', 'Trekking'], yearStart: 2016, yearEnd: 2026 },
    'Argo': { versions: ['1.0', 'Drive', 'Trekking', 'HGT'], yearStart: 2017, yearEnd: 2026 },
    'Cronos': { versions: ['Drive', 'Precision'], yearStart: 2018, yearEnd: 2026 },
    'Pulse': { versions: ['Drive', 'Audace', 'Impetus', 'Abarth'], yearStart: 2021, yearEnd: 2026 },
    'Fastback': { versions: ['Audace', 'Impetus', 'Abarth'], yearStart: 2022, yearEnd: 2026 },
    'Toro': { versions: ['Endurance', 'Freedom', 'Volcano', 'Ranch', 'Ultra'], yearStart: 2016, yearEnd: 2026 },
    'Strada': { versions: ['Endurance', 'Freedom', 'Volcano', 'Ranch'], yearStart: 2020, yearEnd: 2026 },
    'Siena': { versions: ['EL', 'HLX'], yearStart: 1997, yearEnd: 2017 },
    'Palio': { versions: ['Fire', 'Attractive', 'Essence', 'Sporting'], yearStart: 1996, yearEnd: 2018 }
  },
  'Volkswagen': {
    'Gol': { versions: ['1.0', 'Trendline', 'Comfortline'], yearStart: 1980, yearEnd: 2022 },
    'Polo': { versions: ['MPI', 'TSI', 'Comfortline', 'Highline', 'GTS'], yearStart: 2017, yearEnd: 2026 },
    'Virtus': { versions: ['MSI', 'Comfortline', 'Highline', 'Exclusive'], yearStart: 2018, yearEnd: 2026 },
    'Nivus': { versions: ['Comfortline', 'Highline'], yearStart: 2020, yearEnd: 2026 },
    'T-Cross': { versions: ['Sense', '200 TSI', 'Comfortline', 'Highline'], yearStart: 2019, yearEnd: 2026 },
    'Taos': { versions: ['Comfortline', 'Highline'], yearStart: 2021, yearEnd: 2026 },
    'Saveiro': { versions: ['Robust', 'Trendline', 'Cross'], yearStart: 1982, yearEnd: 2026 },
    'Jetta': { versions: ['Comfortline', 'R-Line', 'GLI'], yearStart: 2006, yearEnd: 2026 },
    'Passat': { versions: ['Comfortline', 'Highline'], yearStart: 2006, yearEnd: 2020 },
    'Amarok': { versions: ['SE', 'Comfortline', 'Highline', 'Extreme'], yearStart: 2010, yearEnd: 2026 }
  },
  'Chevrolet': {
    'Onix': { versions: ['LS', 'LT', 'LTZ', 'Premier', 'RS'], yearStart: 2012, yearEnd: 2026 },
    'Onix Plus': { versions: ['LT', 'LTZ', 'Premier'], yearStart: 2019, yearEnd: 2026 },
    'Tracker': { versions: ['AT', 'LT', 'LTZ', 'Premier', 'RS'], yearStart: 2020, yearEnd: 2026 },
    'S10': { versions: ['LS', 'LT', 'LTZ', 'High Country'], yearStart: 1995, yearEnd: 2026 },
    'Montana': { versions: ['MT', 'LT', 'LTZ', 'Premier'], yearStart: 2023, yearEnd: 2026 },
    'Spin': { versions: ['LS', 'LT', 'Premier'], yearStart: 2012, yearEnd: 2026 },
    'Cruze': { versions: ['LT', 'LTZ', 'Premier', 'Sport6'], yearStart: 2011, yearEnd: 2023 },
    'Equinox': { versions: ['LT', 'Premier'], yearStart: 2017, yearEnd: 2026 },
    'Trailblazer': { versions: ['LT', 'Premier'], yearStart: 2012, yearEnd: 2021 },
    'Corsa': { versions: ['Wind', 'GL', 'GLS'], yearStart: 1994, yearEnd: 2012 }
  },
  'Ford': {
    'Ka': { versions: ['S', 'SE', 'SEL'], yearStart: 1997, yearEnd: 2021 },
    'Fiesta': { versions: ['S', 'SE', 'Titanium'], yearStart: 1995, yearEnd: 2019 },
    'Focus': { versions: ['S', 'SE', 'Titanium'], yearStart: 2000, yearEnd: 2019 },
    'Fusion': { versions: ['SEL', 'Titanium', 'Hybrid'], yearStart: 2006, yearEnd: 2020 },
    'Ranger': { versions: ['XL', 'XLS', 'XLT', 'Limited'], yearStart: 1994, yearEnd: 2026 },
    'Ecosport': { versions: ['SE', 'Freestyle', 'Titanium'], yearStart: 2003, yearEnd: 2021 },
    'Territory': { versions: ['SEL', 'Titanium'], yearStart: 2020, yearEnd: 2026 },
    'Maverick': { versions: ['Lariat', 'FX4'], yearStart: 2022, yearEnd: 2026 },
    'Edge': { versions: ['SEL', 'Titanium'], yearStart: 2015, yearEnd: 2020 },
    'Bronco': { versions: ['Sport', 'Wildtrak'], yearStart: 2021, yearEnd: 2026 }
  },
  'Hyundai': {
    'HB20': { versions: ['Sense', 'Comfort', 'Limited', 'Platinum'], yearStart: 2012, yearEnd: 2026 },
    'HB20S': { versions: ['Comfort', 'Limited', 'Platinum'], yearStart: 2013, yearEnd: 2026 },
    'Creta': { versions: ['Action', 'Comfort', 'Limited', 'Platinum', 'N Line'], yearStart: 2017, yearEnd: 2026 },
    'Tucson': { versions: ['GL', 'GLS'], yearStart: 2005, yearEnd: 2026 },
    'Santa Fe': { versions: ['V6', 'AWD'], yearStart: 2006, yearEnd: 2020 },
    'ix35': { versions: ['GL', 'GLS'], yearStart: 2010, yearEnd: 2021 },
    'Azera': { versions: ['GLS'], yearStart: 2006, yearEnd: 2017 },
    'Kona': { versions: ['EV'], yearStart: 2018, yearEnd: 2026 },
    'Venue': { versions: ['SE', 'Limited'], yearStart: 2020, yearEnd: 2026 },
    'Elantra': { versions: ['GLS'], yearStart: 2012, yearEnd: 2018 }
  },
  'Toyota': {
    'Corolla': { versions: ['GLi', 'XEi', 'Altis', 'Altis Premium', 'GR-S', 'Hybrid'], yearStart: 1994, yearEnd: 2026 },
    'Corolla Cross': { versions: ['XR', 'XRE', 'XRX', 'Hybrid'], yearStart: 2021, yearEnd: 2026 },
    'Hilux': { versions: ['STD', 'SR', 'SRV', 'SRX', 'GR-Sport'], yearStart: 1992, yearEnd: 2026 },
    'SW4': { versions: ['SRX', 'Diamond'], yearStart: 2005, yearEnd: 2026 },
    'Yaris': { versions: ['XL', 'XS', 'XLS'], yearStart: 2018, yearEnd: 2026 },
    'Yaris Sedan': { versions: ['XL', 'XS', 'XLS'], yearStart: 2018, yearEnd: 2026 },
    'Etios': { versions: ['X', 'XS', 'XLS'], yearStart: 2012, yearEnd: 2021 },
    'Camry': { versions: ['XLE Hybrid'], yearStart: 2000, yearEnd: 2020 },
    'RAV4': { versions: ['SX Hybrid'], yearStart: 2018, yearEnd: 2026 },
    'Prius': { versions: ['Hybrid'], yearStart: 2013, yearEnd: 2021 }
  },
  'Renault': {
    'Kwid': { versions: ['Zen', 'Intense', 'Outsider'], yearStart: 2017, yearEnd: 2026 },
    'Sandero': { versions: ['Life', 'Zen', 'Intense'], yearStart: 2007, yearEnd: 2024 },
    'Logan': { versions: ['Life', 'Zen', 'Intense'], yearStart: 2007, yearEnd: 2024 },
    'Stepway': { versions: ['Zen', 'Intense'], yearStart: 2008, yearEnd: 2024 },
    'Duster': { versions: ['Zen', 'Intense', 'Iconic'], yearStart: 2011, yearEnd: 2026 },
    'Oroch': { versions: ['Pro', 'Intense', 'Outsider'], yearStart: 2015, yearEnd: 2026 },
    'Kardian': { versions: ['Evolution', 'Techno'], yearStart: 2023, yearEnd: 2026 },
    'Captur': { versions: ['Zen', 'Intense'], yearStart: 2016, yearEnd: 2026 },
    'Fluence': { versions: ['Dynamique', 'Privilege'], yearStart: 2011, yearEnd: 2017 },
    'Clio': { versions: ['Authentique', 'Expression'], yearStart: 1999, yearEnd: 2014 }
  },
  'Honda': {
    'Civic': { versions: ['LX', 'EX', 'EXL', 'Touring', 'Si'], yearStart: 1992, yearEnd: 2026 },
    'City': { versions: ['LX', 'EX', 'EXL', 'Touring'], yearStart: 2009, yearEnd: 2026 },
    'City Hatch': { versions: ['EX', 'EXL', 'Touring'], yearStart: 2021, yearEnd: 2026 },
    'Fit': { versions: ['LX', 'EX', 'EXL'], yearStart: 2003, yearEnd: 2021 },
    'HR-V': { versions: ['LX', 'EX', 'EXL', 'Touring'], yearStart: 2015, yearEnd: 2026 },
    'WR-V': { versions: ['LX', 'EX'], yearStart: 2017, yearEnd: 2022 },
    'Accord': { versions: ['Touring Hybrid'], yearStart: 1995, yearEnd: 2020 },
    'CR-V': { versions: ['EXL', 'Touring'], yearStart: 2007, yearEnd: 2026 },
    'ZR-V': { versions: ['Touring'], yearStart: 2023, yearEnd: 2026 },
    'Insight': { versions: ['Hybrid'], yearStart: 2019, yearEnd: 2022 }
  },
  'Nissan': {
    'Kicks': { versions: ['Sense', 'Advance', 'Exclusive'], yearStart: 2016, yearEnd: 2026 },
    'Versa': { versions: ['Sense', 'Advance', 'Exclusive'], yearStart: 2011, yearEnd: 2026 },
    'Sentra': { versions: ['Advance', 'Exclusive'], yearStart: 2007, yearEnd: 2026 },
    'Frontier': { versions: ['S', 'SE', 'LE', 'Platinum'], yearStart: 1998, yearEnd: 2026 },
    'March': { versions: ['S', 'SV'], yearStart: 2011, yearEnd: 2020 },
    'Livina': { versions: ['SL'], yearStart: 2008, yearEnd: 2015 },
    'X-Trail': { versions: ['SL'], yearStart: 2008, yearEnd: 2015 },
    'Pathfinder': { versions: ['Exclusive'], yearStart: 2013, yearEnd: 2017 },
    'Leaf': { versions: ['EV'], yearStart: 2017, yearEnd: 2026 },
    'Altima': { versions: ['SL'], yearStart: 2018, yearEnd: 2023 }
  },
  'Peugeot': {
    '208': { versions: ['Like', 'Active', 'Allure', 'Griffe'], yearStart: 2013, yearEnd: 2026 },
    '2008': { versions: ['Allure', 'Griffe'], yearStart: 2015, yearEnd: 2026 },
    '3008': { versions: ['Griffe'], yearStart: 2017, yearEnd: 2020 },
    '5008': { versions: ['Griffe'], yearStart: 2018, yearEnd: 2020 },
    '308': { versions: ['Active', 'Allure'], yearStart: 2012, yearEnd: 2023 },
    '408': { versions: ['Allure', 'Griffe'], yearStart: 2010, yearEnd: 2018 },
    '206': { versions: ['Selection', 'Presence'], yearStart: 2001, yearEnd: 2012 },
    '207': { versions: ['XR', 'XS'], yearStart: 2008, yearEnd: 2014 },
    'Partner': { versions: ['Rapid'], yearStart: 2000, yearEnd: 2015 },
    'RCZ': { versions: ['THP'], yearStart: 2010, yearEnd: 2015 }
  },
  'Citroën': {
    'C3': { versions: ['Live', 'Feel', 'Shine'], yearStart: 2003, yearEnd: 2026 },
    'C3 Aircross': { versions: ['Feel', 'Shine'], yearStart: 2018, yearEnd: 2026 },
    'C4 Cactus': { versions: ['Feel', 'Shine'], yearStart: 2018, yearEnd: 2026 },
    'Basalt': { versions: ['Feel', 'Shine'], yearStart: 2023, yearEnd: 2026 },
    'C4 Lounge': { versions: ['Feel', 'Shine'], yearStart: 2013, yearEnd: 2020 },
    'C5': { versions: ['Exclusive'], yearStart: 2005, yearEnd: 2015 },
    'Xsara': { versions: ['GLX'], yearStart: 1998, yearEnd: 2006 },
    'Picasso': { versions: ['GLX'], yearStart: 2000, yearEnd: 2010 },
    'Berlingo': { versions: ['Business'], yearStart: 2005, yearEnd: 2015 },
    'DS3': { versions: ['Chic', 'Sport'], yearStart: 2010, yearEnd: 2016 }
  },
  'Mitsubishi': {
    'Lancer': { versions: ['HL', 'HLE', 'GT'], yearStart: 1992, yearEnd: 2019 },
    'ASX': { versions: ['4x2', '4x4'], yearStart: 2010, yearEnd: 2026 },
    'Outlander': { versions: ['Comfort', 'GT'], yearStart: 2008, yearEnd: 2026 },
    'Eclipse Cross': { versions: ['HPE', 'HPE-S'], yearStart: 2018, yearEnd: 2026 },
    'Pajero': { versions: ['Full', 'Sport'], yearStart: 1991, yearEnd: 2021 },
    'Pajero Sport': { versions: ['HPE', 'HPE-S'], yearStart: 2015, yearEnd: 2026 },
    'Triton': { versions: ['GL', 'GLS', 'HPE', 'HPE-S'], yearStart: 2008, yearEnd: 2026 },
    'L200': { versions: ['Outdoor', 'Triton'], yearStart: 1995, yearEnd: 2026 },
    'Airtrek': { versions: ['EV'], yearStart: 2022, yearEnd: 2026 },
    'Galant': { versions: ['ES'], yearStart: 1995, yearEnd: 2010 }
  },
  'Jeep': {
    'Renegade': { versions: ['Sport', 'Longitude', 'Limited', 'Trailhawk'], yearStart: 2015, yearEnd: 2026 },
    'Compass': { versions: ['Sport', 'Longitude', 'Limited', 'Trailhawk', 'S'], yearStart: 2017, yearEnd: 2026 },
    'Commander': { versions: ['Longitude', 'Limited', 'Overland'], yearStart: 2021, yearEnd: 2026 },
    'Wrangler': { versions: ['Sport', 'Sahara', 'Rubicon'], yearStart: 1997, yearEnd: 2026 },
    'Gladiator': { versions: ['Rubicon'], yearStart: 2020, yearEnd: 2026 },
    'Cherokee': { versions: ['Longitude', 'Trailhawk'], yearStart: 2014, yearEnd: 2020 },
    'Grand Cherokee': { versions: ['Limited', 'Summit'], yearStart: 2005, yearEnd: 2020 },
    'Wagoneer': { versions: ['Series II'], yearStart: 2021, yearEnd: 2026 },
    'Patriot': { versions: ['Sport'], yearStart: 2008, yearEnd: 2015 },
    'Liberty': { versions: ['Sport'], yearStart: 2002, yearEnd: 2012 }
  },
  'Caoa Chery': {
    'Tiggo 2': { versions: ['Look'], yearStart: 2018, yearEnd: 2022 },
    'Tiggo 3X': { versions: ['Pro'], yearStart: 2019, yearEnd: 2026 },
    'Tiggo 5X': { versions: ['Sport', 'Pro', 'Pro Hybrid'], yearStart: 2019, yearEnd: 2026 },
    'Tiggo 7': { versions: ['Pro', 'Hybrid'], yearStart: 2020, yearEnd: 2026 },
    'Tiggo 8': { versions: ['Max Drive', 'Plug-in Hybrid'], yearStart: 2020, yearEnd: 2026 },
    'Arrizo 5': { versions: ['RX'], yearStart: 2018, yearEnd: 2024 },
    'Arrizo 6': { versions: ['Pro', 'GSX'], yearStart: 2019, yearEnd: 2026 },
    'iCar': { versions: ['EV'], yearStart: 2022, yearEnd: 2026 },
    'QQ': { versions: ['Smile'], yearStart: 2005, yearEnd: 2015 },
    'Cielo': { versions: ['Hatch', 'Sedan'], yearStart: 2000, yearEnd: 2010 }
  }
};

export const availableBrands = Object.keys(carDatabase);

export const generateYearList = (start: number, end: number): string[] => {
  const years: string[] = [];
  for (let year = start; year <= end; year++) {
    years.push(year.toString());
  }
  return years.reverse();
};

// pega os modelos de uma marca
export const getModelsByBrand = (brand: string): string[] => {
  return Object.keys(carDatabase[brand] || {});
};

// pega as info de um modelo
export const getModelInfo = (brand: string, modelName: string): CarModelInfo | null => {
  return carDatabase[brand]?.[modelName] ?? null;
};