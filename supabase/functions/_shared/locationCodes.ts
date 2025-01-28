export const locationCodes: {
  [state: string]: {
    code: number;
    cities: {
      [city: string]: number;
    };
  };
} = {
  "Texas": {
    code: 2840,
    cities: {
      "Dallas": 1003735,
      "Houston": 1003811,
      "Austin": 1003550,
      "San Antonio": 1004100
    }
  },
  "California": {
    code: 2840,
    cities: {
      "Los Angeles": 1003910,
      "San Francisco": 1004109,
      "San Diego": 1004102,
      "Sacramento": 1004088
    }
  },
  "New York": {
    code: 2840,
    cities: {
      "New York City": 1003581,
      "Buffalo": 1003622,
      "Albany": 1003518,
      "Rochester": 1004074
    }
  },
  "Florida": {
    code: 2840,
    cities: {
      "Miami": 1003937,
      "Orlando": 1004004,
      "Tampa": 1004145,
      "Jacksonville": 1003846
    }
  }
};