import CountryData from '@data/faker/country';

export default {
  france: new CountryData({
    id: 8,
    name: 'France',
    isoCode: 'FR',
    callPrefix: 33,
    zone: 'Europe',
    active: true,
  }),
  netherlands: new CountryData({
    id: 13,
    name: 'Netherlands',
    isoCode: 'NL',
    callPrefix: 31,
    zone: 'Europe',
    active: false,
  }),
  unitedKingdom: new CountryData({
    id: 17,
    name: 'United Kingdom',
    isoCode: 'GB',
    callPrefix: 44,
    zone: 'Europe',
    active: false,
  }),
  germany: new CountryData({
    id: 1,
    name: 'Germany',
    isoCode: 'DE',
    callPrefix: 49,
    zone: 'Europe',
    active: false,
  }),
  afghanistan: new CountryData({
    id: 231,
    name: 'Afghanistan',
    isoCode: 'AF',
    callPrefix: 93,
    zone: 'Asia',
    active: false,
  }),
  unitedStates: new CountryData({
    id: 21,
    name: 'United States',
    isoCode: 'US',
    callPrefix: 1,
    zone: 'North America',
    active: false,
  }),
};
