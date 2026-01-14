/**
 * City coordinates for major US cities
 * Format: "City, StateAbbr": { latitude, longitude }
 * These coordinates are used for finding the nearest city based on user's geolocation
 */

export interface CityCoordinate {
  latitude: number;
  longitude: number;
}

export const cityCoordinates: Record<string, CityCoordinate> = {
  // Alabama
  "Birmingham, AL": { latitude: 33.5186, longitude: -86.8104 },
  "Montgomery, AL": { latitude: 32.3668, longitude: -86.3000 },
  "Huntsville, AL": { latitude: 34.7304, longitude: -86.5861 },
  "Mobile, AL": { latitude: 30.6954, longitude: -88.0399 },
  
  // Alaska
  "Anchorage, AK": { latitude: 61.2181, longitude: -149.9003 },
  "Fairbanks, AK": { latitude: 64.8378, longitude: -147.7164 },
  "Juneau, AK": { latitude: 58.3019, longitude: -134.4197 },
  
  // Arizona
  "Phoenix, AZ": { latitude: 33.4484, longitude: -112.0740 },
  "Tucson, AZ": { latitude: 32.2226, longitude: -110.9747 },
  "Mesa, AZ": { latitude: 33.4152, longitude: -111.8315 },
  "Chandler, AZ": { latitude: 33.3062, longitude: -111.8413 },
  "Scottsdale, AZ": { latitude: 33.4942, longitude: -111.9261 },
  "Sedona, AZ": { latitude: 34.8697, longitude: -111.7610 },
  "Flagstaff, AZ": { latitude: 35.1983, longitude: -111.6513 },
  
  // Arkansas
  "Little Rock, AR": { latitude: 34.7465, longitude: -92.2896 },
  "Fort Smith, AR": { latitude: 35.3859, longitude: -94.3985 },
  "Fayetteville, AR": { latitude: 36.0626, longitude: -94.1574 },
  
  // California
  "Los Angeles, CA": { latitude: 34.0522, longitude: -118.2437 },
  "San Diego, CA": { latitude: 32.7157, longitude: -117.1611 },
  "San Jose, CA": { latitude: 37.3382, longitude: -121.8863 },
  "San Francisco, CA": { latitude: 37.7749, longitude: -122.4194 },
  "Fresno, CA": { latitude: 36.7378, longitude: -119.7871 },
  "Sacramento, CA": { latitude: 38.5816, longitude: -121.4944 },
  "Long Beach, CA": { latitude: 33.7701, longitude: -118.1937 },
  "Oakland, CA": { latitude: 37.8044, longitude: -122.2712 },
  "Bakersfield, CA": { latitude: 35.3733, longitude: -119.0187 },
  "Anaheim, CA": { latitude: 33.8366, longitude: -117.9143 },
  "Santa Ana, CA": { latitude: 33.7455, longitude: -117.8677 },
  "Riverside, CA": { latitude: 33.9533, longitude: -117.3962 },
  "Irvine, CA": { latitude: 33.6846, longitude: -117.8265 },
  "San Bernardino, CA": { latitude: 34.1083, longitude: -117.2898 },
  "Napa, CA": { latitude: 38.2975, longitude: -122.2869 },
  "Santa Barbara, CA": { latitude: 34.4208, longitude: -119.6982 },
  "Palm Springs, CA": { latitude: 33.8303, longitude: -116.5453 },
  "Malibu, CA": { latitude: 34.0259, longitude: -118.7798 },
  "Beverly Hills, CA": { latitude: 34.0736, longitude: -118.4004 },
  "Carmel, CA": { latitude: 36.5552, longitude: -121.9233 },
  "Monterey, CA": { latitude: 36.6002, longitude: -121.8947 },
  "Laguna Beach, CA": { latitude: 33.5427, longitude: -117.7854 },
  
  // Colorado
  "Denver, CO": { latitude: 39.7392, longitude: -104.9903 },
  "Colorado Springs, CO": { latitude: 38.8339, longitude: -104.8214 },
  "Aurora, CO": { latitude: 39.7294, longitude: -104.8319 },
  "Boulder, CO": { latitude: 40.0150, longitude: -105.2705 },
  "Aspen, CO": { latitude: 39.1911, longitude: -106.8175 },
  "Vail, CO": { latitude: 39.6403, longitude: -106.3742 },
  
  // Connecticut
  "Bridgeport, CT": { latitude: 41.1865, longitude: -73.1952 },
  "New Haven, CT": { latitude: 41.3083, longitude: -72.9279 },
  "Hartford, CT": { latitude: 41.7658, longitude: -72.6734 },
  "Stamford, CT": { latitude: 41.0534, longitude: -73.5387 },
  
  // Delaware
  "Wilmington, DE": { latitude: 39.7391, longitude: -75.5398 },
  "Dover, DE": { latitude: 39.1582, longitude: -75.5244 },
  "Rehoboth Beach, DE": { latitude: 38.7209, longitude: -75.0760 },
  
  // Florida
  "Jacksonville, FL": { latitude: 30.3322, longitude: -81.6557 },
  "Miami, FL": { latitude: 25.7617, longitude: -80.1918 },
  "Tampa, FL": { latitude: 27.9506, longitude: -82.4572 },
  "Orlando, FL": { latitude: 28.5383, longitude: -81.3792 },
  "St. Petersburg, FL": { latitude: 27.7676, longitude: -82.6403 },
  "Tallahassee, FL": { latitude: 30.4383, longitude: -84.2807 },
  "Fort Lauderdale, FL": { latitude: 26.1224, longitude: -80.1373 },
  "Miami Beach, FL": { latitude: 25.7907, longitude: -80.1300 },
  "Key West, FL": { latitude: 24.5551, longitude: -81.7800 },
  "Naples, FL": { latitude: 26.1420, longitude: -81.7948 },
  "Sarasota, FL": { latitude: 27.3364, longitude: -82.5307 },
  "Palm Beach, FL": { latitude: 26.7053, longitude: -80.0364 },
  "West Palm Beach, FL": { latitude: 26.7153, longitude: -80.0534 },
  
  // Georgia
  "Atlanta, GA": { latitude: 33.7490, longitude: -84.3880 },
  "Augusta, GA": { latitude: 33.4735, longitude: -82.0105 },
  "Columbus, GA": { latitude: 32.4609, longitude: -84.9877 },
  "Savannah, GA": { latitude: 32.0809, longitude: -81.0912 },
  "Athens, GA": { latitude: 33.9519, longitude: -83.3576 },
  
  // Hawaii
  "Honolulu, HI": { latitude: 21.3099, longitude: -157.8581 },
  "Hilo, HI": { latitude: 19.7241, longitude: -155.0868 },
  "Kailua, HI": { latitude: 21.4022, longitude: -157.7394 },
  "Maui, HI": { latitude: 20.7984, longitude: -156.3319 },
  
  // Idaho
  "Boise, ID": { latitude: 43.6150, longitude: -116.2023 },
  "Meridian, ID": { latitude: 43.6121, longitude: -116.3915 },
  "Sun Valley, ID": { latitude: 43.6977, longitude: -114.3517 },
  
  // Illinois
  "Chicago, IL": { latitude: 41.8781, longitude: -87.6298 },
  "Aurora, IL": { latitude: 41.7606, longitude: -88.3201 },
  "Rockford, IL": { latitude: 42.2711, longitude: -89.0940 },
  "Naperville, IL": { latitude: 41.7508, longitude: -88.1535 },
  "Springfield, IL": { latitude: 39.7817, longitude: -89.6501 },
  
  // Indiana
  "Indianapolis, IN": { latitude: 39.7684, longitude: -86.1581 },
  "Fort Wayne, IN": { latitude: 41.0793, longitude: -85.1394 },
  "Evansville, IN": { latitude: 37.9716, longitude: -87.5711 },
  "South Bend, IN": { latitude: 41.6764, longitude: -86.2520 },
  
  // Iowa
  "Des Moines, IA": { latitude: 41.5868, longitude: -93.6250 },
  "Cedar Rapids, IA": { latitude: 41.9779, longitude: -91.6656 },
  "Davenport, IA": { latitude: 41.5236, longitude: -90.5776 },
  "Iowa City, IA": { latitude: 41.6611, longitude: -91.5302 },
  
  // Kansas
  "Wichita, KS": { latitude: 37.6872, longitude: -97.3301 },
  "Overland Park, KS": { latitude: 38.9822, longitude: -94.6708 },
  "Kansas City, KS": { latitude: 39.1141, longitude: -94.6275 },
  "Topeka, KS": { latitude: 39.0558, longitude: -95.6890 },
  
  // Kentucky
  "Louisville, KY": { latitude: 38.2527, longitude: -85.7585 },
  "Lexington, KY": { latitude: 38.0406, longitude: -84.5037 },
  "Bowling Green, KY": { latitude: 36.9903, longitude: -86.4436 },
  
  // Louisiana
  "New Orleans, LA": { latitude: 29.9511, longitude: -90.0715 },
  "Baton Rouge, LA": { latitude: 30.4515, longitude: -91.1871 },
  "Shreveport, LA": { latitude: 32.5252, longitude: -93.7502 },
  "Lafayette, LA": { latitude: 30.2241, longitude: -92.0198 },
  
  // Maine
  "Portland, ME": { latitude: 43.6591, longitude: -70.2568 },
  "Lewiston, ME": { latitude: 44.1004, longitude: -70.2148 },
  "Bangor, ME": { latitude: 44.8012, longitude: -68.7778 },
  
  // Maryland
  "Baltimore, MD": { latitude: 39.2904, longitude: -76.6122 },
  "Frederick, MD": { latitude: 39.4143, longitude: -77.4105 },
  "Annapolis, MD": { latitude: 38.9784, longitude: -76.4922 },
  "Bethesda, MD": { latitude: 38.9807, longitude: -77.1006 },
  
  // Massachusetts
  "Boston, MA": { latitude: 42.3601, longitude: -71.0589 },
  "Worcester, MA": { latitude: 42.2626, longitude: -71.8023 },
  "Springfield, MA": { latitude: 42.1015, longitude: -72.5898 },
  "Cambridge, MA": { latitude: 42.3736, longitude: -71.1097 },
  "Cape Cod, MA": { latitude: 41.6688, longitude: -70.2962 },
  "Nantucket, MA": { latitude: 41.2835, longitude: -70.0995 },
  
  // Michigan
  "Detroit, MI": { latitude: 42.3314, longitude: -83.0458 },
  "Grand Rapids, MI": { latitude: 42.9634, longitude: -85.6681 },
  "Ann Arbor, MI": { latitude: 42.2808, longitude: -83.7430 },
  "Lansing, MI": { latitude: 42.7325, longitude: -84.5555 },
  "Traverse City, MI": { latitude: 44.7631, longitude: -85.6206 },
  
  // Minnesota
  "Minneapolis, MN": { latitude: 44.9778, longitude: -93.2650 },
  "Saint Paul, MN": { latitude: 44.9537, longitude: -93.0900 },
  "Rochester, MN": { latitude: 44.0121, longitude: -92.4802 },
  "Duluth, MN": { latitude: 46.7867, longitude: -92.1005 },
  
  // Mississippi
  "Jackson, MS": { latitude: 32.2988, longitude: -90.1848 },
  "Gulfport, MS": { latitude: 30.3674, longitude: -89.0928 },
  "Biloxi, MS": { latitude: 30.3960, longitude: -88.8853 },
  
  // Missouri
  "Kansas City, MO": { latitude: 39.0997, longitude: -94.5786 },
  "St. Louis, MO": { latitude: 38.6270, longitude: -90.1994 },
  "Springfield, MO": { latitude: 37.2090, longitude: -93.2923 },
  "Columbia, MO": { latitude: 38.9517, longitude: -92.3341 },
  "Branson, MO": { latitude: 36.6437, longitude: -93.2185 },
  
  // Montana
  "Billings, MT": { latitude: 45.7833, longitude: -108.5007 },
  "Missoula, MT": { latitude: 46.8721, longitude: -113.9940 },
  "Great Falls, MT": { latitude: 47.5053, longitude: -111.3008 },
  "Bozeman, MT": { latitude: 45.6770, longitude: -111.0429 },
  
  // Nebraska
  "Omaha, NE": { latitude: 41.2565, longitude: -95.9345 },
  "Lincoln, NE": { latitude: 40.8136, longitude: -96.7026 },
  "Bellevue, NE": { latitude: 41.1544, longitude: -95.9145 },
  
  // Nevada
  "Las Vegas, NV": { latitude: 36.1699, longitude: -115.1398 },
  "Henderson, NV": { latitude: 36.0395, longitude: -114.9817 },
  "Reno, NV": { latitude: 39.5296, longitude: -119.8138 },
  "Lake Tahoe, NV": { latitude: 39.0968, longitude: -120.0324 },
  
  // New Hampshire
  "Manchester, NH": { latitude: 42.9956, longitude: -71.4548 },
  "Nashua, NH": { latitude: 42.7654, longitude: -71.4676 },
  "Concord, NH": { latitude: 43.2081, longitude: -71.5376 },
  "Portsmouth, NH": { latitude: 43.0718, longitude: -70.7626 },
  
  // New Jersey
  "Newark, NJ": { latitude: 40.7357, longitude: -74.1724 },
  "Jersey City, NJ": { latitude: 40.7178, longitude: -74.0431 },
  "Paterson, NJ": { latitude: 40.9168, longitude: -74.1718 },
  "Princeton, NJ": { latitude: 40.3573, longitude: -74.6672 },
  "Atlantic City, NJ": { latitude: 39.3643, longitude: -74.4229 },
  "Cape May, NJ": { latitude: 38.9351, longitude: -74.9060 },
  
  // New Mexico
  "Albuquerque, NM": { latitude: 35.0844, longitude: -106.6504 },
  "Las Cruces, NM": { latitude: 32.3199, longitude: -106.7637 },
  "Santa Fe, NM": { latitude: 35.6870, longitude: -105.9378 },
  "Taos, NM": { latitude: 36.4072, longitude: -105.5731 },
  
  // New York
  "New York City, NY": { latitude: 40.7128, longitude: -74.0060 },
  "Buffalo, NY": { latitude: 40.7128, longitude: -78.8784 },
  "Rochester, NY": { latitude: 43.1566, longitude: -77.6088 },
  "Albany, NY": { latitude: 42.6526, longitude: -73.7562 },
  "Syracuse, NY": { latitude: 43.0481, longitude: -76.1474 },
  "Brooklyn, NY": { latitude: 40.6782, longitude: -73.9442 },
  "Manhattan, NY": { latitude: 40.7831, longitude: -73.9712 },
  "Queens, NY": { latitude: 40.7282, longitude: -73.7949 },
  "Hamptons, NY": { latitude: 40.8968, longitude: -72.3926 },
  
  // North Carolina
  "Charlotte, NC": { latitude: 35.2271, longitude: -80.8431 },
  "Raleigh, NC": { latitude: 35.7796, longitude: -78.6382 },
  "Greensboro, NC": { latitude: 36.0726, longitude: -79.7920 },
  "Durham, NC": { latitude: 35.9940, longitude: -78.8986 },
  "Winston-Salem, NC": { latitude: 36.0999, longitude: -80.2442 },
  "Wilmington, NC": { latitude: 34.2257, longitude: -77.9447 },
  "Asheville, NC": { latitude: 35.5951, longitude: -82.5515 },
  
  // North Dakota
  "Fargo, ND": { latitude: 46.8772, longitude: -96.7898 },
  "Bismarck, ND": { latitude: 46.8083, longitude: -100.7837 },
  "Grand Forks, ND": { latitude: 47.9253, longitude: -97.0329 },
  
  // Ohio
  "Columbus, OH": { latitude: 39.9612, longitude: -82.9988 },
  "Cleveland, OH": { latitude: 41.4993, longitude: -81.6944 },
  "Cincinnati, OH": { latitude: 39.1031, longitude: -84.5120 },
  "Toledo, OH": { latitude: 41.6528, longitude: -83.5379 },
  "Akron, OH": { latitude: 41.0814, longitude: -81.5190 },
  
  // Oklahoma
  "Oklahoma City, OK": { latitude: 35.4676, longitude: -97.5164 },
  "Tulsa, OK": { latitude: 36.1540, longitude: -95.9928 },
  "Norman, OK": { latitude: 35.2226, longitude: -97.4395 },
  
  // Oregon
  "Portland, OR": { latitude: 45.5152, longitude: -122.6784 },
  "Salem, OR": { latitude: 44.9429, longitude: -123.0351 },
  "Eugene, OR": { latitude: 44.0521, longitude: -123.0868 },
  "Bend, OR": { latitude: 44.0582, longitude: -121.3153 },
  
  // Pennsylvania
  "Philadelphia, PA": { latitude: 39.9526, longitude: -75.1652 },
  "Pittsburgh, PA": { latitude: 40.4406, longitude: -79.9959 },
  "Allentown, PA": { latitude: 40.6084, longitude: -75.4902 },
  "Harrisburg, PA": { latitude: 40.2732, longitude: -76.8867 },
  "Lancaster, PA": { latitude: 40.0379, longitude: -76.3055 },
  
  // Rhode Island
  "Providence, RI": { latitude: 41.8240, longitude: -71.4128 },
  "Warwick, RI": { latitude: 41.7001, longitude: -71.4162 },
  "Newport, RI": { latitude: 41.4901, longitude: -71.3128 },
  
  // South Carolina
  "Charleston, SC": { latitude: 32.7765, longitude: -79.9311 },
  "Columbia, SC": { latitude: 34.0007, longitude: -81.0348 },
  "Greenville, SC": { latitude: 34.8526, longitude: -82.3940 },
  "Myrtle Beach, SC": { latitude: 33.6891, longitude: -78.8867 },
  "Hilton Head Island, SC": { latitude: 32.2163, longitude: -80.7526 },
  
  // South Dakota
  "Sioux Falls, SD": { latitude: 43.5446, longitude: -96.7311 },
  "Rapid City, SD": { latitude: 44.0805, longitude: -103.2310 },
  "Aberdeen, SD": { latitude: 45.4647, longitude: -98.4865 },
  
  // Tennessee
  "Nashville, TN": { latitude: 36.1627, longitude: -86.7816 },
  "Memphis, TN": { latitude: 35.1495, longitude: -90.0490 },
  "Knoxville, TN": { latitude: 35.9606, longitude: -83.9207 },
  "Chattanooga, TN": { latitude: 35.0456, longitude: -85.3097 },
  "Gatlinburg, TN": { latitude: 35.7143, longitude: -83.5102 },
  
  // Texas
  "Houston, TX": { latitude: 29.7604, longitude: -95.3698 },
  "San Antonio, TX": { latitude: 29.4241, longitude: -98.4936 },
  "Dallas, TX": { latitude: 32.7767, longitude: -96.7970 },
  "Austin, TX": { latitude: 30.2672, longitude: -97.7431 },
  "Fort Worth, TX": { latitude: 32.7555, longitude: -97.3308 },
  "El Paso, TX": { latitude: 31.7619, longitude: -106.4850 },
  "Arlington, TX": { latitude: 32.7357, longitude: -97.1081 },
  "Plano, TX": { latitude: 33.0198, longitude: -96.6989 },
  "Lubbock, TX": { latitude: 33.5779, longitude: -101.8552 },
  "Irving, TX": { latitude: 32.8140, longitude: -96.9489 },
  "Galveston, TX": { latitude: 29.3013, longitude: -94.7977 },
  "Fredericksburg, TX": { latitude: 30.2752, longitude: -98.8703 },
  
  // Utah
  "Salt Lake City, UT": { latitude: 40.7608, longitude: -111.8910 },
  "Provo, UT": { latitude: 40.2338, longitude: -111.6585 },
  "Park City, UT": { latitude: 40.6461, longitude: -111.4980 },
  
  // Vermont
  "Burlington, VT": { latitude: 44.4759, longitude: -73.2121 },
  "Montpelier, VT": { latitude: 44.2601, longitude: -72.5754 },
  "Stowe, VT": { latitude: 44.4654, longitude: -72.6874 },
  
  // Virginia
  "Virginia Beach, VA": { latitude: 36.8529, longitude: -75.9780 },
  "Norfolk, VA": { latitude: 36.8508, longitude: -76.2859 },
  "Richmond, VA": { latitude: 37.5407, longitude: -77.4360 },
  "Arlington, VA": { latitude: 38.8816, longitude: -77.0910 },
  "Charlottesville, VA": { latitude: 38.0293, longitude: -78.4767 },
  "Williamsburg, VA": { latitude: 37.2707, longitude: -76.7075 },
  
  // Washington
  "Seattle, WA": { latitude: 47.6062, longitude: -122.3321 },
  "Spokane, WA": { latitude: 47.6588, longitude: -117.4260 },
  "Tacoma, WA": { latitude: 47.2529, longitude: -122.4443 },
  "Vancouver, WA": { latitude: 45.6387, longitude: -122.6615 },
  "Bellevue, WA": { latitude: 47.6101, longitude: -122.2015 },
  
  // Washington D.C.
  "Washington, DC": { latitude: 38.9072, longitude: -77.0369 },
  
  // West Virginia
  "Charleston, WV": { latitude: 38.3498, longitude: -81.6326 },
  "Huntington, WV": { latitude: 38.4192, longitude: -82.4452 },
  
  // Wisconsin
  "Milwaukee, WI": { latitude: 43.0389, longitude: -87.9065 },
  "Madison, WI": { latitude: 43.0731, longitude: -89.4012 },
  "Green Bay, WI": { latitude: 44.5133, longitude: -88.0133 },
  
  // Wyoming
  "Cheyenne, WY": { latitude: 41.1400, longitude: -104.8202 },
  "Casper, WY": { latitude: 42.8666, longitude: -106.3131 },
  "Jackson, WY": { latitude: 43.4799, longitude: -110.7624 },
};
